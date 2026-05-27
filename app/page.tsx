import HomePageClient from "@/components/home/HomePageClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "ការិយាល័យច្បាប់ និងការអប់រំច្បាប់",
  description:
    "WIMUTISASTR ជាការិយាល័យច្បាប់ និងមជ្ឈមណ្ឌលអប់រំច្បាប់នៅកម្ពុជា ផ្តល់សេវាច្បាប់ ពិគ្រោះយោបល់ផ្នែកច្បាប់ វគ្គវីដេអូ និងឯកសារច្បាប់សម្រាប់សាធារណជន។",
  path: "/",
});

export default function HomePage() {
  return <HomePageClient />;
}
