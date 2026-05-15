"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import type { HomeResponse } from "@/lib/api/client";

const FALLBACK_COVER = "/sample_book/cover/book1.png";

function thumbUnoptimized(src: string) {
  return src.includes(".r2.dev/") || /^https?:\/\//i.test(src);
}

interface FeaturedDocumentsSectionProps {
  home: HomeResponse | null;
  currentBookIndex: number;
  setCurrentBookIndex: (index: number | ((prev: number) => number)) => void;
  hasPaid: boolean;
}

export default function FeaturedDocumentsSection({
  home,
  currentBookIndex,
  setCurrentBookIndex,
  hasPaid,
}: FeaturedDocumentsSectionProps) {
  const router = useRouter();
  const books = home?.featuredBooks ?? [];
  const len = books.length;
  const safeIndex = len > 0 ? Math.min(currentBookIndex, len - 1) : 0;
  const book = len > 0 ? books[safeIndex] : null;

  useEffect(() => {
    if (len === 0) return;
    const max = len - 1;
    if (currentBookIndex > max || currentBookIndex < 0) {
      setCurrentBookIndex(Math.min(Math.max(0, currentBookIndex), max));
    }
  }, [len, currentBookIndex, setCurrentBookIndex]);

  const go = (delta: number) => {
    if (len <= 0) return;
    setCurrentBookIndex((i) => (i + delta + len) % len);
  };

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/4 h-72 w-72 rounded-full bg-(--accent) opacity-[0.05] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-(--primary) opacity-[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10 scroll-animate opacity-0 translate-y-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent-dark)">ធនធានច្បាប់</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">ឯកសារសំខាន់ៗ</h2>
          <p className="mt-4 text-base leading-relaxed text-(--gray-700) sm:text-lg">
            ចូលប្រើឯកសារច្បាប់ និងធនធានសំខាន់ៗយ៉ាងគ្រប់ជ្រុងជ្រោយ
          </p>
        </div>

        {len === 0 ? (
          <div className="scroll-animate opacity-0 translate-y-8 rounded-2xl border border-(--gray-200) bg-(--gray-50) px-6 py-14 text-center shadow-sm">
            <p className="text-(--gray-700)">មិនទាន់មានឯកសារណែនាំនៅពេលនេះទេ។</p>
            <Link
              href={hasPaid ? "/law_documents" : "/pricing_page"}
              className="mt-4 inline-flex text-sm font-semibold text-(--primary) underline-offset-4 transition-colors hover:underline"
            >
              {hasPaid ? "រកមើលឯកសារច្បាប់" : "មើលគម្រោងសមាជិកភាព"}
            </Link>
          </div>
        ) : (
          <div className="space-y-6 scroll-animate opacity-0 translate-y-8">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible">
              {books.map((b, index) => {
                const active = index === safeIndex;
                const thumb = normalizeNextImageSrc(b.cover_url, FALLBACK_COVER, { bucket: "book" });
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setCurrentBookIndex(index)}
                    className={[
                      "flex min-w-0 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-sm transition-colors duration-200 sm:min-w-0",
                      active
                        ? "border-(--accent-dark) bg-(--gray-50) shadow-sm ring-1 ring-(--accent-dark)/20"
                        : "border-(--gray-200) bg-white hover:border-(--accent-dark)/35 hover:bg-(--gray-50)/80",
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
                    <span className="max-w-40 truncate font-medium text-(--ink) sm:max-w-56">{b.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-(--gray-200) bg-(--gray-50) shadow-sm">
              <div
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${safeIndex * 100}%)` }}
              >
                {books.map((b) => {
                  const docHref = hasPaid ? "/law_documents" : "/pricing_page";
                  const cover = normalizeNextImageSrc(b.cover_url, FALLBACK_COVER, { bucket: "book" });
                  const desc = b.description?.trim() || "ឯកសារច្បាប់ដែលបានជ្រើសរើសយ៉ាងរឹងមាំសម្រាប់ការសិក្សា និងយោង។";
                  return (
                    <article key={b.id} className="min-w-full shrink-0">
                      <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-stretch lg:gap-10 lg:p-10">
                        <div className="flex justify-center lg:w-52 lg:shrink-0 lg:justify-start">
                          <Link
                            href={docHref}
                            className="group relative block w-full max-w-[220px] overflow-hidden rounded-xl border border-(--gray-200) bg-white shadow-md transition-shadow duration-200 hover:shadow-lg lg:max-w-[208px]"
                          >
                            <div className="relative aspect-3/4 w-full">
                              <Image
                                src={cover}
                                alt={b.title}
                                fill
                                className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]"
                                sizes="(max-width: 1024px) 220px, 208px"
                                priority={b.id === book?.id}
                                unoptimized={thumbUnoptimized(cover)}
                              />
                              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/5" />
                              {!hasPaid && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-(--accent-dark) shadow-lg" aria-hidden>
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col justify-center border-t border-(--gray-200) pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                          <div className="space-y-2">
                            <Link
                              href={docHref}
                              className="inline-block cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2"
                            >
                              <h3 className="text-xl font-semibold leading-snug text-(--ink) transition-colors hover:text-(--accent-dark) sm:text-2xl lg:text-3xl">
                                {b.title}
                              </h3>
                            </Link>
                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-(--gray-700)">
                              <span className="inline-flex items-center gap-1.5">
                                <svg className="h-4 w-4 shrink-0 text-(--accent-dark)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">{b.author}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <svg className="h-4 w-4 shrink-0 text-(--accent-dark)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium tabular-nums">{b.year}</span>
                              </span>
                            </div>
                          </div>

                          <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-(--gray-700) sm:text-base lg:line-clamp-4">
                            {desc}
                          </p>

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            {hasPaid ? (
                              <Button
                                type="button"
                                onClick={() => router.push("/law_documents")}
                                variant="primary"
                                size="lg"
                                className="cursor-pointer group/btn w-full justify-center sm:w-auto"
                              >
                                <span className="flex items-center gap-2">
                                  មើលឯកសារ
                                  <svg className="h-5 w-5 transition-transform duration-200 group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </span>
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={() => router.push("/pricing_page")}
                                variant="primary"
                                size="lg"
                                className="cursor-pointer group/btn w-full justify-center sm:w-auto"
                              >
                                <span className="flex items-center gap-2">
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  ជាវដើម្បីចូលប្រើ
                                  <svg className="h-5 w-5 transition-transform duration-200 group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </span>
                              </Button>
                            )}
                            <Link
                              href={docHref}
                              className="text-center text-sm font-semibold text-(--accent-dark) underline-offset-4 transition-colors hover:underline sm:text-left"
                            >
                              {hasPaid ? "ចូលទៅបណ្ណាល័យឯកសារ →" : "ស្វែងយល់ពីការជាវ →"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {len > 1 && (
                <div className="flex items-center justify-between gap-4 border-t border-(--gray-200) bg-white px-4 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--gray-200) bg-(--gray-50) px-3 py-2 text-sm font-medium text-(--ink) transition-colors duration-200 hover:border-(--accent-dark)/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2"
                    aria-label="ឯកសារមុន"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">មុន</span>
                  </button>

                  <div className="flex justify-center gap-1.5">
                    {books.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentBookIndex(index)}
                        className={[
                          "h-2 cursor-pointer rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2",
                          index === safeIndex ? "w-7 bg-(--accent-dark)" : "w-2 bg-(--gray-300) hover:bg-(--accent-dark)/50",
                        ].join(" ")}
                        aria-label={`ទៅឯកសារ ${index + 1}`}
                        aria-current={index === safeIndex ? "true" : undefined}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--gray-200) bg-(--gray-50) px-3 py-2 text-sm font-medium text-(--ink) transition-colors duration-200 hover:border-(--accent-dark)/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2"
                    aria-label="ឯកសារបន្ទាប់"
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
              <Link
                href={hasPaid ? "/law_documents" : "/pricing_page"}
                className="font-semibold text-(--accent-dark) underline-offset-4 transition-colors hover:underline"
              >
                {hasPaid ? "មើលឯកសារច្បាប់ទាំងអស់" : "មើលគម្រោងសមាជិកភាព"}
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
