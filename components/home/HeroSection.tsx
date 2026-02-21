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
    <section className="relative overflow-hidden bg-(--paper) pt-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute -top-32 -left-32 h-112 w-md rounded-full bg-(--primary) opacity-[0.07] blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.25}px, ${mousePosition.y * 0.25}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-136 w-136 rounded-full bg-(--accent) opacity-[0.10] blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x * 0.18}px, ${-mousePosition.y * 0.18}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Side - Text Content */}
          <div
            className={[
              "space-y-7 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              "lg:col-span-6",
            ].join(" ")}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--brown-rgb)/0.25)] bg-white/70 px-4 py-2 text-xs font-semibold tracking-wide text-(--ink) shadow-sm backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-(--primary)" />
              ការអប់រំច្បាប់វិជ្ជាជីវៈ
            </div>
            
            {/* Main Headline */}
            <h1 className="text-[2.75rem] leading-[1.05] tracking-tight text-(--ink) sm:text-6xl lg:text-7xl">
              <span className="font-extrabold">សិក្សា</span>{" "}
              <span className="font-extrabold text-(--primary)">ច្បាប់កម្ពុជា</span>{" "}
              <span className="font-extrabold">ជាមួយអ្នកជំនាញ</span>
            </h1>
            
            {/* Description */}
            <p className="max-w-xl text-base leading-relaxed text-(--gray-700) sm:text-lg">
              សិក្សាច្បាប់កម្ពុជាតាមវីដេអូបង្រៀនដោយអ្នកជំនាញ និងឯកសារច្បាប់ដែលរៀបចំជ្រើសរើសយ៉ាងប្រុងប្រយ័ត្ន
              ដើម្បីជួយសិស្ស និស្សិត អ្នកជំនាញ និងសាធារណជន ឱ្យយល់ច្បាប់បានច្បាស់លាស់ និងមានទំនុកចិត្ត។
            </p>

            {/* Benefits */}
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "រៀនដោយអ្នកជំនាញដឹកនាំ",
                "ឯកសារច្បាប់បានផ្ទៀងផ្ទាត់",
                "មេរៀនច្បាស់លាស់ និងមានរចនាសម្ព័ន្ធ",
                "ចូលប្រើបានគ្រប់ពេល គ្រប់ទីកន្លែង",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-(--gray-700)">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--brown-rgb)/0.12)] text-(--primary)">
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
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={() => router.push("/law_video")} variant="primary" size="lg" className="group">
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
              <Button onClick={() => router.push("/pricing_page")} variant="outline" size="lg">
                មើលតម្លៃគម្រោង
              </Button>
              <span className="text-xs text-(--gray-700) sm:ml-2">ចូលប្រើបានលឿន។ រៀនបានងាយស្រួល។</span>
            </div>

            {/* Stats Preview */}
            <div className="grid gap-3 pt-3 sm:grid-cols-3">
              {[
                { label: "វគ្គសិក្សា", value: home?.stats.categoriesCount ?? 0 },
                { label: "វីដេអូ", value: home?.stats.videosCount ?? 0 },
                { label: "ឯកសារ", value: home?.stats.booksCount ?? 0 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur"
                >
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-extrabold text-(--ink)">
                      {homeLoading ? <span className="inline-block w-10 animate-pulse rounded bg-gray-200">&nbsp;</span> : s.value}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-(--gray-700)">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Hero Visual */}
          <div
            className={[
              "transition-all duration-700 delay-150",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              "lg:col-span-6",
            ].join(" ")}
          >
            <div className="relative mx-auto w-full max-w-xl">
              {/* Glow */}
              <div className="absolute -inset-6 rounded-4xlbg-(--accent) opacity-[0.18] blur-3xl" />

              {/* Frame */}
              <div
                className="relative overflow-hidden rounded-4xl border border-gray-200 bg-white shadow-2xl"
                style={{
                  transform: `perspective(1200px) rotateY(${mousePosition.x * 0.012}deg) rotateX(${-mousePosition.y * 0.012}deg)`,
                  transition: "transform 0.25s ease-out",
                }}
              >
                <div className="relative p-5 sm:p-7">
                  <div className="rounded-2xl border border-[rgb(var(--brown-rgb)/0.20)] bg-[rgb(var(--brown-rgb)/0.06)] p-4">
                    <div className="relative aspect-4/3 overflow-hidden bg-white shadow-md">
                      <Image
                        src="/asset/hero.png"
                        alt="ការអប់រំច្បាប់កម្ពុជា"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 1024px) 90vw, 42vw"
                      />
                    </div>
                  </div>                                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="hidden flex-col items-center gap-2 sm:flex">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-(--gray-700)">រមូរ</span>
          <svg className="h-6 w-6 text-(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
