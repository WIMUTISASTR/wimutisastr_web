"use client";

import Image from "next/image";
import PageContainer from "@/compounents/PageContainer";
import { useEffect, useRef } from "react";

export default function AboutUsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const expertRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

    // Observe all animated elements
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
            alt="Legal background"
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
              About Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
              Empowering Cambodians with accessible legal knowledge
            </p>
          </div>
        </div>
      </section>

      {/* Website Mission Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Legal background"
            fill
            className="object-cover"
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        {/* Light overlay for readability */}
        <div className="absolute inset-0 bg-white/85 z-10"></div>
        <div className="relative max-w-6xl mx-auto z-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 opacity-0 translate-y-8 delay-100">
              Why We Created This Platform
            </h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-8 opacity-0 translate-y-8 delay-200"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - Mission Statement */}
            <div className="space-y-6">
              <div className="bg-amber-50 rounded-2xl p-8 border-l-4 border-amber-600 opacity-0 -translate-x-8 delay-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We believe that legal knowledge should be accessible to everyone. Our platform was created 
                  to democratize legal education in Cambodia, making complex legal concepts understandable 
                  and available to all citizens, regardless of their background or location.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 opacity-0 -translate-x-8 delay-400 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  What We Offer
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Through comprehensive video tutorials and detailed legal documents, we provide 
                  expert knowledge on Cambodian law, helping individuals and businesses navigate 
                  the legal landscape with confidence and understanding.
                </p>
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4 opacity-0 translate-x-8 delay-300 hover:transform hover:scale-105 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Expert Knowledge</h4>
                  <p className="text-gray-600">
                    Learn from experienced legal professionals who understand Cambodian law inside and out
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 opacity-0 translate-x-8 delay-400 hover:transform hover:scale-105 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Accessible Learning</h4>
                  <p className="text-gray-600">
                    Access legal education anytime, anywhere. No barriers, no prerequisites—just knowledge
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 opacity-0 translate-x-8 delay-500 hover:transform hover:scale-105 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Trusted Resources</h4>
                  <p className="text-gray-600">
                    All content is carefully prepared and verified by qualified legal experts
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 opacity-0 translate-x-8 delay-700 hover:transform hover:scale-105 transition-all duration-300">
                <div className="shrink-0 w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Empowering Communities</h4>
                  <p className="text-gray-600">
                    Building a more legally aware society, one learner at a time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 opacity-0 translate-y-8 delay-100">
              Meet Our Expert
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto opacity-0 translate-y-8 delay-200">
              All documents and videos are carefully prepared by our experienced legal professional
            </p>
            <div className="w-24 h-1 bg-amber-600 mx-auto mt-6 opacity-0 translate-y-8 delay-300"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-80 h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-100 opacity-0 -translate-x-8 delay-200 hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:border-amber-200">
                <Image
                  src="/asset/teacherImage.png"
                  alt="Men Vuth"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  priority
                />
              </div>
            </div>

            {/* Right Side - Information */}
            <div className="space-y-8">
              {/* Name and Title */}
              <div className="opacity-0 translate-x-8 delay-300">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Men Vuth
                </h2>
                <p className="text-xl text-amber-600 font-semibold mb-4">
                  Legal Expert
                </p>
                <p className="text-gray-600">
                  All documents and videos on this platform are prepared by our expert legal professional
                </p>
              </div>

              {/* Specializations */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 opacity-0 translate-x-8 delay-400 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Specializations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start opacity-0 translate-y-4 delay-500 hover:translate-x-2 transition-all duration-300">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Land Law</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-600 hover:translate-x-2 transition-all duration-300">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Labor Law</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-700 hover:translate-x-2 transition-all duration-300">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Corporate Law</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-800 hover:translate-x-2 transition-all duration-300">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Investment Protection Law</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-900 hover:translate-x-2 transition-all duration-300">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Court and Out-of-Court Litigation</span>
                  </li>
                  <li className="flex items-start opacity-0 translate-y-4 delay-1000 hover:translate-x-2 transition-all duration-300">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Contract Preparation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
              <div className="space-y-4 text-gray-700">
                <div className="opacity-0 translate-y-4 delay-200">
                  <span className="font-semibold text-gray-900">Full Name:</span>{" "}
                  <span>Men Vuth</span>
                </div>
                <div className="opacity-0 translate-y-4 delay-300">
                  <span className="font-semibold text-gray-900">Gender:</span> Male
                </div>
                <div className="opacity-0 translate-y-4 delay-400">
                  <span className="font-semibold text-gray-900">Nationality:</span> Cambodian
                </div>
                <div className="opacity-0 translate-y-4 delay-500">
                  <span className="font-semibold text-gray-900">Date of Birth:</span> May 5, 1984
                </div>
                <div className="opacity-0 translate-y-4 delay-700">
                  <span className="font-semibold text-gray-900">Place of Birth:</span>{" "}
                  <span>Dak Van Village, Oudom Soriya Commune, Tram Kak District, Takeo Province</span>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Education</h3>
              <div className="space-y-4 text-gray-700">
                <div className="opacity-0 translate-y-4 delay-300">
                  <p className="font-semibold text-gray-900 mb-1">2006-2010</p>
                  <p className="text-sm text-gray-600">
                    Bachelor of Law (French Specialization), Royal University of Law and Economics
                  </p>
                </div>
                <div className="opacity-0 translate-y-4 delay-500">
                  <p className="font-semibold text-gray-900 mb-1">2010-2013</p>
                  <p className="text-sm text-gray-600">
                    Master's Degree in International and Comparative Law, Lyon II University & Royal University of Law and Economics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Experience */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-100 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Experience</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-amber-500 pl-6 opacity-0 translate-x-8 delay-200 hover:border-amber-600 hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2022-2023</p>
                <p className="text-gray-600">Practicing Lawyer at CPH LAW GROUP, Kingdom of Cambodia</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-6 opacity-0 translate-x-8 delay-300 hover:border-amber-600 hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2012-2021</p>
                <p className="text-gray-600">Legal Team at His Excellency Hun Manet's Office, Kampong Speu Province</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-6 opacity-0 translate-x-8 delay-400 hover:border-amber-600 hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2010 - Present</p>
                <p className="text-gray-600">Part-time Lecturer at Royal University of Law and Economics</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-6 opacity-0 translate-x-8 delay-500 hover:border-amber-600 hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2012-2015</p>
                <p className="text-gray-600">Head of Legal Affairs at CAMLIFE Insurance Company</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-6 opacity-0 translate-x-8 delay-700 hover:border-amber-600 hover:translate-x-2 transition-all duration-300">
                <p className="font-semibold text-gray-900">2010-2012</p>
                <p className="text-gray-600">Legal Assistant at the Prosecutor's Office of the Phnom Penh Municipal Court</p>
              </div>
            </div>
          </div>

          {/* Languages & Contact */}
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            {/* Languages */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Languages</h3>
              <div className="space-y-3">
                <div className="flex items-center opacity-0 translate-x-8 delay-200 hover:translate-x-2 transition-all duration-300">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Khmer - Native</span>
                </div>
                <div className="flex items-center opacity-0 translate-x-8 delay-300 hover:translate-x-2 transition-all duration-300">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">English</span>
                </div>
                <div className="flex items-center opacity-0 translate-x-8 delay-400 hover:translate-x-2 transition-all duration-300">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">French</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 opacity-0 translate-y-8 delay-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4 text-gray-700">
                <div className="opacity-0 translate-y-4 delay-300">
                  <span className="font-semibold text-gray-900">Phone:</span>{" "}
                  <a href="tel:012227202" className="text-amber-600 hover:text-amber-700 transition-colors">
                    012 227 202
                  </a>
                </div>
                <div className="opacity-0 translate-y-4 delay-400">
                  <span className="font-semibold text-gray-900">Email:</span>{" "}
                  <a href="mailto:vuthmen5@gmail.com" className="text-amber-600 hover:text-amber-700 transition-colors">
                    vuthmen5@gmail.com
                  </a>
                </div>
                <div className="opacity-0 translate-y-4 delay-500">
                  <span className="font-semibold text-gray-900">Address:</span>
                  <p className="mt-1 text-gray-600">
                    House No. 24Q, Street 36, Phnom Penh Thmei Village, Prek Anchanh Commune, Mukh Kampul District, Kandal Province
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
