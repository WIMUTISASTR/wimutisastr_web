import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "តម្លៃ និងសមាជិកភាព",
  description:
    "មើលគម្រោងសមាជិកភាព WIMUTISASTR — ចូលប្រើវីដេអូ និងឯកសារច្បាប់ពេញលេញពីអ្នកជំនាញ។",
  path: "/pricing_page",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
