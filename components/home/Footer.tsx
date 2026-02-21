"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-(--primary-dark) text-gray-200 pt-12 pb-6 px-4 sm:px-6 lg:px-8 border-t-4 border-(--primary)">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">WIMUTISASTR</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              វេទិកាអប់រំច្បាប់កម្ពុជា សម្រាប់វីដេអូសិក្សា និងឯកសារច្បាប់ដែលអាចចូលប្រើបានសម្រាប់សាធារណជន។
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">អំពីស្ថាប័ន</h3>
            <div className="space-y-2 text-sm">
              <Link href="/about_us" className="block text-gray-300 hover:text-white transition-colors">
                អំពីយើង
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">
                ទំនាក់ទំនង
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">ធនធានចម្បង</h3>
            <div className="space-y-3">
              <Link href="/law_video" className="block text-gray-300 hover:text-white transition-colors text-sm">
                វីដេអូច្បាប់
              </Link>
              <Link href="/law_documents" className="block text-gray-300 hover:text-white transition-colors text-sm">
                ឯកសារច្បាប់
              </Link>
              <Link href="/pricing_page" className="block text-gray-300 hover:text-white transition-colors text-sm">
                គម្រោងសមាជិកភាព
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">គណនី</h3>
            <div className="space-y-2 text-sm">
              <Link href="/auth/login" className="block text-gray-300 hover:text-white transition-colors">
                ចូលគណនី
              </Link>
              <Link href="/auth/register" className="block text-gray-300 hover:text-white transition-colors">
                ចុះឈ្មោះ
              </Link>
              <Link href="/profile_page" className="block text-gray-300 hover:text-white transition-colors">
                ប្រវត្តិរូប
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 pt-5 text-center text-xs sm:text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} WIMUTISASTR Law Office — រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
        </div>
      </div>
    </footer>
  );
}
