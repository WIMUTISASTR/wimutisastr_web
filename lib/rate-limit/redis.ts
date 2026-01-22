/**
 * Production-ready rate limiting using Redis (Upstash)
 * Falls back to in-memory storage in development
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '../utils/env';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'rate-limit' });

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  /**
   * Time window in seconds
   * @default 60 (1 minute)
   */
  windowSeconds?: number;

  /**
   * Maximum number of requests allowed in the time window
   * @default 10
   */
  maxRequests?: number;

  /**
   * Custom identifier (defaults to IP)
   */
  identifier?: string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Redis client interface
 */
interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

/**
 * Upstash Redis client using REST API
 */
class UpstashRedisClient implements RedisClient {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url;
    this.token = token;
  }

  private async executeCommand(command: string[]): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error(`Redis command failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      log.error('Redis command failed', error);
      throw error;
    }
  }

  async incr(key: string): Promise<number> {
    return this.executeCommand(['INCR', key]);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.executeCommand(['EXPIRE', key, seconds.toString()]);
  }

  async ttl(key: string): Promise<number> {
    return this.executeCommand(['TTL', key]);
  }
}

/**
 * In-memory fallback for development
 */
class InMemoryRedisClient implements RedisClient {
  private store = new Map<string, { count: number; expiresAt: number }>();

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now >= value.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  async incr(key: string): Promise<number> {
    this.cleanup();
    const record = this.store.get(key);
    if (record && Date.now() < record.expiresAt) {
      record.count++;
      return record.count;
    }
    return 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const record = this.store.get(key);
    const expiresAt = Date.now() + seconds * 1000;
    if (record) {
      record.expiresAt = expiresAt;
    } else {
      this.store.set(key, { count: 1, expiresAt });
    }
  }

  async ttl(key: string): Promise<number> {
    this.cleanup();
    const record = this.store.get(key);
    if (!record) return -2;
    const remaining = Math.ceil((record.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }
}

/**
 * Get Redis client (Upstash in production, in-memory in development)
 */
function getRedisClient(): RedisClient {
  const redisUrl = env.redis.url();
  const redisToken = env.redis.token();

  if (redisUrl && redisToken) {
    log.debug('Using Upstash Redis for rate limiting');
    return new UpstashRedisClient(redisUrl, redisToken);
  }

  log.warn('Redis not configured, using in-memory rate limiting (not suitable for production)');
  return new InMemoryRedisClient();
}

const redisClient = getRedisClient();

/**
 * Extract client identifier from request
 */
function getClientIdentifier(request: NextRequest, customIdentifier?: string): string {
  if (customIdentifier) return customIdentifier;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}

/**
 * Check if request is within rate limit
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const {
    windowSeconds = 60,
    maxRequests = 10,
    identifier: customIdentifier,
  } = config;

  const identifier = getClientIdentifier(request, customIdentifier);
  const key = `ratelimit:${identifier}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;

  try {
    const count = await redisClient.incr(key);
    
    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    const ttl = await redisClient.ttl(key);
    const resetAt = Date.now() + ttl * 1000;

    if (count > maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: resetAt,
      };
    }

    return {
      success: true,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - count),
      reset: resetAt,
    };
  } catch (error) {
    log.error('Rate limit check failed', error);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      reset: Date.now() + windowSeconds * 1000,
    };
  }
}

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  message = 'Too many requests. Please try again later.'
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  strict: { windowSeconds: 60, maxRequests: 5 },
  standard: { windowSeconds: 60, maxRequests: 30 },
  relaxed: { windowSeconds: 60, maxRequests: 100 },
  upload: { windowSeconds: 300, maxRequests: 3 },
} as const;
