"use client";

import Image from "next/image";
import PageContainer from "@/compounents/PageContainer";
import Button from "@/compounents/Button";
import { useEffect, useMemo, useState } from "react";
import { fetchBooks, type BookCategory, type BookRow } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";

const ALL_CATEGORY_ID = "__all__";
const UNCATEGORIZED_ID = "__uncategorized__";

function isAnimatedImageUrl(src: string) {
  return /\.gif(\?|#|$)/i.test(src);
}

export default function LawDocumentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchBooks();
        if (!cancelled) {
          setCategories(data.categories);
          setBooks(data.books);
        }
      } catch (e: unknown) {
        console.error(e);
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load documents.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) => {
      const name = (c.name ?? "").toLowerCase();
      const desc = (c.description ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [categories, searchQuery]);

  return (
    <PageContainer>
        <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src="/asset/document_background.png" alt="Legal documents background" fill className="object-cover" priority sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-linear-to-br from-slate-900/70 via-slate-900/60 to-slate-900/70 z-10" />
          <div className="absolute inset-0 bg-linear-to-br from-(--brown-soft) to-transparent z-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Legal Documents</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">Access comprehensive legal documents and resources</p>
            </div>
          </div>
        </section>

        <section className="py-20 px-2 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full px-5 py-4 rounded-2xl bg-white/80 backdrop-blur text-slate-900 placeholder:text-slate-400 shadow-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brown)] transition-colors text-lg"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-16 text-gray-600">Loading categories…</div>
            ) : loadError ? (
              <div className="text-center py-16 text-red-600">{loadError}</div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-16 text-gray-600">No categories found.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCategories.map((cat) => {
                  const list = cat.id === ALL_CATEGORY_ID ? books : byCategory.get(cat.id) ?? [];
                  const thumb = normalizeNextImageSrc(list[0]?.cover_url ?? null, "/sample_book/cover/book1.png");
                  const unoptimized = isAnimatedImageUrl(thumb);
                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/law_documents/${cat.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") router.push(`/law_documents/${cat.id}`);
                      }}
                    >
                      <div className="p-6 flex gap-5">
                        <div className="relative w-44 aspect-3/4 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <Image src={thumb} alt={cat.name ?? "Category"} fill className="object-cover" sizes="176px" unoptimized={unoptimized} />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-gray-900 mb-1">{cat.name ?? "Untitled"}</h2>
                          <p className="text-gray-600 line-clamp-2 mb-4">{cat.description ?? ""}</p>
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-gray-600">{list.length} document(s)</div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/law_documents/${cat.id}`);
                              }}
                              variant="primary"
                            >
                              View
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
    </PageContainer>
  );
}
