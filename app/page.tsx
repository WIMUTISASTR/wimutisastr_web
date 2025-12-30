"use client";

import Link from "next/link";
import Image from "next/image";
import Nav from "@/compounents/Nav";
import { useEffect, useRef, useState } from "react";

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
                <span className={`inline-block transition-all duration-700 delay-100 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}>
                  Learn Cambodian Law
                </span>
                <span className={`block text-amber-400 mt-2 transition-all duration-700 delay-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}>
                  In Minutes, Not Years
                </span>
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
