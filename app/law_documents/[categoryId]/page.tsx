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

const ALL_CATEGORY_ID = "__all__";

function LockOverlay() {
  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-2 z-10">
      <div className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <span className="text-xs font-semibold text-gray-800 bg-white/90 px-3 py-1 rounded-full shadow-sm">
        សមាជិកប៉ុណ្ណោះ
      </span>
    </div>
  );
}

function BookCard({ doc, categoryName, isLocked, destination }: {
  doc: BookRow;
  categoryName: string;
  isLocked: boolean;
  destination: string;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(destination)}
      className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Cover */}
      <div className="relative h-44 bg-linear-to-br from-slate-100 to-slate-200 overflow-hidden shrink-0">
        {doc.cover_url ? (
          <Image
            src={doc.cover_url}
            alt={doc.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-xs text-slate-400 text-center line-clamp-2 font-medium">{doc.title}</p>
          </div>
        )}

        {/* Year badge */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
          {doc.year}
        </div>

        {/* Access badge */}
        <div className={`absolute top-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          doc.access_level === "free"
            ? "bg-amber-400/90 text-amber-900"
            : "bg-emerald-500/90 text-white"
        }`}>
          {doc.access_level === "free" ? "ឥតគិតថ្លៃ" : "សមាជិក"}
        </div>

        {isLocked && <LockOverlay />}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1 min-h-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
            {doc.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">{doc.author}</p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-30">
            {categoryName}
          </span>
          <Link
            href={destination}
            onClick={(e) => e.stopPropagation()}
            className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLocked
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-(--primary) text-white hover:opacity-90"
            }`}
          >
            {isLocked ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                ដំឡើង
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                អាន
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

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

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
            <div className="space-y-6">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
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
                    className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent"
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
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--primary) shrink-0"
                >
                  <option value="all">គ្រប់ឆ្នាំ</option>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Access pills */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
                  {(["all", "free", "members"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setAccessFilter(f)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        accessFilter === f
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {f === "all" ? "ទាំងអស់" : f === "free" ? "ឥតគិតថ្លៃ" : "សមាជិក"}
                    </button>
                  ))}
                </div>                
              </div>

              {/* Results count */}
              {hasActiveFilters && (
                <p className="text-sm text-gray-500">
                  រកឃើញ <span className="font-semibold text-gray-800">{filteredBooks.length}</span> ឯកសារ
                </p>
              )}

              {/* Grid */}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredBooks.map((doc) => {
                    const isLocked = !isApproved && doc.access_level !== "free";
                    const destination = isLocked ? "/pricing_page" : `/law_documents/${categoryId}/read/${doc.id}`;
                    const catName = categoryNameById.get(doc.category_id ?? "") ?? category?.name ?? "មិនបានចាត់ប្រភេទ";
                    return (
                      <BookCard
                        key={doc.id}
                        doc={doc}
                        categoryName={catName}
                        isLocked={isLocked}
                        destination={destination}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
