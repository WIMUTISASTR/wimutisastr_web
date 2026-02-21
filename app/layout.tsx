import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/context";
import ToastProvider from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIMUTISASTR Law Office - ការអប់រំច្បាប់កម្ពុជា",
  description: "សិក្សាច្បាប់កម្ពុជាតាមរយៈធនធានអប់រំច្បាប់យ៉ាងគ្រប់ជ្រុងជ្រោយ។ ចូលប្រើវីដេអូ និងឯកសារច្បាប់ពីអ្នកជំនាញអំពីប្រព័ន្ធ និងបទប្បញ្ញត្តិច្បាប់កម្ពុជា។",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km">
      <body className="antialiased">
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
