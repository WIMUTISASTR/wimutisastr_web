"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import { fetchBooks, type BookCategory, type BookRow } from "@/lib/api/client";
import LoadingState from "@/components/LoadingState";
import { useMembership } from "@/lib/hooks/useMembership";
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
        if (!cancelled) setError(e instanceof Error ? e.message : "ផ្ទុកឯកសារមិនជោគជ័យ។");
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
  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name ?? "មិនបានចាត់ប្រភេទ"])),
    [categories]
  );
  const yearOptions = useMemo(() => {
    return Array.from(new Set(books.map((doc) => doc.year).filter((year) => Number.isFinite(year))))
      .sort((a, b) => b - a)
      .map((year) => String(year));
  }, [books]);
  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((doc) => {
      if (selectedYear !== "all" && String(doc.year) !== selectedYear) return false;
      const level = doc.access_level === "free" ? "free" : "members";
      if (accessFilter !== "all" && level !== accessFilter) return false;
      if (!q) return true;
      const categoryName = categoryNameById.get(doc.category_id ?? "") ?? "មិនបានចាត់ប្រភេទ";
      const haystack = `${doc.title} ${doc.author} ${doc.description ?? ""} ${categoryName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [accessFilter, books, categoryNameById, searchQuery, selectedYear]);

  return (
    <PageContainer className="law-documents-font">
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
              ត្រឡប់ទៅប្រភេទឯកសារ
            </Link>
            <h1 className="text-3xl font-semibold">{category?.name ?? "ឯកសារ"}</h1>
            <p className="text-gray-300 max-w-3xl">{category?.description ?? ""}</p>
          </div>
        </section>

        <section className="py-12 px-2 sm:px-4 lg:px-6">
          <div className="w-full max-w-none mx-auto">
            {isLoading ? (
              <div className="py-16">
                <LoadingState label="កំពុងផ្ទុកឯកសារ..." />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-16">{error}</div>
            ) : books.length === 0 ? (
              <div className="text-center text-gray-600 py-16">មិនមានឯកសារក្នុងប្រភេទនេះទេ។</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border border-(--gray-200) bg-gray-50 p-3">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[160px_180px_1fr_120px]">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="h-10 rounded border border-(--gray-300) bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-(--primary)"
                    >
                      <option value="all">គ្រប់ឆ្នាំ</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <select
                      value={accessFilter}
                      onChange={(e) => setAccessFilter(e.target.value as "all" | "free" | "members")}
                      className="h-10 rounded border border-(--gray-300) bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-(--primary)"
                    >
                      <option value="all">សិទ្ធិចូលប្រើទាំងអស់</option>
                      <option value="free">ឥតគិតថ្លៃ</option>
                      <option value="members">សមាជិក</option>
                    </select>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ស្វែងរកចំណងជើង អ្នកនិពន្ធ ឬប្រភេទ..."
                      className="h-10 rounded border border-(--gray-300) bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-(--primary)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedYear("all");
                        setAccessFilter("all");
                      }}
                      className="h-10 rounded bg-(--primary) px-4 text-sm font-semibold text-white hover:opacity-90"
                    >
                      កំណត់ឡើងវិញ
                    </button>
                  </div>
                </div>

                {filteredBooks.length === 0 ? (
                  <div className="text-center text-gray-600 py-10">រកមិនឃើញឯកសារដែលត្រូវគ្នាទេ។</div>
                ) : (
                  <div className="overflow-x-auto border border-(--gray-200)">
                    <table className="min-w-full text-left">
                      <thead className="bg-(--gray-100)">
                        <tr className="text-sm font-semibold text-(--ink)">
                          <th className="px-4 py-3 w-24">ឆ្នាំ</th>
                          <th className="px-4 py-3">ចំណងជើងសៀវភៅ</th>
                          <th className="px-4 py-3">ប្រភេទ</th>
                          <th className="px-4 py-3">អ្នកនិពន្ធ</th>
                          <th className="px-4 py-3 w-28">សកម្មភាព</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBooks.map((doc, index) => {
                          const isLocked = !isApproved && doc.access_level !== "free";
                          const destination = isLocked ? "/pricing_page" : `/law_documents/${categoryId}/read/${doc.id}`;
                          const categoryName = categoryNameById.get(doc.category_id ?? "") ?? category?.name ?? "មិនបានចាត់ប្រភេទ";
                          return (
                            <tr
                              key={doc.id}
                              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} cursor-pointer hover:bg-amber-50/40`}
                              onClick={() => router.push(destination)}
                            >
                              <td className="px-4 py-3 text-sm text-gray-700 align-top">{doc.year}</td>
                              <td className="px-4 py-3 align-top">
                                <div className="font-semibold text-(--ink)">{doc.title}</div>
                                <div className="mt-1 flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                      doc.access_level === "free" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                    }`}
                                  >
                                    {doc.access_level === "free" ? "ឥតគិតថ្លៃ" : "សមាជិក"}
                                  </span>
                                  {isLocked ? (
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                                      ជាប់សោ
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 align-top">{categoryName}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 align-top">{doc.author}</td>
                              <td className="px-4 py-3 align-top">
                                <Link
                                  href={destination}
                                  className="inline-flex items-center rounded bg-(--primary) px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {isLocked ? "ដំឡើង" : "អាន"}
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
    </PageContainer>
  );
}

