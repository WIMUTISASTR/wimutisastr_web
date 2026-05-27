import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "អំពីការិយាល័យច្បាប់ WIMUTISASTR",
  description:
    "ស្គាល់អំពីការិយាល័យច្បាប់ WIMUTISASTR នៅកម្ពុជា — ក្រុមមេធាវី បេសកកម្ម សេវាច្បាប់ និងវិធីសាស្ត្រអប់រំច្បាប់សម្រាប់សាធារណជន។",
  path: "/about_us",
});

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
