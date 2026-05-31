import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "ប្រវត្តិរូប",
  description: "គ្រប់គ្រងប្រវត្តិរូប និងសមាជិក WIMUTISASTR",
  path: "/profile_page",
  noIndex: true,
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
