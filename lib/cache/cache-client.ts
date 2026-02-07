/**
 * Unified caching utility with Redis (production) and in-memory (development) support
 * 
 * Provides a simple key-value cache with TTL support for:
 * - Membership status caching
 * - R2 object metadata caching
 * - Token verification caching (optional)
 */

import { env } from '../utils/env';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'cache' });

/**
 * Cache client interface
 */
interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/**
 * Upstash Redis cache client using REST API
 */
class UpstashCacheClient implements CacheClient {
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
      log.error('Redis cache command failed', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.executeCommand(['GET', key]);
      if (result === null) return null;
      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.executeCommand(['SETEX', key, ttlSeconds.toString(), JSON.stringify(value)]);
  }

  async del(key: string): Promise<void> {
    await this.executeCommand(['DEL', key]);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.executeCommand(['EXISTS', key]);
    return result === 1;
  }
}

/**
 * In-memory cache client for development
 */
class InMemoryCacheClient implements CacheClient {
  private store = new Map<string, { value: unknown; expiresAt: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic cleanup every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    for (const [key, record] of entries) {
      if (now >= record.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const record = this.store.get(key);
    if (!record) return null;
    
    if (Date.now() >= record.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return record.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const record = this.store.get(key);
    if (!record) return false;
    
    if (Date.now() >= record.expiresAt) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }
}

/**
 * Get cache client (Upstash in production, in-memory in development)
 */
function getCacheClient(): CacheClient {
  const redisUrl = env.redis.url();
  const redisToken = env.redis.token();

  if (redisUrl && redisToken) {
    log.debug('Using Upstash Redis for caching');
    return new UpstashCacheClient(redisUrl, redisToken);
  }

  log.warn('Redis not configured, using in-memory cache (not suitable for production)');
  return new InMemoryCacheClient();
}

// Singleton cache client
let cacheClientInstance: CacheClient | null = null;

function getClient(): CacheClient {
  if (!cacheClientInstance) {
    cacheClientInstance = getCacheClient();
  }
  return cacheClientInstance;
}

/**
 * Cache key prefixes for different data types
 */
export const CacheKeys = {
  /** Membership status: membership:{userId} */
  membership: (userId: string) => `membership:${userId}`,
  
  /** R2 object metadata: r2_meta:{bucket}:{key} */
  r2Meta: (bucket: string, key: string) => `r2_meta:${bucket}:${key}`,
  
  /** Token verification (optional): token:{hash} */
  token: (tokenHash: string) => `token:${tokenHash}`,
} as const;

/**
 * Cache TTL presets in seconds
 */
export const CacheTTL = {
  /** Membership status: 5 minutes */
  MEMBERSHIP: 5 * 60,
  
  /** R2 metadata: 1 hour */
  R2_METADATA: 60 * 60,
  
  /** Token verification: 15 minutes (shorter than token expiry) */
  TOKEN: 15 * 60,
  
  /** Short-lived cache: 1 minute */
  SHORT: 60,
  
  /** Medium cache: 10 minutes */
  MEDIUM: 10 * 60,
  
  /** Long cache: 1 hour */
  LONG: 60 * 60,
} as const;

/**
 * Cache operations wrapper with error handling
 */
export const cache = {
  /**
   * Get a cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await getClient().get<T>(key);
      if (result !== null) {
        log.debug('Cache hit', { key });
      }
      return result;
    } catch (error) {
      log.error('Cache get failed', error, { key });
      return null;
    }
  },

  /**
   * Set a cached value with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = CacheTTL.MEDIUM): Promise<void> {
    try {
      await getClient().set(key, value, ttlSeconds);
      log.debug('Cache set', { key, ttl: ttlSeconds });
    } catch (error) {
      log.error('Cache set failed', error, { key });
      // Don't throw - cache failures shouldn't break the app
    }
  },

  /**
   * Delete a cached value
   */
  async del(key: string): Promise<void> {
    try {
      await getClient().del(key);
      log.debug('Cache delete', { key });
    } catch (error) {
      log.error('Cache delete failed', error, { key });
    }
  },

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      return await getClient().exists(key);
    } catch (error) {
      log.error('Cache exists check failed', error, { key });
      return false;
    }
  },

  /**
   * Get or set pattern - returns cached value or fetches and caches it
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = CacheTTL.MEDIUM
  ): Promise<T> {
    // Try to get from cache first
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();
    
    // Cache the result (don't await to avoid blocking)
    cache.set(key, fresh, ttlSeconds).catch(() => {
      // Already logged in set()
    });

    return fresh;
  },

  /**
   * Invalidate multiple keys matching a pattern prefix
   * Note: This is a simple implementation - for production with many keys,
   * consider using Redis SCAN command
   */
  async invalidatePrefix(prefix: string): Promise<void> {
    log.debug('Cache invalidate prefix requested', { prefix });
    // For simple use cases, we rely on TTL expiration
    // For critical invalidation, explicitly delete known keys
  },
};

export default cache;
