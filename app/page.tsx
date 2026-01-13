"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageContainer from "@/compounents/PageContainer";
import Button from "@/compounents/Button";
import { useEffect, useRef, useState } from "react";
import { courses } from "./law_video/data";

// Animated Counter Component
function AnimatedCounter({ value, suffix = "+", duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = value;
          const increment = end / (duration / 16);
      
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
        } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <div ref={ref} className="text-5xl font-bold text-gray-900">
      {count}{suffix}
    </div>
  );
}

const books = [
  {
    id: 1,
    title: "Cambodian Labor Law",
    description: "Comprehensive guide to labor laws and regulations in Cambodia, covering employment rights, workplace safety, and employee benefits.",
    author: "Men Vuth",
    year: 2024,
    coverImage: "/sample_book/cover/book1.png",
  },
  {
    id: 2,
    title: "Land Law in Cambodia",
    description: "Detailed explanation of land ownership, property rights, and real estate regulations in the Kingdom of Cambodia.",
    author: "Men Vuth",
    year: 2024,
    coverImage: "/sample_book/cover/book1.png",
  },
  {
    id: 3,
    title: "Corporate Law Handbook",
    description: "Essential guide for understanding corporate structures, business registration, and company law in Cambodia.",
    author: "Men Vuth",
    year: 2023,
    coverImage: "/sample_book/cover/book1.png",
  },
  {
    id: 4,
    title: "Investment Protection Law",
    description: "Complete reference on investment laws, foreign investment regulations, and protection mechanisms for investors.",
    author: "Men Vuth",
    year: 2024,
    coverImage: "/sample_book/cover/book1.png",
  },
];

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Check payment status
  useEffect(() => {
    const checkPaymentStatus = () => {
      try {
        const paymentData = localStorage.getItem('payment_status');
        if (paymentData) {
          const parsed = JSON.parse(paymentData);
          if (parsed.paid === true) {
            setHasPaid(true);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    checkPaymentStatus();
    window.addEventListener('storage', checkPaymentStatus);
    return () => window.removeEventListener('storage', checkPaymentStatus);
  }, []);

  // Auto-slide carousel for books
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBookIndex((prevIndex) => (prevIndex + 1) % books.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide carousel for courses
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCourseIndex((prevIndex) => (prevIndex + 1) % courses.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll animations
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

    const animatedElements = document.querySelectorAll('.scroll-animate');
      animatedElements.forEach((el) => {
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => {
            el.classList.add("animate-in");
          }, 50);
        }
      });

    return () => observer.disconnect();
  }, []);

  return (
    <PageContainer>
      {/* Modern Hero Section with Glassmorphism */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen flex items-center"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at ${50 + mousePosition.x * 0.1}% ${50 + mousePosition.y * 0.1}%, rgba(139, 111, 71, 0.3) 0%, transparent 50%)`,
              transition: 'background-position 0.3s ease-out'
            }}
          />
          <div className="absolute inset-0 bg-[url('/asset/background.png')] bg-cover bg-center mix-blend-overlay opacity-20" />
        </div>

        {/* Floating Law Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-10 w-32 h-32 opacity-20 animate-float"
            style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--brown)]">
              <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" fill="currentColor" />
            </svg>
          </div>
          <div 
            className="absolute bottom-20 right-10 w-24 h-24 opacity-15 animate-float"
            style={{ 
              animationDelay: '2s',
              transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)` 
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M30 50 L45 65 L70 35" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full z-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Text Content */}
            <div 
              className={`space-y-8 transition-all duration-1000 ${
                isVisible 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <div className="inline-block">
                <span className="px-4 py-2 bg-[var(--brown)]/20 backdrop-blur-sm border border-[var(--brown)]/30 rounded-full text-sm font-semibold text-[var(--brown)] animate-scale-in">
                  ⚖️ Legal Education Platform
                  </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-[var(--brown)] bg-clip-text text-transparent animate-gradient">
                Master Cambodian Law
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Transform your legal expertise with our comprehensive platform. Access expert-led video courses, 
                detailed legal documents, and cutting-edge educational resources—all designed to elevate your understanding 
                of Cambodian law.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => router.push("/law_video")}
                  variant="primary"
                  className="px-8 py-4 text-lg group relative overflow-hidden"
                >
                  <span className="relative z-10">Start Learning Now</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[var(--brown-strong)] to-[var(--brown)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button
                  onClick={() => router.push("/pricing_page")}
                  variant="outline"
                  className="px-8 py-4 text-lg glass border-white/20 text-white hover:bg-white/10"
                >
                  View Pricing
                </Button>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-[var(--brown)]">{courses.length}</div>
                  <div className="text-sm text-gray-400">Courses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--brown)]">{courses.reduce((sum, c) => sum + c.totalVideos, 0)}+</div>
                  <div className="text-sm text-gray-400">Videos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--brown)]">{books.length}</div>
                  <div className="text-sm text-gray-400">Documents</div>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Visual */}
            <div 
              className={`relative hidden lg:flex items-center justify-center transition-all duration-1000 delay-300 ${
                isVisible 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div 
                className="relative w-full max-w-lg h-[600px] flex items-center justify-center"
                style={{
                  transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px) rotateY(${mousePosition.x * 0.05}deg) rotateX(${-mousePosition.y * 0.05}deg)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brown)]/20 to-transparent rounded-full blur-3xl animate-pulse-glow" />
                <Image
                  src="/asset/hero.png"
                  alt="Scales of Justice"
                  fill
                  className="object-contain relative z-10 animate-float"
                  priority
                  sizes="(max-width: 1024px) 0vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Modern Features Section with 3D Cards */}
      <section ref={featuresRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--brown)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--brown)] rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Everything You Need to <span className="text-[var(--brown)]">Excel</span>
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
              <div className="relative h-full p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-[var(--brown)] transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--brown)]/10 to-transparent rounded-bl-full" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--brown)] to-[var(--brown-strong)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-[var(--brown)] transition-colors">
                    Video Courses
                </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Learn from expert legal professionals through comprehensive, professionally produced video tutorials 
                    covering all aspects of Cambodian law.
                  </p>
                  <div className="flex items-center text-[var(--brown)] font-semibold group-hover:translate-x-2 transition-transform">
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
              <div className="relative h-full p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-[var(--brown)] transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--brown)]/10 to-transparent rounded-bl-full" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--brown)] to-[var(--brown-strong)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-[var(--brown)] transition-colors">
                  Legal Documents
                </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    Access comprehensive legal documents, statutes, case studies, and reference materials 
                    to deepen your understanding of Cambodian legal frameworks.
                  </p>
                  <div className="flex items-center text-[var(--brown)] font-semibold group-hover:translate-x-2 transition-transform">
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

      {/* Featured Courses Section - Modern Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Featured <span className="text-[var(--brown)]">Courses</span>
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
                {courses.map((course) => (
                  <div key={course.id} className="min-w-full">
                    <Link href={`/law_video/${course.id}`} className="block">
                      <div className="grid md:grid-cols-2 gap-12 p-8 md:p-12 bg-gradient-to-br from-gray-50 to-white rounded-3xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[var(--brown)]/30">
                        {/* Left Side - Course Thumbnail */}
                        <div className="relative group">
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                              {course.totalDuration}
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                <svg className="w-10 h-10 text-[var(--brown)] ml-1" fill="currentColor" viewBox="0 0 20 20">
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
                              {course.title}
                            </h3>
                            <div className="flex items-center space-x-6 text-gray-600 mb-4">
                              <span className="flex items-center font-medium">
                                <svg className="w-5 h-5 mr-2 text-[var(--brown)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {course.author}
                        </span>
                              <span className="flex items-center font-medium">
                                <svg className="w-5 h-5 mr-2 text-[var(--brown)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {course.year}
                              </span>
                            </div>
                      </div>

                          <p className="text-gray-700 text-lg leading-relaxed">
                        {course.description}
                      </p>

                          <div className="flex items-center gap-4 pt-4">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/law_video/${course.id}`);
                              }}
                              variant="primary"
                              className="px-8 py-4 text-lg"
                            >
                              Start Learning
                            </Button>
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold text-gray-900">{course.totalVideos}</span> videos
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
              {courses.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCourseIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentCourseIndex
                      ? 'w-12 h-3 bg-[var(--brown)] shadow-lg'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Documents Section - Modern Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Legal <span className="text-[var(--brown)]">Documents</span>
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
                {books.map((book) => (
                  <div key={book.id} className="min-w-full">
                    <div 
                      className="grid md:grid-cols-2 gap-12 p-8 md:p-12 bg-white rounded-3xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[var(--brown)]/30 cursor-pointer"
                      onClick={() => router.push(hasPaid ? "/law_documents" : "/pricing_page")}
                    >
                      {/* Left Side - Book Cover */}
                      <div className="relative group">
                        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 384px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
                              <svg className="w-5 h-5 mr-2 text-[var(--brown)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {book.author}
                            </span>
                            <span className="flex items-center font-medium">
                              <svg className="w-5 h-5 mr-2 text-[var(--brown)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {books.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBookIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentBookIndex
                      ? 'w-12 h-3 bg-[var(--brown)] shadow-lg'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Animated Counters */}
      <section ref={statsRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/asset/background.png')] bg-cover bg-center mix-blend-overlay" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Trusted by <span className="text-[var(--brown)]">Thousands</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join a growing community of legal professionals and students
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Video Courses", value: courses.length, icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
              { label: "Total Videos", value: courses.reduce((sum, c) => sum + c.totalVideos, 0), icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
              { label: "Legal Documents", value: 4, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { label: "Expert Instructors", value: 1, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 scroll-animate opacity-0 translate-y-8"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--brown)] to-[var(--brown-strong)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
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

      {/* Trusted By Section - Modern */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 mb-12 text-lg font-medium scroll-animate opacity-0 translate-y-4">
            Trusted by legal professionals and institutions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {[
              { name: "Law School", abbrev: "LAW" },
              { name: "Bar Association", abbrev: "BAR" },
              { name: "Judicial Institute", abbrev: "JUD" },
              { name: "Ministry", abbrev: "MIN" },
              { name: "Legal Firm", abbrev: "LEG" },
              { name: "Education", abbrev: "EDU" },
            ].map((partner, index) => (
              <div
                key={partner.abbrev}
                className="flex flex-col items-center space-y-3 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover:shadow-lg scroll-animate opacity-0 translate-y-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 ring-2 ring-[var(--brown)]/25 shadow-lg">
                  <span className="text-white font-bold text-sm">{partner.abbrev}</span>
              </div>
                <p className="text-xs text-gray-600 text-center font-medium">{partner.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-white font-bold text-xl mb-6">About Us</h3>
              <Link href="/about_us" className="text-gray-400 hover:text-white transition-colors block mb-2">
                Learn More
              </Link>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-6">Resources</h3>
              <div className="space-y-3">
                <Link href="/law_video" className="block text-gray-400 hover:text-white transition-colors">
                  Legal Videos
                </Link>
                <Link href="/law_documents" className="block text-gray-400 hover:text-white transition-colors">
                  Legal Documents
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-6">Account</h3>
              <div className="space-y-3">
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
    </PageContainer>
  );
}
