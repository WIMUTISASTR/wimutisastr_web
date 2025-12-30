"use client";

import Link from "next/link";
import Image from "next/image";
import Nav from "@/compounents/Nav";
import Button from "@/compounents/Button";
import { useEffect, useRef, useState } from "react";
import { courses } from "./law_video/data";

// Typing Animation Component
function TypingText({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;

    // Start typing after delay
    const startTyping = () => {
      let currentIndex = 0;
      
      const typeChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutId = setTimeout(typeChar, 100); // Typing speed: 100ms per character
        } else {
          // Stop cursor blinking after typing is complete
          setTimeout(() => {
            setShowCursor(false);
          }, 500);
        }
      };

      typeChar();
    };

    // Cursor blinking effect
    cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    const startTimeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
  }, [text, delay]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && <span className="ml-1 animate-pulse">|</span>}
    </span>
  );
}

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe sections and trigger animation for visible elements
    const checkAndAnimate = () => {
      // Observe sections
      if (featuresRef.current) {
        observer.observe(featuresRef.current);
        // Check if already visible
        const rect = featuresRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          featuresRef.current.classList.add("animate-in");
        }
      }
      if (partnersRef.current) {
        observer.observe(partnersRef.current);
        // Check if already visible
        const rect = partnersRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          partnersRef.current.classList.add("animate-in");
        }
      }

      // Observe all elements with opacity-0 that need animation
      const animatedElements = document.querySelectorAll('.opacity-0[class*="delay"], .opacity-0.translate-y-8, .opacity-0.translate-y-4');
      animatedElements.forEach((el) => {
        observer.observe(el);
        // Check if already visible
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => {
            el.classList.add("animate-in");
          }, 50);
        }
      });
    };

    // Run immediately and after a short delay
    checkAndAnimate();
    setTimeout(checkAndAnimate, 100);

    return () => observer.disconnect();
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* Hero Section - FORM KH Style */}
      <section className="relative overflow-hidden bg-slate-900 text-white min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/background.png"
            alt="Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/70 via-slate-900/60 to-slate-900/70 z-10"></div>
        {/* Amber accent overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-900/20 to-transparent z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full z-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div 
              ref={heroRef}
              className={`space-y-6 transition-all duration-1000 ${
                isVisible 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                {isVisible && (
                  <span className="inline-block">
                    <TypingText 
                      text="Learn Cambodian Law" 
                      delay={300}
                      className="text-white"
                    />
                  </span>
                )}
              </h1>
              <p className={`text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl transition-all duration-700 delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                Instant access to expert legal education with zero barriers. Comprehensive videos and documents 
                to master Cambodian law securely and efficiently.
              </p>
              <div className={`transition-all duration-700 delay-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <Link 
                  href="/law_video"
                  className="inline-block px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-lg hover:bg-amber-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                >
                  Start Learning Now
                </Link>
              </div>
            </div>

            {/* Right Side - Hero Logo */}
            <div 
              className={`relative hidden lg:flex items-center justify-center transition-all duration-1000 delay-300 ${
                isVisible 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative w-full max-w-lg h-[500px] flex items-center justify-center animate-float">
                <Image
                  src="/asset/hero.png"
                  alt="Scales of Justice with Crown and Laurel Wreath"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 1024px) 0vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Simplified */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Videos Feature */}
            <Link 
              href="/law_video"
              className="group flex items-center space-x-6 p-8 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 opacity-0 translate-y-8"
            >
              <div className="shrink-0 w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <svg className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  Educational Videos
                </h3>
                <p className="text-gray-600">
                  Learn from expert legal professionals through comprehensive video tutorials
                </p>
              </div>
            </Link>

            {/* Documents Feature */}
            <Link 
              href="/law_documents"
              className="group flex items-center space-x-6 p-8 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 opacity-0 translate-y-8 delay-200"
            >
              <div className="shrink-0 w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <svg className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  Legal Documents
                </h3>
                <p className="text-gray-600">
                  Access comprehensive legal documents, statutes, and case studies
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-slate-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 opacity-0 translate-y-8 delay-100">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Featured Video Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our most popular legal education courses
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {courses.slice(0, 3).map((course, index) => (
              <Link
                key={course.id}
                href={`/law_video/${course.id}`}
                className="group block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 opacity-0 translate-y-8"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Course Thumbnail - Larger and more prominent */}
                  <div className="relative w-full md:w-80 h-64 md:h-auto overflow-hidden bg-gray-900">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-linear-to-br from-black/40 to-black/60 flex items-center justify-center group-hover:from-black/30 group-hover:to-black/50 transition-all duration-300">
                      <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                        <svg className="w-10 h-10 text-amber-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {course.totalVideos} Videos
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm">
                      {course.totalDuration}
                    </div>
                  </div>

                  {/* Course Info - Better spacing and hierarchy */}
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                          {course.year}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {course.author}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          <span className="font-medium">Video Course</span>
                        </span>
                      </div>
                      <div className="flex items-center text-amber-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        <span className="mr-2">View Course</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center opacity-0 translate-y-8 delay-400">
            <Link href="/law_video">
              <Button variant="outline" className="px-8 py-4 text-lg">
                View All Video Courses
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 opacity-0 translate-y-8 delay-100">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Featured Legal Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access comprehensive legal documents and resources
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                id: 1,
                title: "Cambodian Labor Law",
                author: "Men Vuth",
                year: 2024,
                coverImage: "/sample_book/cover/book1.png",
              },
              {
                id: 2,
                title: "Land Law in Cambodia",
                author: "Men Vuth",
                year: 2024,
                coverImage: "/sample_book/cover/book1.png",
              },
              {
                id: 3,
                title: "Corporate Law Handbook",
                author: "Men Vuth",
                year: 2023,
                coverImage: "/sample_book/cover/book1.png",
              },
              {
                id: 4,
                title: "Investment Protection Law",
                author: "Men Vuth",
                year: 2024,
                coverImage: "/sample_book/cover/book1.png",
              },
            ].slice(0, 4).map((book, index) => (
              <Link
                key={book.id}
                href="/law_documents"
                className="group relative opacity-0 translate-y-8"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="relative h-full">
                  {/* 3D Book Effect Container */}
                  <div className="relative" style={{ perspective: '1000px' }}>
                    <div className="relative transform transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2" style={{ transformStyle: 'preserve-3d' }}>
                      {/* Book Shadow */}
                      <div className="absolute inset-0 bg-black/20 rounded-lg blur-xl transform translate-y-4 group-hover:translate-y-6 group-hover:blur-2xl transition-all duration-500"></div>
                      
                      {/* Book Card */}
                      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-full flex flex-col group-hover:shadow-2xl transition-all duration-500">
                        {/* Book Cover with 3D effect */}
                        <div className="relative w-full h-96 overflow-hidden bg-linear-to-br from-amber-50 via-amber-100 to-yellow-50 p-6">
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-linear-to-br from-amber-200/30 to-transparent"></div>
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              fill
                              className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            {/* Decorative corner accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-amber-400/20 to-transparent rounded-bl-full"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-amber-400/20 to-transparent rounded-tr-full"></div>
                          </div>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                            <div className="text-white">
                              <svg className="w-8 h-8 mb-2 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="text-sm font-semibold">View Document</span>
                            </div>
                          </div>
                        </div>

                        {/* Book Info */}
                        <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                {book.year}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-14">
                              {book.title}
                            </h3>
                          </div>
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">{book.author}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center opacity-0 translate-y-8 delay-500">
            <Link href="/law_documents">
              <Button variant="outline" className="px-8 py-4 text-lg">
                View All Documents
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-amber-50 to-amber-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Video Courses", value: courses.length, icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
              { label: "Total Videos", value: courses.reduce((sum, c) => sum + c.totalVideos, 0), icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
              { label: "Legal Documents", value: 4, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { label: "Expert Instructors", value: 1, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center bg-white rounded-xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300 opacity-0 translate-y-8"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}+</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section - FORM KH Style */}
      <section ref={partnersRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 mb-8 text-lg font-medium opacity-0 translate-y-4">
            Trusted by legal professionals and institutions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {/* Placeholder for partner logos - You can replace these with actual logos */}
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 opacity-0 translate-y-4">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">LAW</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Law School</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 opacity-0 translate-y-4 delay-100">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">BAR</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Bar Association</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 opacity-0 translate-y-4 delay-200">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">JUD</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Judicial Institute</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 opacity-0 translate-y-4 delay-300">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">MIN</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Ministry</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 opacity-0 translate-y-4 delay-400">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">LEG</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Legal Firm</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 opacity-0 translate-y-4 delay-500">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">EDU</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Education</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">About Us</h3>
              <Link href="/about_us" className="text-gray-400 hover:text-white transition-colors">
                Learn More
              </Link>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
              <div className="space-y-2">
                <Link href="/law_video" className="block text-gray-400 hover:text-white transition-colors">
                  Legal Videos
                </Link>
                <Link href="/law_documents" className="block text-gray-400 hover:text-white transition-colors">
                  Legal Documents
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Account</h3>
              <div className="space-y-2">
                <Link href="/auth/login" className="block text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/auth/register" className="block text-gray-400 hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Cambodian Law Education Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
