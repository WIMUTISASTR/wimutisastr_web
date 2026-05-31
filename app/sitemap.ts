import type { MetadataRoute } from "next";
import { getBookCategories, getBooks } from "@/lib/data/books";
import { getVideoCategories, getVideos } from "@/lib/data/videos";
import { getSiteUrl } from "@/lib/seo/site";

const ALL_CATEGORY_ID = "__all__";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about_us`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/law_documents`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${baseUrl}/law_documents/${ALL_CATEGORY_ID}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    { url: `${baseUrl}/law_video`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing_page`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${baseUrl}/training_program`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const [bookCategories, books, videoCategories, videos] = await Promise.all([
      getBookCategories(),
      getBooks(),
      getVideoCategories(),
      getVideos(),
    ]);

    const bookCategoryRoutes: MetadataRoute.Sitemap = bookCategories.map((cat) => ({
      url: `${baseUrl}/law_documents/${cat.id}`,
      lastModified: cat.updated_at ? new Date(cat.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const bookRoutes: MetadataRoute.Sitemap = books.map((book) => {
      const categorySegment = book.category_id ?? ALL_CATEGORY_ID;
      return {
        url: `${baseUrl}/law_documents/${categorySegment}/read/${book.id}`,
        lastModified: book.updated_at
          ? new Date(book.updated_at)
          : book.uploaded_at
            ? new Date(book.uploaded_at)
            : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    });

    const videoCategoryRoutes: MetadataRoute.Sitemap = videoCategories.map((cat) => ({
      url: `${baseUrl}/law_video/${cat.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const videoRoutes: MetadataRoute.Sitemap = videos
      .filter((v) => v.category_id)
      .map((video) => ({
        url: `${baseUrl}/law_video/${video.category_id}/watch/${video.id}`,
        lastModified: video.uploaded_at ? new Date(video.uploaded_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      }));

    return [
      ...staticRoutes,
      ...bookCategoryRoutes,
      ...bookRoutes,
      ...videoCategoryRoutes,
      ...videoRoutes,
    ];
  } catch (error) {
    console.error("[sitemap] Failed to load dynamic routes:", error);
    return staticRoutes;
  }
}
