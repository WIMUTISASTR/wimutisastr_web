import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "វីដេអូច្បាប់",
  description:
    "មើលវគ្គវីដេអូច្បាប់ — រៀនពីអ្នកជំនាញ WIMUTISASTR Law Office។",
  path: "/law_video",
});

export default function LawVideoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
