"use client";

import { useEffect, useState, useCallback } from "react";
import PageContainer from "@/components/PageContainer";
import { fetchHome, type HomeResponse } from "@/lib/api/client";
import { throttle } from "@/lib/utils/throttle";
import { useScrollAnimation } from "@/lib/hooks/useScrollAnimation";
import logger from "@/lib/utils/logger";
import {
  HeroSection,
  FeaturesSection,
  FeaturedCoursesSection,
  FeaturedDocumentsSection,
  TrustedBySection,
  Footer,
} from "@/components/home";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [home, setHome] = useState<HomeResponse | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);

  // Mouse parallax effect - throttled for better performance
  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    }, 50); // Throttle to once every 50ms

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Check payment status - server-side verification
  useEffect(() => {
    let cancelled = false;
    
    const checkPaymentStatus = async () => {
      try {
        // First check localStorage for quick UI update (optimistic)
        const cachedPayment = localStorage.getItem('payment_status');
        if (cachedPayment) {
          const parsed = JSON.parse(cachedPayment);
          if (parsed.paid === true && !cancelled) {
            setHasPaid(true);
          }
        }

        // Then verify with server for accurate status
        const response = await fetch('/api/payment/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok && !cancelled) {
          const data = await response.json();
          setHasPaid(data.hasPaid === true);
          
          // Update localStorage with verified status
          localStorage.setItem('payment_status', JSON.stringify({
            paid: data.hasPaid,
            verifiedAt: new Date().toISOString(),
          }));
        }
      } catch (error) {
        logger.error('Error checking payment status:', error);
        // Keep cached status on error
      }
    };

    checkPaymentStatus();
    
    // Re-verify on storage change (e.g., other tab)
    const handleStorageChange = () => {
      checkPaymentStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load homepage data from backend
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setHomeLoading(true);
        const data = await fetchHome();
        if (!cancelled) setHome(data);
      } catch (e) {
        logger.error("Failed to load home data:", e);
        if (!cancelled) setHome(null);
      } finally {
        if (!cancelled) setHomeLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-slide carousel for books
  useEffect(() => {
    const booksLen = home?.featuredBooks?.length ?? 0;
    if (booksLen <= 1) return;
    const interval = setInterval(() => {
      setCurrentBookIndex((prevIndex) => (prevIndex + 1) % booksLen);
    }, 5000);
    return () => clearInterval(interval);
  }, [home?.featuredBooks?.length]);

  // Auto-slide carousel for courses
  useEffect(() => {
    const categoriesLen = home?.categories?.length ?? 0;
    if (categoriesLen <= 1) return;
    const interval = setInterval(() => {
      setCurrentCourseIndex((prevIndex) => (prevIndex + 1) % categoriesLen);
    }, 5000);
    return () => clearInterval(interval);
  }, [home?.categories?.length]);

  // Scroll animations - using reusable hook
  useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px',
  });

  // Set initial visibility
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <PageContainer>
      <HeroSection 
        isVisible={isVisible}
        mousePosition={mousePosition}
        home={home}
        homeLoading={homeLoading}
      />

      <FeaturesSection />

      <FeaturedCoursesSection
        home={home}
        currentCourseIndex={currentCourseIndex}
        setCurrentCourseIndex={setCurrentCourseIndex}
      />

      <FeaturedDocumentsSection
        home={home}
        currentBookIndex={currentBookIndex}
        setCurrentBookIndex={setCurrentBookIndex}
        hasPaid={hasPaid}
      />

      <TrustedBySection />
      <Footer />
    </PageContainer>
  );
}
