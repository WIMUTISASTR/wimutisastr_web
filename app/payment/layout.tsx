import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "ការទូទាត់",
  description: "ទំព័រទូទាត់ WIMUTISASTR",
  path: "/payment",
  noIndex: true,
});

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
