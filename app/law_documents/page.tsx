"use client";

import Image from "next/image";
import PageContainer from "@/compounents/PageContainer";
import { useEffect, useRef, useState } from "react";

interface Document {
  id: number;
  title: string;
  description: string;
  author: string;
  year: number;
  coverImage: string;
  pdfUrl: string;
}

// Sample documents data - you can replace this with actual data from an API
const documents: Document[] = [
  {
    id: 1,
    title: "Cambodian Labor Law",
    description: "Comprehensive guide to labor laws and regulations in Cambodia, covering employment rights, workplace safety, and employee benefits.",
    author: "Men Vuth",
    year: 2024,
    coverImage: "/sample_book/cover/book1.png",
    pdfUrl: "/sample_book/pdf/law (155).pdf"
  },
  {
    id: 2,
    title: "Land Law in Cambodia",
    description: "Detailed explanation of land ownership, property rights, and real estate regulations in the Kingdom of Cambodia.",
    author: "Men Vuth",
    year: 2024,
    coverImage: "/sample_book/cover/book1.png",
    pdfUrl: "/sample_book/pdf/law (155).pdf"
  },
  {
    id: 3,
    title: "Corporate Law Handbook",
    description: "Essential guide for understanding corporate structures, business registration, and company law in Cambodia.",
    author: "Men Vuth",
    year: 2023,
    coverImage: "/sample_book/cover/book1.png",
    pdfUrl: "/sample_book/pdf/law (155).pdf"
  },
  {
    id: 4,
    title: "Investment Protection Law",
    description: "Complete reference on investment laws, foreign investment regulations, and protection mechanisms for investors.",
    author: "Men Vuth",
    year: 2024,
    coverImage: "/sample_book/cover/book1.png",
    pdfUrl: "/sample_book/pdf/law (155).pdf"
  }
];

export default function LawDocumentsPage() {
  const documentsRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.author.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query) ||
      doc.year.toString().includes(query)
    );
  });

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const checkAndAnimate = () => {
      const animatedElements = document.querySelectorAll(
        '.opacity-0[class*="delay"], .opacity-0.translate-y-8, .opacity-0.translate-y-4, .opacity-0.translate-x-8, .opacity-0.-translate-x-8'
      );
      animatedElements.forEach((el) => {
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => {
            el.classList.add("animate-in");
          }, 50);
        }
      });
    };

    checkAndAnimate();
    setTimeout(checkAndAnimate, 100);

    return () => observer.disconnect();
  }, []);

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/document_background.png"
            alt="Legal documents background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/70 via-slate-900/60 to-slate-900/70 z-10"></div>
        {/* Amber accent overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-900/20 to-transparent z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 opacity-0 translate-y-8 delay-100">
              Legal Documents
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
              Access comprehensive legal documents and resources
            </p>
          </div>
        </div>
      </section>

      {/* Documents List Section */}
      <section className="py-20 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-12 opacity-0 translate-y-8 delay-100">
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title, author, description, or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-md hover:shadow-lg transition-all duration-200 text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-3 text-sm text-gray-600 text-center">
                  Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-0">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc, index) => (
              <div
                key={doc.id}
                className="w-full border-b border-gray-300 py-8 opacity-0 translate-y-8 hover:bg-gray-50 transition-colors duration-200"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left Side - Book Cover */}
                  <div className="flex justify-center md:justify-start">
                    <div className="relative w-56 h-80 rounded-lg overflow-hidden shadow-lg border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 hover:scale-105">
                      <Image
                        src={doc.coverImage}
                        alt={doc.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 224px"
                      />
                    </div>
                  </div>

                  {/* Right Side - Document Details */}
                  <div className="md:col-span-2 flex flex-col justify-center space-y-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {doc.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {doc.author}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {doc.year}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {doc.description}
                    </p>

                    <div className="pt-2">
                      <a
                        href={doc.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Document
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-16 opacity-0 translate-y-8 delay-100">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No documents found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
