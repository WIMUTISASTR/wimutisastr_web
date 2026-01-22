"use client";

import { useRouter } from "next/navigation";
import Button from "@/compounents/Button";

export default function CallToActionSection() {
  const router = useRouter();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('/asset/background.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-linear-to-br from-(--brown)/20 to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <svg className="absolute top-10 left-10 w-64 h-64 text-white" viewBox="0 0 200 200" fill="currentColor" opacity="0.1">
          <path d="M100 20 L120 60 L160 60 L130 85 L145 125 L100 100 L55 125 L70 85 L40 60 L80 60 Z" />
        </svg>
        <svg className="absolute bottom-10 right-10 w-48 h-48 text-white" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.1">
          <circle cx="100" cy="100" r="80" />
          <path d="M60 100 L90 130 L140 70" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Badge */}
        <div className="inline-block mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <svg className="w-5 h-5 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span className="text-sm font-semibold text-white">Limited Time Offer</span>
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Elevate Your <br />
          <span className="text-(--brown) bg-clip-text">Legal Expertise?</span>
        </h2>

        {/* Subheading */}
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join thousands of legal professionals who have transformed their careers with our comprehensive 
          educational platform. Start your journey to legal excellence today.
        </p>

        {/* Benefits List */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="flex items-start gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-(--brown)/20 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Expert-Led Courses</h3>
              <p className="text-sm text-gray-400">Learn from experienced legal professionals</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-(--brown)/20 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Comprehensive Library</h3>
              <p className="text-sm text-gray-400">Access extensive legal documents</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-(--brown)/20 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Lifetime Access</h3>
              <p className="text-sm text-gray-400">Learn at your own pace, anytime</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => router.push("/auth/register")}
            variant="primary"
            className="px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Free Trial
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>

          <Button
            onClick={() => router.push("/pricing_page")}
            variant="outline"
            className="px-10 py-4 text-lg font-semibold bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
          >
            View Pricing Plans
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>7-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-(--brown)" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              <span>24/7 support available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
