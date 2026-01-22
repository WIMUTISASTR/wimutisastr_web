"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/compounents/PageContainer";
import { fetchHome, type HomeResponse } from "@/lib/api/client";
import {
  HeroSection,
  FeaturesSection,
  FeaturedCoursesSection,
  FeaturedDocumentsSection,
  StatisticsSection,
  TrustedBySection,
  AccreditationSection,
  TestimonialsSection,
  CallToActionSection,
  Footer,
} from "@/compounents/home";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [home, setHome] = useState<HomeResponse | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);

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

  // Load homepage data from backend
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setHomeLoading(true);
        const data = await fetchHome();
        if (!cancelled) setHome(data);
      } catch (e) {
        console.error("Failed to load home data:", e);
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

      <StatisticsSection home={home} />
      <TrustedBySection />
      <AccreditationSection />
      <TestimonialsSection />
      <CallToActionSection />
      <Footer />
    </PageContainer>
  );
}
