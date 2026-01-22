"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-white font-bold text-xl mb-6">About Us</h3>
            <Link href="/about_us" className="text-gray-400 hover:text-white transition-colors block mb-2">
              Learn More
            </Link>
          </div>
          <div>
            <h3 className="text-white font-bold text-xl mb-6">Resources</h3>
            <div className="space-y-3">
              <Link href="/law_video" className="block text-gray-400 hover:text-white transition-colors">
                Legal Videos
              </Link>
              <Link href="/law_documents" className="block text-gray-400 hover:text-white transition-colors">
                Legal Documents
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-xl mb-6">Account</h3>
            <div className="space-y-3">
              <Link href="/auth/login" className="block text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="block text-gray-400 hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Cambodian Law Education Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
