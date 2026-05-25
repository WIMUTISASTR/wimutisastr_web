import HomePageClient from "@/components/home/HomePageClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "ទំព័រដើម",
  description:
    "រៀនច្បាប់កម្ពុជាតាមរយៈវីដេអូ និងឯកសារពីអ្នកជំនាញ — WIMUTISASTR Law Office។",
  path: "/",
});

export default function HomePage() {
  return <HomePageClient />;
}
