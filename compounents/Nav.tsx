"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Button from "@/compounents/Button";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface-strong)] backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
              <Image
                src="/logo/logo.png"
                alt="WIMUTISASTR LAW OFFICE Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                WIMUTISASTR
              </h1>
              <p className="text-xs text-slate-600">Law Office</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brown)] focus-visible:ring-offset-2 ${
                pathname === "/"
                  ? "bg-[rgb(var(--brown-rgb)/0.14)] text-slate-900 ring-1 ring-inset ring-[rgb(var(--brown-rgb)/0.22)]"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[rgb(var(--ink-rgb)/0.04)]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/law_video"
              className={`px-4 py-2 rounded-xl transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brown)] focus-visible:ring-offset-2 ${
                pathname === "/law_video"
                  ? "bg-[rgb(var(--brown-rgb)/0.14)] text-slate-900 ring-1 ring-inset ring-[rgb(var(--brown-rgb)/0.22)]"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[rgb(var(--ink-rgb)/0.04)]"
              }`}
            >
              Videos
            </Link>
            <Link
              href="/law_documents"
              className={`px-4 py-2 rounded-xl transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brown)] focus-visible:ring-offset-2 ${
                pathname === "/law_documents"
                  ? "bg-[rgb(var(--brown-rgb)/0.14)] text-slate-900 ring-1 ring-inset ring-[rgb(var(--brown-rgb)/0.22)]"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[rgb(var(--ink-rgb)/0.04)]"
              }`}
            >
              Documents
            </Link>
            <Link
              href="/about_us"
              className={`px-4 py-2 rounded-xl transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brown)] focus-visible:ring-offset-2 ${
                pathname === "/about_us"
                  ? "bg-[rgb(var(--brown-rgb)/0.14)] text-slate-900 ring-1 ring-inset ring-[rgb(var(--brown-rgb)/0.22)]"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[rgb(var(--ink-rgb)/0.04)]"
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
                    variant={pathname === "/profile_page" ? "secondary" : "outline"}
                    size="sm"
                    className="px-5 py-2.5"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </span>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push("/auth/login")}
                      variant={pathname === "/auth/login" ? "secondary" : "outline"}
                      size="sm"
                      className="px-5 py-2.5"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => router.push("/auth/register")}
                      variant="primary"
                      size="sm"
                      className="px-5 py-2.5"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
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
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[var(--border)] mt-2">
            <div className="flex flex-col space-y-1 pt-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl transition-colors font-medium ${
                  pathname === "/"
                    ? "bg-[rgb(var(--brown-rgb)/0.14)] text-slate-900 ring-1 ring-inset ring-[rgb(var(--brown-rgb)/0.22)]"
                    : "text-slate-700 hover:text-slate-900 hover:bg-[rgb(var(--ink-rgb)/0.04)]"
                }`}
              >
                Home
              </Link>
              <Link
                href="/law_video"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl transition-colors font-medium ${
                  pathname === "/law_video"
                    ? "bg-[rgb(var(--brown-rgb)/0.14)] text-slate-900 ring-1 ring-inset ring-[rgb(var(--brown-rgb)/0.22)]"
                    : "text-slate-700 hover:text-slate-900 hover:bg-[rgb(var(--ink-rgb)/0.04)]"
                }`}
              >
                Videos
              </Link>
              <Link
                href="/law_documents"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl transition-colors font-medium ${
                  pathname === "/law_documents"
                    ? "bg-[rgb(var(--brown-rgb)/0.14)] text-slate-900 ring-1 ring-inset ring-[rgb(var(--brown-rgb)/0.22)]"
                    : "text-slate-700 hover:text-slate-900 hover:bg-[rgb(var(--ink-rgb)/0.04)]"
                }`}
              >
                Documents
              </Link>
              <Link
                href="/about_us"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl transition-colors font-medium ${
                  pathname === "/about_us"
                    ? "bg-[rgb(var(--brown-rgb)/0.14)] text-slate-900 ring-1 ring-inset ring-[rgb(var(--brown-rgb)/0.22)]"
                    : "text-slate-700 hover:text-slate-900 hover:bg-[rgb(var(--ink-rgb)/0.04)]"
                }`}
              >
                About Us
              </Link>
              <div className="pt-2 border-t border-[var(--border)] mt-2 space-y-2">
                {!loading && (
                  <>
                    {user ? (
                      <Button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push("/profile_page");
                        }}
                        variant={pathname === "/profile_page" ? "secondary" : "primary"}
                        fullWidth
                        size="sm"
                        className="px-4 py-3"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profile</span>
                        </span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push("/auth/login");
                          }}
                          variant={pathname === "/auth/login" ? "secondary" : "outline"}
                          fullWidth
                          size="sm"
                          className="px-4 py-3"
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
                          size="sm"
                          className="px-4 py-3"
                        >
                          Sign Up
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
