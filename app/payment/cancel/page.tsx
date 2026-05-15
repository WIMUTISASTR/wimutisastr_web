"use client";

import Image from "next/image";
import { Suspense } from "react";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LoadingState from "@/components/LoadingState";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function PaymentCancelContent() {
  const router = useRouter();

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

    const animatedElements = document.querySelectorAll(
      '.opacity-0[class*="delay"], .opacity-0.translate-y-8'
    );
    animatedElements.forEach((el) => {
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
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Cancel background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-slate-900/65 z-10"></div>
        <div className="absolute inset-0 bg-(--brown-soft) opacity-20 z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 opacity-0 translate-y-8 delay-100">
              ការទូទាត់ត្រូវបានបោះបង់
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
              ការទូទាត់របស់អ្នកមិនបានបញ្ចប់ទេ
            </p>
          </div>
        </div>
      </section>

      {/* Cancel Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center opacity-0 translate-y-8 delay-100">
            {/* Cancel Icon */}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ការទូទាត់មិនបានបញ្ចប់
            </h2>
            <p className="text-gray-600 mb-8">
              អ្នកបានបោះបង់ការទូទាត់ ឬការទូទាត់ប្រឈមមុខនឹងបញ្ហា។
              គ្មានប្រាក់ណាត្រូវបានកាត់ចេញពីគណនីរបស់អ្នកទេ។
              អ្នកអាចព្យាយាមម្ដងទៀតនៅពេលណាក៏បាន។
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-800">
                  ប្រសិនបើប្រាក់ត្រូវបានកាត់ចេញពីគណនីរបស់អ្នក ប៉ុន្តែការជាវមិនត្រូវបានដំណើរការ
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

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState label="កំពុងផ្ទុក..." />
        </div>
      </PageContainer>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}
