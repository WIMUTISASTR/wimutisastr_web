"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import type { VideoCategory, VideoRow } from "@/lib/data/videos";
import { useMembership } from "@/lib/hooks/useMembership";
import {
  categoryHasFreePreview,
  getVideosInCategory,
  getWatchTargetVideo,
} from "@/lib/utils/videoAccess";

const FALLBACK_THUMB = "/asset/document_background.png";

const STORAGE = {
  watched: "wimutisastr:watchedVideos:v1",
} as const;

function shouldDisableImageOptimization(src: string) {
  return src.includes(".r2.dev/") || /^https?:\/\//i.test(src);
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("km-KH", { year: "numeric", month: "short" });
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlayIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const VideoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LockIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

interface VideoGridClientProps {
  categories: VideoCategory[];
  videos: VideoRow[];
}

export default function VideoGridClient({ categories, videos }: VideoGridClientProps) {
  const router = useRouter();
  const { status: membershipStatus } = useMembership();
  const isApproved = membershipStatus === "approved";
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE.watched);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setWatchedIds(new Set(parsed.filter((x): x is string => typeof x === "string")));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const videoStatsByCategory = useMemo(() => {
    const map = new Map<string, { count: number; lastUpdated: string | null; watchedCount: number; progressPct: number }>();
    for (const v of videos) {
      const catId = v.category_id ?? "";
      if (!catId) continue;
      const prev = map.get(catId) ?? { count: 0, lastUpdated: null, watchedCount: 0, progressPct: 0 };
      const t = v.uploaded_at ? new Date(v.uploaded_at).getTime() : 0;
      const prevT = prev.lastUpdated ? new Date(prev.lastUpdated).getTime() : 0;
      const watchedCount = prev.watchedCount + (watchedIds.has(v.id) ? 1 : 0);
      const count = prev.count + 1;
      map.set(catId, {
        count,
        lastUpdated: t > prevT ? v.uploaded_at ?? null : prev.lastUpdated,
        watchedCount,
        progressPct: count > 0 ? clamp(Math.round((watchedCount / count) * 100), 0, 100) : 0,
      });
    }
    return map;
  }, [videos, watchedIds]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) => {
      const name = (c.name ?? "").toLowerCase();
      const desc = (c.description ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [categories, searchQuery]);

  const totalVideos = videos.length;
  const totalWatched = watchedIds.size;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--primary-dark)] text-white">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/asset/document_background.png"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[var(--primary-dark)]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white/80 mb-5">
            <VideoIcon className="w-3.5 h-3.5" />
            វគ្គបណ្ដុះបណ្ដាល
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            វគ្គសិក្សាច្បាប់
          </h1>
          <p className="mt-2 text-[var(--accent-light)] text-base sm:text-lg max-w-2xl leading-relaxed">
            វគ្គអប់រំច្បាប់ដែលរៀបចំដោយអ្នកជំនាញ — សម្រាប់អ្នកប្រឡូកក្នុងវិស័យច្បាប់ និងនិស្សិតគ្រប់ជំនាន់
          </p>

          {/* Stats row */}
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5 text-white/70">
              <span className="font-bold text-white text-base">{categories.length}</span>
              <span>វគ្គសិក្សា</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5 text-white/70">
              <span className="font-bold text-white text-base">{totalVideos}</span>
              <span>វីដេអូ</span>
            </div>
            {totalWatched > 0 && (
              <>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>បានមើល {totalWatched} វីដេអូ</span>
                </div>
              </>
            )}
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <SearchIcon className="w-4.5 h-4.5 text-slate-400" />
              </div>
              <input
                id="law-video-search"
                type="text"
                placeholder="ស្វែងរកវគ្គតាមឈ្មោះ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  aria-label="សម្អាតការស្វែងរក"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 min-h-[50vh] bg-gray-50">
        <div className="max-w-7xl mx-auto">

          {/* Result count */}
          {searchQuery && (
            <p className="mb-6 text-sm text-gray-500">
              {filteredCategories.length > 0
                ? `ទទួលបាន ${filteredCategories.length} វគ្គ`
                : "រកមិនឃើញ"}
              {" "}សម្រាប់ <span className="font-semibold text-gray-700">&quot;{searchQuery}&quot;</span>
            </p>
          )}

          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <SearchIcon className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-1">រកមិនឃើញវគ្គសិក្សា</p>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                សូមកែប្រែពាក្យស្វែងរក ឬផ្ទុកវគ្គទាំងអស់
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--primary-light)] transition shadow-sm"
              >
                ផ្ទុកវគ្គទាំងអស់
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCategories.map((cat) => {
                const thumb = normalizeNextImageSrc(cat.cover_url, FALLBACK_THUMB, { bucket: "video" });
                const unoptimized = shouldDisableImageOptimization(thumb);
                const stats = videoStatsByCategory.get(cat.id);
                const total = stats?.count ?? 0;
                const pct = stats?.progressPct ?? 0;
                const updated = stats?.lastUpdated ?? null;
                const watched = stats?.watchedCount ?? 0;

                const inCategory = getVideosInCategory(videos, cat.id);
                const hasFree = categoryHasFreePreview(videos, cat.id);
                const isLocked = !isApproved && !hasFree && inCategory.length > 0;
                const targetVideo = getWatchTargetVideo(videos, cat.id, isApproved);

                return (
                  <CourseCard
                    key={cat.id}
                    cat={cat}
                    thumb={thumb}
                    unoptimized={unoptimized}
                    total={total}
                    pct={pct}
                    watched={watched}
                    updated={updated}
                    hasFree={hasFree}
                    isLocked={isLocked}
                    onClick={() => {
                      if (targetVideo) {
                        router.push(`/law_video/${cat.id}/watch/${targetVideo.id}`);
                        return;
                      }
                      if (isLocked) {
                        router.push("/pricing_page");
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

interface CourseCardProps {
  cat: VideoCategory;
  thumb: string;
  unoptimized: boolean;
  total: number;
  pct: number;
  watched: number;
  updated: string | null;
  hasFree: boolean;
  isLocked: boolean;
  onClick: () => void;
}

function CourseCard({
  cat,
  thumb,
  unoptimized,
  total,
  pct,
  watched,
  updated,
  hasFree,
  isLocked,
  onClick,
}: CourseCardProps) {
  const isStarted = pct > 0 && pct < 100;
  const isCompleted = pct === 100;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden shrink-0">
        <Image
          src={thumb}
          alt={cat.name ?? "វគ្គសិក្សា"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          loading="lazy"
          unoptimized={unoptimized}
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-200">
            <PlayIcon className="w-6 h-6 text-[var(--primary)] ml-0.5" />
          </div>
        </div>

        {/* Status badge */}
        {isLocked && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-slate-900/75 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
            <LockIcon className="w-3 h-3" />
            សមាជិក
          </div>
        )}
        {!isLocked && hasFree && (
          <div className="absolute top-2.5 left-2.5 bg-sky-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
            មើលឥតគិតថ្លៃ
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
            <CheckCircleIcon className="w-3 h-3" />
            បានបញ្ចប់
          </div>
        )}
        {isStarted && !isLocked && (
          <div className="absolute top-2.5 left-2.5 bg-amber-400 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded-full shadow">
            កំពុងរៀន
          </div>
        )}

        {/* Video count */}
        {total > 0 && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
            <VideoIcon className="w-3 h-3" />
            {total}
          </div>
        )}

        {/* Progress bar at bottom edge */}
        {pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors mb-1.5">
          {cat.name ?? "វគ្គគ្មានចំណងជើង"}
        </h3>

        {cat.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {cat.description}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="flex items-center gap-1">
                <VideoIcon className="w-3.5 h-3.5" />
                {total} វីដេអូ
              </span>
            )}
            {isStarted && watched > 0 && (
              <span className="text-emerald-600 font-medium">
                {watched}/{total} ហើយ
              </span>
            )}
          </div>
          {updated && (
            <span>{formatDate(updated)}</span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--primary)]">
            {isLocked
              ? "ដំឡើងសមាជិកភាព"
              : isCompleted
                ? "មើលឡើងវិញ"
                : isStarted
                  ? "បន្តសិក្សា"
                  : hasFree
                    ? "មើលឥតគិតថ្លៃ"
                    : "ចូលមើលវគ្គ"}
          </span>
          <svg className="w-4 h-4 text-[var(--primary)] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
