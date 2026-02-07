/**
 * Cache revalidation utilities for Next.js
 * 
 * Use these functions in API routes or Server Actions when content is updated
 * to invalidate the cached data.
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { VIDEO_CACHE_TAGS } from './videos';
import { BOOK_CACHE_TAGS } from './books';

// Cache profile for revalidation - "default" uses the default cache settings
const CACHE_PROFILE = 'default';

/**
 * Revalidate all video-related caches
 * Call this when videos are created, updated, or deleted
 */
export function revalidateVideos(): void {
  revalidateTag(VIDEO_CACHE_TAGS.ALL, CACHE_PROFILE);
  console.log('[Cache] Revalidated video caches');
}

/**
 * Revalidate video categories cache
 * Call this when categories are created, updated, or deleted
 */
export function revalidateVideoCategories(): void {
  revalidateTag(VIDEO_CACHE_TAGS.CATEGORIES, CACHE_PROFILE);
  console.log('[Cache] Revalidated video category caches');
}

/**
 * Revalidate all book-related caches
 * Call this when books are created, updated, or deleted
 */
export function revalidateBooks(): void {
  revalidateTag(BOOK_CACHE_TAGS.ALL, CACHE_PROFILE);
  console.log('[Cache] Revalidated book caches');
}

/**
 * Revalidate book categories cache
 * Call this when categories are created, updated, or deleted
 */
export function revalidateBookCategories(): void {
  revalidateTag(BOOK_CACHE_TAGS.CATEGORIES, CACHE_PROFILE);
  console.log('[Cache] Revalidated book category caches');
}

/**
 * Revalidate all content caches
 * Call this for bulk updates or when needed
 */
export function revalidateAllContent(): void {
  revalidateVideos();
  revalidateBooks();
}

/**
 * Revalidate specific paths
 */
export function revalidateContentPaths(): void {
  revalidatePath('/law_video');
  revalidatePath('/law_documents');
  console.log('[Cache] Revalidated content paths');
}
