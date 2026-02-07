/**
 * Membership status caching
 * 
 * Caches user membership status to reduce database queries.
 * TTL: 5 minutes (configurable)
 */

import { cache, CacheKeys, CacheTTL } from './cache-client';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'membership-cache' });

/**
 * Cached membership status data
 */
export interface CachedMembershipStatus {
  status: 'approved' | 'pending' | 'rejected' | 'expired' | 'none';
  membershipEndsAt?: string | null;
  cachedAt: number;
}

/**
 * Get cached membership status for a user
 */
export async function getCachedMembershipStatus(
  userId: string
): Promise<CachedMembershipStatus | null> {
  const key = CacheKeys.membership(userId);
  return cache.get<CachedMembershipStatus>(key);
}

/**
 * Cache membership status for a user
 */
export async function cacheMembershipStatus(
  userId: string,
  status: CachedMembershipStatus['status'],
  membershipEndsAt?: string | null,
  ttlSeconds: number = CacheTTL.MEMBERSHIP
): Promise<void> {
  const key = CacheKeys.membership(userId);
  const data: CachedMembershipStatus = {
    status,
    membershipEndsAt,
    cachedAt: Date.now(),
  };
  
  await cache.set(key, data, ttlSeconds);
  log.debug('Cached membership status', { userId, status });
}

/**
 * Invalidate cached membership status for a user
 * Call this when membership status changes (payment approved, subscription expired, etc.)
 */
export async function invalidateMembershipCache(userId: string): Promise<void> {
  const key = CacheKeys.membership(userId);
  await cache.del(key);
  log.info('Invalidated membership cache', { userId });
}

/**
 * Check if user has approved membership with caching
 * 
 * @param userId - User ID to check
 * @param fetchFromDb - Function to fetch membership status from database if not cached
 * @returns Object with membership status and whether it was cached
 */
export async function checkMembershipWithCache(
  userId: string,
  fetchFromDb: () => Promise<{ status: CachedMembershipStatus['status']; membershipEndsAt?: string | null }>
): Promise<{ 
  status: CachedMembershipStatus['status']; 
  membershipEndsAt?: string | null;
  fromCache: boolean;
}> {
  // Try cache first
  const cached = await getCachedMembershipStatus(userId);
  
  if (cached) {
    log.debug('Membership cache hit', { userId, status: cached.status });
    return {
      status: cached.status,
      membershipEndsAt: cached.membershipEndsAt,
      fromCache: true,
    };
  }

  // Cache miss - fetch from database
  log.debug('Membership cache miss, fetching from DB', { userId });
  const fresh = await fetchFromDb();
  
  // Cache the result
  await cacheMembershipStatus(userId, fresh.status, fresh.membershipEndsAt);
  
  return {
    status: fresh.status,
    membershipEndsAt: fresh.membershipEndsAt,
    fromCache: false,
  };
}

/**
 * Helper to check if membership is approved (cached)
 */
export async function isApprovedMemberCached(
  userId: string,
  fetchFromDb: () => Promise<{ status: CachedMembershipStatus['status']; membershipEndsAt?: string | null }>
): Promise<boolean> {
  const result = await checkMembershipWithCache(userId, fetchFromDb);
  return result.status === 'approved';
}
