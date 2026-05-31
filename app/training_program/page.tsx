"use client";

import PageContainer from "@/components/PageContainer";
import TrainingProgramsGrid from "@/components/training/TrainingProgramsGrid";
import { useScrollAnimation } from "@/lib/hooks/useScrollAnimation";
import { useCallback, useState } from "react";
import TrainingHero, { type TrainingHeroStats } from "./_components/TrainingHero";

const EMPTY_STATS: TrainingHeroStats = {
  total: 0,
  courses: 0,
  events: 0,
  workshops: 0,
};

export default function TrainingProgramPage() {
  useScrollAnimation();
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<TrainingHeroStats>(EMPTY_STATS);
  const handleStatsChange = useCallback((nextStats: TrainingHeroStats) => {
    setStats(nextStats);
  }, []);

  return (
    <PageContainer>
      <TrainingHero searchQuery={searchQuery} onSearchChange={setSearchQuery} stats={stats} />
      <section className="min-h-[50vh] bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <TrainingProgramsGrid
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onStatsChange={handleStatsChange}
          />
        </div>
      </section>
    </PageContainer>
  );
}
