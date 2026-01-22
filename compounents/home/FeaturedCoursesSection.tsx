"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/compounents/Button";
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
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Featured <span className="text-(--brown)">Courses</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our most popular legal education courses
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mb-12">
          <div className="relative overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentCourseIndex * 100}%)` }}
            >
              {(home?.categories ?? []).map((cat) => (
                <div key={cat.id} className="min-w-full">
                  <Link href={`/law_video/${cat.id}`} className="block">
                    <div className="grid md:grid-cols-2 gap-12 p-8 md:p-12 bg-linear-to-br from-gray-50 to-white rounded-3xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-(--brown)/30">
                      {/* Left Side - Course Thumbnail */}
                      <div className="relative group">
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
                          <Image
                            src={normalizeNextImageSrc(cat.cover_url, "/asset/document_background.png")}
                            alt={cat.name ?? "Category"}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                            {cat.videoCount} videos
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl">
                              <svg className="w-10 h-10 text-(--brown) ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Course Details */}
                      <div className="flex flex-col justify-center space-y-6">
                        <div>
                          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {cat.name ?? "Untitled"}
                          </h3>
                          <div className="flex items-center space-x-6 text-gray-600 mb-4">
                            <span className="flex items-center font-medium">
                              <svg className="w-5 h-5 mr-2 text-(--brown)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              WIMUTISASTR
                            </span>
                            <span className="flex items-center font-medium">
                              <svg className="w-5 h-5 mr-2 text-(--brown)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date().getFullYear()}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 text-lg leading-relaxed">
                          {cat.description ?? " "}
                        </p>

                        <div className="flex items-center gap-4 pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/law_video/${cat.id}`);
                            }}
                            variant="primary"
                            className="px-8 py-4 text-lg"
                          >
                            Start Learning
                          </Button>
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{cat.videoCount}</span> videos
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
          <div className="flex justify-center items-center gap-3 mt-8">
            {(home?.categories ?? []).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCourseIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentCourseIndex
                    ? 'w-12 h-3 bg-(--brown) shadow-lg'
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
