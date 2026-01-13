"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import PageContainer from "@/compounents/PageContainer";
import Button from "@/compounents/Button";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

interface PlanDetails {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: string;
}

const plans: Record<string, PlanDetails> = {
  monthly: {
    id: "monthly",
    name: "Monthly Plan",
    duration: "1 Month",
    price: 3,
  },
  "six-months": {
    id: "six-months",
    name: "6 Months Plan",
    duration: "6 Months",
    price: 15,
    originalPrice: 18,
    discount: "Save 17%",
  },
  yearly: {
    id: "yearly",
    name: "Yearly Plan",
    duration: "1 Year",
    price: 25,
    originalPrice: 36,
    discount: "Save 31%",
  },
};

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const planId = searchParams.get("plan") || "monthly";
  const selectedPlan = plans[planId] || plans.monthly;

  const [paymentReference, setPaymentReference] = useState<string>("");
  const [qrData, setQrData] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Generate payment session and QR code when component mounts
  useEffect(() => {
    const createPaymentSession = async () => {
      try {
        const response = await fetch("/api/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: selectedPlan.id,
            amount: selectedPlan.price,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment session");
        }

        const data = await response.json();
        setPaymentReference(data.reference);
        setQrData(data.qrData);
        setPaymentStatus("pending");
      } catch (error) {
        console.error("Error creating payment session:", error);
        setErrorMessage("Failed to initialize payment. Please try again.");
        setPaymentStatus("failed");
      }
    };

    createPaymentSession();
  }, [selectedPlan.id, selectedPlan.price]);

  // Auto-checking removed - payment verification will be done manually after proof upload

  // Handle proof of payment image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage("Please upload an image file (JPG, PNG, etc.)");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 5MB");
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
      setErrorMessage("Please select an image and ensure payment reference is available");
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setErrorMessage("Please log in to upload proof of payment");
      toast.error("Please log in to upload proof of payment");
      router.push("/auth/login");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        setErrorMessage("Session expired. Please log in again.");
        toast.error("Session expired. Please log in again.");
        router.push("/auth/login");
        return;
      }

      // Create FormData to send the image
      const formData = new FormData();
      formData.append('proof', proofImage);
      formData.append('reference', paymentReference);
      formData.append('planId', planId);
      formData.append('amount', selectedPlan.price.toString());

      const response = await fetch('/api/payment/upload-proof', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to upload proof of payment" }));
        const message = errorData.error || "Failed to upload proof of payment";
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
      toast.success("Proof of payment uploaded. Waiting for admin review.");
    } catch (error) {
      console.error("Error uploading proof:", error);
      const message = error instanceof Error ? error.message : "Failed to upload proof of payment. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/payment?plan=" + planId);
    }
  }, [user, authLoading, router, planId]);

  if (authLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brown)] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return null; // Will redirect
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
            style={{ objectFit: 'cover' }}
          />
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-900/70 z-10"></div>
        {/* Subtle gold accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brown-soft)] to-transparent z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 opacity-0 translate-y-8 delay-100">
              Complete Your Payment
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
              Secure payment processing for your subscription
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
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24 opacity-0 translate-y-8 delay-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{selectedPlan.name}</span>
                    <span className="font-semibold text-gray-900">${selectedPlan.price}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{selectedPlan.duration}</p>
                    {selectedPlan.discount && (
                      <p className="text-[var(--brown-strong)] mt-1">
                        {selectedPlan.discount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-[var(--brown-strong)]">
                      ${selectedPlan.price}
                    </span>
                  </div>
                </div>

                <Link
                  href="/pricing_page"
                  className="text-sm text-[var(--brown-strong)] hover:text-[var(--brown)] underline"
                >
                  Change Plan
                </Link>
              </div>
            </div>

            {/* Right Side - Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 opacity-0 translate-y-8 delay-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

                <div className="space-y-6">                  
                  {/* KHQR Bakong Payment */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay with KHQR Bakong</h3>
                    
                    {/* QR Code Display */}
                    <div className="bg-gray-50 rounded-xl p-8 border-2 border-[rgb(var(--brown-rgb)/0.3)]">
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                          {qrData ? (
                            <div className="flex flex-col items-center">
                              <QRCodeSVG
                                value={qrData}
                                size={256}
                                level="H"
                                includeMargin={true}
                                className="rounded-lg"
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
                                <p className="text-sm text-gray-500">Generating QR Code...</p>
                              </div>
                            </div>
                          )}
                        </div>


                        {/* Payment Instructions */}
                        <div className="text-center space-y-3 max-w-md">
                          <p className="text-lg font-semibold text-gray-900">
                            Scan to Pay ${selectedPlan.price}
                          </p>
                          <div className="bg-white rounded-lg p-4 space-y-2 text-sm text-gray-700">
                            <p className="font-semibold text-gray-900">Payment Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1 text-left">
                              <li>Open your Bakong app or any KHQR-supported banking app</li>
                              <li>Scan the QR code above</li>
                              <li>Confirm the payment amount: <span className="font-semibold">${selectedPlan.price}</span></li>
                              <li>Complete the payment in your app</li>
                              <li>Upload proof of payment below after completing the transaction</li>
                            </ol>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            After payment, please upload proof of payment for verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Proof of Payment */}
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Proof of Payment</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      After completing your payment, you can upload a screenshot or photo of your payment confirmation for faster verification.
                    </p>

                    {!proofImagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[var(--brown)] transition-colors">
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
                          <p className="text-gray-700 font-medium mb-1">Click to upload proof of payment</p>
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
                                Uploading...
                              </span>
                            ) : uploadSuccess ? (
                              <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Uploaded Successfully
                              </span>
                            ) : (
                              "Upload Proof"
                            )}
                          </Button>
                          <Button
                            onClick={handleRemoveImage}
                            variant="outline"
                            className="px-6 py-3"
                          >
                            Change Image
                          </Button>
                        </div>
                        {uploadSuccess && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-green-700 font-semibold">Proof uploaded successfully!</p>
                                <p className="text-green-600 text-sm mt-1">We'll verify your payment shortly. You can also wait for automatic verification.</p>
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
                      className="w-5 h-5 text-[var(--brown-strong)] shrink-0 mt-0.5"
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
                      <p className="font-semibold text-gray-900 mb-1">Secure Payment</p>
                      <p>KHQR Bakong is Cambodia's national payment system. Your payment is processed securely through your banking app.</p>
                    </div>
                  </div>

                  {/* Retry Button (only shown on failure) */}
                  {paymentStatus === "failed" && (
                    <Button
                      onClick={() => {
                        setPaymentStatus("pending");
                        setErrorMessage("");
                        setQrData("");
                        setPaymentReference("");
                        // Trigger re-initialization
                        window.location.reload();
                      }}
                      variant="primary"
                      fullWidth
                      className="px-6 py-4"
                    >
                      Try Again
                    </Button>
                  )}

                  {/* Status Message */}
                  {qrData && (
                    <div className="bg-[var(--brown-soft)] border border-[rgb(var(--brown-rgb)/0.25)] rounded-lg p-4">
                      <p className="text-sm text-slate-800 text-center">
                        Scan the QR code with your Bakong app to complete payment. After payment, upload proof of payment below for manual verification.
                      </p>
                    </div>
                  )}
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brown)] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </PageContainer>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
