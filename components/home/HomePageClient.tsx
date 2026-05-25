"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { fetchHome, type HomeResponse } from "@/lib/api/client";
import { throttle } from "@/lib/utils/throttle";
import { useScrollAnimation } from "@/lib/hooks/useScrollAnimation";
import logger from "@/lib/utils/logger";
import { notify } from "@/lib/utils/notify";
import {
  HeroSection,
  FeaturesSection,
  FeaturedCoursesSection,
  FeaturedDocumentsSection,
  Footer,
} from "@/components/home";
import { useAuth } from "@/lib/auth/context";

export default function HomePageClient() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [home, setHome] = useState<HomeResponse | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 12,
        y: (e.clientY / window.innerHeight - 0.5) * 12,
      });
    }, 50);

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkPaymentStatus = async () => {
      try {
        const cachedPayment = localStorage.getItem("payment_status");
        if (cachedPayment) {
          const parsed = JSON.parse(cachedPayment);
          if (parsed.paid === true && !cancelled) {
            setHasPaid(true);
          }
        }

        if (!user) {
          if (!cancelled) setHasPaid(false);
          return;
        }

        const response = await fetch("/api/payment/verify", {
          method: "GET",
          credentials: "include",
        });

        if (!cancelled && response.ok) {
          const data = await response.json();
          setHasPaid(data.hasPaid === true);

          localStorage.setItem(
            "payment_status",
            JSON.stringify({
              paid: data.hasPaid === true,
              verifiedAt: new Date().toISOString(),
            })
          );
        }
      } catch (error) {
        logger.error("Error checking payment status:", error);
      }
    };

    checkPaymentStatus();

    const handleStorageChange = () => {
      checkPaymentStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setHomeLoading(true);
        const data = await fetchHome();
        if (!cancelled) setHome(data);
      } catch (e) {
        logger.error("Failed to load home data:", e);
        if (!cancelled) {
          setHome(null);
          notify.error("ផ្ទុកទំព័រដើមមិនជោគជ័យ។ សូមពិនិត្យការតភ្ជាប់របស់អ្នក។");
        }
      } finally {
        if (!cancelled) setHomeLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useScrollAnimation(
    { threshold: 0.1, rootMargin: "0px" },
    [homeLoading, home?.categories?.length ?? 0, home?.featuredBooks?.length ?? 0]
  );

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

      <FeaturedCoursesSection home={home} />

      <FeaturedDocumentsSection home={home} hasPaid={hasPaid} />

      <Footer />
    </PageContainer>
  );
}
