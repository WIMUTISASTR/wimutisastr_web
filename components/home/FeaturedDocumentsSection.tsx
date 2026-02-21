"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import type { HomeResponse } from "@/lib/api/client";

const FALLBACK_COVER = "/sample_book/cover/book1.png";

interface FeaturedDocumentsSectionProps {
  home: HomeResponse | null;
  currentBookIndex: number;
  setCurrentBookIndex: (index: number) => void;
  hasPaid: boolean;
}

export default function FeaturedDocumentsSection({ 
  home, 
  currentBookIndex, 
  setCurrentBookIndex,
  hasPaid 
}: FeaturedDocumentsSectionProps) {
  const router = useRouter();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-(--accent) opacity-8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-(--primary) opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 scroll-animate opacity-0 translate-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent)/20 border-2 border-(--accent-dark) rounded-full mb-6">
            <div className="w-2 h-2 bg-(--accent-dark) rounded-full animate-pulse" />
            <span className="text-sm font-bold text-(--accent-dark) uppercase tracking-wide">ធនធានច្បាប់</span>
          </div>         
          <p className="text-xl text-(--gray-700) max-w-3xl mx-auto font-medium">
            ចូលប្រើឯកសារច្បាប់ និងធនធានសំខាន់ៗយ៉ាងគ្រប់ជ្រុងជ្រោយ
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mb-12">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentBookIndex * 100}%)` }}
            >
              {(home?.featuredBooks ?? []).map((book) => (
                <div key={book.id} className="min-w-full">
                  <div 
                    className="relative grid md:grid-cols-2 gap-10 lg:gap-12 p-8 lg:p-12 cursor-pointer group"
                    onClick={() => router.push(hasPaid ? "/law_documents" : "/pricing_page")}
                  >
                    {/* Left Side - Book Cover */}
                      <div className="relative flex items-center justify-center">
                      <div className="relative w-full max-w-sm">
                        {/* Decorative Background */}
                        <div className="absolute -inset-4 bg-(--accent) opacity-20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                        
                        {/* Book Cover */}
                        <div className="relative aspect-3/4 overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500 card-lift">
                          <Image
                            src={normalizeNextImageSrc(book.cover_url, FALLBACK_COVER, { bucket: "book" })}
                            alt={book.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 384px"
                            loading="lazy"
                          /> 
                          <div className="absolute inset-0 bg-black/30" />
                          
                          {/* Lock Overlay for Non-Paid Users */}
                          {!hasPaid && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                                <svg className="w-8 h-8 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Document Details */}
                    <div className="flex flex-col justify-center space-y-6">
                      {/* Title */}
                      <div>
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-(--ink) mb-4 leading-tight group-hover:text-(--accent) transition-colors duration-300">
                          {book.title}
                        </h3>
                        
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 text-(--gray-700) mb-4">
                          <span className="flex items-center gap-2 font-semibold text-sm">
                            <svg className="w-5 h-5 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {book.author}
                          </span>
                          <span className="flex items-center gap-2 font-semibold text-sm">
                            <svg className="w-5 h-5 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {book.year}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-(--gray-700) text-lg leading-relaxed font-medium">
                        {book.description}
                      </p>

                      {/* CTA */}
                      <div className="pt-4">
                        {hasPaid ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/law_documents");
                            }}
                            variant="primary"
                            size="lg"
                            className="group/btn"
                          >
                            <span className="flex items-center gap-2">
                              មើលឯកសារ
                              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </Button>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/pricing_page");
                            }}
                            variant="primary"
                            size="lg"
                            className="group/btn"
                          >
                            <span className="flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              ជាវដើម្បីចូលប្រើ
                              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          {(home?.featuredBooks ?? []).length > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              {(home?.featuredBooks ?? []).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBookIndex(index)}
                  className={`transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 ${
                    index === currentBookIndex
                      ? 'w-10 h-2.5 bg-(--accent-dark) shadow-sm'
                      : 'w-2.5 h-2.5 bg-(--gray-300) hover:bg-(--accent-dark)'
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
