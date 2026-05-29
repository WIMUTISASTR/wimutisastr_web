"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import type { HomeResponse } from "@/lib/api/client";

/**
 * Full-bleed hero backdrop (subtle; scrim + opacity keep text readable).
 * Source (Pexels, free license): https://www.pexels.com/photo/wooden-gavel-on-brown-wooden-table-5669617/
 * Stored locally at public/asset/hero-law-backdrop.jpg
 */
const HERO_BACKDROP_SRC = "/asset/hero-law-backdrop.jpg";

interface HeroSectionProps {
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  home: HomeResponse | null;
  homeLoading: boolean;
}

export default function HeroSection({ isVisible, mousePosition, home, homeLoading }: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className="relative min-h-svh overflow-hidden border-b border-(--gray-200) bg-gray-100 pt-4 sm:pt-6 flex items-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={HERO_BACKDROP_SRC}
          alt=""
          fill
          className="object-cover object-center opacity-[0.1] sm:opacity-[0.11]"
          priority
          sizes="100vw"
          aria-hidden
        />
        <div className="absolute inset-0 bg-white/85" />
        <div
          className="absolute -top-32 left-1/2 h-96 w-[min(100%,48rem)] -translate-x-1/2 rounded-full bg-(--primary)/5 blur-3xl"
          style={{
            transform: `translate(-50%, ${mousePosition.y * 0.15}px)`,
            transition: "transform 0.35s ease-out",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div
            className={[
              "space-y-8 transition-all duration-700 lg:col-span-5 xl:col-span-6",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            ].join(" ")}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--primary)">
              WIMUTISASTR Law Education
            </p>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-(--ink) sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
                ការិយាល័យច្បាប់
                <span className="mt-1 block text-(--primary)">និងការអប់រំច្បាប់</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-(--gray-700) sm:text-lg">
                WIMUTISASTR ជាការិយាល័យមេធាវី និងមជ្ឈមណ្ឌលសិក្សាច្បាប់ ដែលផ្តល់សេវាច្បាប់
                ពិគ្រោះយោបល់ផ្នែកច្បាប់ វគ្គវីដេអូ និងឯកសារច្បាប់ ដើម្បីជួយសិស្ស និស្សិត អ្នកជំនាញ និងសាធារណជន។
              </p>
            </div>

            <ul className="grid max-w-xl gap-3 sm:grid-cols-2">
              {[
                "រៀនដោយអ្នកជំនាញដឹកនាំ",
                "ឯកសារច្បាប់បានផ្ទៀងផ្ទាត់",
                "មេរៀនច្បាស់លាស់ និងមានរចនាសម្ព័ន្ធ",
                "ចូលប្រើបានគ្រប់ពេល គ្រប់ទីកន្លែង",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-(--gray-700)">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-medium leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => router.push("/law_video")} variant="primary" size="lg" className="group min-w-[168px] justify-center cursor-pointer">
                <span className="flex items-center gap-2">
                  ចាប់ផ្តើមសិក្សា
                  <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
              <Button
                onClick={() => router.push("/law_documents")}
                variant="outline"
                size="lg"
                className="min-w-[168px] justify-center cursor-pointer"
              >
                មើលឯកសារច្បាប់
              </Button>
            </div>

            <dl className="grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-(--gray-200) bg-(--gray-200) sm:max-w-xl">
              {[
                { label: "វគ្គសិក្សា", value: home?.stats.categoriesCount ?? 0 },
                { label: "វីដេអូ", value: home?.stats.videosCount ?? 0 },
                { label: "ឯកសារ", value: home?.stats.booksCount ?? 0 },
              ].map((s) => (
                <div key={s.label} className="bg-white px-3 py-4 text-center sm:px-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-(--gray-700) sm:text-xs">{s.label}</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-(--ink) sm:text-2xl">
                    {homeLoading ? <span className="inline-block min-h-7 w-12 animate-pulse rounded bg-(--gray-100)" aria-hidden /> : s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className={[
              "lg:col-span-7 xl:col-span-6 transition-all duration-700 delay-150",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            ].join(" ")}
          >
            <div className="overflow-hidden border border-(--gray-200) bg-white shadow-lg">
              <div className="relative aspect-4/3">
                <Image
                  src="/asset/hero.png"
                  alt="ការអប់រំច្បាប់"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 92vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/90">ព័ត៌មានសង្ខេប</p>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-white/85">
                    សិក្សាច្បាប់តាមប្រព័ន្ធអនឡាញជាមួយមាតិកាដែលរៀបចំដោយអ្នកជំនាញ។
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
