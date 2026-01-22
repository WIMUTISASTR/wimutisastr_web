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
    <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen flex items-center">
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
          <svg viewBox="0 0 100 100" className="w-full h-full text-(--brown)">
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
              <span className="px-4 py-2 bg-(--brown)/20 backdrop-blur-sm border border-(--brown)/30 rounded-full text-sm font-semibold text-(--brown) animate-scale-in">
                ⚖️ Legal Education Platform
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight bg-linear-to-r from-white via-gray-100 to-(--brown) bg-clip-text text-transparent animate-gradient">
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
                <span className="absolute inset-0 bg-linear-to-r from-(--brown-strong) to-(--brown) opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="text-3xl font-bold text-(--brown)">{home?.stats.categoriesCount ?? (homeLoading ? "…" : 0)}</div>
                <div className="text-sm text-gray-400">Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-(--brown)">{home?.stats.videosCount ?? (homeLoading ? "…" : 0)}</div>
                <div className="text-sm text-gray-400">Videos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-(--brown)">{home?.stats.booksCount ?? (homeLoading ? "…" : 0)}</div>
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
              <div className="absolute inset-0 bg-linear-to-br from-(--brown)/20 to-transparent rounded-full blur-3xl animate-pulse-glow" />
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
  );
}
