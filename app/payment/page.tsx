"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LoadingState from "@/components/LoadingState";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useMembership } from "@/lib/hooks/useMembership";
import { supabase } from "@/lib/supabase/instance";
import { notify } from "@/lib/utils/notify";
import { formatMembershipDateTime, isActiveApprovedMembership } from "@/lib/utils/membership";

interface PlanDetails {
  id: string;
  name: string;
  duration: string;
  price: number;
  description?: string | null;
  currency?: string | null;
  qrCodeUrl?: string | null;
  originalPrice?: number;
  discount?: string;
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { status: membershipStatus, membershipEndsAt, isLoading: membershipLoading } = useMembership();
  const planId = searchParams.get("plan") || "";
  const hasActiveMembership = isActiveApprovedMembership(membershipStatus, membershipEndsAt);
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const selectedPlan = useMemo(() => {
    if (!plans.length) return null;
    if (planId) return plans.find((p) => p.id === planId) ?? null;
    return plans[0] ?? null;
  }, [plans, planId]);

  const [isBarayLoading, setIsBarayLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadPlans = async () => {
      try {
        setIsPlansLoading(true);
        setPlansError(null);
        const res = await fetch("/api/pricing-plans", { cache: "no-store" });
        const json = (await res.json().catch(() => ({}))) as { plans?: PlanDetails[]; error?: string };
        if (!res.ok) {
          if (!cancelled) setPlansError(json.error || "ផ្ទុកគម្រោងមិនជោគជ័យ។");
          return;
        }
        if (!cancelled) setPlans(Array.isArray(json.plans) ? json.plans : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setPlansError("ផ្ទុកគម្រោងមិនជោគជ័យ។");
      } finally {
        if (!cancelled) setIsPlansLoading(false);
      }
    };
    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleBarayPayment = async () => {
    if (!user) {
      notify.error("សូមចូលគណនីដើម្បីបង់ប្រាក់");
      router.push(`/auth/login?redirect=${encodeURIComponent(`/payment${planId ? `?plan=${planId}` : ""}`)}`);
      return;
    }
    if (!selectedPlan) return;

    setIsBarayLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        notify.error("សម័យប្រើប្រាស់ផុតកំណត់។ សូមចូលគណនីម្ដងទៀត។");
        router.push("/auth/login");
        return;
      }

      const res = await fetch("/api/payment/baray/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: selectedPlan.price,
          currency: selectedPlan.currency ?? "USD",
        }),
      });

      const data = await res.json() as { redirectUrl?: string; error?: string };

      if (!res.ok) {
        const reason = encodeURIComponent(data.error || "មិនអាចចាប់ផ្តើមការទូទាត់បានទេ។");
        router.push(`/payment/failed?reason=${reason}`);
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      router.push("/payment/failed");
    } finally {
      setIsBarayLoading(false);
    }
  };

  if (authLoading || membershipLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState label="កំពុងផ្ទុក..." />
        </div>
      </PageContainer>
    );
  }

  if (hasActiveMembership) {
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
            />
          </div>
          <div className="absolute inset-0 bg-slate-900/65 z-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">សមាជិកភាពរបស់អ្នកសកម្មរួចហើយ</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              អ្នកមានសមាជិកភាពពេញលេញ — មិនចាំបាច់ទូទាត់ម្តងទៀតទេ
            </p>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">បានទទួល</h2>
            <p className="text-sm text-gray-600 mb-6">
              សមាជិកភាពរបស់អ្នកមានសុពលភាពរហូតដល់{" "}
              <span className="font-semibold text-gray-900">
                {formatMembershipDateTime(membershipEndsAt)}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push("/law_video")} variant="primary">
                ចាប់ផ្តើមសិក្សា
              </Button>
              <Button onClick={() => router.push("/profile_page")} variant="outline">
                ប្រវត្តិរូប
              </Button>
            </div>
            <p className="mt-6 text-xs text-gray-500">
              ចង់បន្តគម្រោងបន្ទាប់ពីផុតកំណត់?{" "}
              <Link href="/pricing_page" className="text-(--brown-strong) underline hover:text-(--brown)">
                មើលគម្រោង
              </Link>
            </p>
          </div>
        </section>
      </PageContainer>
    );
  }

  if (isPlansLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState label="កំពុងផ្ទុកគម្រោង..." />
        </div>
      </PageContainer>
    );
  }

  if (plansError) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <p className="text-red-600 font-semibold mb-2">{plansError}</p>
            <Button onClick={() => router.push("/pricing_page")} variant="primary">
              ត្រឡប់ទៅទំព័រតម្លៃ
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!selectedPlan) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <p className="text-gray-700 font-semibold mb-2">រកមិនឃើញគម្រោង</p>
            <p className="text-sm text-gray-600 mb-4">សូមជ្រើសរើសគម្រោងនៅទំព័រតម្លៃ។</p>
            <Button onClick={() => router.push("/pricing_page")} variant="primary">
              ត្រឡប់ទៅទំព័រតម្លៃ
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Payment background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-slate-900/65 z-10"></div>
        {/* Subtle brown accent overlay */}
        <div className="absolute inset-0 bg-(--brown-soft) opacity-20 z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              បំពេញការទូទាត់របស់អ្នក
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              ប្រព័ន្ធទូទាត់មានសុវត្ថិភាពសម្រាប់ការជាវរបស់អ្នក
            </p>
          </div>
        </div>
      </section>

      {/* Payment Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">សង្ខេបការបញ្ជាទិញ</h2>
                
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{selectedPlan.name}</span>
                    <span className="font-semibold text-gray-900">${selectedPlan.price}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{selectedPlan.duration}</p>
                    {selectedPlan.discount && (
                      <p className="text-(--brown-strong) mt-1">
                        {selectedPlan.discount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">តម្លៃរង</span>
                    <span className="text-gray-900">${selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ពន្ធ</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">សរុប</span>
                    <span className="text-(--brown-strong)">
                      ${selectedPlan.price}
                    </span>
                  </div>
                </div>

                <Link
                  href="/pricing_page"
                  className="text-sm text-(--brown-strong) hover:text-(--brown) underline"
                >
                  ផ្លាស់ប្តូរគម្រោង
                </Link>
              </div>
            </div>

            {/* Right Side - Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">ព័ត៌មានការទូទាត់</h2>

                <div className="space-y-6">
                  {/* Baray Online Payment */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span className="text-blue-800 font-semibold text-lg">ABA</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          ទូទាត់ភ្លាមៗ — ការជាវរបស់អ្នកនឹងដំណើរការស្វ័យប្រវត្តិ ដោយមិនចាំបាច់ផ្ទុកភស្តុតាង ឬរង់ចាំការពិនិត្យ។
                        </p>
                        <Button
                          onClick={handleBarayPayment}
                          variant="primary"
                          fullWidth
                          disabled={isBarayLoading}
                          className="max-w-xs py-3 text-base"
                        >
                          {isBarayLoading ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              កំពុងដំណើរការ...
                            </span>
                          ) : (
                            `បង់ $${selectedPlan.price}`
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>


                  {/* Security Notice */}
                  <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
                      <svg
                      className="w-5 h-5 text-(--brown-strong) shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold text-gray-900 mb-1">ការទូទាត់មានសុវត្ថិភាព</p>
                      <p>ការទូទាត់របស់អ្នកត្រូវបានដំណើរការដោយសុវត្ថិភាពតាមធនាគារដែលអ្នកជ្រើសរើស។</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </PageContainer>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState label="Loading..." />
        </div>
      </PageContainer>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
