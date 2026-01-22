"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import mammoth from "mammoth";
import DOMPurify from "isomorphic-dompurify";
import PageContainer from "@/compounents/PageContainer";
import Button from "@/compounents/Button";
import ProtectedRoute from "@/compounents/ProtectedRoute";
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
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [docxLoading, setDocxLoading] = useState(false);
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
        setDocxHtml(null);
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

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!viewToken) return;
      if (viewExt !== "docx") return;
      try {
        setDocxLoading(true);
        setDocxHtml(null);
        const res = await fetch(`/api/books/serve?token=${encodeURIComponent(viewToken)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        const { value } = await mammoth.convertToHtml({ arrayBuffer });
        if (!cancelled) setDocxHtml(value || "");
      } catch (e) {
        console.error(e);
        if (!cancelled) setDocxHtml(null);
      } finally {
        if (!cancelled) setDocxLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [viewToken, viewExt]);

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
              <div className="text-center text-gray-600 py-16">Loading…</div>
            ) : error ? (
              <div className="text-center text-red-600 py-16">{error}</div>
            ) : !current ? (
              <div className="text-center text-gray-600 py-16">Document not found.</div>
            ) : membershipLoading ? (
              <div className="text-center text-gray-600 py-16">Checking membership…</div>
            ) : membershipStatus !== "approved" ? (
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="relative w-full aspect-4/3 bg-black">
                      <Image src={cover} alt={current.title} fill className="object-cover opacity-65" sizes="100vw" unoptimized={coverUnoptimized} />
                      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/30 to-black/20" />
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

                <aside className="lg:col-span-4">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200">
                      <div className="font-semibold text-gray-900">Documents</div>
                      <div className="text-sm text-gray-600">{category?.name ?? "Category"}</div>
                    </div>
                    <div className="max-h-[75vh] overflow-auto">
                      {books.map((b, idx) => {
                        const active = b.id === bookId;
                        const bCover = normalizeNextImageSrc(b.cover_url, FALLBACK_COVER);
                        const bCoverUnoptimized = isAnimatedImageUrl(bCover);
                        return (
                          <button
                            key={b.id}
                            onClick={() => router.push(`/law_documents/${categoryId}/read/${b.id}`)}
                            className={[
                              "w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors",
                              active ? "bg-[rgba(161,105,63,0.08)]" : "",
                            ].join(" ")}
                          >
                            <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                              <Image src={bCover} alt={b.title} fill className="object-cover" sizes="64px" unoptimized={bCoverUnoptimized} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={["text-sm font-semibold line-clamp-2", active ? "text-(--brown)" : "text-gray-900"].join(" ")}>
                                {idx + 1}. {b.title}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {[b.author, String(b.year)].filter(Boolean).join(" • ")}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-gray-900 truncate">Reader</div>
                      <div className="text-xs text-gray-500">Protected view</div>
                    </div>

                    <div className="bg-slate-50">
                      {/* Use iframe for broad PDF support without extra dependencies */}
                      {viewToken ? (
                        viewExt === "docx" ? (
                          <div className="w-full h-[75vh] bg-white overflow-auto p-5">
                            <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">DOCX Viewer</div>
                                {viewFilename ? <div className="text-xs text-gray-500 truncate">{viewFilename}</div> : null}
                              </div>
                              <a
                                className="text-xs font-semibold text-(--brown) hover:underline shrink-0"
                                href={`/api/books/serve?token=${encodeURIComponent(viewToken)}`}
                              >
                                Download
                              </a>
                            </div>
                            {docxLoading ? (
                              <div className="py-10 text-center text-gray-700">
                                <div className="font-semibold mb-2">Rendering DOCX…</div>
                                <div className="text-sm text-gray-600">Please wait a moment.</div>
                              </div>
                            ) : docxHtml !== null ? (
                              <div 
                                className="prose prose-slate max-w-none pt-4" 
                                dangerouslySetInnerHTML={{ 
                                  __html: DOMPurify.sanitize(docxHtml, {
                                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                                                   'ul', 'ol', 'li', 'a', 'span', 'div', 'table', 'thead', 'tbody', 
                                                   'tr', 'td', 'th', 'img', 'blockquote', 'pre', 'code'],
                                    ALLOWED_ATTR: ['href', 'class', 'style', 'src', 'alt', 'title'],
                                    ALLOW_DATA_ATTR: false,
                                  })
                                }} 
                              />
                            ) : (
                              <div className="py-10 text-center text-gray-700">
                                <div className="font-semibold mb-2">Unable to render DOCX</div>
                                <div className="text-sm text-gray-600 mb-4">You can still download and view it in Word.</div>
                                <a
                                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white bg-(--brown) hover:opacity-95"
                                  href={`/api/books/serve?token=${encodeURIComponent(viewToken)}`}
                                >
                                  Download DOCX
                                </a>
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

                <aside className="lg:col-span-4">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200">
                      <div className="font-semibold text-gray-900">Documents</div>
                      <div className="text-sm text-gray-600">{category?.name ?? "Category"}</div>
                    </div>
                    <div className="max-h-[75vh] overflow-auto">
                      {books.map((b, idx) => {
                        const active = b.id === bookId;
                        const bCover = normalizeNextImageSrc(b.cover_url, FALLBACK_COVER);
                        const bCoverUnoptimized = isAnimatedImageUrl(bCover);
                        return (
                          <button
                            key={b.id}
                            onClick={() => router.push(`/law_documents/${categoryId}/read/${b.id}`)}
                            className={[
                              "w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors",
                              active ? "bg-[rgba(161,105,63,0.08)]" : "",
                            ].join(" ")}
                          >
                            <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                              <Image src={bCover} alt={b.title} fill className="object-cover" sizes="64px" unoptimized={bCoverUnoptimized} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={["text-sm font-semibold line-clamp-2", active ? "text-(--brown)" : "text-gray-900"].join(" ")}>
                                {idx + 1}. {b.title}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {[b.author, String(b.year)].filter(Boolean).join(" • ")}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {current ? (
                      <div className="px-4 py-4 border-t border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="relative w-14 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <Image src={cover} alt={current.title} fill className="object-cover" sizes="56px" unoptimized={coverUnoptimized} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 line-clamp-2">{current.title}</div>
                            {current.description ? <div className="text-xs text-gray-600 line-clamp-2 mt-1">{current.description}</div> : null}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </aside>
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </ProtectedRoute>
  );
}

