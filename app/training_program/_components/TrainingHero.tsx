"use client";

import Image from "next/image";

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const TrainingIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7" />
  </svg>
);

export type TrainingHeroStats = {
  total: number;
  courses: number;
  events: number;
  workshops: number;
};

interface TrainingHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  stats: TrainingHeroStats;
}

export default function TrainingHero({ searchQuery, onSearchChange, stats }: TrainingHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--primary-dark)] text-white">
      <div className="absolute inset-0">
        <Image
          src="/asset/document_background_page_Header.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[var(--primary-dark)]/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
          <TrainingIcon className="h-3.5 w-3.5" />
          WIMUTISASTR Law Office
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">វគ្គបណ្តុះបណ្តាល</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--accent-light)] sm:text-lg">
          បង្កើនសមត្ថភាពអនុវត្តច្បាប់ និងដោះស្រាយបញ្ហាក្នុងការងារជាមួយការបណ្តុះបណ្តាលពីអ្នកជំនាញការិយាល័យច្បាប់។
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5 text-white/70">
            <span className="text-base font-bold text-white">{stats.total}</span>
            <span>វគ្គសរុប</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-1.5 text-white/70">
            <span className="text-base font-bold text-white">{stats.courses}</span>
            <span>វគ្គសិក្សា</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-1.5 text-white/70">
            <span className="text-base font-bold text-white">{stats.events}</span>
            <span>ព្រឹត្តិការណ៍</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-1.5 text-white/70">
            <span className="text-base font-bold text-white">{stats.workshops}</span>
            <span>សិទ្ធិបណ្តុះបណ្តាល</span>
          </div>
        </div>

        <div className="mt-8 max-w-xl">
          <div className="relative">
            <label htmlFor="training-program-search" className="sr-only">
              ស្វែងរកវគ្គ
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <SearchIcon className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <input
              id="training-program-search"
              type="search"
              placeholder="ស្វែងរកវគ្គតាមឈ្មោះ..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl bg-white py-3 pl-11 pr-10 text-sm text-slate-900 shadow-lg transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-slate-400 transition hover:text-slate-600"
                aria-label="សម្អាតការស្វែងរក"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
