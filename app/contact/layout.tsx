import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "ទំនាក់ទំនងការិយាល័យច្បាប់",
  description:
    "ទាក់ទងការិយាល័យមេធាវី WIMUTISASTR សម្រាប់សេវាច្បាប់ និងពិគ្រោះយោបល់ផ្នែកច្បាប់នៅកម្ពុជា។ សូមផ្ញើសំណួរ ឬស្នើជំនួយបានគ្រប់ពេល។",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
