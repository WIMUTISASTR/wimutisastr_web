import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "គណនី",
  description: "ចូល ឬចុះឈ្មោះគណនី WIMUTISASTR",
  path: "/auth",
  noIndex: true,
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
