import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "អំពីយើង",
  description:
    "ស្គាល់អំពី WIMUTISASTR Law Office — ក្រុមអ្នកជំនាញច្បាប់ បេសកកម្ម និងវិធីសាស្ត្រអប់រំច្បាប់កម្ពុជា។",
  path: "/about_us",
});

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
