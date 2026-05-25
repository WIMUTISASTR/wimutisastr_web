import type { VideoRow } from "@/lib/data/videos";

export function isVideoFree(video: Pick<VideoRow, "access_level"> | null | undefined): boolean {
  return video?.access_level === "free";
}

export function canWatchVideo(
  video: Pick<VideoRow, "access_level"> | null | undefined,
  isApproved: boolean
): boolean {
  if (!video) return false;
  return isVideoFree(video) || isApproved;
}

export function getVideosInCategory(videos: VideoRow[], categoryId: string): VideoRow[] {
  return videos.filter((v) => v.category_id === categoryId);
}

export function categoryHasFreePreview(videos: VideoRow[], categoryId: string): boolean {
  return getVideosInCategory(videos, categoryId).some(isVideoFree);
}

/** First video a user may open in a course (free preview, or any if approved). */
export function getWatchTargetVideo(
  videos: VideoRow[],
  categoryId: string,
  isApproved: boolean
): VideoRow | null {
  const inCategory = getVideosInCategory(videos, categoryId);
  if (inCategory.length === 0) return null;
  if (isApproved) return inCategory[0];
  return inCategory.find(isVideoFree) ?? null;
}
