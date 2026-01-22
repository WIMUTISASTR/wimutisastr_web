"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/compounents/Button";
import type { HomeResponse } from "@/lib/api/client";

interface HeroSectionProps {
  isVisible: boolean;
  mousePosition: { x: number; y: number };
  home: HomeResponse | null;
  homeLoading: boolean;
}

export default function HeroSection({ isVisible, mousePosition, home, homeLoading }: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-20 bg-[var(--paper)]">
      {/* Animated Background Layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Solid Color Orbs */}
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--primary)] opacity-5 rounded-full blur-3xl animate-float"
          style={{ 
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
            transition: 'transform 0.5s ease-out'
          }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[var(--accent)] opacity-10 rounded-full blur-3xl animate-float-slow"
          style={{ 
            transform: `translate(${-mousePosition.x * 0.2}px, ${-mousePosition.y * 0.2}px)`,
            transition: 'transform 0.5s ease-out',
            animationDelay: '1s'
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxOTMsIDE1NCwgOTEsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        
        {/* Floating Icons - Modern Legal Symbols */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-32 left-[10%] opacity-[0.08] animate-float"
              style={{ 
                transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
              <path d="M12 2L4 7V12C4 16.97 7.58 21.45 12 22C16.42 21.45 20 16.97 20 12V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div 
            className="absolute top-48 right-[15%] opacity-[0.06] animate-float"
              style={{ 
                transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
                transition: 'transform 0.3s ease-out',
                animationDelay: '1.5s'
              }}
            >
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" className="text-[var(--primary)]">
              <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div 
            className="absolute bottom-32 left-[20%] opacity-[0.07] animate-float"
              style={{ 
                transform: `translate(${mousePosition.x * 0.5}px, ${-mousePosition.y * 0.2}px)`,
                transition: 'transform 0.3s ease-out',
                animationDelay: '0.8s'
              }}
            >
            <svg width="90" height="90" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
              <path d="M12 6V18M9 15L12 18L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 w-full z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div 
            className={`space-y-8 transition-all duration-1000 ${
              isVisible 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-10"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[var(--primary)] rounded-full animate-scale-in shadow-lg">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
              <span className="text-sm font-bold text-[var(--primary)] tracking-wide uppercase">
                Professional Legal Education
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight text-[var(--ink)]">
              Master <span className="text-[var(--primary)]">Cambodian</span> Law
            </h1>
            
            {/* Description */}
            <p className="text-lg sm:text-xl text-[var(--gray-700)] leading-relaxed max-w-2xl font-medium">
              Transform your legal expertise with our comprehensive platform. Access expert-led video courses, 
              detailed legal documents, and cutting-edge educational resources designed to elevate your understanding 
              of Cambodian law.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={() => router.push("/law_video")}
                variant="gradient"
                size="lg"
                className="group"
              >
                <span className="flex items-center gap-2">
                  Start Learning Now
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
              <Button
                onClick={() => router.push("/pricing_page")}
                variant="outline"
                size="lg"
              >
                View Pricing
              </Button>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-4xl lg:text-5xl font-bold text-[var(--primary)] mb-1">
                  {home?.stats.categoriesCount ?? (homeLoading ? "..." : 0)}
                </div>
                <div className="text-sm font-semibold text-[var(--gray-700)] uppercase tracking-wide">Courses</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl lg:text-5xl font-bold text-[var(--primary)] mb-1">
                  {home?.stats.videosCount ?? (homeLoading ? "..." : 0)}
                </div>
                <div className="text-sm font-semibold text-[var(--gray-700)] uppercase tracking-wide">Videos</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl lg:text-5xl font-bold text-[var(--primary)] mb-1">
                  {home?.stats.booksCount ?? (homeLoading ? "..." : 0)}
                </div>
                <div className="text-sm font-semibold text-[var(--gray-700)] uppercase tracking-wide">Documents</div>
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
            <div className="relative w-full max-w-xl">
              {/* Decorative Background */}
              <div className="absolute -inset-4 bg-[var(--accent)] opacity-20 rounded-3xl blur-3xl animate-pulse-glow" />
              
              {/* Main Image Container */}
              <div 
                className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl card-3d border-4 border-[var(--accent)]"
                style={{
                  transform: `perspective(1200px) rotateY(${mousePosition.x * 0.02}deg) rotateX(${-mousePosition.y * 0.02}deg)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <Image
                  src="/asset/hero.png"
                  alt="Legal Education Platform"
                  fill
                  className="object-contain p-8 animate-float relative z-10 drop-shadow-2xl"
                  priority
                  sizes="(max-width: 1024px) 0vw, 50vw"
                />
              </div>
              
              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-float border-2 border-[var(--primary)]" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--ink)]">100%</div>
                    <div className="text-xs text-[var(--gray-700)] font-semibold">Certified</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-float border-2 border-[var(--accent)]" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[var(--accent)] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--ink)]">{home?.stats.booksCount ?? 0}+</div>
                    <div className="text-xs text-[var(--gray-700)] font-semibold">Resources</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-semibold text-[var(--gray-700)] uppercase tracking-widest">Scroll</span>
          <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
