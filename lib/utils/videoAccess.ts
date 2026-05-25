/** Minimal video fields used for access checks (shared by API + server data types). */
export type VideoAccessRow = {
  id: string;
  category_id?: string | null;
  access_level?: "free" | "members" | null;
};

export function isVideoFree(video: Pick<VideoAccessRow, "access_level"> | null | undefined): boolean {
  return video?.access_level === "free";
}

export function canWatchVideo(
  video: Pick<VideoAccessRow, "access_level"> | null | undefined,
  isApproved: boolean
): boolean {
  if (!video) return false;
  return isVideoFree(video) || isApproved;
}

export function getVideosInCategory(videos: VideoAccessRow[], categoryId: string): VideoAccessRow[] {
  return videos.filter((v) => v.category_id === categoryId);
}

export function categoryHasFreePreview(videos: VideoAccessRow[], categoryId: string): boolean {
  return getVideosInCategory(videos, categoryId).some(isVideoFree);
}

/** First video a user may open in a course (free preview, or any if approved). */
export function getWatchTargetVideo(
  videos: VideoAccessRow[],
  categoryId: string,
  isApproved: boolean
): VideoAccessRow | null {
  const inCategory = getVideosInCategory(videos, categoryId);
  if (inCategory.length === 0) return null;
  if (isApproved) return inCategory[0];
  return inCategory.find(isVideoFree) ?? null;
}
