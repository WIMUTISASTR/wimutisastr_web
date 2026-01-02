"use client";

import Image from "next/image";
import Link from "next/link";
import PageContainer from "@/compounents/PageContainer";
import { useEffect, useRef } from "react";
import { courses } from "../data";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = parseInt(params.courseId as string);
  const course = courses.find((c) => c.id === courseId);

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

  if (!course) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <Link
              href="/law_video"
              className="text-amber-600 hover:text-amber-700 underline"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/document_background.png"
            alt="Course background"
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
            <Link
              href="/law_video"
              className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors opacity-0 translate-y-8 delay-100"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 opacity-0 translate-y-8 delay-200 leading-tight line-clamp-2">
              {course.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
              {course.description}
            </p>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-20 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Videos List */}
          <div className="space-y-0">
            {course.videos.map((video, index) => (
              <div
                key={video.id}
                className="w-full border-b border-gray-300 py-8 opacity-0 translate-y-8 hover:bg-gray-50 transition-colors duration-200"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left Side - Video Thumbnail */}
                  <div className="flex justify-center md:justify-start">
                    <div className="relative w-full md:w-96 aspect-video rounded-md overflow-hidden group cursor-pointer">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 384px"
                      />
                      {/* Play Button Overlay - YouTube style (appears on hover) */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 shadow-lg">
                          <svg
                            className="w-8 h-8 text-amber-600 ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                      {/* Duration Badge - YouTube style */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                        {video.duration}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Video Details */}
                  <div className="md:col-span-2 flex flex-col justify-center space-y-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight line-clamp-2">
                        {index + 1}. {video.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {video.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {video.duration}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        Watch Video
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

