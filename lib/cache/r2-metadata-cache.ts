/**
 * R2 Object Metadata Caching
 * 
 * Caches HeadObjectCommand responses to reduce R2 API calls.
 * TTL: 1 hour (files rarely change)
 */

import { cache, CacheKeys, CacheTTL } from './cache-client';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'r2-metadata-cache' });

/**
 * Cached R2 object metadata
 */
export interface CachedR2Metadata {
  /** File size in bytes */
  size: number;
  /** Content type */
  contentType?: string;
  /** ETag for cache validation */
  etag?: string;
  /** Last modified timestamp */
  lastModified?: string;
  /** When this was cached */
  cachedAt: number;
}

/**
 * Get cached R2 object metadata
 */
export async function getCachedR2Metadata(
  bucket: string,
  key: string
): Promise<CachedR2Metadata | null> {
  const cacheKey = CacheKeys.r2Meta(bucket, key);
  return cache.get<CachedR2Metadata>(cacheKey);
}

/**
 * Cache R2 object metadata
 */
export async function cacheR2Metadata(
  bucket: string,
  key: string,
  metadata: Omit<CachedR2Metadata, 'cachedAt'>,
  ttlSeconds: number = CacheTTL.R2_METADATA
): Promise<void> {
  const cacheKey = CacheKeys.r2Meta(bucket, key);
  const data: CachedR2Metadata = {
    ...metadata,
    cachedAt: Date.now(),
  };
  
  await cache.set(cacheKey, data, ttlSeconds);
  log.debug('Cached R2 metadata', { bucket, key, size: metadata.size });
}

/**
 * Invalidate cached R2 metadata
 * Call this when a file is updated or deleted
 */
export async function invalidateR2MetadataCache(
  bucket: string,
  key: string
): Promise<void> {
  const cacheKey = CacheKeys.r2Meta(bucket, key);
  await cache.del(cacheKey);
  log.debug('Invalidated R2 metadata cache', { bucket, key });
}

/**
 * Get R2 metadata with caching
 * 
 * @param bucket - R2 bucket name
 * @param key - Object key
 * @param fetchFromR2 - Function to fetch metadata from R2 if not cached
 * @returns Object metadata and whether it was cached
 */
export async function getR2MetadataWithCache(
  bucket: string,
  key: string,
  fetchFromR2: () => Promise<Omit<CachedR2Metadata, 'cachedAt'> | null>
): Promise<{
  metadata: CachedR2Metadata | null;
  fromCache: boolean;
}> {
  // Try cache first
  const cached = await getCachedR2Metadata(bucket, key);
  
  if (cached) {
    log.debug('R2 metadata cache hit', { bucket, key });
    return {
      metadata: cached,
      fromCache: true,
    };
  }

  // Cache miss - fetch from R2
  log.debug('R2 metadata cache miss, fetching from R2', { bucket, key });
  const fresh = await fetchFromR2();
  
  if (!fresh) {
    return { metadata: null, fromCache: false };
  }
  
  // Cache the result
  await cacheR2Metadata(bucket, key, fresh);
  
  return {
    metadata: { ...fresh, cachedAt: Date.now() },
    fromCache: false,
  };
}
