/** Short Khmer month names — fixed list so SSR and browser match (no Intl locale drift). */
const KHMER_MONTHS_SHORT = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
] as const;

function parseDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** e.g. "កុម្ភៈ 2025" */
export function formatKhmerMonthYear(value: string | Date | null | undefined): string | null {
  if (value == null || value === "") return null;
  const date = parseDate(value);
  if (!date) return null;
  const month = KHMER_MONTHS_SHORT[date.getUTCMonth()];
  return `${month} ${date.getUTCFullYear()}`;
}

/** e.g. "15 កុម្ភៈ 2025" */
export function formatKhmerShortDate(value: string | Date | null | undefined): string | null {
  if (value == null || value === "") return null;
  const date = parseDate(value);
  if (!date) return null;
  const month = KHMER_MONTHS_SHORT[date.getUTCMonth()];
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}
