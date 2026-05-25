import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getVideoById, getVideoCategoryById } from "@/lib/seo/lookup";
import { absoluteUrl, SITE_NAME } from "@/lib/seo/site";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ courseId: string; videoId: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { courseId, videoId } = await params;
  const video = await getVideoById(videoId);
  const category = await getVideoCategoryById(courseId);
  const title = video?.title ?? category?.name ?? "វីដេអូច្បាប់";

  return buildPageMetadata({
    title,
    description:
      video?.description ??
      category?.description ??
      `មើលវីដេអូច្បាប់ — ${title}`,
    path: `/law_video/${courseId}/watch/${videoId}`,
    image: video?.thumbnail_url ?? category?.cover_url,
    ogType: "article",
  });
}

export default async function VideoWatchLayout({ children, params }: LayoutProps) {
  const { courseId, videoId } = await params;
  const [video, category] = await Promise.all([
    getVideoById(videoId),
    getVideoCategoryById(courseId),
  ]);

  const courseName = category?.name ?? "វគ្គវីដេអូ";
  const videoTitle = video?.title ?? courseName;
  const pageUrl = absoluteUrl(`/law_video/${courseId}/watch/${videoId}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: courseName,
          description: category?.description ?? undefined,
          url: absoluteUrl(`/law_video/${courseId}`),
          provider: { "@type": "Organization", name: SITE_NAME },
          hasCourseInstance: {
            "@type": "CourseInstance",
            name: videoTitle,
            description: video?.description ?? undefined,
            courseMode: "online",
            url: pageUrl,
          },
        }}
      />
      {children}
    </>
  );
}
