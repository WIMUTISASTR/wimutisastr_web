const STORAGE_KEY = "law-doc-reading-progress";

function readStore(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, number>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function getReadingPage(bookId: string): number | null {
  const page = readStore()[bookId];
  return typeof page === "number" && page >= 1 ? page : null;
}

export function saveReadingPage(bookId: string, page: number) {
  if (typeof window === "undefined" || !bookId || page < 1) return;
  try {
    const store = readStore();
    store[bookId] = page;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota / privacy errors
  }
}
