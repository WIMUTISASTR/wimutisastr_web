"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingState from "@/components/LoadingState";
import { apiPost, fetchBooks, type BookCategory, type BookRow } from "@/lib/api/client";
import { useMembership } from "@/lib/hooks/useMembership";
import { notify } from "@/lib/utils/notify";

const DocxViewer = dynamic(() => import("@/components/DocxViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
        <div className="text-sm text-gray-600">កំពុងផ្ទុកកម្មវិធីមើលឯកសារ...</div>
      </div>
    </div>
  ),
});

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
    </div>
  ),
});

const ALL_CATEGORY_ID = "__all__";

function requestElementFullscreen(element: HTMLElement) {
  if (element.requestFullscreen) return element.requestFullscreen();
  const webkitElement = element as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
  if (webkitElement.webkitRequestFullscreen) return webkitElement.webkitRequestFullscreen();
  return Promise.reject(new Error("Fullscreen is not supported"));
}

function exitElementFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  const webkitDocument = document as Document & { webkitExitFullscreen?: () => Promise<void> };
  if (webkitDocument.webkitExitFullscreen) return webkitDocument.webkitExitFullscreen();
  return Promise.reject(new Error("Fullscreen is not supported"));
}

function getFullscreenElement() {
  return document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ?? null;
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
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
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
        if (!cancelled) {
          const message = e instanceof Error ? e.message : "ផ្ទុកឯកសារមិនជោគជ័យ។";
          setError(message);
          notify.error(message);
        }
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
  const isFree = current?.access_level === "free";

  const prev = currentIndex > 0 ? books[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < books.length - 1 ? books[currentIndex + 1] : null;

  // Track if we have a valid token cookie set (ready state from API)
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setIsReady(false);
        setViewToken(null);
        setViewExt(null);
        setViewFilename(null);
        setViewUrl(null);
        if (!bookId) return;
        if (!current?.id) return;
        if (!isFree && membershipStatus !== "approved") return;
        // API now sets HTTP-only cookie and returns ready state
        const res = await apiPost<{ ready?: boolean; token?: string; ext?: string; filename?: string; url?: string }>("/api/books/view-token", { bookId });
        if (!cancelled) {
          // Support both new cookie-based flow and legacy token flow
          setIsReady(res.ready ?? !!res.token);
          setViewToken(res.token ?? "cookie"); // Use marker for cookie-based auth
          setViewExt(res.ext ? String(res.ext).toLowerCase() : null);
          setViewFilename(res.filename ?? null);
          setViewUrl(res.url ?? null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          const message = "បើកឯកសារមិនជោគជ័យ។";
          setError(message);
          notify.error(message);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [bookId, current?.id, isFree, membershipStatus]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(getFullscreenElement() === viewerRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!viewerRef.current) return;
    try {
      if (getFullscreenElement() === viewerRef.current) {
        await exitElementFullscreen();
      } else {
        await requestElementFullscreen(viewerRef.current);
      }
    } catch (e) {
      console.error(e);
      notify.error("មិនអាចបើករបៀបពេញអេក្រង់បានទេ។");
    }
  }, []);

  const navigateToBook = useCallback(
    (id: string) => {
      router.push(`/law_documents/${categoryId}/read/${id}`);
    },
    [categoryId, router]
  );

  useEffect(() => {
    if (!isReady || membershipLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        void toggleFullscreen();
        return;
      }

      if (e.altKey && e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        navigateToBook(prev.id);
        return;
      }

      if (e.altKey && e.key === "ArrowRight" && next) {
        e.preventDefault();
        navigateToBook(next.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReady, membershipLoading, navigateToBook, next, prev, toggleFullscreen]);

  // URL for serving content - cookie will be sent automatically
  const serveUrl = useMemo(() => {
    if (!isReady && !viewToken) return null;
    if (viewUrl) return viewUrl;
    return `/api/books/serve`;
  }, [isReady, viewToken, viewUrl]);

  return (
    <ProtectedRoute>
      <PageContainer>
        <section className={`px-2 sm:px-4 lg:px-6 ${isFullscreen ? "py-0" : "py-8"}`}>
          <div className="max-w-7xl mx-auto">
            {!isFullscreen && (
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/law_documents/${categoryId}`} className="text-sm text-gray-600 hover:text-gray-900">
                    ← ត្រឡប់ទៅ {category?.name ?? "ឯកសារ"}
                  </Link>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900 truncate">{current?.title ?? "អានឯកសារ"}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    {current?.author ? <span>{current.author}</span> : null}
                    {typeof current?.year === "number" ? <span>{current.year}</span> : null}
                    {currentIndex >= 0 ? <span>ឯកសារ {currentIndex + 1} នៃ {books.length}</span> : null}
                  </div>
                </div>

                {!isLoading && !error && current && (isFree || membershipStatus === "approved") && books.length > 1 ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => prev && navigateToBook(prev.id)}
                      disabled={!prev}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-(--primary) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">មុន</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => next && navigateToBook(next.id)}
                      disabled={!next}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-(--primary) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="hidden sm:inline">បន្ទាប់</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {isLoading ? (
              <div className="py-16">
                <LoadingState label="កំពុងផ្ទុកឯកសារ..." />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-16">{error}</div>
            ) : !current ? (
              <div className="text-center text-gray-600 py-16">រកមិនឃើញឯកសារ។</div>
            ) : membershipLoading ? (
              <div className="py-16">
                <LoadingState label="កំពុងពិនិត្យសមាជិកភាព..." />
              </div>
            ) : !isFree && membershipStatus !== "approved" ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-900">ត្រូវការសមាជិកភាព</h2>
                <p className="mt-2 mx-auto max-w-md text-sm leading-relaxed text-slate-600">
                  អ្នកអាចរកមើលប្រភេទ និងគម្របបាន ប៉ុន្តែការអានឯកសារគឺសម្រាប់សមាជិកប៉ុណ្ណោះ។
                </p>
                <div className="mt-6">
                  <Button onClick={() => router.push("/pricing_page")} variant="primary">
                    ដំឡើងសមាជិកភាព
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div
                    ref={viewerRef}
                    className={`overflow-hidden bg-white shadow-sm ${
                      isFullscreen ? "flex h-full w-full flex-col bg-slate-100" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {viewExt === "docx" || viewExt === "doc" ? "កម្មវិធីមើលឯកសារ" : "អានឯកសារ PDF"}
                        </div>
                        {viewFilename ? (
                          <div className="truncate text-xs text-slate-500">{viewFilename}</div>
                        ) : null}
                      </div>
                      {isReady ? (
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-(--primary) hover:text-(--primary)"
                          aria-label={isFullscreen ? "ចាកចេញពីអេក្រង់ពេញ" : "មើលពេញអេក្រង់"}
                        >
                          {isFullscreen ? (
                            <>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"
                                />
                              </svg>
                              <span className="hidden sm:inline">ចាកចេញ</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                />
                              </svg>
                              <span className="hidden sm:inline">ពេញអេក្រង់</span>
                            </>
                          )}
                        </button>
                      ) : null}
                    </div>

                    <div className={`bg-slate-50 ${isFullscreen ? "min-h-0 flex-1" : ""}`}>
                      {isReady ? (
                        viewExt === "docx" || viewExt === "doc" ? (
                          <DocxViewer
                            url={serveUrl ?? `/api/books/serve`}
                            className={isFullscreen ? "min-h-0 h-full" : "min-h-[65vh]"}
                          />
                        ) : (
                          <PdfViewer
                            url={serveUrl ?? `/api/books/serve`}
                            bookId={bookId}
                            className={isFullscreen ? "min-h-0 h-full" : "min-h-[75vh]"}
                          />
                        )
                      ) : (
                        <div className="p-6 text-center text-gray-700">
                          <div className="font-semibold mb-2">កំពុងរៀបចំកម្មវិធីអានមានសុវត្ថិភាព…</div>
                          <div className="text-sm text-gray-600">សូមរង់ចាំបន្តិច។</div>
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

