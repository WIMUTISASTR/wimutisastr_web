"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import { fetchBooks, type BookCategory, type BookRow } from "@/lib/api/client";
import LoadingState from "@/components/LoadingState";
import { useMembership } from "@/lib/hooks/useMembership";
import { notify } from "@/lib/utils/notify";
import DocumentsTable from "../_components/DocumentsTable";

const ALL_CATEGORY_ID = "__all__";

export default function DocumentCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;

  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [accessFilter, setAccessFilter] = useState<"all" | "free" | "members">("all");
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
    return () => { cancelled = true; };
  }, [categoryId]);

  const category = useMemo(() => categories.find((c) => c.id === categoryId) ?? null, [categories, categoryId]);

  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name ?? "មិនបានចាត់ប្រភេទ"])),
    [categories]
  );

  const yearOptions = useMemo(() =>
    Array.from(new Set(books.map((d) => d.year).filter(Number.isFinite)))
      .sort((a, b) => b - a)
      .map(String),
    [books]
  );

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((doc) => {
      if (selectedYear !== "all" && String(doc.year) !== selectedYear) return false;
      const level = doc.access_level === "free" ? "free" : "members";
      if (accessFilter !== "all" && level !== accessFilter) return false;
      if (!q) return true;
      const cat = categoryNameById.get(doc.category_id ?? "") ?? "មិនបានចាត់ប្រភេទ";
      return `${doc.title} ${doc.author} ${doc.description ?? ""} ${cat}`.toLowerCase().includes(q);
    });
  }, [accessFilter, books, categoryNameById, searchQuery, selectedYear]);

  const hasActiveFilters = searchQuery || selectedYear !== "all" || accessFilter !== "all";

  return (
    <PageContainer className="law-documents-font">
      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-14 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/asset/document_background.png" alt="Documents background" fill className="object-cover" priority sizes="100vw" fetchPriority="high" />
        </div>
        <div className="absolute inset-0 bg-slate-900/65 z-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <Link href="/law_documents" className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors text-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ត្រឡប់ទៅប្រភេទឯកសារ
          </Link>
          <h1 className="text-3xl font-bold">{category?.name ?? "ឯកសារ"}</h1>
          {category?.description && (
            <p className="text-gray-300 mt-1 max-w-2xl text-sm">{category.description}</p>
          )}
          {!isLoading && (
            <p className="text-gray-400 mt-2 text-sm">{books.length} ឯកសារ</p>
          )}
        </div>
      </section>

      <section className="py-8 w-full bg-(--paper) px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="w-full max-w-none">
          {isLoading ? (
            <div className="py-24">
              <LoadingState label="កំពុងផ្ទុកឯកសារ..." />
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <button
                onClick={() => router.refresh()}
                className="text-sm text-gray-500 underline hover:text-gray-700"
              >
                ព្យាយាមម្ដងទៀត
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">មិនមានឯកសារក្នុងប្រភេទនេះទេ</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកចំណងជើង ឬអ្នកនិពន្ធ..."
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Year */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-11 shrink-0 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-700 focus:border-(--primary) focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--primary)/20 lg:w-36"
                >
                  <option value="all">គ្រប់ឆ្នាំ</option>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Access pills */}
                <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/50 p-1">
                  {(["all", "free", "members"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setAccessFilter(f)}
                      className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-all ${
                        accessFilter === f
                          ? "bg-(--primary) text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      {f === "all" ? "ទាំងអស់" : f === "free" ? "ឥតគិតថ្លៃ" : "សមាជិក"}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
                  រកឃើញ <span className="font-semibold text-slate-800">{filteredBooks.length}</span> ឯកសារ
                  {" · "}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedYear("all");
                      setAccessFilter("all");
                    }}
                    className="font-medium text-(--primary) hover:underline"
                  >
                    សម្អាតតម្រង
                  </button>
                </p>
              )}
              </div>

              {filteredBooks.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="font-medium">រកមិនឃើញឯកសារដែលត្រូវគ្នា</p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedYear("all"); setAccessFilter("all"); }}
                    className="mt-3 text-sm text-(--primary) underline"
                  >
                    សម្អាតតម្រង
                  </button>
                </div>
              ) : (
                <DocumentsTable
                  books={filteredBooks}
                  categories={categories}
                  categoryId={categoryId}
                  isApproved={isApproved}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
