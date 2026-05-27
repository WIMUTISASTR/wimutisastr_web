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
import { useMembership } from "@/lib/hooks/useMembership";
import { isActiveApprovedMembership } from "@/lib/utils/membership";

export default function HomePageClient() {
  const { status: membershipStatus, membershipEndsAt } = useMembership();
  const isMember = isActiveApprovedMembership(membershipStatus, membershipEndsAt);
  const [isVisible, setIsVisible] = useState(false);
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

      <FeaturedCoursesSection home={home} isLoading={homeLoading} />

      {/* <FeaturedDocumentsSection home={home} hasPaid={isMember} isLoading={homeLoading} /> */}

      <Footer />
    </PageContainer>
  );
}
