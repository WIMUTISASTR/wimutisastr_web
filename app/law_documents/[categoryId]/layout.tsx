import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getBookCategoryById } from "@/lib/seo/lookup";

const ALL_CATEGORY_ID = "__all__";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ categoryId: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { categoryId } = await params;

  if (categoryId === ALL_CATEGORY_ID) {
    return buildPageMetadata({
      title: "ឯកសារច្បាប់ទាំងអស់",
      description: "រុករកឯកសារច្បាប់ទាំងអស់ — តម្រៀបតាមប្រភេទ និងឆ្នាំ។",
      path: `/law_documents/${ALL_CATEGORY_ID}`,
    });
  }

  const category = await getBookCategoryById(categoryId);
  const name = category?.name ?? "ឯកសារច្បាប់";

  return buildPageMetadata({
    title: name,
    description:
      category?.description ??
      `រុករកឯកសារច្បាប់ក្នុងប្រភេទ ${name} — ធនធានអប់រំច្បាប់ពី WIMUTISASTR។`,
    path: `/law_documents/${categoryId}`,
    image: category?.cover_url,
  });
}

export default function LawDocumentCategoryLayout({ children }: LayoutProps) {
  return children;
}
