"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Button from "@/components/Button";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import type { BookCategory, BookRow } from "@/lib/data/books";
import { useMembership } from "@/lib/hooks/useMembership";

const ALL_CATEGORY_ID = "__all__";
const UNCATEGORIZED_ID = "__uncategorized__";
const FALLBACK_COVER = "/sample_book/cover/book1.png";

function isAnimatedImageUrl(src: string) {
  return /\.gif(\?|#|$)/i.test(src);
}

function shouldDisableImageOptimization(src: string) {
  return src.includes(".r2.dev/") || /^https?:\/\//i.test(src);
}

interface BookGridClientProps {
  categories: BookCategory[];
  books: BookRow[];
}

export default function BookGridClient({ categories, books }: BookGridClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { status: membershipStatus } = useMembership();
  const isApproved = membershipStatus === "approved";

  // Group books by category
  const byCategory = useMemo(() => {
    const map = new Map<string, BookRow[]>();
    for (const b of books) {
      const cid = b.category_id ?? UNCATEGORIZED_ID;
      const list = map.get(cid) ?? [];
      list.push(b);
      map.set(cid, list);
    }
    return map;
  }, [books]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) => {
      const name = (c.name ?? "").toLowerCase();
      const desc = (c.description ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [categories, searchQuery]);

  // Add "All Documents" category
  const displayCategories = useMemo(() => {
    const hasAll = categories.some((c) => c.id === ALL_CATEGORY_ID);
    const allCategory: BookCategory = {
      id: ALL_CATEGORY_ID,
      name: "All Documents",
      description: "Browse all available documents.",
      cover_url: null,
      parent_id: null,
      created_at: null,
      updated_at: null,
    };
    return hasAll ? filteredCategories : [allCategory, ...filteredCategories];
  }, [categories, filteredCategories]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-14 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/document_background.png"
            alt="Documents background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-slate-900/65 z-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <h1 className="text-3xl sm:text-4xl font-semibold">Law Documents</h1>
          <p className="text-gray-300 max-w-3xl mt-2">
            Browse categories and read legal documents on this site.
          </p>

          <div className="mt-8 max-w-2xl">
            <label className="text-sm font-semibold text-gray-200" htmlFor="law-documents-search">
              Search categories
            </label>
            <div className="mt-2 relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg className="h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M21 21l-4.3-4.3m1.3-5.2a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                id="law-documents-search"
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 text-slate-900 placeholder:text-slate-500 shadow-sm ring-1 ring-inset ring-white/20 focus:outline-none focus:ring-2 focus:ring-(--primary) transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories list */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-[80vw] max-w-[80vw] mx-auto">
          {displayCategories.length === 0 ? (
            <div className="rounded-3xl border border-(--gray-200) bg-white px-6 py-10 text-center shadow-sm">
              <div className="text-xl font-bold text-(--ink)">No categories found</div>
              <div className="mt-2 text-(--gray-700) font-medium">Try a different search keyword.</div>
              <div className="mt-6">
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear search
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {displayCategories.map((cat) => {
                const list = cat.id === ALL_CATEGORY_ID ? books : byCategory.get(cat.id) ?? [];
                const thumb = normalizeNextImageSrc(list[0]?.cover_url ?? null, FALLBACK_COVER, { bucket: "book" });
                const unoptimized = isAnimatedImageUrl(thumb) || shouldDisableImageOptimization(thumb);
                const hasFree = list.some((b) => b.access_level === "free");
                const isLocked = !isApproved && !hasFree;

                return (
                  <div
                    key={cat.id}
                    className="group rounded-none overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-b border-black"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open category ${cat.name ?? "Untitled"}`}
                    onClick={() => router.push(`/law_documents/${cat.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        router.push(`/law_documents/${cat.id}`);
                      }
                    }}
                  >
                    <div className="p-8 sm:p-10 flex flex-col sm:flex-row gap-6 sm:gap-8">
                      <div className="relative w-full sm:w-52 aspect-3/4 rounded-none overflow-hidden shrink-0">
                        <Image
                          src={thumb}
                          alt={cat.name ?? "Category"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, 208px"
                          unoptimized={unoptimized}
                          loading="lazy"
                        />
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                              Members only
                            </span>
                          </div>
                        )}
                        <div/>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-5">
                        <div>
                          <h3 className="text-2xl font-bold text-(--ink) truncate">{cat.name ?? "Untitled"}</h3>
                          <p className="mt-3 text-(--gray-700) font-medium line-clamp-3 text-lg">
                            {cat.description ?? ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm text-(--gray-700) font-semibold">Category</div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/law_documents/${cat.id}`);
                            }}
                            variant="primary"
                            size="md"
                          >
                            {isLocked ? "View" : "View"}
                          </Button>
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
    </>
  );
}
