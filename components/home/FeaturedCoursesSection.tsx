"use client";

import Image from "next/image";
import Link from "next/link";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import type { HomeResponse } from "@/lib/api/client";

const FALLBACK_COVER = "/asset/document_background.png";
const MAX_DISPLAY = 6;

function thumbUnoptimized(src: string) {
  return src.includes(".r2.dev/") || /^https?:\/\//i.test(src);
}

function PlayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

interface FeaturedCoursesSectionProps {
  home: HomeResponse | null;
  isLoading?: boolean;
}

function CourseCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-xl border border-(--gray-200) bg-white shadow-sm animate-pulse">
      <div className="aspect-[16/10] bg-(--gray-200)" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-(--gray-200)" />
        <div className="h-4 w-full rounded bg-(--gray-100)" />
        <div className="h-4 w-2/3 rounded bg-(--gray-100)" />
      </div>
    </li>
  );
}

export default function FeaturedCoursesSection({ home, isLoading = false }: FeaturedCoursesSectionProps) {
  const categories = (home?.categories ?? []).slice(0, MAX_DISPLAY);
  const showSkeleton = isLoading && categories.length === 0;

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-(--primary) opacity-[0.05] blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-72 w-72 rounded-full bg-(--accent) opacity-[0.08] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="scroll-animate flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">វគ្គសិក្សាច្បាប់</h2>
            <p className="mt-3 text-base leading-relaxed text-(--gray-700) sm:text-lg">
              ស្វែងរកវគ្គអប់រំច្បាប់ពេញនិយម — បង្រៀនដោយអ្នកជំនាញ
            </p>
          </div>
          {categories.length > 0 ? (
            <Link
              href="/law_video"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-(--primary) underline-offset-4 transition-colors hover:text-(--primary-dark) hover:underline"
            >
              មើលវគ្គទាំងអស់
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : null}
        </div>

        {showSkeleton ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </ul>
        ) : categories.length === 0 ? (
          <div className="scroll-animate mt-10 rounded-2xl border border-(--gray-200) bg-(--gray-50) px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
              <PlayIcon className="h-7 w-7" />
            </div>
            <p className="mt-4 text-(--gray-700)">មិនទាន់មានវគ្គសិក្សាបង្ហាញនៅពេលនេះទេ។</p>
            <Link
              href="/law_video"
              className="mt-4 inline-flex text-sm font-semibold text-(--primary) underline-offset-4 transition-colors hover:underline"
            >
              រកមើលវគ្គវីដេអូ
            </Link>
          </div>
        ) : (
          <ul className="scroll-animate mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => {
              const src = normalizeNextImageSrc(c.cover_url, FALLBACK_COVER, { bucket: "video" });
              const href = `/law_video/${c.id}`;
              const desc =
                c.description?.trim() ||
                "មាតិកាអប់រំច្បាប់គ្រប់ជ្រុងជ្រោយ ដែលគ្របដណ្តប់ប្រធានបទសំខាន់ៗនៃច្បាប់។";

              return (
                <li key={c.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-(--gray-200) bg-white shadow-sm transition-all duration-200 hover:border-(--primary)/25 hover:shadow-md">
                    <Link
                      href={href}
                      className="relative block aspect-[16/10] overflow-hidden bg-(--gray-100)"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={thumbUnoptimized(src)}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-(--primary-dark)/70 via-(--primary-dark)/10 to-transparent" />
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <PlayIcon className="h-3.5 w-3.5" />
                        {c.videoCount} វីដេអូ
                      </span>
                      <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-(--primary) shadow-md transition-transform duration-200 group-hover:scale-105">
                        <PlayIcon className="ml-0.5 h-5 w-5" />
                      </span>
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <Link
                        href={href}
                        className="line-clamp-2 text-base font-semibold leading-snug text-(--ink) transition-colors hover:text-(--primary) sm:text-lg"
                      >
                        {c.name ?? "គ្មានចំណងជើង"}
                      </Link>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-(--gray-700) line-clamp-2">{desc}</p>
                      <Link
                        href={href}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary) transition-colors hover:text-(--primary-dark)"
                      >
                        ចាប់ផ្តើមសិក្សា
                        <svg
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
