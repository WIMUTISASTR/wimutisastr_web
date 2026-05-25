import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getVideoCategoryById } from "@/lib/seo/lookup";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { courseId } = await params;
  const category = await getVideoCategoryById(courseId);
  const name = category?.name ?? "វគ្គវីដេអូ";

  return buildPageMetadata({
    title: name,
    description:
      category?.description ??
      `វគ្គវីដេអូច្បាប់ ${name} — រៀនពីអ្នកជំនាញ WIMUTISASTR។`,
    path: `/law_video/${courseId}`,
    image: category?.cover_url,
  });
}

export default function LawVideoCourseLayout({ children }: LayoutProps) {
  return children;
}
