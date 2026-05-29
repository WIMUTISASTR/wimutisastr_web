/** Site-wide SEO constants and URL helpers */

export const SITE_NAME = "WIMUTISASTR Law Office";
export const SITE_NAME_SHORT = "WIMUTISASTR";

export const SITE_DESCRIPTION =
  "សិក្សាច្បាប់តាមរយៈធនធានអប់រំច្បាប់យ៉ាងគ្រប់ជ្រុងជ្រោយ។ ចូលប្រើវីដេអូ និងឯកសារច្បាប់ពីអ្នកជំនាញអំពីប្រព័ន្ធ និងបទប្បញ្ញត្តិច្បាប់។";

export const SITE_KEYWORDS = [
  "ការិយាល័យច្បាប់",
  "ការិយាល័យមេធាវី",
  "សេវាច្បាប់",
  "ពិគ្រោះយោបល់ផ្នែកច្បាប់",
  "មេធាវី",
  "មេធាវីនៅភ្នំពេញ",
  "ច្បាប់",
  "ការអប់រំច្បាប់",
  "មេធាវីច្បាប់",
  "វគ្គសិក្សាច្បាប់",
  "ឯកសារច្បាប់",
  "ជំនួយផ្នែកច្បាប់",
  "ប្រឹក្សាច្បាប់ក្រុមហ៊ុន",
  "ប្រឹក្សាច្បាប់បុគ្គល",
  "WIMUTISASTR",
  "law office Cambodia",
  "law firm Phnom Penh",
  "legal services Cambodia",
  "Cambodian law",
  "legal education Cambodia",
  "law courses Cambodia",
] as const;

export const DEFAULT_OG_IMAGE = "/logo/logo.png";

export const CONTACT_EMAIL = "info@wimutisastr.com";

/** Production fallback when env is unset (e.g. local dev sitemap preview). */
const PRODUCTION_SITE_URL = "https://wimutisastr.com";

/**
 * Canonical site origin (no trailing slash).
 * Set `NEXT_PUBLIC_APP_URL` in production (e.g. https://wimutisastr.com).
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    const withProtocol = /^https?:\/\//i.test(configured)
      ? configured
      : `https://${configured}`;
    return withProtocol.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return PRODUCTION_SITE_URL;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
