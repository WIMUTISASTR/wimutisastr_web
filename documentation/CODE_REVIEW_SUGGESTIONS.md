# Code Review: Performance, Security & Optimization Suggestions

## Executive Summary

This document outlines critical issues and recommendations for improving the performance, security, and optimization of the WIMUTISASTR web application. The review covers client-side components, API routes, authentication flows, and overall architecture.

---

## 🔴 Critical Security Issues

### 1. Rate Limiting Not Applied
**Location:** All API routes  
**Severity:** High  
**Issue:** The `rate-limit.ts` utility exists but is not being used in any API routes, leaving endpoints vulnerable to abuse.

**Recommendation:**
```typescript
// Example implementation for payment upload route
import { rateLimit, RateLimitPresets, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, RateLimitPresets.upload);
  
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }
  
  // ... rest of handler
}
```

**Action Items:**
- Apply rate limiting to `/api/payment/upload-proof` (use `RateLimitPresets.upload`)
- Apply rate limiting to `/api/auth/*` routes (use `RateLimitPresets.strict`)
- Apply rate limiting to `/api/videos/*/play` (use `RateLimitPresets.standard`)
- Consider using Redis/Upstash for production instead of in-memory storage

---

### 2. Content Security Policy Too Permissive
**Location:** `next.config.ts` lines 104-105  
**Severity:** High  
**Issue:** CSP allows `'unsafe-eval'` and `'unsafe-inline'`, which significantly weakens XSS protection.

**Current:**
```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
"style-src 'self' 'unsafe-inline'",
```

**Recommendation:**
- Remove `'unsafe-eval'` completely
- Use nonces or hashes for inline scripts/styles
- If using third-party libraries that require inline scripts, use specific hashes

**Example:**
```typescript
"script-src 'self' 'sha256-...'",
"style-src 'self' 'sha256-...'",
```

---

### 3. Missing Input Validation
**Location:** API routes (e.g., `app/api/videos/[videoId]/play/route.ts`)  
**Severity:** High  
**Issue:** API routes don't validate input format, type, or sanitize user input.

**Recommendation:**
- Use Zod or similar for schema validation
- Validate UUIDs, file types, and string lengths
- Sanitize all user inputs before processing

**Example:**
```typescript
import { z } from 'zod';

const videoIdSchema = z.string().uuid();

export async function GET(req: NextRequest, ctx: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await ctx.params;
  
  const validation = videoIdSchema.safeParse(videoId);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid video ID format' }, { status: 400 });
  }
  
  // ... rest of handler
}
```

---

### 4. File Upload Security Weaknesses
**Location:** `app/api/payment/upload-proof/route.ts`  
**Severity:** High  
**Issue:** File validation relies only on MIME type, which can be spoofed.

**Recommendation:**
- Validate file signatures (magic bytes) in addition to MIME type
- Implement file size limits (already done - good!)
- Scan uploaded files for malware (consider ClamAV or similar)
- Enforce strict filename patterns to prevent path traversal

**Example:**
```typescript
import { fileTypeFromBuffer } from 'file-type';

const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

// Validate magic bytes
const fileType = await fileTypeFromBuffer(buffer);
if (!fileType || !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}
```

---

### 5. Error Messages Leak Information
**Location:** Multiple API routes  
**Severity:** Medium  
**Issue:** Some error responses expose internal details (database errors, stack traces).

**Recommendation:**
- Return generic error messages to clients
- Log detailed errors server-side only
- Use error codes instead of detailed messages

**Example:**
```typescript
// Bad
return NextResponse.json({ error: dbError.message }, { status: 500 });

// Good
console.error('Database error:', dbError);
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
```

---

### 6. Missing CSRF Protection
**Location:** All POST/PUT/DELETE endpoints  
**Severity:** Medium  
**Issue:** No CSRF token validation for state-changing operations.

**Recommendation:**
- Implement CSRF token generation and validation
- Use Next.js built-in CSRF protection or a library like `csurf`
- Ensure tokens are validated on all state-changing requests

---

## ⚡ Performance Issues

### 1. Client-Side Data Fetching
**Location:** Multiple pages (e.g., `app/page.tsx`, `app/law_video/[courseId]/page.tsx`)  
**Severity:** High  
**Issue:** Data is fetched in `useEffect` on the client, causing:
- Slower First Contentful Paint (FCP)
- Poor SEO (no server-side rendering)
- Unnecessary client-side JavaScript execution
- Multiple round trips

**Recommendation:**
- Convert to Server Components where possible
- Use Next.js `fetch` with caching for data fetching
- Only use client components for interactive features

**Example:**
```typescript
// Before (Client Component)
"use client";
export default function VideoCategoryPage() {
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    fetchVideos(categoryId).then(setVideos);
  }, [categoryId]);
  // ...
}

// After (Server Component)
export default async function VideoCategoryPage({ params }: { params: { courseId: string } }) {
  const data = await fetchVideos(params.courseId);
  return <VideoCategoryClient data={data} />;
}
```

---

### 2. Video Progress Tracking Performance
**Location:** `app/law_video/[courseId]/watch/[videoId]/page.tsx` line 348  
**Severity:** Medium  
**Issue:** `onTimeUpdate` fires multiple times per second, causing excessive state updates.

**Recommendation:**
- Throttle or debounce progress updates (every 5-10 seconds)
- Use `requestAnimationFrame` for smoother updates
- Consider using IndexedDB for progress storage instead of React state

**Example:**
```typescript
const [lastProgressUpdate, setLastProgressUpdate] = useState(0);

onTimeUpdate={(e) => {
  const video = e.currentTarget;
  if (video.duration) {
    const progress = video.currentTime / video.duration;
    const now = Date.now();
    
    // Only update every 5 seconds
    if (now - lastProgressUpdate > 5000) {
      handleVideoProgress(current.id, progress);
      setLastProgressUpdate(now);
    }
  }
}}
```

---

### 3. Multiple API Calls
**Location:** `app/law_video/[courseId]/page.tsx`  
**Severity:** Medium  
**Issue:** Separate API calls for categories and videos could be combined.

**Recommendation:**
- Combine into a single endpoint that returns both
- Or use `Promise.all` for parallel fetching if they must be separate

**Example:**
```typescript
// Instead of sequential calls
const categories = await fetchCategories();
const videos = await fetchVideos(categoryId);

// Use parallel fetching
const [categories, videos] = await Promise.all([
  fetchCategories(),
  fetchVideos(categoryId)
]);
```

---

### 4. Image Optimization Issues
**Location:** `app/payment/page.tsx` line 514  
**Severity:** Low  
**Issue:** Some images use `unoptimized` prop, bypassing Next.js optimization.

**Recommendation:**
- Remove `unoptimized` prop unless absolutely necessary
- Ensure all images use Next.js Image component with proper sizing
- Use `priority` only for above-the-fold images

---

### 5. Missing React.memo and useMemo
**Location:** Video list components  
**Severity:** Medium  
**Issue:** Heavy components re-render unnecessarily when parent state changes.

**Recommendation:**
- Wrap expensive components with `React.memo`
- Use `useMemo` for computed values
- Use `useCallback` for event handlers passed to children

**Example:**
```typescript
const VideoCard = React.memo(({ video, index }: { video: VideoRow; index: number }) => {
  // Component implementation
});

const sortedVideos = useMemo(() => {
  return [...videos].sort((a, b) => a.title.localeCompare(b.title));
}, [videos]);
```

---

### 6. localStorage Performance
**Location:** Multiple components  
**Severity:** Low  
**Issue:** Frequent localStorage reads/writes can block the main thread.

**Recommendation:**
- Debounce localStorage writes
- Use IndexedDB for larger data sets
- Consider moving critical data to server-side storage

---

## 🔧 Optimization Issues

### 1. Bundle Size
**Location:** All pages  
**Severity:** Medium  
**Issue:** All pages are client components, increasing JavaScript bundle size.

**Recommendation:**
- Convert static parts to Server Components
- Use `next/dynamic` for code splitting
- Analyze bundle with `@next/bundle-analyzer`

**Example:**
```typescript
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <VideoPlayerSkeleton />,
  ssr: false
});
```

---

### 2. API Response Caching
**Location:** `lib/api-client.ts`  
**Severity:** Medium  
**Issue:** All API calls use `cache: "no-store"`, preventing any caching.

**Recommendation:**
- Use appropriate cache strategies
- Implement ISR (Incremental Static Regeneration) for public data
- Use `revalidate` for time-based cache invalidation

**Example:**
```typescript
// For public data that changes infrequently
const res = await fetch(url, { 
  next: { revalidate: 3600 } // Revalidate every hour
});

// For user-specific data
const res = await fetch(url, { 
  cache: 'no-store' // Keep as is
});
```

---

### 3. Database Query Optimization
**Location:** API routes  
**Severity:** Medium  
**Issue:** Some queries may be inefficient (multiple separate queries instead of joins).

**Recommendation:**
- Review all database queries
- Use joins where appropriate
- Ensure proper indexes exist
- Use Supabase query optimization features

**Example:**
```typescript
// Instead of multiple queries
const { data: video } = await supabase.from('videos').select('*').eq('id', videoId).single();
const { data: category } = await supabase.from('categories').select('*').eq('id', video.category_id).single();

// Use a join
const { data } = await supabase
  .from('videos')
  .select('*, categories(*)')
  .eq('id', videoId)
  .single();
```

---

### 4. Missing Error Boundaries
**Location:** Application-wide  
**Severity:** Medium  
**Issue:** No error boundaries to catch React errors gracefully.

**Recommendation:**
- Add error boundaries at key points in the component tree
- Provide user-friendly error messages
- Log errors to monitoring service

**Example:**
```typescript
'use client';

export class ErrorBoundary extends React.Component {
  // Implementation
}

// Usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

---

### 5. Video Token Refresh
**Location:** `app/law_video/[courseId]/watch/[videoId]/page.tsx`  
**Severity:** Medium  
**Issue:** Video tokens expire after 120 seconds, but no refresh mechanism exists.

**Recommendation:**
- Implement token refresh before expiration
- Monitor token expiration time
- Automatically refresh when video is playing

**Example:**
```typescript
useEffect(() => {
  if (!playback?.exp) return;
  
  const timeUntilExpiry = (playback.exp * 1000) - Date.now();
  const refreshTime = timeUntilExpiry - 30000; // Refresh 30s before expiry
  
  if (refreshTime > 0) {
    const timer = setTimeout(() => {
      // Refresh token
      loadPlayback();
    }, refreshTime);
    
    return () => clearTimeout(timer);
  }
}, [playback?.exp]);
```

---

### 6. Component Size
**Location:** `app/law_video/[courseId]/watch/[videoId]/page.tsx` (575 lines)  
**Severity:** Low  
**Issue:** Large components are harder to maintain and test.

**Recommendation:**
- Split into smaller, focused components
- Extract custom hooks for complex logic
- Create reusable UI components

**Suggested Split:**
- `VideoPlayer` component
- `VideoSidebar` component
- `VideoTabs` component
- `useVideoProgress` hook
- `useVideoPlayback` hook

---

## 📋 Priority Action Items

### High Priority (Do First)
1. ✅ Apply rate limiting to all API routes
2. ✅ Remove `'unsafe-eval'` and `'unsafe-inline'` from CSP
3. ✅ Add input validation to API routes
4. ✅ Throttle video progress updates
5. ✅ Move data fetching to Server Components where possible

### Medium Priority (Do Next)
1. ⚠️ Implement token refresh mechanism
2. ⚠️ Add file signature validation
3. ⚠️ Optimize database queries
4. ⚠️ Split large components
5. ⚠️ Add error boundaries
6. ⚠️ Implement proper caching strategies

### Low Priority (Nice to Have)
1. 📝 Code splitting for heavy components
2. 📝 Bundle size optimization
3. 📝 Add request retry logic
4. 📝 Consolidate state management (consider Zustand/Redux)
5. 📝 Add comprehensive logging/monitoring

---

## 🛠️ Implementation Checklist

### Security
- [ ] Apply rate limiting to `/api/payment/upload-proof`
- [ ] Apply rate limiting to `/api/auth/*` routes
- [ ] Apply rate limiting to `/api/videos/*/play`
- [ ] Fix CSP to remove unsafe directives
- [ ] Add Zod validation to all API routes
- [ ] Implement file signature validation
- [ ] Add CSRF protection
- [ ] Sanitize all error messages

### Performance
- [ ] Convert home page to Server Component
- [ ] Convert video category page to Server Component
- [ ] Throttle video progress updates
- [ ] Combine API calls where possible
- [ ] Remove `unoptimized` from images
- [ ] Add React.memo to expensive components
- [ ] Optimize localStorage usage

### Optimization
- [ ] Split large components
- [ ] Add error boundaries
- [ ] Implement token refresh
- [ ] Add proper caching strategies
- [ ] Optimize database queries
- [ ] Add code splitting
- [ ] Set up bundle analyzer

---

## 📚 Additional Resources

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Zod Validation](https://zod.dev/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## 📝 Notes

- This review was conducted on the codebase as of the current state
- Some recommendations may require architectural changes
- Test all changes thoroughly before deploying to production
- Consider implementing changes incrementally to reduce risk
- Monitor performance and security metrics after implementing changes

---

**Last Updated:** $(date)  
**Reviewer:** AI Code Review Assistant
