"use client";

import Image from "next/image";
import Link from "next/link";
import PageContainer from "@/compounents/PageContainer";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

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

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan") || "monthly";
  const selectedPlan = plans[planId] || plans.monthly;

  const [paymentReference, setPaymentReference] = useState<string>("");
  const [qrData, setQrData] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "checking" | "completed" | "failed">("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");
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

  // Poll for payment status
  useEffect(() => {
    if (!paymentReference || paymentStatus === "completed" || paymentStatus === "failed") {
      return;
    }

    // Start polling after 5 seconds (give user time to scan)
    const startPolling = setTimeout(() => {
      setPaymentStatus("checking");

      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`/api/payment?reference=${paymentReference}`);
          
          if (!response.ok) {
            throw new Error("Failed to check payment status");
          }

          const data = await response.json();

          if (data.status === "completed") {
            setPaymentStatus("completed");
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            // Redirect to success page
            router.push(`/payment/success?plan=${planId}&reference=${paymentReference}`);
          } else if (data.status === "failed") {
            setPaymentStatus("failed");
            setErrorMessage("Payment failed. Please try again or contact support.");
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      };

      // Check immediately
      checkPaymentStatus();

      // Then poll every 3 seconds
      pollingIntervalRef.current = setInterval(checkPaymentStatus, 3000);
    }, 5000);

    return () => {
      clearTimeout(startPolling);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [paymentReference, paymentStatus, router, planId]);


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
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/70 via-slate-900/60 to-slate-900/70 z-10"></div>
        {/* Amber accent overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-900/20 to-transparent z-10"></div>
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
                      <p className="text-amber-600 mt-1">{selectedPlan.discount}</p>
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
                    <span className="text-amber-600">${selectedPlan.price}</span>
                  </div>
                </div>

                <Link
                  href="/pricing_page"
                  className="text-sm text-amber-600 hover:text-amber-700 underline"
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
                    <div className="bg-gray-50 rounded-xl p-8 border-2 border-amber-200">
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

                        {/* Payment Status */}
                        {paymentStatus === "checking" && (
                          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-md">
                            <div className="flex items-center justify-center space-x-2">
                              <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <p className="text-blue-700 font-semibold">Checking payment status...</p>
                            </div>
                          </div>
                        )}

                        {paymentStatus === "failed" && errorMessage && (
                          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-md">
                            <div className="flex items-start space-x-2">
                              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-red-700 font-semibold">Payment Failed</p>
                                <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                              </div>
                            </div>
                          </div>
                        )}

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
                              <li>Payment will be automatically verified after completion</li>
                            </ol>
                          </div>
                          {paymentStatus === "pending" && (
                            <p className="text-xs text-gray-500 mt-2">
                              Waiting for payment... Status will update automatically.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
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
                    <button
                      onClick={() => {
                        setPaymentStatus("pending");
                        setErrorMessage("");
                        setQrData("");
                        setPaymentReference("");
                        // Trigger re-initialization
                        window.location.reload();
                      }}
                      className="w-full px-6 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Try Again
                    </button>
                  )}

                  {/* Status Message */}
                  {paymentStatus === "pending" && qrData && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-800 text-center">
                        Scan the QR code with your Bakong app to complete payment. We'll automatically detect when your payment is successful.
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
