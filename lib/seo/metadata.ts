import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_NAME_SHORT,
  absoluteUrl,
  getSiteUrl,
} from "./site";

export type PageMetadataInput = {
  title: string;
  description?: string;
  path?: string;
  /** Relative (/logo/...) or absolute image URL for social previews */
  image?: string | null;
  /** When true, omit from search indexes (auth, payment, profile, etc.) */
  noIndex?: boolean;
  /** Override Open Graph type (default: website) */
  ogType?: "website" | "article";
};

function resolveOgImage(image?: string | null): string {
  if (!image) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return image.startsWith("/") ? image : `/${image}`;
}

/**
 * Build Next.js Metadata for a page, using the site title template from root layout.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const description = input.description ?? SITE_DESCRIPTION;
  const canonicalPath = input.path ?? "/";
  const ogImage = resolveOgImage(input.image);

  const metadata: Metadata = {
    title: input.title,
    description,
    keywords: [...SITE_KEYWORDS],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: input.ogType ?? "website",
      locale: "km_KH",
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      title: input.title,
      description,
      images: [
        {
          url: ogImage,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
  };

  if (input.noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    };
  }

  return metadata;
}

/** Default metadata exported from root `app/layout.tsx` */
export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} - ការអប់រំច្បាប់`,
    template: `%s | ${SITE_NAME_SHORT}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE_NAME_SHORT,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "km_KH",
    url: getSiteUrl(),
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ការអប់រំច្បាប់`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ការអប់រំច្បាប់`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
