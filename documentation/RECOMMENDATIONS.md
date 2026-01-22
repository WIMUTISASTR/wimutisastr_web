# WIMUTISASTR Web - Security, Performance & Structure Recommendations

**Generated:** January 20, 2026  
**Project:** wimutisastr_web  
**Framework:** Next.js 16.1.1

---

## 🚨 Critical Security Issues (Fix Immediately)

### 1. Missing Next.js Middleware for Route Protection

**Issue:** No `middleware.ts` file exists at the root level, meaning all route protection happens client-side only.

**Risk:** Users can access protected routes by disabling JavaScript or manipulating client-side code.

**Solution:** Create `middleware.ts` in the project root:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const protectedRoutes = ['/law_documents', '/law_video', '/payment', '/profile_page']
const authRoutes = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
```

---

### 2. File Upload Security Vulnerabilities

**Location:** `/app/api/payment/upload-proof/route.ts`

**Issues:**
- ❌ No file size validation
- ❌ No MIME type verification
- ❌ No filename sanitization
- ❌ No rate limiting

**Solution:** Add comprehensive validation:

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }
    
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      }, { status: 400 })
    }
    
    // Validate file extension
    const fileExt = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json({ 
        error: 'Invalid file extension' 
      }, { status: 400 })
    }
    
    // Sanitize filename
    const sanitizedFilename = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 100)
    
    // Continue with upload...
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

---

### 3. Missing Rate Limiting

**Issue:** API routes have no rate limiting, exposing the application to:
- Spam attacks
- DDoS attempts
- Resource exhaustion
- Credential stuffing attacks

**Solution:** Implement rate limiting using Upstash Redis or alternative:

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server'

const WINDOW_SIZE = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10

const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(request: NextRequest): { success: boolean; limit: number; remaining: number; reset: number } {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  
  const record = requestCounts.get(ip)
  
  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_SIZE })
    return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_SIZE }
  }
  
  if (record.count >= MAX_REQUESTS) {
    return { success: false, limit: MAX_REQUESTS, remaining: 0, reset: record.resetAt }
  }
  
  record.count++
  return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - record.count, reset: record.resetAt }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetAt) {
      requestCounts.delete(key)
    }
  }
}, WINDOW_SIZE)
```

**Usage in API routes:**

```typescript
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request)
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        }
      }
    )
  }
  
  // Continue with request handling...
}
```

---

### 4. Missing Security Headers

**Issue:** No security headers configured, exposing application to:
- XSS attacks
- Clickjacking
- MIME sniffing attacks
- Downgrade attacks

**Solution:** Add security headers to `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existing image config...
  images: {
    // ... your existing config
  },
  
  // Enable security features
  reactStrictMode: true,
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.r2.dev",
              "media-src 'self' https://*.r2.dev blob:",
              "frame-ancestors 'self'",
            ].join('; ')
          }
        ]
      }
    ]
  }
};

export default nextConfig;
```

---

### 5. Input Validation Weaknesses

**Issue:** Insufficient input validation across API routes.

**Solution:** Create a validation utility:

```typescript
// lib/validation.ts
import { z } from 'zod'

export const validators = {
  bookId: z.string().uuid(),
  videoId: z.string().uuid(),
  categoryId: z.string().uuid().or(z.literal('__all__')),
  planId: z.string().min(1).max(100),
  paymentReference: z.string().min(1).max(200),
  token: z.string().min(10),
}

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Validation failed' }
  }
}
```

**Install zod:**

```bash
npm install zod
```

**Usage:**

```typescript
import { validateInput, validators } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('bookId')
  
  const validation = validateInput(validators.bookId, bookId)
  
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }
  
  // Use validation.data (guaranteed to be valid UUID)
}
```

---

## 🔐 Additional Security Improvements

### 6. Environment Variables Best Practices

**Current Issue:** Inconsistent handling of environment variables.

**Recommendations:**

1. **Create `.env.example`:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# R2 Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_VIDEO_BUCKET_NAME=
R2_PROOF_OF_PAYMENT_BUCKET_NAME=
R2_PROOF_OF_PAYMENT_URL=

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# JWT/Token Secrets (generate with: openssl rand -base64 32)
CONTENT_TOKEN_SECRET=
VIDEO_TOKEN_SECRET=
STORAGE_TOKEN_SECRET=
```

2. **Add environment validation:**

```typescript
// lib/config.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
] as const

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Call in app initialization
```

---

### 7. Error Handling & Logging

**Create global error boundary:**

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'
import Button from '@/components/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. Our team has been notified.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
```

```typescript
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

---

### 8. API Route Error Handling Pattern

**Standardize error responses:**

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  
  // Don't expose internal errors to client
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}
```

**Usage:**

```typescript
export async function GET(request: NextRequest) {
  try {
    // Your logic
    if (!authorized) {
      throw new ApiError(401, 'Unauthorized', 'AUTH_REQUIRED')
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## ⚡ Performance Optimizations

### 9. Convert Client Components to Server Components

**Issue:** Many pages use client-side data fetching unnecessarily.

**Example - Current (Slow):**

```typescript
// app/law_documents/page.tsx - BEFORE
"use client"
import { useEffect, useState } from "react"

export default function LawDocuments() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchBooks().then(setBooks).finally(() => setLoading(false))
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return <div>{/* render books */}</div>
}
```

**Improved (Fast):**

```typescript
// app/law_documents/page.tsx - AFTER
import { createServerClient } from '@/lib/supabase-server'

async function getBooks() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('books')
    .select('*')
  
  if (error) throw error
  return data
}

export default async function LawDocuments() {
  const books = await getBooks()
  
  return <div>{/* render books */}</div>
}
```

**Benefits:**
- ✅ Faster initial page load
- ✅ Better SEO
- ✅ Smaller JavaScript bundle
- ✅ No loading states needed
- ✅ Server-side data fetching

---

### 10. Dynamic Imports for Heavy Libraries

**Issue:** Large libraries like `pdfjs-dist` and `mammoth` bloat the bundle.

**Solution:**

```typescript
// BEFORE
import mammoth from "mammoth"
import * as pdfjsLib from "pdfjs-dist"

// AFTER
const renderDocx = async (file: ArrayBuffer) => {
  const mammoth = (await import('mammoth')).default
  return mammoth.convertToHtml({ arrayBuffer: file })
}

const renderPdf = async (file: ArrayBuffer) => {
  const pdfjsLib = await import('pdfjs-dist')
  const pdf = await pdfjsLib.getDocument({ data: file }).promise
  // ... render logic
}
```

**Measure impact:**

```bash
npm run build
# Check bundle size before and after
```

---

### 11. Implement Proper Caching Strategy

**Current Issue:** All API routes use `cache: 'no-store'`.

**Recommendations:**

```typescript
// For static/semi-static data
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const data = await fetchPublicBooks()
  return NextResponse.json(data)
}
```

```typescript
// For dynamic data with stale-while-revalidate
export async function GET(request: NextRequest) {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

---

### 12. Image Optimization

**Update `next.config.ts`:**

```typescript
const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // ... rest of your config
  },
  // Enable experimental optimizations
  experimental: {
    optimizeCss: true,
  },
}
```

---

### 13. Add Loading States with Suspense

**Create loading.tsx files:**

```typescript
// app/law_documents/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
```

```typescript
// app/law_documents/page.tsx
import { Suspense } from 'react'

export default async function LawDocumentsPage() {
  return (
    <Suspense fallback={<BooksSkeleton />}>
      <BooksContent />
    </Suspense>
  )
}

async function BooksContent() {
  const books = await getBooks()
  return <BooksList books={books} />
}
```

---

### 14. Database Query Optimization

**Add indexes to Supabase tables:**

```sql
-- Add index for frequently queried columns
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_videos_category_id ON videos(category_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_payment_proofs_user_id ON payment_proofs(user_id);

-- Add composite indexes for common queries
CREATE INDEX idx_books_category_created ON books(category_id, created_at DESC);
CREATE INDEX idx_videos_category_created ON videos(category_id, created_at DESC);
```

**Optimize queries:**

```typescript
// BEFORE - Two separate queries
const categories = await supabase.from('categories').select('*')
const books = await supabase.from('books').select('*')

// AFTER - Single query with join
const { data } = await supabase
  .from('books')
  .select(`
    *,
    category:categories(*)
  `)
  .order('created_at', { ascending: false })
  .limit(50)
```

---

## 🏗️ Structure & Organization

### 15. Fix Folder Naming Typo

**Issue:** Folder is named `compounents` instead of `components`.

**Solution:**

```bash
# Rename folder
mv compounents components

# Update all imports
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/@\/compounents/@\/components/g'

# Update tsconfig.json paths if needed
```

---

### 16. Reorganize Project Structure

**Current structure has mixed concerns. Recommended:**

```
lib/
├── clients/              # External service clients
│   ├── supabase-client.ts
│   ├── supabase-server.ts
│   └── r2-client.ts
├── utils/                # Pure utility functions
│   ├── validation.ts
│   ├── rate-limit.ts
│   └── normalize-image.ts
├── tokens/               # Token generation/verification
│   ├── content-token.ts
│   ├── video-token.ts
│   └── storage-token.ts
└── config/               # Configuration & constants
    ├── env.ts
    └── constants.ts

hooks/                    # React hooks
├── useAuth.ts
├── useMembership.ts
└── useMediaQuery.ts

components/               # Reusable components (fixed typo!)
├── ui/                   # Basic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Checkbox.tsx
├── forms/                # Form-specific components
│   ├── FormCard.tsx
│   └── FormHeader.tsx
├── layout/               # Layout components
│   ├── Nav.tsx
│   └── PageContainer.tsx
└── providers/            # Context providers
    ├── AuthProvider.tsx
    └── ToastProvider.tsx
```

---

### 17. Type Safety Improvements

**Create shared types:**

```typescript
// types/index.ts
export interface User {
  id: string
  email: string
  created_at: string
}

export interface Book {
  id: string
  title: string
  category_id: string
  file_url: string
  cover_url: string | null
  created_at: string
}

export interface Video {
  id: string
  title: string
  category_id: string
  video_url: string
  thumbnail_url: string | null
  duration: number | null
  created_at: string
}

export interface MembershipStatus {
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  plan_id: string | null
  starts_at: string | null
  expires_at: string | null
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}
```

---

### 18. Consistent API Response Format

**Create response builder:**

```typescript
// lib/api-response.ts
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json({ 
    success: false, 
    error: message,
    code 
  }, { status })
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    }
  })
}
```

---

## 🧪 Testing & Quality Assurance

### 19. Add Testing Infrastructure

**Install dependencies:**

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
npm install -D @types/jest
```

**Create test configuration:**

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom'
```

**Add test scripts to package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### 20. Add ESLint & Prettier Configuration

**Install:**

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-security
```

**Create `.prettierrc.json`:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Update `eslint.config.mjs`:**

```javascript
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import security from 'eslint-plugin-security'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'prettier'),
  {
    plugins: {
      security,
    },
    rules: {
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      '@next/next/no-img-element': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
```

---

## 📊 Monitoring & Analytics

### 21. Add Error Tracking

**Recommended: Sentry**

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

---

### 22. Add Performance Monitoring

**Create performance utilities:**

```typescript
// lib/monitoring.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start}ms`)
}

export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  console.log(`${name} took ${end - start}ms`)
  return result
}
```

---

## 📱 Progressive Web App (PWA)

### 23. Add PWA Support

**Install:**

```bash
npm install next-pwa
```

**Create `public/manifest.json`:**

```json
{
  "name": "WIMUTISASTR Law Office",
  "short_name": "WIMUTISASTR",
  "description": "Master Cambodian law through comprehensive legal education resources",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "icons": [
    {
      "src": "/logo/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Update `next.config.ts`:**

```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig = {
  // ... your existing config
}

module.exports = withPWA(nextConfig)
```

---

## 🚀 Deployment Checklist

### 24. Pre-Deployment Tasks

**Before deploying to production:**

- [ ] Verify all environment variables are set
- [ ] Enable database RLS (Row Level Security) policies
- [ ] Set up database backups
- [ ] Configure CDN for static assets
- [ ] Enable HTTPS only
- [ ] Set up monitoring/alerting
- [ ] Test error pages (404, 500)
- [ ] Verify rate limiting is active
- [ ] Check security headers
- [ ] Run security audit: `npm audit`
- [ ] Test with Lighthouse
- [ ] Verify SEO meta tags
- [ ] Test on mobile devices
- [ ] Set up CI/CD pipeline
- [ ] Configure log aggregation

---

## 📋 Priority Implementation Order

### Phase 1: Critical Security (Week 1)
1. ✅ Create `middleware.ts` for route protection
2. ✅ Add file upload validation
3. ✅ Implement rate limiting
4. ✅ Add security headers to `next.config.ts`
5. ✅ Create `.env.example` and validate environment variables

### Phase 2: Structure & Organization (Week 2)
6. ✅ Rename `compounents` to `components`
7. ✅ Reorganize lib folder structure
8. ✅ Add global error boundaries
9. ✅ Standardize API response format
10. ✅ Create shared TypeScript types

### Phase 3: Performance (Week 3)
11. ✅ Convert client components to server components
12. ✅ Implement dynamic imports for heavy libraries
13. ✅ Add proper caching strategies
14. ✅ Optimize database queries and add indexes
15. ✅ Add Suspense boundaries and loading states

### Phase 4: Quality & Monitoring (Week 4)
16. ✅ Set up testing infrastructure
17. ✅ Configure ESLint & Prettier
18. ✅ Add error tracking (Sentry)
19. ✅ Implement performance monitoring
20. ✅ Create deployment checklist

---

## 📚 Additional Resources

**Next.js Best Practices:**
- https://nextjs.org/docs/app/building-your-application/routing/middleware
- https://nextjs.org/docs/app/building-your-application/optimizing/images

**Security Resources:**
- https://owasp.org/www-project-top-ten/
- https://cheatsheetseries.owasp.org/

**Supabase Security:**
- https://supabase.com/docs/guides/auth/row-level-security
- https://supabase.com/docs/guides/database/postgres/row-level-security

**Performance:**
- https://web.dev/vitals/
- https://developer.chrome.com/docs/lighthouse/

---

## 🤝 Support

If you have questions about implementing these recommendations:
1. Review the Next.js documentation
2. Check Supabase documentation for database changes
3. Test changes in development before deploying
4. Create backups before major structural changes

---

**Last Updated:** January 20, 2026
**Version:** 1.0
