"use client";

import Link from "next/link";

const features = [
  {
    href: "/law_video",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "វគ្គវីដេអូ",
    description: "សិក្សាពីអ្នកជំនាញច្បាប់តាមវីដេអូបង្រៀនគ្រប់ជ្រុងជ្រោយ ដែលផលិតដោយវិជ្ជាជីវៈ និងគ្របដណ្តប់គ្រប់ទិដ្ឋភាពនៃច្បាប់កម្ពុជា។",
    cta: "ស្វែងរកវគ្គសិក្សា",
    iconWrapClass: "bg-(--primary) text-white",
  },
  {
    href: "/law_documents",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "ឯកសារច្បាប់",
    description: "ចូលប្រើឯកសារច្បាប់ ព្រះរាជក្រម ករណីសិក្សា និងឯកសារយោង ដើម្បីពង្រឹងការយល់ដឹងអំពីប្រព័ន្ធច្បាប់កម្ពុជា។",
    cta: "រកមើលឯកសារ",
    iconWrapClass: "bg-(--accent) text-white",
  },
];

const highlights = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "ដឹកនាំដោយអ្នកជំនាញ",
    desc: "បង្រៀនដោយអ្នកវិជ្ជាជីវៈ",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "ចូលប្រើតាមទូរស័ព្ទ",
    desc: "រៀនបានគ្រប់ទីកន្លែង គ្រប់ពេល",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "មានការទទួលស្គាល់",
    desc: "ការទទួលស្គាល់ផ្លូវការ",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "គាំទ្រ 24/7",
    desc: "តែងតែរង់ចាំជួយអ្នក",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-(--primary) opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-(--accent) opacity-[0.06] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16 scroll-animate opacity-0 translate-y-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--primary)">មុខងារសំខាន់ៗ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
            អ្វីៗដែលអ្នកត្រូវការ{" "}
            <span className="text-(--primary)">ដើម្បីរីកចម្រើន</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-(--gray-700) sm:text-lg">
            ធនធានអប់រំច្បាប់គ្រប់គ្រាន់នៅចុងម្រាមដៃអ្នក
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {features.map((feature, index) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={[
                "group relative scroll-animate opacity-0 translate-y-8 block rounded-2xl border border-(--gray-200) bg-white p-7 sm:p-8",
                "cursor-pointer transition-colors duration-200",
                "hover:border-(--primary)/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2",
                index === 0 ? "delay-100" : "delay-200",
              ].join(" ")}
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconWrapClass} shadow-sm`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-(--ink) transition-colors duration-200 group-hover:text-(--primary) sm:text-2xl">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-(--gray-700) sm:text-base">{feature.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-(--primary) transition-colors duration-200">
                {feature.cta}
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:mt-14 scroll-animate opacity-0 translate-y-8 delay-300">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-(--gray-200) bg-(--gray-50)/80 p-5 transition-colors duration-200 hover:border-(--primary)/25 hover:bg-white"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                {item.icon}
              </div>
              <h4 className="font-semibold text-(--ink)">{item.title}</h4>
              <p className="mt-1 text-sm text-(--gray-700)">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
