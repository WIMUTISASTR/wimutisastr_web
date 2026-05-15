import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "វគ្គបណ្តុុះបណ្តាល | WIMUTISASTR Law Office",
  description:
    "វគ្គបណ្តុុះបណ្តាល សម្រាប់អនុវត្តចំណេះដឹងច្បាប់ និងទទួលបានការណែនាំពីអ្នកជំនាញនៅ WIMUTISASTR។",
};

export default function VoccheBancheBanchalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
