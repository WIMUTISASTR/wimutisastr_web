"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import type { HomeResponse } from "@/lib/api/client";

interface HeroSectionProps {
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  home: HomeResponse | null;
  homeLoading: boolean;
}

export default function HeroSection({ isVisible, mousePosition, home, homeLoading }: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gray-100 pt-20">
      <div className="absolute inset-0 -z-10">
        <Image src="/asset/aboutUs.png" alt="Hero background" fill className="object-cover opacity-20" priority sizes="100vw" />
        <div className="absolute inset-0 bg-white/80" />
        <div
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.35}px, ${mousePosition.y * 0.35}px)`,
            transition: "transform 0.35s ease-out",
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-(--accent)/20 blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x * 0.2}px, ${-mousePosition.y * 0.2}px)`,
            transition: "transform 0.35s ease-out",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div
            className={[
              "space-y-7 transition-all duration-700 lg:col-span-7 rounded-2xl bg-white/95 p-6 sm:p-8 shadow-lg border border-gray-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            ].join(" ")}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-(--primary)/20 bg-(--primary) px-4 py-2 text-xs font-semibold tracking-wide text-white">
              <span className="inline-flex h-2 w-2 rounded-full bg-(--accent)" />
              WIMUTISASTR Law Education
            </div>

            <h1 className="text-4xl leading-tight tracking-tight text-(--ink) sm:text-5xl lg:text-6xl">
              មជ្ឈមណ្ឌល
              <span className="block text-(--primary)">សិក្សាច្បាប់កម្ពុជា</span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
              ផ្តល់ជូនវគ្គវីដេអូ និងឯកសារច្បាប់សំខាន់ៗ ដើម្បីជួយឱ្យសិស្ស និស្សិត អ្នកជំនាញ និងសាធារណជន
              អាចសិក្សា និងយល់ដឹងអំពីច្បាប់កម្ពុជាបានយ៉ាងច្បាស់លាស់។
            </p>

            <ul className="grid gap-3 sm:grid-cols-2 max-w-2xl">
              {[
                "រៀនដោយអ្នកជំនាញដឹកនាំ",
                "ឯកសារច្បាប់បានផ្ទៀងផ្ទាត់",
                "មេរៀនច្បាស់លាស់ និងមានរចនាសម្ព័ន្ធ",
                "ចូលប្រើបានគ្រប់ពេល គ្រប់ទីកន្លែង",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button onClick={() => router.push("/law_video")} variant="primary" size="lg" className="group min-w-[180px] justify-center">
                <span className="flex items-center gap-2">
                  ចាប់ផ្តើមសិក្សា
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
              <Button
                onClick={() => router.push("/law_documents")}
                variant="outline"
                size="lg"
                className="min-w-[180px] justify-center"
              >
                មើលឯកសារច្បាប់
              </Button>
            </div>

            <div className="grid gap-3 pt-4 sm:grid-cols-3 max-w-3xl">
              {[
                { label: "វគ្គសិក្សា", value: home?.stats.categoriesCount ?? 0 },
                { label: "វីដេអូ", value: home?.stats.videosCount ?? 0 },
                { label: "ឯកសារ", value: home?.stats.booksCount ?? 0 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                >
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-extrabold text-(--ink)">
                      {homeLoading ? <span className="inline-block w-10 animate-pulse rounded bg-gray-200">&nbsp;</span> : s.value}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={[
              "transition-all duration-700 delay-150 lg:col-span-5",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            ].join(" ")}
          >
            <div
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
              style={{
                transform: `perspective(1200px) rotateY(${mousePosition.x * 0.008}deg) rotateX(${-mousePosition.y * 0.008}deg)`,
                transition: "transform 0.25s ease-out",
              }}
            >
              <div className="relative aspect-4/3">
                <Image
                  src="/asset/hero.png"
                  alt="ការអប់រំច្បាប់កម្ពុជា"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 92vw, 42vw"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-white text-sm font-semibold mb-1">ព័ត៌មានសង្ខេប</div>
                  <div className="text-gray-100 text-xs">
                    សិក្សាច្បាប់តាមប្រព័ន្ធអនឡាញជាមួយមាតិកាដែលរៀបចំដោយអ្នកជំនាញ។
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
