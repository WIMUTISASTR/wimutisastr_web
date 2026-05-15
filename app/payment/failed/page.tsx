"use client";

import Image from "next/image";
import { Suspense } from "react";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LoadingState from "@/components/LoadingState";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const els = document.querySelectorAll('.opacity-0[class*="delay"], .opacity-0.translate-y-8');
    els.forEach((el) => {
      observer.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setTimeout(() => el.classList.add("animate-in"), 50);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <PageContainer>
      {/* Hero */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Failed background"
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 opacity-0 translate-y-8 delay-100">
            ការទូទាត់បរាជ័យ
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
            មានបញ្ហាកើតឡើងក្នុងអំឡុងពេលដំណើរការការទូទាត់
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center opacity-0 translate-y-8 delay-100">
            {/* Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ការទូទាត់មិនជោគជ័យ
            </h2>

            <p className="text-gray-600 mb-4">
              ការទូទាត់របស់អ្នកមិនអាចដំណើរការបានទេ។
              គ្មានប្រាក់ណាត្រូវបានកាត់ចេញពីគណនីរបស់អ្នកទេ។
            </p>

            {reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700 font-mono break-all">{reason}</p>
              </div>
            )}

            {/* Common reasons */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm font-semibold text-gray-900 mb-2">មូលហេតុទូទៅ:</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>សមតុល្យគណនីមិនគ្រប់គ្រាន់</li>
                <li>ការតភ្ជាប់អ៊ីនធឺណិតត្រូវបានរំខាន</li>
                <li>ការទូទាត់ត្រូវបានបដិសេធដោយធនាគារ</li>
                <li>ការទូទាត់ហួសសម័យ (លើស ១៥ នាទី)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-800">
                  ប្រសិនបើប្រាក់ត្រូវបានកាត់ចេញប៉ុន្តែការជាវមិនបានដំណើរការ
                  សូមទំនាក់ទំនងផ្ទាល់ជាមួយយើង។
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/pricing_page")}
                variant="primary"
                className="px-8 py-3"
              >
                ព្យាយាមម្ដងទៀត
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="px-8 py-3"
              >
                ត្រឡប់ទៅទំព័រដើម
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState label="កំពុងផ្ទុក..." />
        </div>
      </PageContainer>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
