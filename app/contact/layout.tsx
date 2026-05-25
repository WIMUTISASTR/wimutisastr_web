import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "ទំនាក់ទំនង",
  description:
    "ទាក់ទង WIMUTISASTR Law Office — សំណួរ ការចុះឈ្មោះ ឬជំនួយអំពីធនធានច្បាប់របស់យើង។",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
