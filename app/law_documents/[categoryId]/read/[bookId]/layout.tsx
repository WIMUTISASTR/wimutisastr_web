import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getBookById, getBookCategoryById } from "@/lib/seo/lookup";
import { absoluteUrl, SITE_NAME } from "@/lib/seo/site";

const ALL_CATEGORY_ID = "__all__";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ categoryId: string; bookId: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { categoryId, bookId } = await params;
  const book = await getBookById(bookId);

  if (!book) {
    return buildPageMetadata({
      title: "ឯកសារច្បាប់",
      path: `/law_documents/${categoryId}/read/${bookId}`,
    });
  }

  const category =
    categoryId !== ALL_CATEGORY_ID ? await getBookCategoryById(categoryId) : null;
  const categoryLabel = category?.name ?? "ឯកសារច្បាប់";

  return buildPageMetadata({
    title: book.title,
    description:
      book.description ??
      `${book.title} — ${book.author} (${book.year}) · ${categoryLabel}`,
    path: `/law_documents/${categoryId}/read/${bookId}`,
    image: book.cover_url,
    ogType: "article",
  });
}

export default async function BookReadLayout({ children, params }: LayoutProps) {
  const { categoryId, bookId } = await params;
  const book = await getBookById(bookId);

  if (!book) {
    return children;
  }

  const bookUrl = absoluteUrl(`/law_documents/${categoryId}/read/${bookId}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: book.title,
          author: { "@type": "Person", name: book.author },
          datePublished: String(book.year),
          description: book.description ?? undefined,
          image: book.cover_url ?? undefined,
          url: bookUrl,
          publisher: { "@type": "Organization", name: SITE_NAME },
        }}
      />
      {children}
    </>
  );
}
