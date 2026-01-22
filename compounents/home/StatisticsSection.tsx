"use client";

import AnimatedCounter from "./AnimatedCounter";
import type { HomeResponse } from "@/lib/api/client";

interface StatisticsSectionProps {
  home: HomeResponse | null;
}

export default function StatisticsSection({ home }: StatisticsSectionProps) {
  const stats = [
    { 
      label: "Video Courses", 
      value: home?.stats.categoriesCount ?? 0, 
      icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
    },
    { 
      label: "Total Videos", 
      value: home?.stats.videosCount ?? 0, 
      icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
    },
    { 
      label: "Legal Documents", 
      value: home?.stats.booksCount ?? 0, 
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
    },
    { 
      label: "Expert Instructors", 
      value: 1, 
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/asset/background.png')] bg-cover bg-center mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Trusted by <span className="text-(--brown)">Thousands</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join a growing community of legal professionals and students
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 scroll-animate opacity-0 translate-y-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-linear-to-br from-(--brown) to-(--brown-strong) rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <AnimatedCounter value={stat.value} />
              <div className="text-gray-300 font-medium mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
