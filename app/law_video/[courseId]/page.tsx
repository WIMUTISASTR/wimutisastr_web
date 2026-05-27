"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchVideos } from "@/lib/api/client";
import { useMembership } from "@/lib/hooks/useMembership";
import { isActiveApprovedMembership } from "@/lib/utils/membership";
import { getWatchTargetVideo } from "@/lib/utils/videoAccess";

export default function VideoCategoryRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.courseId as string;
  const { status: membershipStatus, membershipEndsAt } = useMembership();
  const isApproved = isActiveApprovedMembership(membershipStatus, membershipEndsAt);

  useEffect(() => {
    let cancelled = false;
    fetchVideos(categoryId)
      .then((data) => {
        if (cancelled) return;
        const target = getWatchTargetVideo(data.videos, categoryId, isApproved);
        if (target) {
          router.replace(`/law_video/${categoryId}/watch/${target.id}`);
          return;
        }
        if (data.videos.length > 0) {
          router.replace("/pricing_page");
          return;
        }
        router.replace("/law_video");
      })
      .catch(() => {
        if (!cancelled) router.replace("/law_video");
      });
    return () => { cancelled = true; };
  }, [categoryId, isApproved, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-(--primary) border-t-transparent mb-3" />
        <p className="text-sm text-gray-500">កំពុងបញ្ជូន...</p>
      </div>
    </div>
  );
}
