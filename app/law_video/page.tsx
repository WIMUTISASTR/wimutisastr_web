"use client";

import Image from "next/image";
import PageContainer from "@/compounents/PageContainer";
import ProtectedRoute from "@/compounents/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchVideos, type VideoCategory, type VideoRow } from "@/lib/api/client";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";

const FALLBACK_THUMB = "/asset/document_background.png";

const STORAGE = {
  watched: "wimutisastr:watchedVideos:v1",
} as const;

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// Icon components
const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlayIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const BookOpenIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function LawVideoPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchVideos();
        if (!cancelled) {
          setCategories(data.categories);
          setVideos(data.videos);
        }
      } catch (e: unknown) {
        console.error(e);
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load videos.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE.watched);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const ids = parsed.filter((x): x is string => typeof x === "string");
          setWatchedIds(new Set(ids));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const videoStatsByCategory = useMemo(() => {
    const map = new Map<
      string,
      { count: number; lastUpdated: string | null; watchedCount: number; progressPct: number }
    >();
    for (const v of videos) {
      const catId = v.category_id ?? "";
      if (!catId) continue;
      const prev = map.get(catId) ?? {
        count: 0,
        lastUpdated: null,
        watchedCount: 0,
        progressPct: 0,
      };
      const t = v.uploaded_at ? new Date(v.uploaded_at).getTime() : 0;
      const prevT = prev.lastUpdated ? new Date(prev.lastUpdated).getTime() : 0;
      const watchedCount = prev.watchedCount + (watchedIds.has(v.id) ? 1 : 0);
      const count = prev.count + 1;
      const progressPct = count > 0 ? clamp(Math.round((watchedCount / count) * 100), 0, 100) : 0;

      map.set(catId, {
        count: prev.count + 1,
        lastUpdated: t > prevT ? v.uploaded_at ?? null : prev.lastUpdated,
        watchedCount,
        progressPct,
      });
    }
    return map;
  }, [videos, watchedIds]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = categories;
    if (q) {
      list = list.filter((c) => {
        const name = (c.name ?? "").toLowerCase();
        const desc = (c.description ?? "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    return list;
  }, [categories, searchQuery]);

  return (
    <ProtectedRoute>
      <PageContainer>
        {/* Hero banner (match Documents style) */}
        <section className="relative bg-slate-900 text-white py-14 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/asset/document_background.png"
              alt="Video courses background"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-slate-900/65 z-10" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
            <h1 className="text-3xl sm:text-4xl font-semibold">Video Courses</h1>
            <p className="text-gray-300 max-w-3xl mt-2">
              Explore legal education courses designed for professionals and students.
            </p>

            <div className="mt-8 max-w-2xl">
              <label className="text-sm font-semibold text-gray-200" htmlFor="law-video-search">
                Search courses
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <SearchIcon className="w-5 h-5 text-gray-300" />
                </div>
                <input
                  id="law-video-search"
                  type="text"
                  placeholder="Search courses by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/90 text-slate-900 placeholder:text-slate-500 shadow-sm ring-1 ring-inset ring-white/20 focus:outline-none focus:ring-2 focus:ring-(--primary) transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
          <div className="max-w-7xl mx-auto">

            {/* Results Count */}
            {!isLoading && !error && (
              <div className="mb-6 text-sm text-gray-600 animate-in delay-100">
                {filteredCategories.length === 0 ? (
                  <span>No courses found</span>
                ) : (
                  <span>
                    {filteredCategories.length} {filteredCategories.length === 1 ? "course" : "courses"} available
                  </span>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-none border border-gray-200 shadow-lg overflow-hidden animate-pulse"
                  >
                    <div className="aspect-video bg-gray-200" />
                    <div className="p-6 space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-2 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="mt-12 rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-center animate-scale-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-red-900 mb-2">Couldn&apos;t load courses</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="mt-12 rounded-2xl border-2 border-gray-200 bg-white p-12 text-center shadow-sm animate-scale-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">No courses found</p>
                <p className="text-sm text-gray-600 mb-6">Try adjusting your search terms or browse all courses.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 rounded-xl bg-(--brown) text-white px-6 py-3 text-sm font-semibold hover:bg-(--brown-strong) transition-colors shadow-sm hover:shadow-md"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((cat, index) => {
                  const thumb = normalizeNextImageSrc(cat.cover_url, FALLBACK_THUMB);
                  const stats = videoStatsByCategory.get(cat.id);
                  const total = stats?.count ?? 0;
                  const pct = stats?.progressPct ?? 0;
                  const updated = stats?.lastUpdated ?? null;

                  const handleOpen = () => {
                    router.push(`/law_video/${cat.id}`);
                  };

                  return (
                    <div
                      key={cat.id}
                      className="group bg-white border-2 border-gray-200 rounded-none overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-scale-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      role="button"
                      tabIndex={0}
                      onClick={handleOpen}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleOpen();
                      }}
                    >
                      {/* Course Thumbnail */}
                      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                        <Image
                          src={thumb}
                          alt={cat.name ?? "Course"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                              <PlayIcon className="w-10 h-10 text-(--brown) ml-1" />
                          </div>
                        </div>

                        {/* Progress Badge */}
                        {pct > 0 && (
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-bold text-(--brown) shadow-lg">
                            {pct}% Complete
                          </div>
                        )}

                        {/* Video Count Badge */}
                        {total > 0 && (
                          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-lg flex items-center gap-1.5">
                            <BookOpenIcon className="w-3.5 h-3.5" />
                            <span>{total} {total === 1 ? "video" : "videos"}</span>
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-(--brown) transition-colors">
                            {cat.name ?? "Untitled Course"}
                          </h3>
                          {cat.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {total > 0 && (
                          <div className="mb-4">
                            {pct === 0 ? (
                              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                <span>Not Started</span>
                              </div>
                            ) : (
                              <>
                                <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-2">
                                  <div
                                    className="h-full bg-(--brown) rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span className="font-medium">{pct}% complete</span>
                                  {updated && (
                                    <span className="text-gray-500">Updated {formatDate(updated)}</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-(--brown) group-hover:text-(--brown-strong) transition-colors">
                              {pct === 0 ? "Start Course" : pct === 100 ? "Review Course" : "Continue Learning"}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-(--brown)/10 flex items-center justify-center group-hover:bg-(--brown)/20 transition-colors">
                              <svg className="w-4 h-4 text-(--brown)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
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
    </ProtectedRoute>
  );
}
