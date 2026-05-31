import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "វគ្គបណ្តុះបណ្តាល",
  description:
    "វគ្គបណ្តុះបណ្តាល សម្រាប់អនុវត្តចំណេះដឹងច្បាប់ និងទទួលបានការណែនាំពីអ្នកជំនាញនៅ WIMUTISASTR។",
  path: "/training_program",
});

export default function TrainingProgramLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
