"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/compounents/Button";
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
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Legal <span className="text-(--brown)">Documents</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access comprehensive legal documents and resources
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mb-12">
          <div className="relative overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentBookIndex * 100}%)` }}
            >
              {(home?.featuredBooks ?? []).map((book) => (
                <div key={book.id} className="min-w-full">
                  <div 
                    className="grid md:grid-cols-2 gap-12 p-8 md:p-12 bg-white rounded-3xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-(--brown)/30 cursor-pointer"
                    onClick={() => router.push(hasPaid ? "/law_documents" : "/pricing_page")}
                  >
                    {/* Left Side - Book Cover */}
                    <div className="relative group">
                      <div className="relative w-full max-w-sm mx-auto aspect-3/4 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        <Image
                          src={normalizeNextImageSrc(book.cover_url, FALLBACK_COVER)}
                          alt={book.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 384px"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                      </div>
                    </div>

                    {/* Right Side - Document Details */}
                    <div className="flex flex-col justify-center space-y-6">
                      <div>
                        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                          {book.title}
                        </h3>
                        <div className="flex items-center space-x-6 text-gray-600 mb-4">
                          <span className="flex items-center font-medium">
                            <svg className="w-5 h-5 mr-2 text-(--brown)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {book.author}
                          </span>
                          <span className="flex items-center font-medium">
                            <svg className="w-5 h-5 mr-2 text-(--brown)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {book.year}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 text-lg leading-relaxed">
                        {book.description}
                      </p>

                      <div className="pt-4">
                        {hasPaid ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/law_documents");
                            }}
                            variant="primary"
                            className="px-8 py-4 text-lg"
                          >
                            View Document
                          </Button>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/pricing_page");
                            }}
                            variant="primary"
                            className="px-8 py-4 text-lg"
                          >
                            Subscribe to Access
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
          <div className="flex justify-center items-center gap-3 mt-8">
            {(home?.featuredBooks ?? []).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBookIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentBookIndex
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
