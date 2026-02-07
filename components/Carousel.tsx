"use client";

import { useState, useEffect, ReactNode } from 'react';

interface CarouselProps {
  children: ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  className?: string;
}

/**
 * Reusable Carousel Component
 * Supports auto-play, manual navigation, and keyboard accessibility
 */
export default function Carousel({
  children,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  className = '',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemCount = children.length;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || itemCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, itemCount]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % itemCount);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} className="min-w-full">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {showDots && itemCount > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-12 h-3 bg-(--accent-dark) shadow-lg'
                  : 'w-3 h-3 bg-(--gray-300) hover:bg-(--accent-dark) hover:scale-125'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Optional: Previous/Next Buttons (hidden by default, can be shown with CSS) */}
      {itemCount > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all z-10"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all z-10"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Hook for using carousel state externally
 */
export function useCarousel(itemCount: number, autoPlay = true, interval = 5000) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || itemCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, itemCount]);

  return {
    currentIndex,
    setCurrentIndex,
    goToNext: () => setCurrentIndex((prev) => (prev + 1) % itemCount),
    goToPrevious: () => setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount),
  };
}
