"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function CallToActionSection() {
  const router = useRouter();

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 bg-(--primary)">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-(--accent) opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-(--primary-light) opacity-15 rounded-full blur-3xl" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 opacity-5">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
            <path d="M12 2L4 7V12C4 16.97 7.58 21.45 12 22C16.42 21.45 20 16.97 20 12V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute bottom-20 right-20 w-48 h-48 opacity-5">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Badge */}
        <div className="inline-block mb-8 animate-bounce-in">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border-2 border-(--accent) shadow-xl">
            <div className="w-2 h-2 bg-(--accent) rounded-full animate-pulse" />
            <span className="text-sm font-bold text-white uppercase tracking-wide">ចាប់ផ្តើមដំណើររបស់អ្នក</span>
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 leading-tight">
          ត្រៀមខ្លួនរួចរាល់ដើម្បីបង្កើន{" "}
          <span className="text-(--accent)">ជំនាញច្បាប់របស់អ្នកហើយឬនៅ?</span>
        </h2>

        {/* Subheading */}
        <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
          ចូលរួមជាមួយអ្នកជំនាញច្បាប់រាប់ពាន់នាក់ដែលបានអភិវឌ្ឍអាជីពរបស់ពួកគេតាមរយៈវេទិកាអប់រំដ៏គ្រប់ជ្រុងជ្រោយរបស់យើង។
          ចាប់ផ្តើមដំណើរទៅកាន់ឧត្តមភាពផ្នែកច្បាប់របស់អ្នកថ្ងៃនេះ។
        </p>

        {/* Benefits List */}
        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8 mb-14 max-w-4xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "វគ្គដឹកនាំដោយអ្នកជំនាញ",
              desc: "សិក្សាពីអ្នកជំនាញច្បាប់មានបទពិសោធន៍"
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
              title: "បណ្ណាល័យគ្រប់ជ្រុងជ្រោយ",
              desc: "ចូលប្រើឯកសារច្បាប់ជាច្រើន"
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "ចូលប្រើរយៈពេលវែង",
              desc: "រៀនតាមល្បឿនរបស់អ្នក គ្រប់ពេល"
            }
          ].map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group border border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-(--accent) flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-bold text-white mb-2 text-lg">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
          <Button
            onClick={() => router.push("/auth/register")}
            variant="primary"
            size="lg"
            className="group/btn shadow-2xl"
          >
            <span className="flex items-center gap-2">
              ចាប់ផ្តើមសិក្សាឥឡូវនេះ
              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>

          <Button
            onClick={() => router.push("/pricing_page")}
            variant="outline"
            size="lg"
            className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
          >
            មើលគម្រោងតម្លៃ
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="pt-10 border-t border-white/10">
          <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-10 text-gray-400 text-sm">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                text: "មិនចាំបាច់ប្រើកាតឥណទាន"
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                ),
                text: "ធានាសងប្រាក់វិញក្នុង 7 ថ្ងៃ"
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                ),
                text: "មានក្រុមគាំទ្រ 24/7"
              }
            ].map((indicator, index) => (
              <div key={index} className="flex items-center gap-2 font-medium">
                <div className="text-(--accent)">
                  {indicator.icon}
                </div>
                <span>{indicator.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
