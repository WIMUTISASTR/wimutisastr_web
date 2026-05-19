"use client";

import Image from "next/image";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import { useEffect } from "react";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 px-8 py-2.5 text-sm";

const highlights = [
  "ការណែនាំជាក់លាក់តាមគោលដៅអាជីព និងគម្រោងរបស់អ្នក",
  "ឱកាសពិភាក្សា និងទទួលមតិពីអ្នកជំនាញច្បាប់",
  "រចនាសម្ព័ន្ធសិក្សាដែលភ្ជាប់ជាមួយធនធានវេទិកា WIMUTISASTR",
];

export default function VoccheBancheBanchalPage() {
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

    const checkAndAnimate = () => {
      const animatedElements = document.querySelectorAll(
        '.opacity-0[class*="delay"], .opacity-0.translate-y-8, .opacity-0.translate-y-4'
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
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-slate-900/65 z-10" />
        <div className="absolute inset-0 bg-(--brown-soft) opacity-20 z-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-(--accent-light) mb-3 opacity-0 translate-y-8 delay-75">
            WIMUTISASTR
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight opacity-0 translate-y-8 delay-100">
            វគ្គបណ្តុះបណ្តាល
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto opacity-0 translate-y-8 delay-200">
            បង្កើនសមត្ថភាពអនុវត្តច្បាប់ និងដោះស្រាយបញ្ហាក្នុងការងារជាមួយការបណ្តុះបណ្តាលពីអ្នកជំនាញការិយាល័យច្បាប់។
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-(--ink) mb-6 opacity-0 translate-y-8 delay-100">
            អំពីវគ្គ
          </h2>
          <p className="text-(--gray-700) text-lg leading-relaxed mb-10 opacity-0 translate-y-8 delay-200">
            វគ្គនេះសមស្របសម្រាប់អ្នកដែលចង់ពង្រឹងជំនាញច្បាប់ ឬចាប់ផ្តើមគម្រោងអាជីពថ្មី ដោយមានការគាំទ្រជាប្រចាំក្លងរយៈពេល។ លម្អិតបន្ថែមអាចផ្លាស់ប្តូរតាមរដូវកាល និងការរៀបចំរបស់ការិយាល័យ។
          </p>

          <ul className="space-y-4 mb-12">
            {highlights.map((item, i) => (
              <li
                key={item}
                className="flex gap-3 text-(--gray-700) text-lg opacity-0 translate-y-8"
                style={{ animationDelay: `${250 + i * 80}ms` }}
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-(--primary)" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 translate-y-8 delay-500">
            <Link
              href="/contact"
              className={`${btnBase} bg-(--primary) text-white border border-transparent shadow-sm hover:bg-(--primary-light) active:bg-(--primary-dark)`}
            >
              សួរព័ត៌មាន
            </Link>
            <Link
              href="/auth/register"
              className={`${btnBase} bg-white text-(--ink) border border-(--gray-300) shadow-sm hover:border-(--primary) hover:text-(--primary) hover:bg-(--gray-50)`}
            >
              ចុះឈ្មោះប្រើប្រាស់
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
