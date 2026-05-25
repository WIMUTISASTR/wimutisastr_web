import { getBookCategories, getBooks, type BookCategory, type BookRow } from "@/lib/data/books";
import { getVideoCategories, getVideos, type VideoCategory, type VideoRow } from "@/lib/data/videos";

export async function getBookCategoryById(categoryId: string): Promise<BookCategory | null> {
  const categories = await getBookCategories();
  return categories.find((c) => c.id === categoryId) ?? null;
}

export async function getBookById(bookId: string): Promise<BookRow | null> {
  const books = await getBooks();
  return books.find((b) => b.id === bookId) ?? null;
}

export async function getVideoCategoryById(categoryId: string): Promise<VideoCategory | null> {
  const categories = await getVideoCategories();
  return categories.find((c) => c.id === categoryId) ?? null;
}

export async function getVideoById(videoId: string): Promise<VideoRow | null> {
  const videos = await getVideos();
  return videos.find((v) => v.id === videoId) ?? null;
}
