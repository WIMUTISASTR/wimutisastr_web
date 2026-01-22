/**
 * Authentication lockout mechanism
 * Prevents brute force attacks on login endpoints
 */

import { env } from '@/lib/utils/env';

interface RedisClient {
  get(key: string): Promise<string | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

/**
 * Simple in-memory fallback for development
 */
class InMemoryStore implements RedisClient {
  private store = new Map<string, { value: number; expiresAt: number }>();

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now >= record.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    this.cleanup();
    const record = this.store.get(key);
    if (!record || Date.now() >= record.expiresAt) {
      return null;
    }
    return String(record.value);
  }

  async incr(key: string): Promise<number> {
    this.cleanup();
    const record = this.store.get(key);
    if (record && Date.now() < record.expiresAt) {
      record.value++;
      return record.value;
    }
    this.store.set(key, { value: 1, expiresAt: Date.now() + 3600000 }); // 1 hour default
    return 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const record = this.store.get(key);
    if (record) {
      record.expiresAt = Date.now() + seconds * 1000;
    }
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
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
  }

  async get(key: string): Promise<string | null> {
    return this.executeCommand(['GET', key]);
  }

  async incr(key: string): Promise<number> {
    return this.executeCommand(['INCR', key]);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.executeCommand(['EXPIRE', key, seconds.toString()]);
  }

  async del(key: string): Promise<void> {
    await this.executeCommand(['DEL', key]);
  }
}

function getRedisClient(): RedisClient {
  const redisUrl = env.redis.url();
  const redisToken = env.redis.token();

  if (redisUrl && redisToken) {
    return new UpstashRedisClient(redisUrl, redisToken);
  }

  return new InMemoryStore();
}

const redis = getRedisClient();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 900; // 15 minutes in seconds
const ATTEMPT_WINDOW = 300; // 5 minutes in seconds

/**
 * Check if IP is locked out from authentication
 */
export async function isLockedOut(ip: string): Promise<boolean> {
  const lockoutKey = `auth_lockout:${ip}`;
  const lockout = await redis.get(lockoutKey);
  return lockout !== null;
}

/**
 * Record a failed authentication attempt
 * Returns true if IP should be locked out
 */
export async function recordFailedAuth(ip: string): Promise<boolean> {
  const attemptsKey = `auth_attempts:${ip}`;
  const attempts = await redis.incr(attemptsKey);

  if (attempts === 1) {
    await redis.expire(attemptsKey, ATTEMPT_WINDOW);
  }

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    const lockoutKey = `auth_lockout:${ip}`;
    await redis.incr(lockoutKey);
    await redis.expire(lockoutKey, LOCKOUT_DURATION);
    return true;
  }

  return false;
}

/**
 * Clear failed attempts on successful login
 */
export async function clearFailedAttempts(ip: string): Promise<void> {
  const attemptsKey = `auth_attempts:${ip}`;
  await redis.del(attemptsKey);
}

/**
 * Get remaining lockout time in seconds
 */
export async function getLockoutTimeRemaining(ip: string): Promise<number> {
  const lockoutKey = `auth_lockout:${ip}`;
  const lockout = await redis.get(lockoutKey);
  if (!lockout) return 0;
  
  // In production with real Redis, use TTL command
  // For now, return fixed duration
  return LOCKOUT_DURATION;
}
