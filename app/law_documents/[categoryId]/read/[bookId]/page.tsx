"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  // URL for serving content - cookie will be sent automatically
  const serveUrl = useMemo(() => {
    if (!isReady && !viewToken) return null;
    if (viewUrl) return viewUrl;
    return `/api/books/serve`;
  }, [isReady, viewToken, viewUrl]);

  return (
    <ProtectedRoute>
      <PageContainer>
        <section className="py-8 px-2 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-start justify-between gap-3">
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
            </div>

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
                  <div className="bg-whit shadow-sm overflow-hidden">

                    <div className="bg-slate-50">
                      {isReady ? (
                        viewExt === "docx" || viewExt === "doc" ? (
                          <div className="w-full bg-white overflow-auto">
                            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">កម្មវិធីមើលឯកសារ</div>
                                {viewFilename ? <div className="text-xs text-gray-500 truncate">{viewFilename}</div> : null}
                              </div>
                            </div>
                            <DocxViewer
                              url={serveUrl ?? `/api/books/serve`}
                              className="min-h-[65vh]"
                            />
                          </div>
                        ) : (
                          <PdfViewer
                            url={serveUrl ?? `/api/books/serve`}
                            className="min-h-[75vh]"
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

