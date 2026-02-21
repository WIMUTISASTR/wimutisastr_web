"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import Button from "@/components/Button";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-(--gray-200) bg-white shadow-sm">
      <div className="hidden md:block bg-(--primary-dark) text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <span>វេទិកាអប់រំច្បាប់ | WIMUTISASTR Law Office</span>
          <span>ទំនាក់ទំនង: +855 12 345 678</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-16">
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group transition-all duration-300"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo/logo.png"
                alt="WIMUTISASTR LAW OFFICE Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-(--ink) tracking-tight group-hover:text-(--primary) transition-colors">
                WIMUTISASTR
              </h1>
              <p className="text-xs text-(--gray-700) font-medium">ការិយាល័យច្បាប់</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md transition-all duration-300 font-semibold text-sm ${
                pathname === "/"
                  ? "bg-(--primary) text-white"
                  : "text-(--gray-700) hover:text-(--primary) hover:bg-(--gray-100)"
              }`}
            >
              ទំព័រដើម
            </Link>
            <Link
              href="/law_video"
              className={`px-4 py-2 rounded-md transition-all duration-300 font-semibold text-sm ${
                pathname === "/law_video"
                  ? "bg-(--primary) text-white"
                  : "text-(--gray-700) hover:text-(--primary) hover:bg-(--gray-100)"
              }`}
            >
              វីដេអូ
            </Link>
            <Link
              href="/law_documents"
              className={`px-4 py-2 rounded-md transition-all duration-300 font-semibold text-sm ${
                pathname === "/law_documents"
                  ? "bg-(--primary) text-white"
                  : "text-(--gray-700) hover:text-(--primary) hover:bg-(--gray-100)"
              }`}
            >
              ឯកសារ
            </Link>
            <Link
              href="/about_us"
              className={`px-4 py-2 rounded-md transition-all duration-300 font-semibold text-sm ${
                pathname === "/about_us"
                  ? "bg-(--primary) text-white"
                  : "text-(--gray-700) hover:text-(--primary) hover:bg-(--gray-100)"
              }`}
            >
              អំពីយើង
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!loading && (
              <>
                {user ? (
                  <Button
                    onClick={() => router.push("/profile_page")}
                    variant={pathname === "/profile_page" ? "primary" : "outline"}
                    size="sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ប្រវត្តិរូប
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push("/auth/login")}
                      variant="ghost"
                      size="sm"
                    >
                      ចូលគណនី
                    </Button>
                    <Button
                      onClick={() => router.push("/auth/register")}
                      variant="primary"
                      size="sm"
                    >
                      ចាប់ផ្តើម
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md border border-transparent hover:bg-gray-100 hover:border-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2"
            aria-label="បើក/បិទម៉ឺនុយ"
          >
            <svg
              className="w-6 h-6 text-(--ink) transition-transform duration-300"
              style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col space-y-2 py-4 border-t border-gray-200">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:bg-(--gray-100) hover:text-(--primary)"
              }`}
            >
              ទំព័រដើម
            </Link>
            <Link
              href="/law_video"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/law_video"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:bg-(--gray-100) hover:text-(--primary)"
              }`}
            >
              វីដេអូ
            </Link>
            <Link
              href="/law_documents"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/law_documents"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:bg-(--gray-100) hover:text-(--primary)"
              }`}
            >
              ឯកសារ
            </Link>
            <Link
              href="/about_us"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/about_us"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:bg-(--gray-100) hover:text-(--primary)"
              }`}
            >
              អំពីយើង
            </Link>
            <div className="pt-3 border-t border-gray-200 mt-2 space-y-2">
              {!loading && (
                <>
                  {user ? (
                    <Button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/profile_page");
                      }}
                      variant="primary"
                      fullWidth
                      size="md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      ប្រវត្តិរូប
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push("/auth/login");
                        }}
                        variant="outline"
                        fullWidth
                        size="md"
                      >
                        ចូលគណនី
                      </Button>
                      <Button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push("/auth/register");
                        }}
                        variant="primary"
                        fullWidth
                        size="md"
                      >
                        ចាប់ផ្តើម
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
