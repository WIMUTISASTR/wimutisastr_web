"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookCategory, BookRow } from "@/lib/api/client";

const PAGE_SIZE = 10;

type SortKey = "title" | "category" | "year";
type SortDir = "asc" | "desc";

interface DocumentsTableProps {
  books: BookRow[];
  categories: BookCategory[];
  categoryId: string;
  isApproved: boolean;
}

function SortChevrons({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1.5 inline-flex flex-col gap-px opacity-80">
      <svg
        className={`h-2.5 w-2.5 ${active && dir === "asc" ? "text-(--primary)" : "text-slate-400"}`}
        viewBox="0 0 10 6"
        fill="currentColor"
        aria-hidden
      >
        <path d="M5 0 10 6H0z" />
      </svg>
      <svg
        className={`h-2.5 w-2.5 ${active && dir === "desc" ? "text-(--primary)" : "text-slate-400"}`}
        viewBox="0 0 10 6"
        fill="currentColor"
        aria-hidden
      >
        <path d="M5 6 0 0h10z" />
      </svg>
    </span>
  );
}

function ThButton({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "center";
}) {
  const active = activeKey === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`group inline-flex w-full items-center gap-0.5 text-sm font-semibold tracking-wide text-slate-700 transition-colors hover:text-(--primary) ${
        align === "center" ? "justify-center" : "justify-start"
      } ${active ? "text-(--primary)" : ""}`}
    >
      {label}
      <SortChevrons active={active} dir={dir} />
    </button>
  );
}

export default function DocumentsTable({
  books,
  categories,
  categoryId,
  isApproved,
}: DocumentsTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const getCategoryLines = (docCategoryId: string | null | undefined) => {
    const cat = docCategoryId ? categoryById.get(docCategoryId) : null;
    if (!cat) {
      return { primary: "មិនបានចាត់ប្រភេទ", secondary: "" };
    }
    const parent = cat.parent_id ? categoryById.get(cat.parent_id) : null;
    if (parent) {
      return {
        primary: parent.name ?? "ឯកសារ",
        secondary: cat.name ?? "",
      };
    }
    return {
      primary: cat.name ?? "ឯកសារច្បាប់",
      secondary: cat.description?.trim() ?? "",
    };
  };

  useEffect(() => {
    setPage(1);
  }, [books.length]);

  const sortedBooks = useMemo(() => {
    const list = [...books];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") {
        cmp = (a.title ?? "").localeCompare(b.title ?? "", "km");
      } else if (sortKey === "category") {
        const aCat = getCategoryLines(a.category_id).primary;
        const bCat = getCategoryLines(b.category_id).primary;
        cmp = aCat.localeCompare(bCat, "km");
      } else {
        cmp = (a.year ?? 0) - (b.year ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [books, sortKey, sortDir, categoryById]);

  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageBooks = sortedBooks.slice(startIdx, startIdx + PAGE_SIZE);
  const startItem = sortedBooks.length === 0 ? 0 : startIdx + 1;
  const endItem = Math.min(safePage * PAGE_SIZE, sortedBooks.length);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleOpen = (doc: BookRow) => {
    const isLocked = !isApproved && doc.access_level !== "free";
    router.push(isLocked ? "/pricing_page" : `/law_documents/${categoryId}/read/${doc.id}`);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (safePage <= 3) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (safePage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages);
    }
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200/90 bg-white">
      {/* Table meta bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/90 px-5 py-3.5 sm:px-6">
        <div>
          <p className="text-base font-semibold text-slate-800">បញ្ជីឯកសារ</p>
        </div>
        <p className="text-sm text-slate-500">
          ទំព័រ {safePage} / {totalPages}
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[780px] table-fixed border-collapse text-base">
          <colgroup>
            <col className="w-[45%]" />
            <col className="w-[28%]" />
            <col className="w-[5.5rem]" />
            <col className="w-[6.5rem]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="px-5 py-3.5 pr-3 text-left sm:px-6 sm:pr-4">
                <ThButton label="ចំណងជើង" sortKey="title" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
              <th className="hidden py-3.5 pl-2 pr-4 text-left md:table-cell sm:pl-3">
                <ThButton label="ការពិពណ៌នា" sortKey="category" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              </th>
              <th className="px-3 py-3.5 text-center sm:px-4">
                <ThButton label="ឆ្នាំ" sortKey="year" activeKey={sortKey} dir={sortDir} onSort={toggleSort} align="center" />
              </th>
              <th className="px-5 py-3.5 text-center sm:px-6">
                <span className="text-sm font-semibold tracking-wide text-slate-700">អាន</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageBooks.map((doc, idx) => {
              const { primary, secondary } = getCategoryLines(doc.category_id);
              const isLocked = !isApproved && doc.access_level !== "free";
              const isFree = doc.access_level === "free";

              return (
                <tr
                  key={doc.id}
                  className={`group border-b border-slate-100 last:border-0 transition-colors ${
                    idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                  } hover:bg-[rgba(45,76,94,0.04)]`}
                >
                  <td className="px-5 py-4 pr-3 align-middle sm:px-6 sm:pr-4">
                    <button
                      type="button"
                      onClick={() => handleOpen(doc)}
                      className="block w-full text-left"
                    >
                      <span className="text-base font-medium text-slate-900 leading-snug group-hover:text-(--primary) transition-colors line-clamp-2">
                        {doc.title}
                      </span>
                      {doc.author ? (
                        <span className="mt-1.5 block text-sm text-slate-500">{doc.author}</span>
                      ) : null}
                      <span className="md:hidden mt-2 block text-sm text-slate-500 leading-relaxed">
                        <span className="font-medium text-slate-700">{primary}</span>
                        {secondary ? <span className="block mt-0.5">{secondary}</span> : null}
                        {Number.isFinite(doc.year) ? (
                          <span className="mt-1 block tabular-nums text-slate-600">ឆ្នាំ {doc.year}</span>
                        ) : null}
                      </span>
                    </button>
                  </td>
                  <td className="hidden py-4 pl-2 pr-4 align-middle md:table-cell sm:pl-3">
                    <div className="text-base font-medium text-slate-800 leading-snug">{primary}</div>
                    {secondary ? (
                      <div className="text-sm text-slate-500 mt-1 leading-relaxed">{secondary}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-4 align-middle text-center tabular-nums text-base text-slate-700 sm:px-4">
                    {Number.isFinite(doc.year) ? doc.year : "—"}
                  </td>
                  <td className="px-5 py-4 align-middle text-center sm:px-6">
                    <button
                      type="button"
                      onClick={() => handleOpen(doc)}
                      title={isLocked ? "ត្រូវការសមាជិកភាព" : "អានឯកសារ"}
                      aria-label={isLocked ? "ត្រូវការសមាជិកភាព" : "អានឯកសារ"}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-all ${
                        isLocked
                          ? "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100"
                          : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-(--primary) hover:bg-(--primary) hover:text-white hover:shadow-md"
                      }`}
                    >
                      {isLocked ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedBooks.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-600">
            បង្ហាញ{" "}
            <span className="font-semibold text-slate-900">{startItem}</span>
            {" "}ដល់{" "}
            <span className="font-semibold text-slate-900">{endItem}</span>
            {" "}ក្នុងចំណោម{" "}
            <span className="font-semibold text-slate-900">{sortedBooks.length}</span>
            {" "}ឯកសារ
          </p>

          {totalPages > 1 && (
            <nav className="flex flex-wrap items-center justify-center gap-1 sm:justify-end" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                មុន
              </button>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="px-2 py-2 text-sm text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-9 rounded-lg border px-2.5 py-2 text-sm font-medium transition ${
                      p === safePage
                        ? "border-(--primary) bg-(--primary) text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                បន្ទាប់
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
