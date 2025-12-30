"use client";

import Image from "next/image";
import PageContainer from "@/compounents/PageContainer";
import Link from "next/link";
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
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/70 via-slate-900/60 to-slate-900/70 z-10"></div>
        {/* Amber accent overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-900/20 to-transparent z-10"></div>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 opacity-0 translate-y-8 ${
                  plan.popular
                    ? "border-amber-500 scale-105"
                    : "border-gray-200"
                }`}
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                {plan.popular && (
                  <div className="bg-amber-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.duration}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="ml-3 text-xl text-gray-400 line-through">
                          ${plan.originalPrice}
                        </span>
                      )}
                    </div>
                    {plan.discount && (
                      <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
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
                          className="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5"
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
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/payment?plan=${plan.id}`}
                    className={`w-full block text-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? "bg-amber-600 text-white hover:bg-amber-700 shadow-md hover:shadow-lg"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center opacity-0 translate-y-8 delay-500">
            <p className="text-gray-600 mb-4">
              All plans include full access to our legal education platform
            </p>
            <p className="text-sm text-gray-500">
              Secure payment • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
