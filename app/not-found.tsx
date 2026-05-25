import type { Metadata } from "next";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import { Footer } from "@/components/home";

export const metadata: Metadata = {
  title: "មិនរកឃើញទំព័រ | WIMUTISASTR Law Office",
  description:
    "ទំព័រដែលអ្នកស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ទី។ ត្រឡប់ទៅទំព័រដើម ឬរុករកធនធានច្បាប់របស់យើង។",
};

const quickLinks = [
  { href: "/law_video", label: "វីដេអូច្បាប់" },
  { href: "/law_documents", label: "ឯកសារច្បាប់" },
  { href: "/about_us", label: "អំពីយើង" },
  { href: "/contact", label: "ទំនាក់ទំនង" },
] as const;

export default function NotFound() {
  return (
    <PageContainer>
      <main className="relative flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-(--accent)/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 rounded-full bg-(--primary)/10 blur-3xl" />
        </div>

        <div className="w-full max-w-2xl text-center">
          <p className="text-7xl font-bold tracking-tight text-(--primary) sm:text-8xl">
            404
          </p>

          <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-(--gray-100) ring-1 ring-(--border)">
            <svg
              className="h-10 w-10 text-(--primary)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-(--ink) sm:text-4xl">
            មិនរកឃើញទំព័រ
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-(--gray-700) sm:text-lg">
            ទំព័រដែលអ្នកស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ទី។ សូមពិនិត្យ URL
            ម្តងទៀត ឬត្រឡប់ទៅទំព័រដើមដើម្បីបន្តស្វែងរកធនធានច្បាប់។
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-(--primary) px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-(--primary-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 sm:w-auto"
            >
              ត្រឡប់ទៅទំព័រដើម
            </Link>
            <Link
              href="/law_documents"
              className="inline-flex w-full items-center justify-center rounded-md border border-(--gray-300) bg-white px-8 py-3 text-sm font-semibold text-(--ink) shadow-sm transition-colors duration-200 hover:border-(--primary) hover:text-(--primary) hover:bg-(--gray-50) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 sm:w-auto"
            >
              រុករកឯកសារ
            </Link>
          </div>

          <nav
            className="mt-12 rounded-xl border border-(--border) bg-white p-6 shadow-md"
            aria-label="តំណភ្ជាប់រហ័ស"
          >
            <p className="text-sm font-semibold text-(--ink)">
              តំណភ្ជាប់ដែលអាចជួយបាន
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-md px-4 py-2 text-sm font-medium text-(--gray-700) transition-colors duration-200 hover:bg-(--gray-100) hover:text-(--primary)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>

      <Footer />
    </PageContainer>
  );
}
