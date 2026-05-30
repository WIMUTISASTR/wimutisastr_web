"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LoadingState from "@/components/LoadingState";
import { apiPost, fetchBooks, type BookCategory, type BookRow } from "@/lib/api/client";
import { useMembership } from "@/lib/hooks/useMembership";
import { notify } from "@/lib/utils/notify";
import useScrollAnimation from "@/lib/hooks/useScrollAnimation";

const DocxViewer = dynamic(() => import("@/components/DocxViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50dvh] items-center justify-center sm:min-h-[60dvh]">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
        <div className="text-sm text-gray-600">កំពុងផ្ទុកកម្មវិធីមើលឯកសារ...</div>
      </div>
    </div>
  ),
});

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50dvh] items-center justify-center sm:min-h-[60dvh]">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
    </div>
  ),
});

const ALL_CATEGORY_ID = "__all__";

const viewerHeight = {
  docx: "min-h-[calc(100dvh-14rem)] sm:min-h-[calc(100dvh-16rem)] lg:min-h-[65dvh]",
  pdf: "min-h-[calc(100dvh-14rem)] sm:min-h-[calc(100dvh-16rem)] lg:min-h-[70dvh]",
  fullscreen: "min-h-0 h-full",
} as const;

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

function NavIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-(--primary) hover:text-(--primary) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:min-w-0 sm:py-2"
    >
      {children}
    </button>
  );
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
        const res = await apiPost<{ ready?: boolean; token?: string; ext?: string; filename?: string; url?: string }>("/api/books/view-token", { bookId });
        if (!cancelled) {
          setIsReady(res.ready ?? !!res.token);
          setViewToken(res.token ?? "cookie");
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

  const serveUrl = useMemo(() => {
    if (!isReady && !viewToken) return null;
    if (viewUrl) return viewUrl;
    return `/api/books/serve`;
  }, [isReady, viewToken, viewUrl]);

  const isDocx = viewExt === "docx" || viewExt === "doc";
  const showBookNav = !isLoading && !error && !!current && (isFree || membershipStatus === "approved") && books.length > 1;
  const showMobileBookNav = showBookNav && isReady && !isFullscreen;

  useScrollAnimation(
    { threshold: 0.1, rootMargin: "0px" },
    [isLoading, error, membershipLoading, isReady, isFullscreen, viewExt, current?.id]
  );

  return (
    <>
      <PageContainer className={isFullscreen ? "pt-0!" : "pt-20! md:pt-24!"}>
        <section
          className={`law-documents-font px-0 sm:px-2 lg:px-6 ${
            isFullscreen ? "py-0" : "py-3 sm:py-6 lg:py-8"
          } ${showMobileBookNav ? "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0" : ""}`}
        >
          <div className={isFullscreen ? "mx-auto max-w-7xl" : "scroll-animate mx-auto max-w-7xl"}>
            {!isFullscreen && (
              <header className="scroll-animate mb-4 flex flex-col gap-3 px-3 sm:mb-6 sm:gap-4 sm:px-0">
                <div className="min-w-0">
                  <Link
                    href={`/law_documents/${categoryId}`}
                    className="inline-flex min-h-10 touch-manipulation items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← ត្រឡប់ទៅ {category?.name ?? "ឯកសារ"}
                  </Link>
                  <h1 className="mt-1 text-xl font-semibold leading-snug text-gray-900 sm:mt-2 sm:text-2xl lg:text-3xl">
                    {current?.title ?? "អានឯកសារ"}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 sm:mt-2 sm:text-sm">
                    {current?.author ? <span>{current.author}</span> : null}
                    {typeof current?.year === "number" ? <span>{current.year}</span> : null}
                    {currentIndex >= 0 ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        {currentIndex + 1} / {books.length}
                      </span>
                    ) : null}
                  </div>
                </div>

                {showBookNav ? (
                  <div className="hidden items-center gap-2 sm:flex">
                    <NavIconButton label="ឯកសារមុន" onClick={() => prev && navigateToBook(prev.id)} disabled={!prev}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>មុន</span>
                    </NavIconButton>
                    <NavIconButton label="ឯកសារបន្ទាប់" onClick={() => next && navigateToBook(next.id)} disabled={!next}>
                      <span>បន្ទាប់</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </NavIconButton>
                  </div>
                ) : null}
              </header>
            )}

            {isLoading ? (
              <div className="px-3 py-12 sm:py-16">
                <LoadingState label="កំពុងផ្ទុកឯកសារ..." />
              </div>
            ) : error ? (
              <div className="px-3 py-12 text-center text-red-600 sm:py-16">{error}</div>
            ) : !current ? (
              <div className="px-3 py-12 text-center text-gray-600 sm:py-16">រកមិនឃើញឯកសារ។</div>
            ) : membershipLoading ? (
              <div className="px-3 py-12 sm:py-16">
                <LoadingState label="កំពុងពិនិត្យសមាជិកភាព..." />
              </div>
            ) : !isFree && membershipStatus !== "approved" ? (
              <div className="mx-3 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:mx-0 sm:px-10 sm:py-16">
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
                <h2 className="mt-5 text-lg font-semibold text-slate-900 sm:text-xl">ត្រូវការសមាជិកភាព</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                  អ្នកអាចរកមើលប្រភេទ និងគម្របបាន ប៉ុន្តែការអានឯកសារគឺសម្រាប់សមាជិកប៉ុណ្ណោះ។
                </p>
                <div className="mt-6">
                  <Button onClick={() => router.push("/pricing_page")} variant="primary">
                    ចួលជាសមាជិក
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div
                  ref={viewerRef}
                  className={`overflow-hidden bg-white ${
                    isFullscreen
                      ? "flex h-dvh w-full flex-col bg-slate-100"
                      : "scroll-animate border-y border-slate-200 shadow-sm sm:rounded-xl sm:border"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 ${
                      isFullscreen ? "" : "scroll-animate"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                        {isDocx ? "កម្មវិធីមើលឯកសារ" : "អានឯកសារ PDF"}
                      </div>
                      {viewFilename && !isFullscreen ? (
                        <div className="hidden truncate text-xs text-slate-500 sm:block">{viewFilename}</div>
                      ) : null}
                    </div>
                    {isReady ? (
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="inline-flex min-h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-(--primary) hover:text-(--primary) active:scale-[0.98] sm:min-h-0 sm:min-w-0 sm:py-2"
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

                  <div className={`bg-slate-50 ${isFullscreen ? "min-h-0 flex-1 overflow-hidden" : ""}`}>
                    {isReady ? (
                      isDocx ? (
                        <DocxViewer
                          url={serveUrl ?? `/api/books/serve`}
                          className={isFullscreen ? viewerHeight.fullscreen : viewerHeight.docx}
                        />
                      ) : (
                        <PdfViewer
                          url={serveUrl ?? `/api/books/serve`}
                          bookId={bookId}
                          className={isFullscreen ? viewerHeight.fullscreen : viewerHeight.pdf}
                        />
                      )
                    ) : (
                      <div className="px-4 py-10 text-center text-gray-700 sm:p-6 sm:py-12">
                        <div className="mb-2 font-semibold">កំពុងរៀបចំកម្មវិធីអានមានសុវត្ថិភាព…</div>
                        <div className="text-sm text-gray-600">សូមរង់ចាំបន្តិច។</div>
                      </div>
                    )}
                  </div>
                </div>

                {isReady && !isFullscreen ? (
                  <p className="hidden px-3 text-center text-xs text-slate-500 sm:block sm:px-0">
                    ប្រើគ្រាប់ចុច ← → សម្រាប់ទំព័រ PDF · Alt+← → សម្រាប់ឯកសារមុន/បន្ទាប់ · F សម្រាប់ពេញអេក្រង់
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </section>

        {showMobileBookNav ? (
          <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
            aria-label="រុករកឯកសារ"
          >
            <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
              <NavIconButton label="ឯកសារមុន" onClick={() => prev && navigateToBook(prev.id)} disabled={!prev}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </NavIconButton>
              <span className="truncate px-2 text-center text-xs font-medium text-slate-600">
                {currentIndex + 1} / {books.length}
              </span>
              <NavIconButton label="ឯកសារបន្ទាប់" onClick={() => next && navigateToBook(next.id)} disabled={!next}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </NavIconButton>
            </div>
          </nav>
        ) : null}
      </PageContainer>
    </>
  );
}
