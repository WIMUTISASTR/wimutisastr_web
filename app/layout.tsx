import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth/context";
import ToastProvider from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { rootMetadata } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = {
  ...rootMetadata,
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#8B6F47",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km">
      <body className="antialiased">
        <OrganizationJsonLd />
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
