"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LoadingState from "@/components/LoadingState";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/instance";
import { toast } from "react-toastify";

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
  const planId = searchParams.get("plan") || "";
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const selectedPlan = useMemo(() => {
    if (!plans.length) return null;
    if (planId) return plans.find((p) => p.id === planId) ?? null;
    return plans[0] ?? null;
  }, [plans, planId]);

  const qrImageUrl = selectedPlan?.qrCodeUrl ?? null;

  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Supabase-only flow:
  // QR comes from selectedPlan.qrCodeUrl (stored in Supabase).
  // We generate a client-side reference for proof upload.
  useEffect(() => {
    if (!selectedPlan) return;
    if (!qrImageUrl) {
      setPaymentStatus("failed");
      setErrorMessage("មិនមាន QR code សម្រាប់គម្រោងនេះទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។");
      return;
    }
    if (!paymentReference) {
      const ref = `REF-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      setPaymentReference(ref);
    }
    setPaymentStatus("pending");
  }, [selectedPlan, qrImageUrl, paymentReference]);

  // Auto-checking removed - payment verification will be done manually after proof upload

  // Handle proof of payment image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage("សូមផ្ទុកឡើងឯកសាររូបភាព (JPG, PNG ជាដើម)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("ទំហំរូបភាពត្រូវតិចជាង 5MB");
        return;
      }
      setProofImage(file);
      setErrorMessage("");
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProofImage(null);
    setProofImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadProof = async () => {
    if (!proofImage || !paymentReference) {
      setErrorMessage("សូមជ្រើសរើសរូបភាព និងត្រូវប្រាកដថាមានលេខយោងការទូទាត់");
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setErrorMessage("សូមចូលគណនីដើម្បីផ្ទុកភស្តុតាងបង់ប្រាក់");
      toast.error("សូមចូលគណនីដើម្បីផ្ទុកភស្តុតាងបង់ប្រាក់");
      router.push("/auth/login");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        setErrorMessage("សម័យប្រើប្រាស់ផុតកំណត់។ សូមចូលគណនីម្ដងទៀត។");
        toast.error("សម័យប្រើប្រាស់ផុតកំណត់។ សូមចូលគណនីម្ដងទៀត។");
        router.push("/auth/login");
        return;
      }

      // Create FormData to send the image
      const formData = new FormData();
      formData.append('proof', proofImage);
      formData.append('reference', paymentReference);
      if (!selectedPlan) {
        setErrorMessage("មិនទាន់ផ្ទុកគម្រោងទេ។ សូមត្រឡប់ក្រោយ ហើយជ្រើសរើសគម្រោងម្តងទៀត។");
        toast.error("មិនទាន់ផ្ទុកគម្រោងទេ។ សូមជ្រើសរើសគម្រោងម្តងទៀត។");
        return;
      }
      formData.append('planId', selectedPlan.id);
      formData.append('amount', selectedPlan.price.toString());

      const response = await fetch('/api/payment/upload-proof', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "ផ្ទុកភស្តុតាងបង់ប្រាក់មិនជោគជ័យ" }));
        const message = errorData.error || "ផ្ទុកភស្តុតាងបង់ប្រាក់មិនជោគជ័យ";
        // Use toast for user-facing messaging (and avoid throwing / red overlay)
        if (response.status === 409) {
          toast.info(message);
        } else {
          toast.error(message);
        }
        setErrorMessage(message);
        return;
      }

      const data = await response.json();
      setUploadSuccess(true);
      setErrorMessage("");
      toast.success("បានផ្ទុកភស្តុតាងបង់ប្រាក់រួចរាល់។ សូមរង់ចាំការពិនិត្យពីអ្នកគ្រប់គ្រង។");
    } catch (error) {
      console.error("Error uploading proof:", error);
      const message = error instanceof Error ? error.message : "ផ្ទុកភស្តុតាងបង់ប្រាក់មិនជោគជ័យ។ សូមព្យាយាមម្តងទៀត។";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState label="កំពុងផ្ទុក..." />
        </div>
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
                  {/* KHQR Bakong Payment */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">បង់ប្រាក់ដោយ KHQR Bakong</h3>
                    
                    {/* QR Code Display */}
                    <div className="bg-gray-50 rounded-xl p-8 border-2 border-[rgb(var(--brown-rgb)/0.3)]">
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                          {qrImageUrl ? (
                            <div className="flex flex-col items-center">
                              <Image
                                src={qrImageUrl}
                                alt="KHQR code"
                                width={256}
                                height={256}
                                className="rounded-lg"
                                sizes="256px"
                              />
                              {paymentReference && (
                                <p className="text-xs text-gray-500 mt-2 font-mono">
                                  Ref: {paymentReference}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
                              <div className="text-center">
                                <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-sm text-gray-500">មិនមាន QR code</p>
                              </div>
                            </div>
                          )}
                        </div>


                        {/* Payment Instructions */}
                        <div className="text-center space-y-3 max-w-md">
                          <p className="text-lg font-semibold text-gray-900">
                            ស្កេនដើម្បីបង់ប្រាក់ ${selectedPlan.price}
                          </p>
                          <div className="bg-white rounded-lg p-4 space-y-2 text-sm text-gray-700">
                            <p className="font-semibold text-gray-900">វិធីសាស្ត្របង់ប្រាក់:</p>
                            <ol className="list-decimal list-inside space-y-1 text-left">
                              <li>បើកកម្មវិធី Bakong ឬកម្មវិធីធនាគារដែលគាំទ្រ KHQR</li>
                              <li>ស្កេន QR code ខាងលើ</li>
                              <li>បញ្ជាក់ចំនួនទឹកប្រាក់: <span className="font-semibold">${selectedPlan.price}</span></li>
                              <li>បញ្ចប់ការទូទាត់ក្នុងកម្មវិធីរបស់អ្នក</li>
                              <li>ផ្ទុកភស្តុតាងបង់ប្រាក់ខាងក្រោមបន្ទាប់ពីទូទាត់រួច</li>
                            </ol>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            បន្ទាប់ពីទូទាត់រួច សូមផ្ទុកភស្តុតាងបង់ប្រាក់សម្រាប់ការផ្ទៀងផ្ទាត់។
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Proof of Payment */}
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ផ្ទុកភស្តុតាងបង់ប្រាក់</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      បន្ទាប់ពីបង់ប្រាក់រួច អ្នកអាចផ្ទុករូបថតអេក្រង់ ឬរូបថតបញ្ជាក់ការទូទាត់ ដើម្បីឱ្យពិនិត្យបានលឿនជាងមុន។
                    </p>
                    {!user ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-semibold">ត្រូវចូលគណនីដើម្បីផ្ទុកភស្តុតាង</p>
                        <p className="mt-1 text-amber-800/90">
                          អ្នកអាចស្កេន និងបង់ប្រាក់ឥឡូវនេះបាន ប៉ុន្តែត្រូវចូលគណនីដើម្បីផ្ទុកភស្តុតាងសម្រាប់អ្នកគ្រប់គ្រងពិនិត្យ។
                        </p>
                        <div className="mt-3">
                          <Button
                            variant="primary"
                            onClick={() => {
                              const redirectPath = `/payment${planId ? `?plan=${encodeURIComponent(planId)}` : ""}`;
                              router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
                            }}
                          >
                            ចូលគណនី
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {!proofImagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-(--brown) transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="proof-upload"
                        />
                        <label
                          htmlFor="proof-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <svg
                            className="w-12 h-12 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-gray-700 font-medium mb-1">ចុចដើម្បីផ្ទុកភស្តុតាងបង់ប្រាក់</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                          <Image
                            src={proofImagePreview}
                            alt="Proof of payment preview"
                            width={600}
                            height={400}
                            className="w-full h-auto object-contain bg-gray-50"
                            unoptimized
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                            aria-label="Remove image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handleUploadProof}
                            variant="primary"
                            fullWidth
                            disabled={isUploading || uploadSuccess}
                            className="px-6 py-3"
                          >
                            {isUploading ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                កំពុងផ្ទុកឡើង...
                              </span>
                            ) : uploadSuccess ? (
                              <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                ផ្ទុកឡើងជោគជ័យ
                              </span>
                            ) : (
                              "ផ្ទុកភស្តុតាង"
                            )}
                          </Button>
                          <Button
                            onClick={handleRemoveImage}
                            variant="outline"
                            className="px-6 py-3"
                          >
                            ប្តូររូបភាព
                          </Button>
                        </div>
                        {uploadSuccess && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-green-700 font-semibold">បានផ្ទុកភស្តុតាងជោគជ័យ!</p>
                                <p className="text-green-600 text-sm mt-1">យើងនឹងផ្ទៀងផ្ទាត់ការទូទាត់របស់អ្នកឆាប់ៗនេះ។ អ្នកក៏អាចរង់ចាំការផ្ទៀងផ្ទាត់ស្វ័យប្រវត្តិផងដែរ។</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                      <p>KHQR Bakong គឺជាប្រព័ន្ធទូទាត់ជាតិរបស់កម្ពុជា។ ការទូទាត់របស់អ្នកត្រូវបានដំណើរការដោយសុវត្ថិភាពតាមកម្មវិធីធនាគាររបស់អ្នក។</p>
                    </div>
                  </div>

                  {/* Retry Button (only shown on failure) */}
                  {paymentStatus === "failed" && (
                    <Button
                      onClick={() => {
                        setPaymentStatus("pending");
                        setErrorMessage("");
                        setPaymentReference("");
                        // Trigger re-initialization
                        window.location.reload();
                      }}
                      variant="primary"
                      fullWidth
                      className="px-6 py-4"
                    >
                      ព្យាយាមម្តងទៀត
                    </Button>
                  )}

                  {/* Status Message */}
                  {qrImageUrl ? (
                    <div className="bg-(--brown-soft) border border-[rgb(var(--brown-rgb)/0.25)] rounded-lg p-4">
                      <p className="text-sm text-slate-800 text-center">
                        សូមស្កេន QR code ដោយកម្មវិធី Bakong របស់អ្នកដើម្បីបញ្ចប់ការទូទាត់។ បន្ទាប់ពីទូទាត់រួច សូមផ្ទុកភស្តុតាងខាងក្រោមសម្រាប់ការផ្ទៀងផ្ទាត់ដោយដៃ។
                      </p>
                    </div>
                  ) : null}
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
