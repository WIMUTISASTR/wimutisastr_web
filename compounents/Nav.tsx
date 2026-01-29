"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import Button from "@/compounents/Button";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "glass-strong shadow-lg border-b border-white/20" 
          : "bg-transparent border-b border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group transition-all duration-300"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo/logo.png"
                alt="WIMUTISASTR LAW OFFICE Logo"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--ink)] tracking-tight group-hover:text-(--primary) transition-colors">
                WIMUTISASTR
              </h1>
              <p className="text-xs text-(--gray-700) font-medium">Law Office</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:text-(--primary) hover:bg-(--accent)/20"
              }`}
            >
              Home
            </Link>
            <Link
              href="/law_video"
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/law_video"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:text-(--primary) hover:bg-(--accent)/20"
              }`}
            >
              Videos
            </Link>
            <Link
              href="/law_documents"
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/law_documents"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:text-(--primary) hover:bg-(--accent)/20"
              }`}
            >
              Documents
            </Link>
            <Link
              href="/about_us"
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/about_us"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:text-(--primary) hover:bg-(--accent)/20"
              }`}
            >
              About Us
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
                    Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push("/auth/login")}
                      variant="ghost"
                      size="sm"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => router.push("/auth/register")}
                      variant="primary"
                      size="sm"
                    >
                      Get Started
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
            className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-all duration-300 active:scale-95"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-[var(--ink)] transition-transform duration-300"
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
          <div className="flex flex-col space-y-2 py-4 border-t border-white/20">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:bg-(--accent)/20 hover:text-(--primary)"
              }`}
            >
              Home
            </Link>
            <Link
              href="/law_video"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/law_video"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:bg-(--accent)/20 hover:text-(--primary)"
              }`}
            >
              Videos
            </Link>
            <Link
              href="/law_documents"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/law_documents"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:bg-(--accent)/20 hover:text-(--primary)"
              }`}
            >
              Documents
            </Link>
            <Link
              href="/about_us"
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                pathname === "/about_us"
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-(--gray-700) hover:bg-(--accent)/20 hover:text-(--primary)"
              }`}
            >
              About Us
            </Link>
            <div className="pt-3 border-t border-white/20 mt-2 space-y-2">
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
                      Profile
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
                        Login
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
                        Get Started
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
