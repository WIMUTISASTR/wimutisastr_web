"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import { fetchBooks, type BookCategory, type BookRow } from "@/lib/api/client";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import LoadingState from "@/components/LoadingState";
import { useMembership } from "@/lib/hooks/useMembership";

const FALLBACK_COVER = "/sample_book/cover/book1.png";
const ALL_CATEGORY_ID = "__all__";

function isAnimatedImageUrl(src: string) {
  return /\.gif(\?|#|$)/i.test(src);
}

function shouldDisableImageOptimization(src: string) {
  return src.includes(".r2.dev/");
}

export default function DocumentCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;

  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status: membershipStatus } = useMembership();
  const isApproved = membershipStatus === "approved";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchBooks(categoryId === ALL_CATEGORY_ID ? undefined : categoryId);
        if (!cancelled) {
          setCategories(data.categories);
          setBooks(data.books);
        }
      } catch (e: unknown) {
        console.error(e);
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load documents.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const category = useMemo(() => categories.find((c) => c.id === categoryId) ?? null, [categories, categoryId]);

  return (
    <PageContainer>
        <section className="relative bg-slate-900 text-white py-14 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src="/asset/document_background.png" alt="Documents background" fill className="object-cover" priority sizes="100vw" fetchPriority="high" />
          </div>
          <div className="absolute inset-0 bg-slate-900/65 z-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
            <Link href="/law_documents" className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Categories
            </Link>
            <h1 className="text-3xl font-semibold">{category?.name ?? "Documents"}</h1>
            <p className="text-gray-300 max-w-3xl">{category?.description ?? ""}</p>
          </div>
        </section>

        <section className="py-12 px-2 sm:px-4 lg:px-6">
          <div className="w-[80vw] max-w-[80vw] mx-auto">
            {isLoading ? (
              <div className="py-16">
                <LoadingState label="Loading documents..." />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-16">{error}</div>
            ) : books.length === 0 ? (
              <div className="text-center text-gray-600 py-16">No documents in this category.</div>
            ) : (
              <div className="space-y-6">
                {books.map((doc, index) => {
                  const cover = normalizeNextImageSrc(doc.cover_url, FALLBACK_COVER);
                  const unoptimized = isAnimatedImageUrl(cover) || shouldDisableImageOptimization(cover);
                  const isLocked = !isApproved && doc.access_level !== "free";
                  return (
                    <div key={doc.id} className="bg-white overflow-hidden">
                      <div className="p-6 grid md:grid-cols-3 gap-6">
                        <Link
                          href={`/law_documents/${categoryId}/read/${doc.id}`}
                          className="relative w-full aspect-3/4 overflow-hidden block group bg-gray-100"
                          aria-label={`Read ${doc.title}`}
                          onClick={(e) => {
                            if (!isLocked) return;
                            e.preventDefault();
                            router.push("/pricing_page");
                          }}
                        >
                          <Image
                            src={cover}
                            alt={doc.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            unoptimized={unoptimized}
                          />
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                                Members only
                              </span>
                            </div>
                          )}
                          <div />
                        </Link>

                        <div className="md:col-span-2 flex flex-col justify-center">
                          <Link
                            href={`/law_documents/${categoryId}/read/${doc.id}`}
                            className="group"
                            onClick={(e) => {
                              if (!isLocked) return;
                              e.preventDefault();
                              router.push("/pricing_page");
                            }}
                          >
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-(--brown) transition-colors">
                              {index + 1}. {doc.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>{doc.author}</span>
                            <span>{doc.year}</span>
                          </div>
                          {doc.description ? <p className="text-gray-700 mb-4">{doc.description}</p> : null}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => router.push(isLocked ? "/pricing_page" : `/law_documents/${categoryId}/read/${doc.id}`)}
                              className="rounded-full bg-(--primary) text-white px-8 py-2.5 font-semibold shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--primary) focus:ring-offset-2 transition-opacity"
                            >
                              {isLocked ? "Upgrade to Access" : "Read"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
    </PageContainer>
  );
}

