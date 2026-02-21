"use client";

import Link from "next/link";

const features = [
  {
    href: "/law_video",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "វគ្គវីដេអូ",
    description: "សិក្សាពីអ្នកជំនាញច្បាប់តាមវីដេអូបង្រៀនគ្រប់ជ្រុងជ្រោយ ដែលផលិតដោយវិជ្ជាជីវៈ និងគ្របដណ្តប់គ្រប់ទិដ្ឋភាពនៃច្បាប់កម្ពុជា។",
    cta: "ស្វែងរកវគ្គសិក្សា",
    bgColor: "var(--primary)",
  },
  {
    href: "/law_documents",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "ឯកសារច្បាប់",
    description: "ចូលប្រើឯកសារច្បាប់ ព្រះរាជក្រម ករណីសិក្សា និងឯកសារយោង ដើម្បីពង្រឹងការយល់ដឹងអំពីប្រព័ន្ធច្បាប់កម្ពុជា។",
    cta: "រកមើលឯកសារ",
    bgColor: "var(--accent)",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-(--primary) opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-(--accent) opacity-8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 scroll-animate opacity-0 translate-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent)/20 border-2 border-(--primary) rounded-full mb-6">
            <div className="w-2 h-2 bg-(--primary) rounded-full animate-pulse" />
            <span className="text-sm font-bold text-(--primary) uppercase tracking-wide">មុខងារសំខាន់ៗ</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-(--ink) mb-6 leading-tight">
            អ្វីៗដែលអ្នកត្រូវការ{" "}
            <span className="text-(--primary)">ដើម្បីរីកចម្រើន</span>
          </h2>
          <p className="text-xl text-(--gray-700) max-w-3xl mx-auto font-medium">
            ធនធានអប់រំច្បាប់គ្រប់គ្រាន់នៅចុងម្រាមដៃអ្នក
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <Link 
              key={feature.href}
              href={feature.href}
              className={`group relative scroll-animate opacity-0 translate-y-8 delay-${(index + 1) * 100}`}
            >
              <div className="relative h-full p-8 lg:p-10 rounded-3xl bg-white border-2 border-(--gray-200) hover:border-(--primary) transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden card-lift">
                {/* Solid Color Overlay on Hover */}
                <div className="absolute inset-0 bg-(--accent) opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-3xl lg:text-4xl font-bold text-(--ink) mb-4 group-hover:text-(--primary) transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-(--gray-700) text-lg leading-relaxed mb-6 font-medium">
                    {feature.description}
                  </p>
                  
                  {/* CTA */}
                  <div className="flex items-center gap-2 text-(--primary) font-bold group-hover:gap-4 transition-all duration-300">
                    <span>{feature.cta}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Subtle Highlight */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-white/10" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 scroll-animate opacity-0 translate-y-8 delay-300">
          {[
            { 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ),
              title: "ដឹកនាំដោយអ្នកជំនាញ",
              desc: "បង្រៀនដោយអ្នកវិជ្ជាជីវៈ",
            },
            { 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
              title: "ចូលប្រើតាមទូរស័ព្ទ",
              desc: "រៀនបានគ្រប់ទីកន្លែង គ្រប់ពេល",
            },
            { 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "មានការទទួលស្គាល់",
              desc: "ការទទួលស្គាល់ផ្លូវការ",
            },
            { 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
              title: "គាំទ្រ 24/7",
              desc: "តែងតែរង់ចាំជួយអ្នក",
            },
          ].map((item, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-white border-2 border-(--gray-200) hover:border-(--primary) transition-all duration-300 hover:shadow-lg group"
            >
              <div className="w-12 h-12 bg-(--accent)/20 rounded-xl flex items-center justify-center mb-4 text-(--primary) group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h4 className="font-bold text-(--ink) mb-1 text-lg">{item.title}</h4>
              <p className="text-sm text-(--gray-700)">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
