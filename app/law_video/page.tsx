import PageContainer from "@/components/PageContainer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getVideosData } from "@/lib/data/videos";
import VideoGridClient from "./VideoGridClient";

// Revalidate this page every 5 minutes
export const revalidate = 300;

export default async function LawVideoPage() {
  // Fetch data on the server with caching
  const { categories, videos } = await getVideosData();

  return (
    <ProtectedRoute>
      <PageContainer>
        {/* Pass server data to client component for interactivity */}
        <VideoGridClient 
          categories={categories} 
          videos={videos} 
        />
      </PageContainer>
    </ProtectedRoute>
  );
}
