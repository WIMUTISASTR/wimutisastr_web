"use client";

import Image from "next/image";
import PageContainer from "@/components/PageContainer";
import { useEffect } from "react";
import ContactContent from "@/components/contact/ContactContent";

export default function AboutUsPage() {
  type TeamMember = {
    name: string;
    role: string;
    imageUrl: string;
    phone?: string;
    email?: string;
    facebook?: string;
  };

  const teamMembers: TeamMember[] = [
    {
      name: "ភ័ណ្ឌ  ស្រីលីស",
      role: "អនុប្រធានការិយាល័យមេធាវី",
      imageUrl:
        "https://www.wimutisastrlawyer.com/assets/uploads/images/original/1760249843-1760249843-135497.jpg",
      phone: "069789722",
    },
    {
      name: "ឌឹម ចាន់ឡេង",
      role: "ទីប្រឹក្សាច្បាប់ និងជំនួយការមេធាវី",
      imageUrl:
        "https://www.wimutisastrlawyer.com/assets/uploads/images/original/1760250507-1760250507-820027.jpg",
      phone: "095410815",
    },
    {
      name: "ឡយ សីហា",
      role: "ទីប្រឹក្សាច្បាប់ និងជំនួយការមេធាវី",
      imageUrl:
        "https://www.wimutisastrlawyer.com/assets/uploads/images/original/1760250112-1760250112-417414.jpg",
      phone: "0969155963",
    },
    {
      name: "Kheang Su iy",
      role: "ទីប្រឹក្សាច្បាប់",
      imageUrl:
        "https://www.wimutisastrlawyer.com/assets/uploads/images/original/1709001614-1709001614-2660.jpg",
      phone: "087596866",
      email: "kheang1916baobei@gmail.com",
    },
    {
      name: "មេធាវី ម៉ែន វុធ",
      role: "ប្រធានការិយាល័យវិមុត្តិសាស្ត្រ",
      imageUrl:
        "https://www.wimutisastrlawyer.com/assets/uploads/images/original/1702799451-1702799451511161.jpg",
      phone: "0717251802",
      email: "avocatmenvuth@gmail.com",
      facebook: "https://web.facebook.com/profile.php?id=61552023062511",
    },
    {
      name: "អុល លីហួ",
      role: "ប្រឹក្សាច្បាប់",
      imageUrl:
        "https://www.wimutisastrlawyer.com/assets/uploads/images/original/1702799570-1702799570380404.jpg",
      phone: "095389323",
    },
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const checkAndAnimate = () => {
      const animatedElements = document.querySelectorAll(
        '.opacity-0[class*="delay"], .opacity-0.translate-y-8, .opacity-0.translate-y-4, .opacity-0.translate-x-8, .opacity-0.-translate-x-8'
      );
      animatedElements.forEach((el) => {
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => {
            el.classList.add("animate-in");
          }, 50);
        }
      });
    };

    checkAndAnimate();
    setTimeout(checkAndAnimate, 100);

    return () => observer.disconnect();
  }, []);

  return (
    <PageContainer>
      {/* Website Mission Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Legal background"
            fill
            className="object-cover"
            sizes="100vw"
            priority
            fetchPriority="high"
          />
        </div>
        {/* Light overlay for readability */}
        <div className="absolute inset-0 bg-white/85 z-10"></div>
        <div className="relative max-w-6xl mx-auto z-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 opacity-0 translate-y-8 delay-100">
              ហេតុអ្វីបានជាយើងបង្កើតវេទិកានេះ
            </h2>
            <div className="w-24 h-1 bg-(--brown) mx-auto mb-8 opacity-0 translate-y-8 delay-200"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - Mission Statement */}
            <div className="space-y-6">
              <div className="bg-(--brown-soft) rounded-2xl p-8 border-l-4 border-(--brown) opacity-0 -translate-x-8 delay-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  បេសកកម្មរបស់យើង
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  យើងជឿជាក់ថាចំណេះដឹងផ្នែកច្បាប់គួរតែអាចចូលប្រើបានសម្រាប់មនុស្សគ្រប់រូប។ វេទិការបស់យើងត្រូវបានបង្កើតឡើង
                  ដើម្បីផ្សព្វផ្សាយការអប់រំច្បាប់នៅកម្ពុជា ឱ្យកាន់តែងាយយល់ និងអាចចូលដល់សាធារណជនគ្រប់រូប
                  ដោយមិនគិតពីប្រវត្តិរូប ឬទីតាំងរស់នៅ។
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 opacity-0 -translate-x-8 delay-400 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  អ្វីដែលយើងផ្តល់ជូន
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  តាមរយៈវីដេអូបង្រៀនយ៉ាងគ្រប់ជ្រុងជ្រោយ និងឯកសារច្បាប់លម្អិត យើងផ្តល់
                  ចំណេះដឹងពីអ្នកជំនាញអំពីច្បាប់កម្ពុជា ដើម្បីជួយបុគ្គល និងអាជីវកម្ម
                  ឱ្យអាចដោះស្រាយបញ្ហាច្បាប់បានដោយទំនុកចិត្ត និងការយល់ដឹង។
                </p>
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4 opacity-0 translate-x-8 delay-300 hover:transform hover:scale-105 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 bg-(--brown) rounded-lg flex items-center justify-center group-hover:bg-(--brown-strong) transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">ចំណេះដឹងពីអ្នកជំនាញ</h4>
                  <p className="text-gray-600">
                    សិក្សាពីអ្នកជំនាញច្បាប់ដែលមានបទពិសោធន៍ និងយល់ដឹងជ្រាលជ្រៅអំពីច្បាប់កម្ពុជា
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 opacity-0 translate-x-8 delay-400 hover:transform hover:scale-105 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 bg-(--brown) rounded-lg flex items-center justify-center group-hover:bg-(--brown-strong) transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">ការរៀនដែលអាចចូលប្រើបាន</h4>
                  <p className="text-gray-600">
                    ចូលប្រើការអប់រំច្បាប់បានគ្រប់ពេល គ្រប់ទីកន្លែង។ មិនមានឧបសគ្គ គ្មានលក្ខខណ្ឌ—មានតែចំណេះដឹង
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 opacity-0 translate-x-8 delay-500 hover:transform hover:scale-105 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 bg-(--brown) rounded-lg flex items-center justify-center group-hover:bg-(--brown-strong) transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">ធនធានដែលទុកចិត្តបាន</h4>
                  <p className="text-gray-600">
                    មាតិកាទាំងអស់ត្រូវបានរៀបចំ និងផ្ទៀងផ្ទាត់យ៉ាងប្រុងប្រយ័ត្នដោយអ្នកជំនាញច្បាប់ដែលមានសមត្ថភាព
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 opacity-0 translate-x-8 delay-700 hover:transform hover:scale-105 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 bg-(--brown) rounded-lg flex items-center justify-center group-hover:bg-(--brown-strong) transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">ពង្រឹងសហគមន៍</h4>
                  <p className="text-gray-600">
                    កសាងសង្គមដែលមានការយល់ដឹងអំពីច្បាប់កាន់តែប្រសើរ ម្នាក់ម្តងៗ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section (from downloaded HTML, restyled) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 opacity-0 translate-y-8 delay-100">
              ក្រុមការងាររបស់យើង
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto opacity-0 translate-y-8 delay-200">
              សូមស្គាល់អ្នកជំនាញដែលគាំទ្របេសកកម្មរបស់យើងក្នុងការធ្វើឱ្យចំណេះដឹងច្បាប់អាចចូលប្រើបាន។
            </p>
            <div className="w-24 h-1 bg-(--brown) mx-auto mt-6 opacity-0 translate-y-8 delay-300"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => {
              const delay = 200 + idx * 100;
              const delayClass =
                delay <= 1000 ? (`delay-${delay}` as const) : ("delay-1000" as const);

              return (
                <div
                  key={member.name}
                  className={[
                    "bg-white rounded-xl overflow-hidden border border-gray-200",
                    "hover:shadow-md transition-all duration-300",
                    "opacity-0 translate-y-8",
                    delayClass,
                  ].join(" ")}
                >
                  <div className="relative w-full aspect-4/5 bg-gray-100">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent"></div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {member.phone ? (
                        <a
                          href={`tel:${member.phone}`}
                          className="inline-flex items-center justify-center rounded-md bg-white/90 text-gray-900 w-9 h-9 hover:bg-white transition-colors"
                          aria-label={`ហៅទៅកាន់ ${member.name}`}
                          title="ហៅទូរស័ព្ទ"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.58-1.58a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </a>
                      ) : null}

                      {member.email ? (
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center justify-center rounded-md bg-white/90 text-gray-900 w-9 h-9 hover:bg-white transition-colors"
                          aria-label={`ផ្ញើអ៊ីមែលទៅ ${member.name}`}
                          title="អ៊ីមែល"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                          >
                            <path d="M4 4h16v16H4z" />
                            <path d="m22 6-10 7L2 6" />
                          </svg>
                        </a>
                      ) : null}

                      {member.facebook ? (
                        <a
                          href={member.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-md bg-white/90 text-gray-900 w-9 h-9 hover:bg-white transition-colors"
                          aria-label={`ប្រវត្តិរូប Facebook របស់ ${member.name}`}
                          title="Facebook"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                            aria-hidden="true"
                          >
                            <path d="M22 12.07C22 6.477 17.523 2 11.93 2 6.477 2 2 6.477 2 12.07c0 5.05 3.657 9.236 8.438 9.93v-7.024H7.898v-2.906h2.54V9.854c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.47h-1.26c-1.243 0-1.63.772-1.63 1.562v1.878h2.773l-.443 2.906h-2.33V22c4.78-.694 8.437-4.88 8.437-9.93z" />
                          </svg>
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm text-(--brown-strong) font-semibold uppercase tracking-wide">
                      {member.role}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      {member.phone ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.58-1.58a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <span>{member.phone}</span>
                        </span>
                      ) : null}
                      {member.email ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m22 6-10 7L2 6" />
                          </svg>
                          <span className="truncate">{member.email}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 opacity-0 translate-y-8 delay-100">
              ស្គាល់អ្នកជំនាញរបស់យើង
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto opacity-0 translate-y-8 delay-200">
              ឯកសារ និងវីដេអូទាំងអស់ត្រូវបានរៀបចំយ៉ាងម៉ត់ចត់ដោយអ្នកជំនាញច្បាប់ដែលមានបទពិសោធន៍របស់យើង
            </p>
            <div className="w-24 h-1 bg-(--brown) mx-auto mt-6 opacity-0 translate-y-8 delay-300"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-80 h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-[rgb(var(--brown-rgb)/0.2)] opacity-0 -translate-x-8 delay-200 hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:border-[rgb(var(--brown-rgb)/0.35)]">
                <Image
                  src="/asset/teacherImage.png"
                  alt="Men Vuth"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  priority
                />
              </div>
            </div>

            {/* Right Side - Information */}
            <div className="space-y-8">
              {/* Name and Title */}
              <div className="opacity-0 translate-x-8 delay-300">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Men Vuth
                </h2>
                <p className="text-xl text-(--brown-strong) font-semibold mb-4">
                  អ្នកជំនាញច្បាប់
                </p>
                <p className="text-gray-600">
                  ឯកសារ និងវីដេអូទាំងអស់លើវេទិកានេះត្រូវបានរៀបចំដោយអ្នកជំនាញច្បាប់របស់យើង
                </p>
              </div>

              {/* Specializations */}
              <div className="bg-(--brown-soft) rounded-xl p-6 border border-[rgb(var(--brown-rgb)/0.25)] opacity-0 translate-x-8 delay-400 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-xl font-bold text-gray-900 mb-3">ជំនាញឯកទេស</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start opacity-0 translate-y-4 delay-500 hover:translate-x-2 transition-all duration-300">
                    <span className="text-(--brown-strong) mr-2">•</span>
                    <span>ច្បាប់ដីធ្លី</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-600 hover:translate-x-2 transition-all duration-300">
                    <span className="text-(--brown-strong) mr-2">•</span>
                    <span>ច្បាប់ការងារ</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-700 hover:translate-x-2 transition-all duration-300">
                    <span className="text-(--brown-strong) mr-2">•</span>
                    <span>ច្បាប់សាជីវកម្ម</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-800 hover:translate-x-2 transition-all duration-300">
                    <span className="text-(--brown-strong) mr-2">•</span>
                    <span>ច្បាប់ការពារវិនិយោគ</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-900 hover:translate-x-2 transition-all duration-300">
                    <span className="text-(--brown-strong) mr-2">•</span>
                    <span>ដោះស្រាយវិវាទក្នុង និងក្រៅតុលាការ</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-1000 hover:translate-x-2 transition-all duration-300">
                    <span className="text-(--brown-strong) mr-2">•</span>
                    <span>ការរៀបចំកិច្ចសន្យា</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">ព័ត៌មានផ្ទាល់ខ្លួន</h3>
              <div className="space-y-4 text-gray-700">
                <div className="opacity-0 translate-y-4 delay-200">
                  <span className="font-semibold text-gray-900">ឈ្មោះពេញ:</span>{" "}
                  <span>Men Vuth</span>
                </div>
                <div className="opacity-0 translate-y-4 delay-300">
                  <span className="font-semibold text-gray-900">ភេទ:</span> ប្រុស
                </div>
                <div className="opacity-0 translate-y-4 delay-400">
                  <span className="font-semibold text-gray-900">សញ្ជាតិ:</span> ខ្មែរ
                </div>
                <div className="opacity-0 translate-y-4 delay-500">
                  <span className="font-semibold text-gray-900">ថ្ងៃខែឆ្នាំកំណើត:</span> 5 ឧសភា 1984
                </div>
                <div className="opacity-0 translate-y-4 delay-700">
                  <span className="font-semibold text-gray-900">ទីកន្លែងកំណើត:</span>{" "}
                  <span>ភូមិតាកវ៉ាន់ ឃុំឧត្តមសុរិយា ស្រុកត្រាំកក់ ខេត្តតាកែវ</span>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">ការអប់រំ</h3>
              <div className="space-y-4 text-gray-700">
                <div className="opacity-0 translate-y-4 delay-300">
                  <p className="font-semibold text-gray-900 mb-1">2006-2010</p>
                  <p className="text-sm text-gray-600">
                    បរិញ្ញាបត្រនីតិសាស្ត្រ (ឯកទេសភាសាបារាំង), សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច
                  </p>
                </div>
                <div className="opacity-0 translate-y-4 delay-500">
                  <p className="font-semibold text-gray-900 mb-1">2010-2013</p>
                  <p className="text-sm text-gray-600">
                    បរិញ្ញាបត្រជាន់ខ្ពស់ផ្នែកច្បាប់អន្តរជាតិ និងប្រៀបធៀប, សាកលវិទ្យាល័យ Lyon II និង សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Experience */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-100 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">បទពិសោធន៍វិជ្ជាជីវៈ</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-(--brown) pl-6 opacity-0 translate-x-8 delay-200 hover:border-(--brown-strong) hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2022-2023</p>
                <p className="text-gray-600">មេធាវីអនុវត្តនៅ CPH LAW GROUP, ព្រះរាជាណាចក្រកម្ពុជា</p>
              </div>
              <div className="border-l-4 border-(--brown) pl-6 opacity-0 translate-x-8 delay-300 hover:border-(--brown-strong) hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2012-2021</p>
                <p className="text-gray-600">ក្រុមការងារផ្នែកច្បាប់នៅខុទ្ទកាល័យឯកឧត្តម ហ៊ុន ម៉ាណែត ខេត្តកំពង់ស្ពឺ</p>
              </div>
              <div className="border-l-4 border-(--brown) pl-6 opacity-0 translate-x-8 delay-400 hover:border-(--brown-strong) hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2010 - Present</p>
                <p className="text-gray-600">គ្រូបង្រៀនក្រៅម៉ោងនៅសាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច</p>
              </div>
              <div className="border-l-4 border-(--brown) pl-6 opacity-0 translate-x-8 delay-500 hover:border-(--brown-strong) hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2012-2015</p>
                <p className="text-gray-600">ប្រធានផ្នែកកិច្ចការច្បាប់នៅក្រុមហ៊ុនធានារ៉ាប់រង CAMLIFE</p>
              </div>
              <div className="border-l-4 border-(--brown) pl-6 opacity-0 translate-x-8 delay-700 hover:border-(--brown-strong) hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2010-2012</p>
                <p className="text-gray-600">ជំនួយការផ្នែកច្បាប់នៅអយ្យការអមសាលាដំបូងរាជធានីភ្នំពេញ</p>
              </div>
            </div>
          </div>

          {/* Languages & Contact */}
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            {/* Languages */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">ភាសា</h3>
              <div className="space-y-3">
                <div className="flex items-center opacity-0 translate-x-8 delay-200 hover:translate-x-2 transition-all duration-300">
                  <div className="w-3 h-3 bg-(--brown) rounded-full mr-3"></div>
                  <span className="text-gray-700">ខ្មែរ - ភាសាកំណើត</span>
                </div>
                <div className="flex items-center opacity-0 translate-x-8 delay-300 hover:translate-x-2 transition-all duration-300">
                  <div className="w-3 h-3 bg-(--brown) rounded-full mr-3"></div>
                  <span className="text-gray-700">អង់គ្លេស</span>
                </div>
                <div className="flex items-center opacity-0 translate-x-8 delay-400 hover:translate-x-2 transition-all duration-300">
                  <div className="w-3 h-3 bg-(--brown) rounded-full mr-3"></div>
                  <span className="text-gray-700">បារាំង</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">ព័ត៌មានទំនាក់ទំនង</h3>
              <div className="space-y-4 text-gray-700">
                <div className="opacity-0 translate-y-4 delay-300">
                  <span className="font-semibold text-gray-900">ទូរស័ព្ទ:</span>{" "}
                  <a href="tel:012227202" className="text-(--brown-strong) hover:text-(--brown) transition-colors">
                    012 227 202
                  </a>
                </div>
                <div className="opacity-0 translate-y-4 delay-400">
                  <span className="font-semibold text-gray-900">អ៊ីមែល:</span>{" "}
                  <a href="mailto:vuthmen5@gmail.com" className="text-(--brown-strong) hover:text-(--brown) transition-colors">
                    vuthmen5@gmail.com
                  </a>
                </div>
                <div className="opacity-0 translate-y-4 delay-500">
                  <span className="font-semibold text-gray-900">អាសយដ្ឋាន:</span>
                  <p className="mt-1 text-gray-600">
                    ផ្ទះលេខ 24Q ផ្លូវលេខ 36 ភូមិភ្នំពេញថ្មី ឃុំព្រែកអញ្ចាញ ស្រុកមុខកំពូល ខេត្តកណ្ដាល
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactContent />
    </PageContainer>
  );
}
