"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/compounents/PageContainer";
import Button from "@/compounents/Button";
import ProtectedRoute from "@/compounents/ProtectedRoute";
import LoadingState from "@/compounents/LoadingState";
import { apiPost, fetchBooks, type BookCategory, type BookRow } from "@/lib/api/client";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import { useMembership } from "@/lib/hooks/useMembership";

const FALLBACK_COVER = "/sample_book/cover/book1.png";
const ALL_CATEGORY_ID = "__all__";

function isAnimatedImageUrl(src: string) {
  return /\.gif(\?|#|$)/i.test(src);
}

export default function ReadDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const bookId = params.bookId as string;

  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewToken, setViewToken] = useState<string | null>(null);
  const [viewExt, setViewExt] = useState<string | null>(null);
  const [viewFilename, setViewFilename] = useState<string | null>(null);
  const { status: membershipStatus, isLoading: membershipLoading } = useMembership();

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
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load document.");
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
  const currentIndex = useMemo(() => books.findIndex((b) => b.id === bookId), [books, bookId]);
  const current = currentIndex >= 0 ? books[currentIndex] : null;

  const prev = currentIndex > 0 ? books[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < books.length - 1 ? books[currentIndex + 1] : null;

  const cover = normalizeNextImageSrc(current?.cover_url, FALLBACK_COVER);
  const coverUnoptimized = isAnimatedImageUrl(cover);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setViewToken(null);
        setViewExt(null);
        setViewFilename(null);
        if (!bookId) return;
        if (membershipStatus !== "approved") return;
        const res = await apiPost<{ token: string; ext?: string; filename?: string }>("/api/books/view-token", { bookId });
        if (!cancelled) {
          setViewToken(res.token);
          setViewExt(res.ext ? String(res.ext).toLowerCase() : null);
          setViewFilename(res.filename ?? null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Failed to open document.");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [bookId, membershipStatus]);

  const serveUrl = useMemo(() => {
    if (!viewToken) return null;
    if (typeof window === "undefined") return null;
    return `${window.location.origin}/api/books/serve?token=${encodeURIComponent(viewToken)}`;
  }, [viewToken]);

  const officeEmbedUrl = useMemo(() => {
    if (!serveUrl) return null;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(serveUrl)}`;
  }, [serveUrl]);

  return (
    <ProtectedRoute>
      <PageContainer>
        <section className="py-8 px-2 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/law_documents/${categoryId}`} className="text-sm text-gray-600 hover:text-gray-900">
                  ← Back to {category?.name ?? "Documents"}
                </Link>
                <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900 truncate">{current?.title ?? "Read Document"}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                  {current?.author ? <span>{current.author}</span> : null}
                  {typeof current?.year === "number" ? <span>{current.year}</span> : null}
                  {currentIndex >= 0 ? <span>Document {currentIndex + 1} of {books.length}</span> : null}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Button onClick={() => prev && router.push(`/law_documents/${categoryId}/read/${prev.id}`)} variant="secondary" disabled={!prev}>
                  Prev
                </Button>
                <Button onClick={() => next && router.push(`/law_documents/${categoryId}/read/${next.id}`)} variant="primary" disabled={!next}>
                  Next
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-16">
                <LoadingState label="Loading document..." />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-16">{error}</div>
            ) : !current ? (
              <div className="text-center text-gray-600 py-16">Document not found.</div>
            ) : membershipLoading ? (
              <div className="py-16">
                <LoadingState label="Checking membership..." />
              </div>
            ) : membershipStatus !== "approved" ? (
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="relative w-full aspect-4/3 bg-black">
                      <Image src={cover} alt={current.title} fill className="object-cover opacity-65" sizes="100vw" unoptimized={coverUnoptimized} />
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
                        <div>
                          <div className="text-xl font-semibold mb-2">Membership required</div>
                          <div className="text-sm text-white/85 mb-5">You can browse categories and covers, but reading documents is for members only.</div>
                          <Button onClick={() => router.push("/pricing_page")} variant="primary">
                            Upgrade Membership
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-gray-900 truncate">Reader</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500">Protected view</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!viewToken}
                          onClick={() => {
                            if (!viewToken) return;
                            const url = serveUrl ?? `/api/books/serve?token=${encodeURIComponent(viewToken)}`;
                            const w = window.open(url, "_blank", "noopener");
                            if (w) w.opener = null;
                          }}
                        >
                          View full page
                        </Button>
                      </div>
                    </div>

                    <div className="bg-slate-50">
                      {/* Use native viewers (PDF browser viewer / Office viewer) */}
                      {viewToken ? (
                        viewExt === "docx" || viewExt === "doc" ? (
                          <div className="w-full h-[75vh] bg-white overflow-auto p-5">
                            <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">Document Viewer</div>
                                {viewFilename ? <div className="text-xs text-gray-500 truncate">{viewFilename}</div> : null}
                              </div>
                              <a
                                className="text-xs font-semibold text-(--brown) hover:underline shrink-0"
                                href={serveUrl ?? `/api/books/serve?token=${encodeURIComponent(viewToken)}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open / Download
                              </a>
                            </div>
                            {officeEmbedUrl ? (
                              <iframe
                                title={current.title}
                                src={officeEmbedUrl}
                                className="w-full h-[65vh] bg-white mt-4 rounded-lg border border-gray-200"
                              />
                            ) : (
                              <div className="py-10 text-center text-gray-700">
                                <div className="font-semibold mb-2">Preparing viewer…</div>
                                <div className="text-sm text-gray-600">Please wait a moment.</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <iframe
                            title={current.title}
                            src={`/api/books/serve?token=${encodeURIComponent(viewToken)}`}
                            className="w-full h-[75vh] bg-white"
                          />
                        )
                      ) : (
                        <div className="p-6 text-center text-gray-700">
                          <div className="font-semibold mb-2">Preparing secure reader…</div>
                          <div className="text-sm text-gray-600">Please wait a moment.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </ProtectedRoute>
  );
}

