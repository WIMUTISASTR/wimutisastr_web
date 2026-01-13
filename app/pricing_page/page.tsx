"use client";

import Image from "next/image";
import PageContainer from "@/compounents/PageContainer";
import Button from "@/compounents/Button";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  features: string[];
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "Monthly Plan",
    duration: "1 Month",
    price: 3,
    features: [
      "Access to all legal documents",
      "Access to all video courses",
      "Download PDF documents",
      "Email support",
      "Cancel anytime",
    ],
  },
  {
    id: "six-months",
    name: "6 Months Plan",
    duration: "6 Months",
    price: 15,
    originalPrice: 18,
    discount: "Save 17%",
    features: [
      "Access to all legal documents",
      "Access to all video courses",
      "Download PDF documents",
      "Priority email support",
      "Cancel anytime",
      "Best value for money",
    ],
    popular: true,
  },
  {
    id: "yearly",
    name: "Yearly Plan",
    duration: "1 Year",
    price: 25,
    originalPrice: 36,
    discount: "Save 31%",
    features: [
      "Access to all legal documents",
      "Access to all video courses",
      "Download PDF documents",
      "Priority email support",
      "Cancel anytime",
      "Maximum savings",
      "Exclusive content access",
    ],
  },
];

export default function PricingPage() {
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
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Pricing background"
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
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
              Select the perfect plan to access comprehensive legal education
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] backdrop-blur-xl shadow-[var(--shadow-elev-1)] overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-elev-2)] hover:-translate-y-1 opacity-0 translate-y-8 ${
                  plan.popular
                    ? "ring-2 ring-[rgb(var(--brown-rgb)/0.35)] md:scale-[1.03]"
                    : ""
                }`}
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="p-8">
                  {plan.popular && (
                    <div className="absolute top-5 right-5">
                      <span className="inline-flex items-center rounded-full bg-[rgb(var(--brown-rgb)/0.16)] text-[var(--brown-strong)] ring-1 ring-[rgb(var(--brown-rgb)/0.25)] px-3 py-1 text-xs font-semibold">
                        Most popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 mb-6">{plan.duration}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-slate-900 tracking-tight">
                        ${plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-lg text-slate-400 line-through">
                          ${plan.originalPrice}
                        </span>
                      )}
                    </div>
                    {plan.discount && (
                      <span className="inline-flex mt-3 items-center px-3 py-1 bg-[var(--brown-soft)] text-[var(--brown-strong)] rounded-full text-sm font-semibold">
                        {plan.discount}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start opacity-0 translate-y-4"
                        style={{ animationDelay: `${(index + 1) * 100 + (featureIndex + 1) * 50}ms` }}
                      >
                        <svg
                          className="w-5 h-5 text-[var(--brown-strong)] mr-3 shrink-0 mt-0.5"
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
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => router.push(`/payment?plan=${plan.id}`)}
                    variant={plan.popular ? "primary" : "outline"}
                    fullWidth
                    className="px-6 py-3"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center opacity-0 translate-y-8 delay-500">
            <p className="text-slate-700 mb-4">
              All plans include full access to our legal education platform
            </p>
            <p className="text-sm text-slate-500">
              Secure payment • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
