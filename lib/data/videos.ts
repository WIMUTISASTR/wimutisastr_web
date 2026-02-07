/**
 * Server-side video data fetching with Next.js caching
 * 
 * This module provides cached data fetching for videos and categories.
 * Data is cached and shared across all users, revalidated every 5 minutes.
 */

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client (no auth needed for public data)
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(url, anonKey);
}

export type VideoCategory = {
  id: string;
  name: string | null;
  description: string | null;
  cover_url: string | null;
};

export type VideoRow = {
  id: string;
  title: string | null;
  description: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  uploaded_at: string | null;
  presented_by: string | null;
  access_level: "free" | "members" | null;
};

export type VideosData = {
  categories: VideoCategory[];
  videos: VideoRow[];
};

/**
 * Fetch all video categories (cached)
 */
async function fetchVideoCategoriesInternal(): Promise<VideoCategory[]> {
  const supabase = getServerSupabase();
  
  const { data, error } = await supabase
    .from('video_categories')
    .select('id, name, description, cover_url')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Failed to fetch video categories:', error);
    throw new Error('Failed to fetch video categories');
  }
  
  return data ?? [];
}

/**
 * Fetch all videos (cached)
 */
async function fetchVideosInternal(categoryId?: string): Promise<VideoRow[]> {
  const supabase = getServerSupabase();
  
  let query = supabase
    .from('videos')
    .select('id, title, description, file_url, thumbnail_url, category_id, uploaded_at, presented_by, access_level')
    .order('uploaded_at', { ascending: false });
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Failed to fetch videos:', error);
    throw new Error('Failed to fetch videos');
  }
  
  return data ?? [];
}

/**
 * Cached video categories fetch
 * Revalidates every 5 minutes, can be manually invalidated with tag 'videos'
 */
export const getVideoCategories = unstable_cache(
  fetchVideoCategoriesInternal,
  ['video-categories'],
  {
    revalidate: 300, // 5 minutes
    tags: ['videos', 'video-categories'],
  }
);

/**
 * Cached videos fetch
 * Revalidates every 5 minutes, can be manually invalidated with tag 'videos'
 */
export const getVideos = unstable_cache(
  fetchVideosInternal,
  ['videos-list'],
  {
    revalidate: 300, // 5 minutes
    tags: ['videos'],
  }
);

/**
 * Get all videos data (categories + videos) with caching
 */
export async function getVideosData(categoryId?: string): Promise<VideosData> {
  const [categories, videos] = await Promise.all([
    getVideoCategories(),
    getVideos(categoryId),
  ]);
  
  return { categories, videos };
}

/**
 * Cache tags for revalidation
 */
export const VIDEO_CACHE_TAGS = {
  ALL: 'videos',
  CATEGORIES: 'video-categories',
} as const;
