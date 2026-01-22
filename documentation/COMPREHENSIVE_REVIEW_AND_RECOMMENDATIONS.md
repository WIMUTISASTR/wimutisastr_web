# Comprehensive Code Review & Recommendations
## WIMUTISASTR Law Office Web Application

**Review Date:** January 22, 2026  
**Reviewer:** Senior Full-Stack Security & Performance Analyst  
**Scope:** Security, Performance Optimization, and SEO

---

## Executive Summary

This is a **well-architected Next.js application** with several strong security measures already in place. However, there are critical improvements needed across security, performance, and SEO domains to meet production-grade standards for a legal education platform handling sensitive user data and paid memberships.

**Overall Rating:**
- 🟢 **Security:** 7/10 (Good foundation, needs hardening)
- 🟡 **Performance:** 6/10 (Moderate optimization needed)
- 🔴 **SEO:** 3/10 (Critical improvements required)

---

## 🔐 SECURITY AUDIT

### CRITICAL ISSUES

#### 1. **Environment Variable Exposure Risk**
**Severity:** 🔴 CRITICAL  
**Location:** Multiple files using `process.env.NEXT_PUBLIC_*`

**Issue:**
```typescript
// middleware.ts, multiple API routes
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
```

**Problem:** While these are "public" keys, the non-assertive usage with `!` can cause runtime errors if undefined. Additionally, you're using `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` which is a non-standard name.

**Recommendation:**
```typescript
// Create lib/env.ts for centralized validation
const REQUIRED_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

export function validateEnv() {
  const missing = Object.entries(REQUIRED_ENV)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return REQUIRED_ENV;
}

// Use at app startup
const env = validateEnv();
```

#### 2. **Debug Console Logs in Production**
**Severity:** 🟡 MEDIUM  
**Location:** `lib/api-client.ts:203`

**Issue:**
```typescript
// eslint-disable-next-line no-console
console.log("books-public debug:", data.debug);
```

**Problem:** Debug information can leak sensitive data in production.

**Recommendation:**
```typescript
// Create lib/logger.ts
export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, consider using a service like Sentry
    console.error(...args);
  }
};

// Usage
logger.debug("books-public debug:", data.debug);
```

#### 3. **Insufficient Rate Limiting Implementation**
**Severity:** 🟡 MEDIUM  
**Location:** `lib/rate-limit.ts`

**Issue:** In-memory rate limiting won't work in production with multiple instances/edge functions.

**Problem:**
```typescript
// Current implementation uses Map() - loses data on restart
const requestCounts = new Map<string, { count: number; resetAt: number }>();
```

**Recommendation:**
```typescript
// Use Upstash Redis for distributed rate limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "wimutisastr",
});

// Usage in API routes
const { success, limit, remaining, reset } = await ratelimit.limit(
  `api:${clientIP}`
);
```

**Install:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

#### 4. **Missing CSRF Protection**
**Severity:** 🟡 MEDIUM  
**Location:** All form submissions

**Issue:** No CSRF tokens on state-changing operations.

**Recommendation:**
```typescript
// middleware.ts - Add CSRF token generation
import { createHash } from 'crypto';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Generate CSRF token for session
  const csrfToken = createHash('sha256')
    .update(`${session?.user?.id}-${Date.now()}`)
    .digest('hex');
  
  response.cookies.set('csrf-token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  return response;
}

// API routes - Verify CSRF
export async function POST(request: NextRequest) {
  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies.get('csrf-token')?.value;
  
  if (csrfHeader !== csrfCookie) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
  // ... rest of handler
}
```

#### 5. **Weak File Upload Validation**
**Severity:** 🔴 CRITICAL  
**Location:** `app/api/payment/upload-proof/route.ts`

**Issue:**
```typescript
// Only checks MIME type from client (easily spoofed)
if (!file.type.startsWith('image/')) {
  return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
}
```

**Recommendation:**
```typescript
import { fileTypeFromBuffer } from 'file-type';

// Validate actual file content, not just MIME type
const buffer = Buffer.from(await file.arrayBuffer());
const fileType = await fileTypeFromBuffer(buffer);

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (!fileType || !ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
  return NextResponse.json(
    { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
    { status: 400 }
  );
}

// Additional: Scan for malware using ClamAV or similar
// const scanResult = await scanFile(buffer);
```

#### 6. **Token Expiration Issues**
**Severity:** 🟡 MEDIUM  
**Location:** `lib/content-token.ts`, `lib/video-token.ts`

**Issue:** Hardcoded or missing token expiration policies.

**Recommendation:**
```typescript
// Add configurable expiration
export const TOKEN_EXPIRY = {
  BOOK_VIEW: 60 * 60, // 1 hour
  VIDEO_PLAY: 60 * 60 * 4, // 4 hours
  STORAGE: 60 * 15, // 15 minutes
} as const;

export function signContentToken(payload: Omit<ContentViewTokenPayload, 'exp'>): string {
  const fullPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY.BOOK_VIEW,
  };
  // ... rest of implementation
}
```

### HIGH PRIORITY ISSUES

#### 7. **Missing Security Headers in Next.js Config**
**Severity:** 🟡 MEDIUM  
**Location:** `next.config.ts`

**Current State:** Good headers present, but missing some important ones.

**Add:**
```typescript
headers: [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // ADD THESE:
  {
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none',
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'require-corp',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
  // Update CSP to be stricter
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'nonce-{NONCE}' 'strict-dynamic'", // Use nonces
      "style-src 'self' 'nonce-{NONCE}'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.r2.dev",
      "media-src 'self' https://*.r2.dev blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
]
```

#### 8. **Session Fixation Vulnerability**
**Severity:** 🟡 MEDIUM  
**Location:** `lib/auth-context.tsx`

**Issue:** No session regeneration on login/logout.

**Recommendation:**
```typescript
const signOut = async () => {
  await supabase.auth.signOut();
  
  // Clear all local storage
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }
  
  setUser(null);
  setSession(null);
  
  // Force router refresh to clear any cached data
  router.push("/auth/login");
  router.refresh();
};
```

#### 9. **Insufficient Input Validation**
**Severity:** 🟡 MEDIUM  
**Location:** Multiple API routes

**Current:** Zod validation exists but not consistently applied.

**Recommendation:**
```typescript
// Create middleware for automatic validation
// lib/validate-middleware.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (req: NextRequest, validated: z.infer<T>) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return handler(req, validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  };
}

// Usage
export const POST = withValidation(
  z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  async (req, { email, password }) => {
    // Handler with validated data
  }
);
```

#### 10. **Missing Request Sanitization**
**Severity:** 🟡 MEDIUM

**Recommendation:**
```typescript
// lib/sanitize.ts
import xss from 'xss';

export function sanitizeInput(input: string): string {
  return xss(input, {
    whiteList: {}, // No HTML allowed
    stripIgnoreTag: true,
  });
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  }
  return sanitized;
}

// Install
npm install xss
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### CRITICAL ISSUES

#### 1. **Missing Image Optimization**
**Severity:** 🔴 CRITICAL  
**Location:** Throughout the app

**Issues:**
- No `priority` on above-fold images
- No responsive image sizing
- Missing `loading="lazy"` on below-fold images
- No image format optimization

**Recommendations:**

```tsx
// app/page.tsx - Hero section
<Image
  src="/logo/logo.png"
  alt="WIMUTISASTR Law Office"
  width={500}
  height={500}
  priority // This is above the fold!
  quality={90}
/>

// Below-fold images
<Image
  src={bookCover}
  alt={book.title}
  width={300}
  height={400}
  loading="lazy"
  quality={75}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

#### 2. **No Code Splitting**
**Severity:** 🟡 MEDIUM  
**Location:** Component imports

**Issue:** Large components loaded immediately.

**Recommendation:**
```tsx
// app/page.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const FeaturedCoursesSection = dynamic(
  () => import('@/compounents/home/FeaturedCoursesSection'),
  { loading: () => <div>Loading...</div> }
);

const TestimonialsSection = dynamic(
  () => import('@/compounents/home/TestimonialsSection')
);
```

#### 3. **Inefficient Data Fetching**
**Severity:** 🟡 MEDIUM  
**Location:** `app/page.tsx`, category pages

**Issue:** Sequential API calls, no caching strategy.

**Current:**
```tsx
useEffect(() => {
  const load = async () => {
    const data = await fetchHome();
    setHome(data);
  };
  load();
}, []);
```

**Recommendation:**
```tsx
// Use Next.js App Router features
// Convert to Server Component
export default async function Home() {
  // This runs on the server, cached by Next.js
  const data = await fetch('/api/home', {
    next: { revalidate: 300 } // Revalidate every 5 minutes
  }).then(res => res.json());
  
  return <HomeClient data={data} />;
}
```

Or with React Server Components:
```tsx
// app/page.tsx
import { fetchHomeData } from '@/lib/server-actions';

export default async function Home() {
  const data = await fetchHomeData();
  return <HomePage data={data} />;
}

// lib/server-actions.ts
'use server';
import { unstable_cache } from 'next/cache';

export const fetchHomeData = unstable_cache(
  async () => {
    // Fetch data here
  },
  ['home-data'],
  { revalidate: 300 } // 5 minutes
);
```

#### 4. **No Database Query Optimization**
**Severity:** 🟡 MEDIUM  
**Location:** API routes

**Issue:** N+1 queries, missing indexes.

**Recommendation:**
```typescript
// app/api/home/route.ts
// BAD: Multiple queries
const categories = await supabase.from('video_categories').select('*');
for (const cat of categories) {
  const videos = await supabase.from('videos').select('*').eq('category_id', cat.id);
}

// GOOD: Single query with join
const { data, error } = await supabase
  .from('video_categories')
  .select(`
    *,
    videos:videos(count)
  `)
  .order('created_at', { ascending: false });

// Add database indexes
CREATE INDEX idx_videos_category_id ON videos(category_id);
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_payment_proofs_user_id_status ON payment_proofs(user_id, status);
CREATE INDEX idx_user_profiles_membership_status ON user_profiles(membership_status);
```

#### 5. **Excessive Re-renders**
**Severity:** 🟡 MEDIUM  
**Location:** `app/page.tsx`

**Issue:**
```tsx
// Multiple useEffects causing re-renders
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: ..., y: ... }); // Triggers re-render on every mouse move!
  };
  window.addEventListener("mousemove", handleMouseMove);
}, []);
```

**Recommendation:**
```tsx
// Throttle mouse events
import { useCallback, useRef } from 'react';

const throttledMouseMove = useCallback(
  throttle((e: MouseEvent) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  }, 100), // Update max once per 100ms
  []
);

// Helper function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    }
  };
}
```

#### 6. **Missing Bundle Analysis**
**Severity:** 🟡 MEDIUM

**Recommendation:**
```bash
npm install -D @next/bundle-analyzer

# next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

#### 7. **No Resource Hints**
**Severity:** 🟢 LOW  
**Location:** `app/layout.tsx`

**Recommendation:**
```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://YOUR_SUPABASE_PROJECT.supabase.co" />
        <link rel="dns-prefetch" href="https://YOUR_R2_BUCKET.r2.dev" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
```

### HIGH PRIORITY

#### 8. **Implement Service Worker for Offline Support**

```typescript
// public/sw.js
const CACHE_NAME = 'wimutisastr-v1';
const urlsToCache = [
  '/',
  '/logo/logo.png',
  '/asset/document_background.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

#### 9. **Add Compression**

```typescript
// next.config.ts
export default {
  compress: true, // Already enabled ✅
  
  // Add additional compression for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
        ],
      },
    ];
  },
};
```

---

## 🔍 SEO OPTIMIZATION

### CRITICAL ISSUES

#### 1. **Missing robots.txt**
**Severity:** 🔴 CRITICAL

**Create:**
```txt
# public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /profile_page
Disallow: /payment/

Sitemap: https://wimutisastr.com/sitemap.xml
```

#### 2. **Missing Sitemap**
**Severity:** 🔴 CRITICAL

**Create:**
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wimutisastr.com';
  
  // Fetch dynamic routes
  const categories = await fetchCategories();
  const books = await fetchBooks();
  const videos = await fetchVideoCategories();
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about_us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/law_documents`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/law_video`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing_page`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Dynamic category pages
    ...categories.map((cat) => ({
      url: `${baseUrl}/law_documents/${cat.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    // Add more dynamic routes...
  ];
}
```

#### 3. **Poor Metadata**
**Severity:** 🔴 CRITICAL  
**Location:** Most pages lack proper metadata

**Current:**
```tsx
// app/layout.tsx - Only basic metadata
export const metadata: Metadata = {
  title: "WIMUTISASTR Law Office - Cambodian Law Education",
  description: "Master Cambodian law...",
};
```

**Recommendation:**
```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#8B6F47',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://wimutisastr.com'),
  title: {
    default: 'WIMUTISASTR Law Office - Expert Cambodian Law Education',
    template: '%s | WIMUTISASTR Law Office',
  },
  description: 'Master Cambodian law through comprehensive legal education resources. Access expert videos, documents, and courses on Cambodian legal system, regulations, and civil procedure.',
  keywords: [
    'Cambodian law',
    'legal education',
    'law office Cambodia',
    'legal training',
    'law courses',
    'legal documents',
    'WIMUTISASTR',
    'civil procedure',
    'criminal law Cambodia',
  ],
  authors: [{ name: 'WIMUTISASTR Law Office' }],
  creator: 'WIMUTISASTR Law Office',
  publisher: 'WIMUTISASTR Law Office',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['km_KH'], // Khmer locale
    url: 'https://wimutisastr.com',
    siteName: 'WIMUTISASTR Law Office',
    title: 'WIMUTISASTR Law Office - Expert Cambodian Law Education',
    description: 'Comprehensive legal education platform for Cambodian law',
    images: [
      {
        url: '/logo/logo.png',
        width: 1200,
        height: 630,
        alt: 'WIMUTISASTR Law Office',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'WIMUTISASTR Law Office - Cambodian Law Education',
    description: 'Master Cambodian law through expert education resources',
    images: ['/logo/logo.png'],
    creator: '@wimutisastr', // Add your Twitter handle
  },
  
  // Verification
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    // yandex: 'YOUR_YANDEX_CODE',
    // yahoo: 'YOUR_YAHOO_CODE',
  },
  
  // Icons
  icons: {
    icon: '/logo/logo.png',
    apple: '/logo/logo.png',
  },
  
  // Manifest
  manifest: '/manifest.json',
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

#### 4. **Individual Page Metadata**

```tsx
// app/law_documents/[categoryId]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { categoryId: string } }): Promise<Metadata> {
  const category = await fetchCategory(params.categoryId);
  
  return {
    title: `${category.name} - Legal Documents`,
    description: category.description || `Browse ${category.name} legal documents and resources`,
    openGraph: {
      title: `${category.name} - Legal Documents`,
      description: category.description,
      images: [category.cover_url || '/default-og-image.png'],
    },
  };
}
```

#### 5. **Missing Structured Data (JSON-LD)**
**Severity:** 🔴 CRITICAL

**Recommendation:**
```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'WIMUTISASTR Law Office',
    description: 'Expert Cambodian Law Education Platform',
    url: 'https://wimutisastr.com',
    logo: 'https://wimutisastr.com/logo/logo.png',
    sameAs: [
      'https://facebook.com/wimutisastr', // Add your social media
      'https://twitter.com/wimutisastr',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KH',
      addressLocality: 'Phnom Penh', // Update with actual address
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@wimutisastr.com', // Update
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

// For course pages - Add Course schema
const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: videoCategory.name,
  description: videoCategory.description,
  provider: {
    '@type': 'Organization',
    name: 'WIMUTISASTR Law Office',
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    courseWorkload: 'PT10H', // Example: 10 hours
  },
};
```

#### 6. **Missing Canonical URLs**
**Severity:** 🟡 MEDIUM

```tsx
// Each page should have canonical URL
export const metadata: Metadata = {
  alternates: {
    canonical: '/law_documents/category-id',
  },
};
```

#### 7. **No Language Tags**
**Severity:** 🟡 MEDIUM

```tsx
// app/layout.tsx
<html lang="en">
  <head>
    <link rel="alternate" hrefLang="en" href="https://wimutisastr.com" />
    <link rel="alternate" hrefLang="km" href="https://wimutisastr.com/km" />
    <link rel="alternate" hrefLang="x-default" href="https://wimutisastr.com" />
  </head>
  {/* ... */}
</html>
```

#### 8. **Missing Breadcrumbs**
**Severity:** 🟡 MEDIUM

```tsx
// compounents/Breadcrumbs.tsx
export function Breadcrumbs({ items }: { items: Array<{ label: string; href: string }> }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://wimutisastr.com${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={item.href}>
              {index < items.length - 1 ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

#### 9. **Poor URL Structure**
**Severity:** 🟢 LOW

**Current:** `/law_documents/[categoryId]` - Good!  
**Improvement:** Consider more descriptive slugs

```
/law-education/civil-procedure (instead of /law_documents/uuid)
/video-courses/criminal-law (instead of /law_video/uuid)
```

---

## 📊 MONITORING & ANALYTICS

### Add Performance Monitoring

```typescript
// lib/analytics.ts
export function reportWebVitals(metric: any) {
  // Send to analytics service
  const body = JSON.stringify(metric);
  const url = '/api/analytics';
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}

// app/layout.tsx
import { reportWebVitals } from '@/lib/analytics';

export { reportWebVitals };
```

### Add Error Tracking

```bash
npm install @sentry/nextjs

# Run
npx @sentry/wizard@latest -i nextjs
```

---

## 🚀 QUICK WINS (Implement First)

1. **Add robots.txt and sitemap** (SEO) - 30 minutes
2. **Fix debug console.log** (Security) - 5 minutes
3. **Add image priority attributes** (Performance) - 15 minutes
4. **Implement proper metadata** (SEO) - 1 hour
5. **Add rate limiting with Upstash** (Security) - 2 hours
6. **Setup bundle analyzer** (Performance) - 15 minutes
7. **Add structured data (JSON-LD)** (SEO) - 1 hour
8. **Implement CSRF protection** (Security) - 2 hours

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Security Hardening (Week 1)
- [ ] Centralize environment variable validation
- [ ] Remove debug logs
- [ ] Implement distributed rate limiting (Upstash)
- [ ] Add CSRF protection
- [ ] Strengthen file upload validation
- [ ] Add security headers

### Phase 2: SEO Foundation (Week 2)
- [ ] Create robots.txt
- [ ] Generate sitemap
- [ ] Implement comprehensive metadata
- [ ] Add structured data (JSON-LD)
- [ ] Add breadcrumbs
- [ ] Implement canonical URLs

### Phase 3: Performance Optimization (Week 3)
- [ ] Optimize images (priority, lazy loading)
- [ ] Implement code splitting
- [ ] Add caching strategy
- [ ] Optimize database queries
- [ ] Reduce re-renders
- [ ] Add bundle analysis

### Phase 4: Monitoring (Week 4)
- [ ] Setup Sentry error tracking
- [ ] Implement analytics
- [ ] Add performance monitoring
- [ ] Setup uptime monitoring

---

## 🎯 EXPECTED OUTCOMES

After implementing these recommendations:

### Security
- ✅ Protection against common web vulnerabilities
- ✅ Proper token management
- ✅ Distributed rate limiting
- ✅ File upload security
- ✅ CSRF protection

### Performance
- ✅ 30-40% faster page load times
- ✅ Improved Core Web Vitals scores
- ✅ Better mobile performance
- ✅ Reduced bundle size

### SEO
- ✅ Better search engine visibility
- ✅ Rich search results with structured data
- ✅ Improved indexing
- ✅ Higher ranking potential

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Web Vitals](https://web.dev/vitals/)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)

---

## ✅ CONCLUSION

Your application has a solid foundation with good security practices already in place. The main gaps are:

1. **SEO is the weakest area** - needs immediate attention
2. **Performance optimizations** - moderate improvements needed
3. **Security hardening** - good base, needs production-grade enhancements

Implementing the Phase 1 and Phase 2 recommendations will significantly improve your production readiness.

**Estimated Total Implementation Time:** 4-6 weeks for full implementation
**Critical Path Items:** 1-2 weeks for minimum viable production deployment

---

*Review conducted on January 22, 2026*  
*For questions or clarifications, please review the specific code sections referenced above.*
