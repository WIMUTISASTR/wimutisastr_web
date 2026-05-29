import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "ឯកសារច្បាប់",
  description:
    "រុករក និងអានឯកសារច្បាប់ តាមប្រភេទ — សៀវភៅ និងឯកសារពី WIMUTISASTR Law Office។",
  path: "/law_documents",
});

export default function LawDocumentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
