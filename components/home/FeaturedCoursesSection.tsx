"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import type { HomeResponse } from "@/lib/api/client";

interface FeaturedCoursesSectionProps {
  home: HomeResponse | null;
  currentCourseIndex: number;
  setCurrentCourseIndex: (index: number) => void;
}

export default function FeaturedCoursesSection({ 
  home, 
  currentCourseIndex, 
  setCurrentCourseIndex 
}: FeaturedCoursesSectionProps) {
  const router = useRouter();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-(--gray-50)">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-(--primary) opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-(--accent) opacity-8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 scroll-animate opacity-0 translate-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent)/20 border-2 border-(--primary) rounded-full mb-6">
            <div className="w-2 h-2 bg-(--primary) rounded-full animate-pulse" />
            <span className="text-sm font-bold text-(--primary) uppercase tracking-wide">វគ្គពេញនិយម</span>
          </div>
          <p className="text-xl text-(--gray-700) max-w-3xl mx-auto font-medium">
            ស្វែងរកវគ្គអប់រំច្បាប់ពេញនិយមបំផុតរបស់យើង
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mb-12">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentCourseIndex * 100}%)` }}
            >
              {(home?.categories ?? []).map((cat) => (
                <div key={cat.id} className="min-w-full">
                  <Link href={`/law_video/${cat.id}`} className="block">
                    <div className="relative grid md:grid-cols-2 gap-10 lg:gap-12 p-8 lg:p-12 duration-500 group">
                      {/* Left Side - Course Thumbnail */}
                      <div className="relative">
                        <div className="relative w-full aspect-video overflow-hidden">
                          {/* Image */}
                          <Image
                            src={normalizeNextImageSrc(cat.cover_url, "/asset/document_background.png", { bucket: "video" })}
                            alt={cat.name ?? "Category"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                          />
                          
                          {/* Dark Overlay */}
                          <div className="absolute inset-0 bg-black/30" />
                          
                          {/* Video Count Badge */}
                          <div className="absolute top-4 right-4 bg-(--primary) text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            {cat.videoCount} វីដេអូ
                          </div>
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                              <svg className="w-10 h-10 text-(--primary) ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Decorative Element */}
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-(--accent) opacity-20 rounded-3xl blur-2xl group-hover:scale-110 transition-transform duration-500" />
                      </div>

                      {/* Right Side - Course Details */}
                      <div className="flex flex-col justify-center space-y-6">
                        {/* Title */}
                        <div>
                          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-(--ink) mb-4 leading-tight group-hover:text-(--primary) transition-colors duration-300">
                            {cat.name ?? "គ្មានចំណងជើង"}
                          </h3>
                          
                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-6 text-(--gray-700) mb-4">
                            <span className="flex items-center gap-2 font-semibold text-sm">
                              <svg className="w-5 h-5 text-(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              WIMUTISASTR
                            </span>
                            <span className="flex items-center gap-2 font-semibold text-sm">
                              <svg className="w-5 h-5 text-(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date().getFullYear()}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-(--gray-700) text-lg leading-relaxed font-medium">
                          {cat.description || "មាតិកាអប់រំច្បាប់គ្រប់ជ្រុងជ្រោយ ដែលគ្របដណ្តប់ប្រធានបទសំខាន់ៗនៃច្បាប់កម្ពុជា។"}
                        </p>

                        {/* CTA */}
                        <div className="flex items-center gap-4 pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              router.push(`/law_video/${cat.id}`);
                            }}
                            variant="primary"
                            size="lg"
                            className="group/btn"
                          >
                            <span className="flex items-center gap-2">
                              ចាប់ផ្តើមសិក្សា
                              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </Button>
                          
                          <div className="px-4 py-3 glass rounded-xl border border-(--gray-200)">
                            <div className="text-xs text-(--gray-700) font-semibold uppercase tracking-wide mb-1">ចំនួនវីដេអូសរុប</div>
                            <div className="text-2xl font-bold text-(--primary)">{cat.videoCount}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          {(home?.categories ?? []).length > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              {(home?.categories ?? []).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCourseIndex(index)}
                  className={`transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 ${
                    index === currentCourseIndex
                      ? 'w-10 h-2.5 bg-(--primary) shadow-sm'
                      : 'w-2.5 h-2.5 bg-(--gray-300) hover:bg-(--primary)'
                  }`}
                  aria-label={`ទៅស្លាយ ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
