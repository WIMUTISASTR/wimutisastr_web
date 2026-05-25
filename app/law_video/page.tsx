import PageContainer from "@/components/PageContainer";
import { getVideosData } from "@/lib/data/videos";
import VideoGridClient from "./VideoGridClient";

export const revalidate = 300;

export default async function LawVideoPage() {
  const { categories, videos } = await getVideosData();

  const safeVideos = videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    thumbnail_url: v.thumbnail_url,
    category_id: v.category_id,
    uploaded_at: v.uploaded_at,
    presented_by: v.presented_by,
    access_level: v.access_level,
  }));

  return (
    <PageContainer>
      <VideoGridClient categories={categories} videos={safeVideos} />
    </PageContainer>
  );
}
