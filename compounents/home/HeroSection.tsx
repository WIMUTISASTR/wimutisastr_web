"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/compounents/Button";
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
    <section className="relative overflow-hidden bg-[var(--paper)] pt-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-(--primary) opacity-[0.07] blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.25}px, ${mousePosition.y * 0.25}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-(--accent) opacity-[0.10] blur-3xl"
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--brown-rgb)/0.25)] bg-white/70 px-4 py-2 text-xs font-semibold tracking-wide text-[var(--ink)] shadow-sm backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-(--primary)" />
              Professional Legal Education
            </div>
            
            {/* Main Headline */}
            <h1 className="text-[2.75rem] leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl lg:text-7xl">
              <span className="font-extrabold">Learn</span>{" "}
              <span className="font-extrabold text-(--primary)">Cambodian</span>{" "}
              <span className="font-extrabold">Legal From Experts</span>
            </h1>
            
            {/* Description */}
            <p className="max-w-xl text-base leading-relaxed text-(--gray-700) sm:text-lg">
              Learn Cambodian law with expert-led video lessons and curated legal documents—designed to help
              students, professionals, and the public understand the law clearly and confidently.
            </p>

            {/* Benefits */}
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "Expert-led learning",
                "Verified legal documents",
                "Clear, structured courses",
                "Access anytime, anywhere",
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
                  Start Learning
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
                View Pricing
              </Button>
              <span className="text-xs text-(--gray-700) sm:ml-2">Fast access. Simple learning.</span>
            </div>

            {/* Stats Preview */}
            <div className="grid gap-3 pt-3 sm:grid-cols-3">
              {[
                { label: "Courses", value: home?.stats.categoriesCount ?? 0 },
                { label: "Videos", value: home?.stats.videosCount ?? 0 },
                { label: "Documents", value: home?.stats.booksCount ?? 0 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur"
                >
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-extrabold text-[var(--ink)]">
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
              <div className="absolute -inset-6 rounded-[2rem] bg-(--accent) opacity-[0.18] blur-3xl" />

              {/* Frame */}
              <div
                className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl"
                style={{
                  transform: `perspective(1200px) rotateY(${mousePosition.x * 0.012}deg) rotateX(${-mousePosition.y * 0.012}deg)`,
                  transition: "transform 0.25s ease-out",
                }}
              >
                <div className="relative p-5 sm:p-7">
                  <div className="rounded-2xl border border-[rgb(var(--brown-rgb)/0.20)] bg-[rgb(var(--brown-rgb)/0.06)] p-4">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white shadow-md">
                      <Image
                        src="/asset/hero.png"
                        alt="Cambodian legal education"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 1024px) 90vw, 42vw"
                      />
                    </div>
                  </div>

                  {/* Floating pills */}
                  <div className="pointer-events-none absolute left-6 top-6 sm:left-8 sm:top-8">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 text-xs font-semibold text-[var(--ink)] shadow-md backdrop-blur">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[rgb(var(--brown-rgb)/0.12)] text-(--primary)">
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                          <path
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span>
                        <span className="text-sm font-extrabold">{homeLoading ? "…" : `${home?.stats.booksCount ?? 0}+`}</span>
                        <span className="ml-1 text-(--gray-700)">Resources</span>
                      </span>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute bottom-6 right-6 sm:bottom-8 sm:right-8">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 text-xs font-semibold text-[var(--ink)] shadow-md backdrop-blur">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-(--primary) text-white">
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                          <path
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span>
                        <span className="text-sm font-extrabold">Trusted</span>
                        <span className="ml-1 text-(--gray-700)">Learning</span>
                      </span>
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
          <span className="text-[11px] font-semibold uppercase tracking-widest text-(--gray-700)">Scroll</span>
          <svg className="h-6 w-6 text-(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
