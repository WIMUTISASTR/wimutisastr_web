"use client";

import PageContainer from "@/components/PageContainer";
import { useScrollAnimation } from "@/lib/hooks/useScrollAnimation";
import AboutHero from "./_components/AboutHero";
import LeadExpertSection from "./_components/LeadExpertSection";
import MissionSection from "./_components/MissionSection";
import TeamSection from "./_components/TeamSection";
import { TEAM_MEMBERS } from "./_data/team";

export default function AboutUsPage() {
  useScrollAnimation();

  return (
    <PageContainer className="pt-0">
      <AboutHero />
      <MissionSection />
      <TeamSection members={TEAM_MEMBERS} />
      <LeadExpertSection />
    </PageContainer>
  );
}
