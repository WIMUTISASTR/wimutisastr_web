"use client";

import Link from "next/link";

export default function FeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-(--brown) rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-(--brown) rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Everything You Need to <span className="text-(--brown)">Excel</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive legal education resources at your fingertips
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Video Feature Card */}
          <Link 
            href="/law_video"
            className="group card-3d scroll-animate opacity-0 translate-y-8 delay-100"
          >
            <div className="relative h-full p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-(--brown) transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-(--brown)/10 to-transparent rounded-bl-full" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-linear-to-br from-(--brown) to-(--brown-strong) rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-(--brown) transition-colors">
                  Video Courses
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Learn from expert legal professionals through comprehensive, professionally produced video tutorials 
                  covering all aspects of Cambodian law.
                </p>
                <div className="flex items-center text-(--brown) font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Courses
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Documents Feature Card */}
          <Link 
            href="/law_documents"
            className="group card-3d scroll-animate opacity-0 translate-y-8 delay-200"
          >
            <div className="relative h-full p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-(--brown) transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-(--brown)/10 to-transparent rounded-bl-full" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-linear-to-br from-(--brown) to-(--brown-strong) rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-(--brown) transition-colors">
                  Legal Documents
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Access comprehensive legal documents, statutes, case studies, and reference materials 
                  to deepen your understanding of Cambodian legal frameworks.
                </p>
                <div className="flex items-center text-(--brown) font-semibold group-hover:translate-x-2 transition-transform">
                  Browse Documents
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
