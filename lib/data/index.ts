/**
 * Server-side data fetching utilities with Next.js caching
 * 
 * These functions use Next.js unstable_cache for server-side caching
 * that persists across requests and users.
 */

export * from './videos';
export * from './books';
export * from './revalidate';

// Re-export cache tags for easy invalidation
export { VIDEO_CACHE_TAGS } from './videos';
export { BOOK_CACHE_TAGS } from './books';
