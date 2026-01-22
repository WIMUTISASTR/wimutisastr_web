import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Maximum number of requests allowed in the time window
   * @default 10
   */
  maxRequests?: number;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /**
   * Whether the request should be allowed
   */
  success: boolean;

  /**
   * Maximum number of requests allowed
   */
  limit: number;

  /**
   * Number of requests remaining in current window
   */
  remaining: number;

  /**
   * Timestamp when the rate limit will reset (milliseconds)
   */
  reset: number;
}

/**
 * Store for tracking request counts per IP
 * In production, use Redis or another persistent store
 */
const requestCounts = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

/**
 * Extract client IP address from request
 * Checks various headers in order of preference
 */
function getClientIp(request: NextRequest): string {
  // Check for forwarded IP (from proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  // Check for real IP (some proxies use this)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to unknown (shouldn't happen in production)
  return 'unknown';
}

/**
 * Check if request is within rate limit
 * Uses in-memory storage - for production, use Redis with Upstash
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = rateLimit(request);
 *
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       {
 *         status: 429,
 *         headers: {
 *           'X-RateLimit-Limit': rateLimitResult.limit.toString(),
 *           'X-RateLimit-Remaining': '0',
 *           'X-RateLimit-Reset': rateLimitResult.reset.toString(),
 *         },
 *       }
 *     );
 *   }
 *
 *   // Process request...
 * }
 * ```
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { windowMs = 60 * 1000, maxRequests = 10 } = config;

  const ip = getClientIp(request);
  const now = Date.now();

  const record = requestCounts.get(ip);

  // If no record exists or window has expired, create new record
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    requestCounts.set(ip, { count: 1, resetAt });

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: resetAt,
    };
  }

  // If max requests exceeded, deny request
  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  // Increment count and allow request
  record.count++;

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: record.resetAt,
  };
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
 * Clean up expired entries from the in-memory store
 * Should be called periodically (e.g., every minute)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetAt) {
      requestCounts.delete(key);
    }
  }
}

// Automatically clean up expired entries every minute
// In production, this should be handled by Redis TTL
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 1000);
}

/**
 * Preset rate limit configurations for different API endpoints
 */
export const RateLimitPresets = {
  /**
   * Strict limit for sensitive operations (auth, payment)
   * 5 requests per minute
   */
  strict: { windowMs: 60 * 1000, maxRequests: 5 },

  /**
   * Standard limit for regular API calls
   * 30 requests per minute
   */
  standard: { windowMs: 60 * 1000, maxRequests: 30 },

  /**
   * Relaxed limit for read-only operations
   * 100 requests per minute
   */
  relaxed: { windowMs: 60 * 1000, maxRequests: 100 },

  /**
   * File upload limit
   * 3 uploads per 5 minutes
   */
  upload: { windowMs: 5 * 60 * 1000, maxRequests: 3 },
} as const;
