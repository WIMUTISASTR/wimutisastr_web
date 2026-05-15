"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import type { HomeResponse } from "@/lib/api/client";

const FALLBACK_COVER = "/asset/document_background.png";

function thumbUnoptimized(src: string) {
  return src.includes(".r2.dev/") || /^https?:\/\//i.test(src);
}

interface FeaturedCoursesSectionProps {
  home: HomeResponse | null;
  currentCourseIndex: number;
  setCurrentCourseIndex: (index: number | ((prev: number) => number)) => void;
}

export default function FeaturedCoursesSection({
  home,
  currentCourseIndex,
  setCurrentCourseIndex,
}: FeaturedCoursesSectionProps) {
  const router = useRouter();
  const categories = home?.categories ?? [];
  const len = categories.length;
  const safeIndex = len > 0 ? Math.min(currentCourseIndex, len - 1) : 0;
  const cat = len > 0 ? categories[safeIndex] : null;

  useEffect(() => {
    if (len === 0) return;
    const max = len - 1;
    if (currentCourseIndex > max || currentCourseIndex < 0) {
      setCurrentCourseIndex(Math.min(Math.max(0, currentCourseIndex), max));
    }
  }, [len, currentCourseIndex, setCurrentCourseIndex]);

  const go = (delta: number) => {
    if (len <= 0) return;
    setCurrentCourseIndex((i) => (i + delta + len) % len);
  };

  return (
    <section className="relative overflow-hidden bg-(--gray-50) py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-(--primary) opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-72 w-72 rounded-full bg-(--accent) opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10 scroll-animate opacity-0 translate-y-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--primary)">វគ្គពេញនិយម</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">វគ្គសិក្សាណែនាំ</h2>
          <p className="mt-4 text-base leading-relaxed text-(--gray-700) sm:text-lg">
            ស្វែងរកវគ្គអប់រំច្បាប់ពេញនិយមបំផុតរបស់យើង
          </p>
        </div>

        {len === 0 ? (
          <div className="scroll-animate opacity-0 translate-y-8 rounded-2xl border border-(--gray-200) bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-(--gray-700)">មិនទាន់មានវគ្គសិក្សាបង្ហាញនៅពេលនេះទេ។</p>
            <Link
              href="/law_video"
              className="mt-4 inline-flex text-sm font-semibold text-(--primary) underline-offset-4 transition-colors hover:underline"
            >
              រកមើលវគ្គវីដេអូទាំងអស់
            </Link>
          </div>
        ) : (
          <div className="space-y-6 scroll-animate opacity-0 translate-y-8">
            {/* Category picker — clearer than dots-only */}
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible">
              {categories.map((c, index) => {
                const active = index === safeIndex;
                const thumb = normalizeNextImageSrc(c.cover_url, FALLBACK_COVER, { bucket: "video" });
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCurrentCourseIndex(index)}
                    className={[
                      "flex min-w-0 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-sm transition-colors duration-200 sm:min-w-0",
                      active
                        ? "border-(--primary) bg-white shadow-sm ring-1 ring-(--primary)/20"
                        : "border-(--gray-200) bg-white/80 hover:border-(--primary)/40 hover:bg-white",
                    ].join(" ")}
                    aria-current={active ? "true" : undefined}
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-(--gray-100)">
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="44px"
                        unoptimized={thumbUnoptimized(thumb)}
                      />
                    </span>
                    <span className="max-w-40 truncate font-medium text-(--ink) sm:max-w-48">
                      {c.name ?? "វគ្គ"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Spotlight: contained thumbnail + copy (no full-bleed cinematic hero) */}
            <div className="overflow-hidden rounded-2xl border border-(--gray-200) bg-white shadow-sm">
              <div
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${safeIndex * 100}%)` }}
              >
                {categories.map((c) => {
                  const src = normalizeNextImageSrc(c.cover_url, FALLBACK_COVER, { bucket: "video" });
                  const desc =
                    c.description?.trim() ||
                    "មាតិកាអប់រំច្បាប់គ្រប់ជ្រុងជ្រោយ ដែលគ្របដណ្តប់ប្រធានបទសំខាន់ៗនៃច្បាប់កម្ពុជា។";
                  return (
                    <article key={c.id} className="min-w-full shrink-0">
                      <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-start lg:gap-10 lg:p-10">
                        <Link
                          href={`/law_video/${c.id}`}
                          className="group relative block shrink-0 overflow-hidden rounded-xl border border-(--gray-200) bg-(--gray-100) lg:w-[min(44%,420px)]"
                        >
                          <div className="relative aspect-5/3 w-full max-h-[220px] sm:max-h-[260px] lg:aspect-4/3 lg:max-h-none">
                            <Image
                              src={src}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]"
                              sizes="(max-width: 1024px) 100vw, 420px"
                              priority={c.id === cat?.id}
                              unoptimized={thumbUnoptimized(src)}
                            />
                            <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-(--primary) shadow-md">
                                <svg className="ml-0.5 h-7 w-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <Link
                              href={`/law_video/${c.id}`}
                              className="group/title min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 rounded-sm"
                            >
                              <h3 className="text-xl font-semibold leading-snug text-(--ink) transition-colors group-hover/title:text-(--primary) sm:text-2xl lg:text-3xl">
                                {c.name ?? "គ្មានចំណងជើង"}
                              </h3>
                            </Link>
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--primary)/20 bg-(--primary)/10 px-3 py-1 text-xs font-semibold text-(--primary)">
                              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                              {c.videoCount} វីដេអូ
                            </span>
                          </div>

                          <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-(--gray-700) sm:text-base lg:line-clamp-4">
                            {desc}
                          </p>

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <Button
                              type="button"
                              onClick={() => router.push(`/law_video/${c.id}`)}
                              variant="primary"
                              size="lg"
                              className="cursor-pointer group/btn w-full justify-center sm:w-auto"
                            >
                              <span className="flex items-center gap-2">
                                ចាប់ផ្តើមសិក្សា
                                <svg
                                  className="h-5 w-5 transition-transform duration-200 group-hover/btn:translate-x-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </span>
                            </Button>
                            <Link
                              href={`/law_video/${c.id}`}
                              className="text-center text-sm font-semibold text-(--primary) underline-offset-4 transition-colors hover:underline sm:self-center sm:text-left"
                            >
                              មើលវគ្គនេះលម្អិត →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {len > 1 && (
                <div className="flex items-center justify-between gap-4 border-t border-(--gray-100) px-4 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--gray-200) bg-(--gray-50) px-3 py-2 text-sm font-medium text-(--ink) transition-colors duration-200 hover:border-(--primary)/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2"
                    aria-label="វគ្គមុន"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">មុន</span>
                  </button>

                  <div className="flex justify-center gap-1.5">
                    {categories.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentCourseIndex(index)}
                        className={[
                          "h-2 cursor-pointer rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2",
                          index === safeIndex ? "w-7 bg-(--primary)" : "w-2 bg-(--gray-300) hover:bg-(--primary)/50",
                        ].join(" ")}
                        aria-label={`ទៅវគ្គ ${index + 1}`}
                        aria-current={index === safeIndex ? "true" : undefined}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--gray-200) bg-(--gray-50) px-3 py-2 text-sm font-medium text-(--ink) transition-colors duration-200 hover:border-(--primary)/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2"
                    aria-label="វគ្គបន្ទាប់"
                  >
                    <span className="hidden sm:inline">បន្ទាប់</span>
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-(--gray-700)">
              <Link href="/law_video" className="font-semibold text-(--primary) underline-offset-4 transition-colors hover:underline">
                មើលវគ្គវីដេអូទាំងអស់
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
