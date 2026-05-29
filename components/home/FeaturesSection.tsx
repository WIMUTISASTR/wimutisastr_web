"use client";

import Image from "next/image";
import Link from "next/link";

/** Full-bleed features band backdrop — Angkor Wat at sunrise (local asset). */
const FEATURES_BACKDROP_SRC = "/asset/featureBackground.png";

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
    description: "សិក្សាពីអ្នកជំនាញច្បាប់តាមវីដេអូបង្រៀនគ្រប់ជ្រុងជ្រោយ ដែលផលិតដោយវិជ្ជាជីវៈ និងគ្របដណ្តប់គ្រប់ទិដ្ឋភាពនៃច្បាប់។",
    cta: "ស្វែងរកវគ្គសិក្សា",
    iconWrapClass: "bg-amber-800 text-amber-50 shadow-amber-900/20",
  },
  {
    href: "/law_documents",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "ឯកសារច្បាប់",
    description: "ចូលប្រើឯកសារច្បាប់ ព្រះរាជក្រម ករណីសិក្សា និងឯកសារយោង ដើម្បីពង្រឹងការយល់ដឹងអំពីប្រព័ន្ធច្បាប់។",
    cta: "រកមើលឯកសារ",
    iconWrapClass: "bg-orange-700 text-orange-50 shadow-orange-900/20",
  },
  {
    href: "/vocche_banche_banchal",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7M5.176 10.576L12 14l6.824-3.424" />
      </svg>
    ),
    title: "វគ្គបណ្តុះបណ្តាល",
    description:
      "បង្កើនសមត្ថភាពអនុវត្តច្បាប់ និងទទួលការណែនាំពីអ្នកជំនាញការិយាល័យច្បាប់ តាមរយៈវគ្គបណ្តុះបណ្តាលជាក់លាក់។",
    cta: "មើលវគ្គបណ្តុះបណ្តាល",
    iconWrapClass: "bg-amber-950 text-amber-100 shadow-amber-950/25",
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
    <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Image
          src={FEATURES_BACKDROP_SRC}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(28, 16, 8, 0.78) 0%, rgba(120, 53, 18, 0.52) 42%, rgba(20, 12, 6, 0.82) 100%)",
          }}
        />
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-amber-400 opacity-[0.14] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-orange-300 opacity-[0.12] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16 scroll-animate opacity-0 translate-y-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
            WIMUTISASTR Law Education
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-amber-50 drop-shadow-sm sm:text-4xl">
            មុខងារសំខាន់ៗ{" "}
            <span className="text-amber-200">ដែលធ្វើអោយអ្នកយល់ដឹងអំពីច្បាប់</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-amber-50/85 sm:text-lg">
            ផ្តល់ជូននៅវគ្គសិក្សាច្បាប់ ឯកសារច្បាប់ និងវគ្គបណ្តុះបណ្តាល
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          {features.map((feature, index) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={[
                "group relative scroll-animate opacity-0 translate-y-8 block rounded-2xl border border-amber-200/50 bg-[#fffaf5]/95 p-7 shadow-lg shadow-amber-950/10 backdrop-blur-sm sm:p-8",
                "cursor-pointer transition-all duration-200",
                "hover:border-amber-400/60 hover:bg-white hover:shadow-xl hover:shadow-amber-950/15",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-950/20",
                index === 0 ? "delay-100" : index === 1 ? "delay-200" : "delay-300",
              ].join(" ")}
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${feature.iconWrapClass}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-stone-900 transition-colors duration-200 group-hover:text-amber-900 sm:text-2xl">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">{feature.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition-colors duration-200 group-hover:text-orange-700">
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
              className="rounded-xl border border-amber-200/35 bg-[#fffaf5]/90 p-5 shadow-md shadow-amber-950/10 backdrop-blur-md transition-all duration-200 hover:border-amber-300/55 hover:bg-white/95"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                {item.icon}
              </div>
              <h4 className="font-semibold text-stone-900">{item.title}</h4>
              <p className="mt-1 text-sm text-stone-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
