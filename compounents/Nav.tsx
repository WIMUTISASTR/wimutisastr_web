"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
              <Image
                src="/logo/image.png"
                alt="WIMUTISASTR LAW OFFICE Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                WIMUTISASTR
              </h1>
              <p className="text-xs text-gray-600">Law Office</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/law_video"
              className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
            >
              Videos
            </Link>
            <Link
              href="/law_documents"
              className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
            >
              Documents
            </Link>
            <Link
              href="/about_us"
              className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
            >
              About Us
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/auth/login"
              className={`px-6 py-2 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg ${
                pathname === "/auth/login"
                  ? "bg-amber-700 text-white"
                  : "text-black "
              }`}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className={`px-6 py-2 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg ${
                pathname === "/auth/register"
                  ? "bg-amber-700 text-white"
                  : " text-black"
              }`}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2">
            <div className="flex flex-col space-y-1 pt-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/law_video"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
              >
                Videos
              </Link>
              <Link
                href="/law_documents"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
              >
                Documents
              </Link>
              <Link
                href="/about_us"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
              >
                About Us
              </Link>
              <div className="pt-2 border-t border-gray-200 mt-2 space-y-1">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors font-medium text-center ${
                    pathname === "/auth/login"
                      ? "bg-amber-700 text-white"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors font-medium text-center ${
                    pathname === "/auth/register"
                      ? "bg-amber-700 text-white"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
