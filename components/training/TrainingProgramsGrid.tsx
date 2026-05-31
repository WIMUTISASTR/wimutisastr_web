"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicTrainingProgram } from "@/lib/data/training-programs";
import { rescanScrollAnimations } from "@/lib/hooks/useScrollAnimation";
import { formatKhmerShortDate } from "@/lib/utils/formatKhmerDate";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";

const FALLBACK_COVER = "/asset/aboutUs.png";
const PAGE_SIZE = 6;
const CTA_LABEL = "ចុះឈ្មោះចូលរួម";

function shouldDisableImageOptimization(src: string) {
  return src.includes(".r2.dev/") || /^https?:\/\//i.test(src);
}

function matchesSearch(program: PublicTrainingProgram, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    program.title,
    program.description ?? "",
    program.instructor ?? "",
    program.location ?? "",
    TYPE_LABELS[program.program_type],
    ...program.highlights,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

function buildPageNumbers(safePage: number, totalPages: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (safePage <= 3) {
    pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (safePage >= totalPages - 2) {
    pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages);
  }
  return pages;
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const startLabel = formatKhmerShortDate(start);
  const endLabel = formatKhmerShortDate(end);
  if (startLabel && endLabel && startLabel !== endLabel) {
    return `${startLabel} – ${endLabel}`;
  }
  return startLabel ?? endLabel;
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function ProgramCard({ program }: { program: PublicTrainingProgram }) {
  const coverSrc = normalizeNextImageSrc(program.cover_url, FALLBACK_COVER, { bucket: "book" });
  const dateLabel = formatDateRange(program.event_start_at, program.event_end_at);
  const ctaHref = program.cta_url.startsWith("/") ? program.cta_url : program.cta_url;
  const isExternal = /^https?:\/\//i.test(ctaHref);

  const ctaClass =
    "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--primary-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2";

  return (
    <article className="group flex flex-col overflow-hidden border border-(--gray-200) bg-white transition-colors duration-200 hover:border-(--primary)/25">
      <div className="relative aspect-16/10 overflow-hidden bg-(--gray-100)">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={program.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={shouldDisableImageOptimization(coverSrc)}
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
        
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg font-semibold leading-snug text-(--ink)">{program.title}</h3>

        <div className="mt-3 space-y-2">
          {program.instructor ? (
            <p className="flex items-center gap-2 text-sm text-(--gray-600)">
              <UserIcon />
              <span>{program.instructor}</span>
            </p>
          ) : null}

          {dateLabel ? (
            <p className="flex items-center gap-2 text-sm font-medium text-(--primary)">
              <CalendarIcon />
              <span>{dateLabel}</span>
            </p>
          ) : null}

          {program.location ? (
            <p className="flex items-center gap-2 text-sm text-(--gray-600)">
              <LocationIcon />
              <span>{program.location}</span>
            </p>
          ) : null}
        </div>

        {program.description ? (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-(--gray-700)">
            {program.description}
          </p>
        ) : null}

        {program.highlights.length > 0 ? (
          <ul className="mt-4 flex-1 space-y-1.5 border-t border-(--gray-100) pt-4">
            {program.highlights.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 text-sm text-(--gray-700)">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6">
          {isExternal ? (
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={ctaClass}>
              {CTA_LABEL}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ) : (
            <Link href={ctaHref} className={ctaClass}>
              {CTA_LABEL}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="overflow-hidden border border-(--gray-200) bg-white"
        >
          <div className="aspect-16/10 animate-pulse bg-(--gray-100)" />
          <div className="space-y-3 p-6">
            <div className="h-5 w-3/4 animate-pulse rounded bg-(--gray-100)" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-(--gray-100)" />
            <div className="h-4 w-full animate-pulse rounded bg-(--gray-100)" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-(--gray-100)" />
            <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-(--gray-100)" />
          </div>
        </div>
      ))}
    </div>
  );
}

function computeStats(programs: PublicTrainingProgram[]) {
  return {
    total: programs.length,
    courses: programs.filter((p) => p.program_type === "course").length,
    events: programs.filter((p) => p.program_type === "event").length,
    workshops: programs.filter((p) => p.program_type === "workshop").length,
  };
}

interface TrainingProgramsGridProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onStatsChange?: (stats: ReturnType<typeof computeStats>) => void;
}

function ProgramsPagination({
  safePage,
  totalPages,
  startItem,
  endItem,
  totalItems,
  onPageChange,
}: {
  safePage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const pageNumbers = useMemo(() => buildPageNumbers(safePage, totalPages), [safePage, totalPages]);

  return (
    <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-(--gray-200) bg-(--gray-50) px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-(--gray-700)">
        បង្ហាញ{" "}
        <span className="font-semibold text-(--ink)">{startItem}</span>
        {" "}ដល់{" "}
        <span className="font-semibold text-(--ink)">{endItem}</span>
        {" "}ក្នុងចំណោម{" "}
        <span className="font-semibold text-(--ink)">{totalItems}</span>
        {" "}វគ្គ
      </p>

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center justify-center gap-1 sm:justify-end" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage <= 1}
            className="cursor-pointer rounded-lg border border-(--gray-200) bg-white px-3.5 py-2 text-sm font-medium text-(--ink) shadow-sm transition-colors duration-200 hover:bg-white hover:border-(--primary)/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            មុន
          </button>
          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-(--gray-600)">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === safePage ? "page" : undefined}
                className={`min-w-9 cursor-pointer rounded-lg border px-2.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  p === safePage
                    ? "border-(--primary) bg-(--primary) text-white shadow-sm"
                    : "border-(--gray-200) bg-white text-(--ink) shadow-sm hover:border-(--primary)/30 hover:bg-white"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            disabled={safePage >= totalPages}
            className="cursor-pointer rounded-lg border border-(--gray-200) bg-white px-3.5 py-2 text-sm font-medium text-(--ink) shadow-sm transition-colors duration-200 hover:bg-white hover:border-(--primary)/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            បន្ទាប់
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default function TrainingProgramsGrid({
  searchQuery,
  onSearchChange,
  onStatsChange,
}: TrainingProgramsGridProps) {
  const [programs, setPrograms] = useState<PublicTrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    ;(async () => {
      try {
        const res = await fetch("/api/training-programs-public", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load programs");
        if (!cancelled) setPrograms(json.programs ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "មិនអាចផ្ទុកវគ្គបាន");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          window.setTimeout(rescanScrollAnimations, 50);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    onStatsChange?.(computeStats(programs));
  }, [programs, onStatsChange]);

  const filteredPrograms = useMemo(
    () => programs.filter((program) => matchesSearch(program, searchQuery)),
    [programs, searchQuery]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pagePrograms = filteredPrograms.slice(startIdx, startIdx + PAGE_SIZE);
  const startItem = filteredPrograms.length === 0 ? 0 : startIdx + 1;
  const endItem = Math.min(safePage * PAGE_SIZE, filteredPrograms.length);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, programs.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-base font-medium text-red-800">មិនអាចផ្ទុកវគ្គបណ្តុះបណ្តាលបានទេ</p>
        <p className="mt-1 text-sm text-red-600">សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។</p>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--gray-300) bg-(--gray-50) px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-(--ink)">មិនទាន់មានវគ្គបង្ហាញ</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-(--gray-600)">
          វគ្គបណ្តុះបណ្តាលថ្មីនឹងបង្ហាញនៅទីនេះ — សូមទាក់ទងមកយើងសម្រាប់ព័ត៌មានបន្ថែម។
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-lg bg-(--primary) px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--primary-light)"
        >
          សួរព័ត៌មាន
        </Link>
      </div>
    );
  }

  return (
    <div ref={listRef}>
      {searchQuery.trim() ? (
        <p className="mb-6 text-sm text-gray-500">
          {filteredPrograms.length > 0
            ? `ទទួលបាន ${filteredPrograms.length} វគ្គ`
            : "រកមិនឃើញ"}{" "}
          សម្រាប់ <span className="font-semibold text-gray-700">&quot;{searchQuery.trim()}&quot;</span>
        </p>
      ) : null}

      {filteredPrograms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--gray-300) bg-white px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--gray-100) text-(--gray-600)">
            <SearchIcon />
          </div>
          <p className="text-lg font-semibold text-(--ink)">រកមិនឃើញវគ្គ</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-(--gray-600)">
            សូមកែប្រែពាក្យស្វែងរក ឬសម្អាតវាដើម្បីមើលវគ្គទាំងអស់។
          </p>
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-lg border border-(--gray-300) bg-white px-6 py-2.5 text-sm font-semibold text-(--ink) transition-colors duration-200 hover:border-(--primary) hover:text-(--primary)"
          >
            សម្អាតការស្វែងរក
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagePrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>

          <ProgramsPagination
            safePage={safePage}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            totalItems={filteredPrograms.length}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
