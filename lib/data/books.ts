/**
 * Server-side book data fetching with Next.js caching
 * 
 * This module provides cached data fetching for books and categories.
 * Data is cached and shared across all users, revalidated every 5 minutes.
 */

import { unstable_cache } from 'next/cache';
import { createAdminClient, createServerClient } from '@/lib/supabase/server';

// Create a server-side Supabase client (no auth needed for public data)
function getServerSupabase() {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  return hasServiceRole ? createAdminClient() : createServerClient();
}

export type BookCategory = {
  id: string;
  name: string | null;
  description: string | null;
  cover_url: string | null;
  parent_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BookRow = {
  id: string;
  title: string;
  author: string;
  year: number;
  description: string | null;
  file_url: string | null;
  cover_url: string | null;
  category_id: string | null;
  uploaded_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  access_level: "free" | "members" | null;
};

export type BooksData = {
  categories: BookCategory[];
  books: BookRow[];
};

/**
 * Fetch all book categories (cached)
 */
async function fetchBookCategoriesInternal(): Promise<BookCategory[]> {
  const supabase = getServerSupabase();
  
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description, cover_url, parent_id, created_at, updated_at')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Failed to fetch book categories:', error);
    throw new Error('Failed to fetch book categories');
  }
  
  return data ?? [];
}

/**
 * Fetch all books (cached)
 */
async function fetchBooksInternal(categoryId?: string): Promise<BookRow[]> {
  const supabase = getServerSupabase();
  
  let query = supabase
    .from('books')
    .select('id, title, author, year, description, file_url, cover_url, category_id, uploaded_at, created_at, updated_at, access_level')
    .order('created_at', { ascending: false });
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Failed to fetch books:', error);
    throw new Error('Failed to fetch books');
  }
  
  return data ?? [];
}

/**
 * Cached book categories fetch
 * Revalidates every 5 minutes, can be manually invalidated with tag 'books'
 */
export const getBookCategories = unstable_cache(
  fetchBookCategoriesInternal,
  ['book-categories'],
  {
    revalidate: 300, // 5 minutes
    tags: ['books', 'book-categories'],
  }
);

/**
 * Cached books fetch
 * Revalidates every 5 minutes, can be manually invalidated with tag 'books'
 */
export const getBooks = unstable_cache(
  fetchBooksInternal,
  ['books-list'],
  {
    revalidate: 300, // 5 minutes
    tags: ['books'],
  }
);

/**
 * Get all books data (categories + books) with caching
 */
export async function getBooksData(categoryId?: string): Promise<BooksData> {
  const [categories, books] = await Promise.all([
    getBookCategories(),
    getBooks(categoryId),
  ]);
  
  return { categories, books };
}

/**
 * Cache tags for revalidation
 */
export const BOOK_CACHE_TAGS = {
  ALL: 'books',
  CATEGORIES: 'book-categories',
} as const;
