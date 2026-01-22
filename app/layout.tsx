import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/context";
import ToastProvider from "@/compounents/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIMUTISASTR Law Office - Cambodian Law Education",
  description: "Master Cambodian law through comprehensive legal education resources. Access expert videos and documents on Cambodian legal system and regulations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
