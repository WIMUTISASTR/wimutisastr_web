"use client";

import Link from "next/link";
import type { HomeResponse } from "@/lib/api/client";

interface FeaturedDocumentsSectionProps {
  home: HomeResponse | null;
  hasPaid: boolean;
  isLoading?: boolean;
}

function DocumentCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-xl border border-(--gray-200) bg-white shadow-sm animate-pulse">
      <div className="h-16 border-b border-(--gray-100) bg-(--gray-100)" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-4/5 rounded bg-(--gray-200)" />
        <div className="h-4 w-1/2 rounded bg-(--gray-100)" />
        <div className="h-4 w-full rounded bg-(--gray-100)" />
      </div>
    </li>
  );
}

function DocumentIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export default function FeaturedDocumentsSection({ home, hasPaid, isLoading = false }: FeaturedDocumentsSectionProps) {
  const books = home?.featuredBooks ?? [];
  const libraryHref = hasPaid ? "/law_documents" : "/pricing_page";
  const showSkeleton = isLoading && books.length === 0;

  return (
    <section className="relative overflow-hidden bg-(--gray-100) py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-1/3 h-72 w-72 rounded-full bg-(--primary) opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-(--accent) opacity-[0.06] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="scroll-animate flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">ឯកសារសំខាន់ៗ</h2>
            <p className="mt-3 text-base leading-relaxed text-(--gray-700) sm:text-lg">
              ឯកសារច្បាប់ ព្រះរាជក្រម និងឯកសារយោងដែលជ្រើសរើសសម្រាប់ការសិក្សា
            </p>
          </div>
          {books.length > 0 ? (
            <Link
              href={libraryHref}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-(--primary) underline-offset-4 transition-colors hover:text-(--primary-dark) hover:underline"
            >
              {hasPaid ? "មើលឯកសារទាំងអស់" : "មើលគម្រោងសមាជិក"}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : null}
        </div>

        {showSkeleton ? (
          <ul className="scroll-animate mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </ul>
        ) : books.length === 0 ? (
          <div className="scroll-animate mt-10 rounded-2xl border border-(--gray-200) bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
              <DocumentIcon />
            </div>
            <p className="mt-4 text-(--gray-700)">មិនទាន់មានឯកសារណែនាំនៅពេលនេះទេ។</p>
            <Link
              href={libraryHref}
              className="mt-4 inline-flex text-sm font-semibold text-(--primary) underline-offset-4 transition-colors hover:underline"
            >
              {hasPaid ? "រកមើលឯកសារច្បាប់" : "មើលគម្រោងសមាជិក"}
            </Link>
          </div>
        ) : (
          <div className="scroll-animate mt-10 space-y-8">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => {
                const desc =
                  book.description?.trim() ||
                  "ឯកសារច្បាប់ដែលបានជ្រើសរើសសម្រាប់ការសិក្សា និងយោងប្រចាំថ្ងៃ។";
                return (
                  <li key={book.id}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-(--gray-200) bg-white shadow-sm transition-all duration-200 hover:border-(--primary)/25 hover:shadow-md">
                      <div className="flex items-center justify-between gap-3 border-b border-(--gray-100) bg-linear-to-br from-(--primary)/8 via-white to-(--accent)/5 px-5 py-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary) transition-colors group-hover:bg-(--primary)/15">
                          <DocumentIcon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full border border-(--primary)/15 bg-(--primary)/5 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-(--primary)">
                          {book.year}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-(--ink) transition-colors group-hover:text-(--primary) sm:text-lg">
                          {book.title}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-(--gray-700)">{book.author}</p>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-(--gray-700) line-clamp-3">{desc}</p>
                        <Link
                          href={libraryHref}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary) transition-colors hover:text-(--primary-dark)"
                        >
                          {hasPaid ? "ចូលប្រើឯកសារ" : "ចូលមើល"}
                          <svg
                            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>            
          </div>
        )}
      </div>
    </section>
  );
}
