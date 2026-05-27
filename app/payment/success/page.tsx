"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LoadingState from "@/components/LoadingState";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ActivationState = "idle" | "activating" | "done" | "pending" | "error";

const BARAY_POLL_INTERVAL_MS = 2000;
const BARAY_POLL_MAX_ATTEMPTS = 30; // ~60 seconds

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const reference = searchParams.get("reference");
  const barayRef = searchParams.get("ref");
  const isBarayPayment = !!barayRef;

  const [activation, setActivation] = useState<ActivationState>(
    isBarayPayment ? "activating" : "done"
  );

  // Legacy: store manual payment data in localStorage
  useEffect(() => {
    if (planId && reference) {
      localStorage.setItem(
        "payment_status",
        JSON.stringify({ planId, reference, paid: true, paidAt: Date.now() })
      );
    }
  }, [planId, reference]);

  // Poll read-only status until the Baray webhook confirms payment.
  // Membership is never activated from this page — only the webhook may grant access.
  useEffect(() => {
    if (!barayRef) return;

    let cancelled = false;
    let attempts = 0;

    const pollStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          if (!cancelled) setActivation("pending");
          return;
        }

        const res = await fetch(
          `/api/payment/baray/status?ref=${encodeURIComponent(barayRef)}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: "no-store",
          }
        );

        if (cancelled) return;

        if (!res.ok) {
          setActivation("pending");
          return;
        }

        const data = (await res.json()) as {
          status?: "pending" | "verified" | "not_found" | "unauthorized";
        };

        if (data.status === "verified") {
          setActivation("done");
          return;
        }

        if (data.status === "not_found" || data.status === "unauthorized") {
          setActivation("error");
          return;
        }

        attempts += 1;
        if (attempts >= BARAY_POLL_MAX_ATTEMPTS) {
          setActivation("pending");
          return;
        }

        window.setTimeout(pollStatus, BARAY_POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setActivation("pending");
      }
    };

    pollStatus();

    return () => {
      cancelled = true;
    };
  }, [barayRef]);

  // Animate elements into view
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
        '.opacity-0[class*="delay"], .opacity-0.translate-y-8'
      );
      animatedElements.forEach((el) => {
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => el.classList.add("animate-in"), 50);
        }
      });
    };

    checkAndAnimate();
    setTimeout(checkAndAnimate, 100);

    return () => observer.disconnect();
  }, []);

  if (activation === "activating") {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingState label="កំពុងបញ្ជាក់ការទូទាត់..." />
            <p className="mt-4 text-sm text-gray-500">សូមរង់ចាំបន្តិច រហូតដល់ប្រព័ន្ធទទួលបានការបញ្ជាក់ពី Baray...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (activation === "pending") {
    return (
      <PageContainer>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">កំពុងដំណើរការការទូទាត់</h2>
            <p className="text-gray-600 mb-6">
              ការទូទាត់របស់អ្នកកំពុងត្រូវបានបញ្ជាក់។ សមាជិកភាពរបស់អ្នកនឹងបើកដំណើរការក្នុងរយៈពេលពីរបីនាទី។
            </p>
            {barayRef && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">លេខយោងការទូទាត់</p>
                <p className="text-lg font-semibold text-gray-900 font-mono break-all">{barayRef}</p>
              </div>
            )}
            <div className="space-y-4">
              <Button onClick={() => router.push("/profile_page")} variant="primary" className="w-full sm:w-auto px-8 py-3">
                ទៅប្រវត្តិរូប
              </Button>
              <Button onClick={() => router.push("/")} variant="secondary" className="w-full sm:w-auto px-8 py-3">
                ត្រឡប់ទៅទំព័រដើម
              </Button>
            </div>
          </div>
        </section>
      </PageContainer>
    );
  }

  if (activation === "error") {
    return (
      <PageContainer>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">មិនអាចបញ្ជាក់ការទូទាត់បាន</h2>
            <p className="text-gray-600 mb-6">
              មិនអាចរកឃើញកំណត់ត្រាការទូទាត់នេះទេ។ ប្រសិនបើអ្នកបានទូទាត់រួចហើយ សូមពិនិត្យប្រវត្តិរូបរបស់អ្នកក្នុងរយៈពេលពីរបីនាទី។
            </p>
            <div className="space-y-4">
              <Button onClick={() => router.push("/profile_page")} variant="primary" className="w-full sm:w-auto px-8 py-3">
                ទៅប្រវត្តិរូប
              </Button>
              <Button onClick={() => router.push("/payment")} variant="secondary" className="w-full sm:w-auto px-8 py-3">
                ត្រឡប់ទៅការទូទាត់
              </Button>
            </div>
          </div>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Success background"
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
              ការទូទាត់ជោគជ័យ!
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
              សូមអរគុណសម្រាប់ការជាវរបស់អ្នក
            </p>
          </div>
        </div>
      </section>

      {/* Success Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center opacity-0 translate-y-8 delay-100">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ការទូទាត់ត្រូវបានបញ្ជាក់
            </h2>

            <p className="text-gray-600 mb-6">
              {isBarayPayment
                ? "ការជាវរបស់អ្នកបានដំណើរការរួចហើយ។ អ្នកអាចចូលប្រើប្រាស់មាតិកាបានភ្លាមៗ។"
                : "ការទូទាត់របស់អ្នកត្រូវបានដំណើរការដោយជោគជ័យ។ ឥឡូវនេះការជាវរបស់អ្នកបានដំណើរការ។"}
            </p>

            {(reference || barayRef) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">លេខយោងការទូទាត់</p>
                <p className="text-lg font-semibold text-gray-900 font-mono break-all">
                  {reference ?? barayRef}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={() => router.push("/law_documents")}
                variant="primary"
                className="w-full sm:w-auto px-8 py-3"
              >
                ចូលប្រើឯកសារច្បាប់
              </Button>
              <Button
                onClick={() => router.push("/law_video")}
                variant="secondary"
                className="w-full sm:w-auto px-8 py-3"
              >
                រកមើលវគ្គវីដេអូ
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="min-h-screen flex items-center justify-center">
            <LoadingState label="កំពុងផ្ទុក..." />
          </div>
        </PageContainer>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
