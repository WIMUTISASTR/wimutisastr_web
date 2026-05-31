"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";

export default function Footer() {
  const { user, loading } = useAuth();
  return (
    <footer className="border-t-4 border-(--primary) bg-(--primary-dark) px-4 pb-8 pt-14 text-gray-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-3 transition-opacity hover:opacity-90">
              <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
                <Image
                  src="/logo/logo.png"
                  alt="WIMUTISASTR Law Office"
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-white transition-colors group-hover:text-(--accent-light)">
                  WIMUTISASTR
                </p>
                <p className="text-xs font-medium text-gray-400">ការិយាល័យច្បាប់</p>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-300">
              វេទិកាអប់រំច្បាប់ សម្រាប់វីដេអូសិក្សា និងឯកសារច្បាប់ដែលអាចចូលប្រើបានសម្រាប់សាធារណជន។
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">អំពីស្ថាប័ន</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/about_us" className="text-gray-300 transition-colors duration-200 hover:text-white">
                  អំពីយើង
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 transition-colors duration-200 hover:text-white">
                  ទាក់ទងមកយើង
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">ធនធានចម្បង</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/law_video" className="text-gray-300 transition-colors duration-200 hover:text-white">
                  វីដេអូច្បាប់
                </Link>
              </li>
              <li>
                <Link href="/law_documents" className="text-gray-300 transition-colors duration-200 hover:text-white">
                  ឯកសារច្បាប់
                </Link>
              </li>
              <li>
                <Link href="/pricing_page" className="text-gray-300 transition-colors duration-200 hover:text-white">
                  គម្រោងសមាជិក
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">គណនី</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {user ? (
                <>
                  <li>
                    <Link href="/profile_page" className="text-gray-300 transition-colors duration-200 hover:text-white">
                      ប្រវត្តិរូប
                    </Link>
                  </li>
                  <li>
                    <Link href="/law_video" className="text-gray-300 transition-colors duration-200 hover:text-white">
                      វគ្គសិក្សា
                    </Link>
                  </li>
                </>
              ) : loading ? (
                <li className="text-gray-500">...</li>
              ) : (
                <>
                  <li>
                    <Link href="/auth/login" className="text-gray-300 transition-colors duration-200 hover:text-white">
                      ចូលគណនី
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/register" className="text-gray-300 transition-colors duration-200 hover:text-white">
                      ចុះឈ្មោះ
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-center text-xs text-gray-400 sm:text-sm">
          <p>&copy; {new Date().getFullYear()} WIMUTISASTR Law Office — រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
        </div>
      </div>
    </footer>
  );
}
