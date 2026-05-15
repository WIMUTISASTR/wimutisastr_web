"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchVideos } from "@/lib/api/client";

export default function VideoCategoryRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.courseId as string;

  useEffect(() => {
    let cancelled = false;
    fetchVideos(categoryId)
      .then((data) => {
        if (cancelled) return;
        const first = data.videos[0];
        if (first) {
          router.replace(`/law_video/${categoryId}/watch/${first.id}`);
        } else {
          router.replace("/law_video");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/law_video");
      });
    return () => { cancelled = true; };
  }, [categoryId, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-(--primary) border-t-transparent mb-3" />
          <p className="text-sm text-gray-500">កំពុងបញ្ជូន...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
