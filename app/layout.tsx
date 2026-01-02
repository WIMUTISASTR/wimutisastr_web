import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import ToastProvider from "@/compounents/ToastProvider";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
      <body
        className={`${playfairDisplay.variable} ${lora.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
