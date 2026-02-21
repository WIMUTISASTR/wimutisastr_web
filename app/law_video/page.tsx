"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchVideos, type VideoCategory, type VideoRow } from "@/lib/api/client";
import type { VideoCategory as GridVideoCategory, VideoRow as GridVideoRow } from "@/lib/data/videos";
import VideoGridClient from "./VideoGridClient";

export default function LawVideoPage() {
  const [categories, setCategories] = useState<GridVideoCategory[]>([]);
  const [videos, setVideos] = useState<GridVideoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchVideos();
        if (!cancelled) {
          const mappedCategories: GridVideoCategory[] = (data.categories ?? []).map((c: VideoCategory) => ({
            id: c.id,
            name: c.name ?? null,
            description: c.description ?? null,
            cover_url: c.cover_url ?? null,
          }));

          const mappedVideos: GridVideoRow[] = (data.videos ?? []).map((v: VideoRow) => ({
            id: v.id,
            title: v.title ?? null,
            description: v.description ?? null,
            file_url: v.file_url ?? null,
            thumbnail_url: v.thumbnail_url ?? null,
            category_id: v.category_id ?? null,
            uploaded_at: v.uploaded_at ?? null,
            presented_by: v.presented_by ?? null,
            access_level: v.access_level ?? null,
          }));

          setCategories(mappedCategories);
          setVideos(mappedVideos);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "ផ្ទុកវគ្គសិក្សាមិនជោគជ័យ។");
          setCategories([]);
          setVideos([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProtectedRoute>
      <PageContainer>
        {isLoading ? (
          <section className="min-h-[50vh] flex items-center justify-center px-4">
            <div className="text-center text-gray-600">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-(--brown) border-t-transparent mb-3" />
              <p>កំពុងផ្ទុកវគ្គសិក្សា...</p>
            </div>
          </section>
        ) : error ? (
          <section className="min-h-[50vh] flex items-center justify-center px-4">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold mb-2">មិនអាចផ្ទុកវគ្គសិក្សា</p>
              <p className="text-sm">{error}</p>
            </div>
          </section>
        ) : (
          <VideoGridClient categories={categories} videos={videos} />
        )}
      </PageContainer>
    </ProtectedRoute>
  );
}
