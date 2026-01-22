# Migration Guide: Security Improvements

This guide will help you migrate your existing code to use the new security features.

## Quick Start

1. Add Redis credentials to your environment
2. Update API calls to include CSRF tokens
3. Replace console.log with logger
4. Test thoroughly

## Step-by-Step Migration

### 1. Environment Setup

#### Add to `.env.local`:

```env
# Required - Generate with: openssl rand -base64 32
CONTENT_TOKEN_SECRET=your_32_char_minimum_secret

# Highly Recommended for Production
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Optional
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

#### Get Upstash Redis (Free):
1. Go to https://upstash.com
2. Sign up and create a new database
3. Copy REST URL and Token
4. Add to your environment variables

### 2. Update Client-Side Code

#### Option A: Use the Secure API Client (Recommended)

```typescript
// Old code
import { createClient } from '@supabase/supabase-js';

const response = await fetch('/api/payment/upload-proof', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

// New code
import { apiClient, withAuth } from '@/lib/api-client-secure';

const response = await apiClient.postFormData(
  '/payment/upload-proof',
  formData,
  withAuth(token)
);
```

#### Option B: Manual CSRF Token Management

```typescript
import { fetchWithCsrf } from '@/lib/csrf-client';

const response = await fetchWithCsrf('/api/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

#### Option C: React Hook (for forms)

```tsx
import { useCsrfToken } from '@/lib/csrf-client';

function MyForm() {
  const { token: csrfToken, loading, error } = useCsrfToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken!,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(formData),
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading form</div>;

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Update Server-Side Code

#### Replace Environment Variable Access

```typescript
// Before
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const bucketName = process.env.R2_BOOK_BUCKET_NAME;

// After
import { env } from '@/lib/env';
const supabaseUrl = env.supabase.url();
const bucketName = env.r2.bookBucket();
```

#### Replace Console Logs

```typescript
// Before
console.log('Processing upload');
console.error('Error occurred:', error);

// After
import { logger } from '@/lib/logger';
const log = logger.child({ module: 'upload' });

log.info('Processing upload', { userId, filename });
log.error('Error occurred', error, { userId });
```

#### Add Rate Limiting to API Routes

```typescript
// Before
export async function POST(request: NextRequest) {
  // Process request...
}

// After
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limit-redis';

export async function POST(request: NextRequest) {
  // Add rate limiting
  const rateLimitResult = await rateLimit(request, RateLimitPresets.standard);
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }
  
  // Process request...
}
```

#### Add File Validation

```typescript
// Before
if (!file.type.startsWith('image/')) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}

// After
import { validateFileBuffer, sanitizeFilename } from '@/lib/file-validation';

const buffer = Buffer.from(await file.arrayBuffer());
const validation = validateFileBuffer(buffer, file.name, file.type, 'paymentProof');

if (!validation.valid) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}

const safeFilename = sanitizeFilename(file.name);
```

### 4. Update Token Generation

```typescript
// Before
import { signVideoToken } from '@/lib/video-token';

const exp = Math.floor(Date.now() / 1000) + 3600;
const token = signVideoToken({
  sub: userId,
  videoId,
  bucket: 'video',
  key: fileKey,
  exp,
});

// After
import { signVideoToken, TOKEN_EXPIRY } from '@/lib/video-token';

const token = signVideoToken(
  {
    sub: userId,
    videoId,
    bucket: 'video',
    key: fileKey,
  },
  TOKEN_EXPIRY.VIDEO_PLAY // or custom time in seconds
);
```

## File-by-File Migration Checklist

### High Priority (Security Critical)

- [x] `app/api/payment/upload-proof/route.ts` - ✅ Updated
- [x] `app/api/books/view-token/route.ts` - ✅ Updated
- [x] `app/api/videos/[videoId]/play/route.ts` - ✅ Updated
- [x] `middleware.ts` - ✅ Updated
- [x] `lib/video-token.ts` - ✅ Updated
- [x] `lib/content-token.ts` - ✅ Updated
- [x] `lib/storage-token.ts` - ✅ Updated

### Medium Priority (API Routes)

- [ ] `app/api/videos-public/route.ts` - Replace console.error, add env
- [ ] `app/api/books-public/route.ts` - Replace console.error, add env
- [ ] `app/api/videos/serve/route.ts` - Replace console.error, add env
- [ ] `app/api/home/route.ts` - Replace console.error, add env
- [ ] `app/api/membership/status/route.ts` - Replace console.error, add env, add rate limiting
- [ ] `app/api/storage/serve/route.ts` - Replace console.error, add env
- [ ] `app/api/storage/view-token/route.ts` - Replace console.error, add env, add rate limiting
- [ ] `app/api/profile/me/route.ts` - Replace console.error, add env, add rate limiting
- [ ] `app/api/books/serve/route.ts` - Replace console.error, add env

### Lower Priority (Client Components)

- [ ] `app/law_documents/[categoryId]/read/[bookId]/page.tsx` - Replace console.error
- [ ] `app/page.tsx` - Replace console.error
- [ ] `app/law_video/[courseId]/page.tsx` - Replace console.error
- [ ] `app/payment/page.tsx` - Replace console.error, add CSRF
- [ ] `app/law_video/[courseId]/watch/[videoId]/page.tsx` - Replace console.error
- [ ] `app/law_video/page.tsx` - Replace console.error
- [ ] `app/law_documents/[categoryId]/page.tsx` - Replace console.error
- [ ] `app/law_documents/page.tsx` - Replace console.error
- [ ] `app/profile_page/page.tsx` - Replace console.error, add CSRF
- [ ] `app/pricing_page/page.tsx` - Replace console.error

## Testing After Migration

### 1. Test Environment Variables
```bash
npm run dev
# Should start without errors
# Check for "Missing required environment variables" errors
```

### 2. Test Rate Limiting
```bash
# Make rapid requests to test rate limiting
for i in {1..50}; do curl http://localhost:3000/api/endpoint; done
# Should see 429 responses after hitting the limit
```

### 3. Test CSRF Protection
```bash
# Request without CSRF token (should fail)
curl -X POST http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer token"
# Should return 403

# Request with CSRF token (should succeed)
TOKEN=$(curl http://localhost:3000/api/csrf-token | jq -r .csrfToken)
curl -X POST http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer token" \
  -H "X-CSRF-Token: $TOKEN"
```

### 4. Test File Upload
```bash
# Upload a valid image
# Upload a file with wrong extension
# Upload a malicious file
# All should be properly validated
```

### 5. Test Logging
```bash
# Check that sensitive data is not logged
# In production, debug logs should not appear
NODE_ENV=production npm run build && npm start
# No debug logs should appear
```

## Common Issues and Solutions

### Issue: "Missing CONTENT_TOKEN_SECRET"
**Solution:** Generate and add to `.env.local`:
```bash
openssl rand -base64 32
```

### Issue: "CSRF validation failed"
**Solution:** Ensure client is fetching and including CSRF token:
```typescript
const csrfToken = await getCsrfToken();
// Include in request headers
```

### Issue: "Rate limit exceeded" in development
**Solution:** Either:
1. Add Redis credentials (recommended)
2. Or accept in-memory limitations (resets on restart)

### Issue: File upload rejected
**Solution:** Check that:
1. File is actually the type it claims to be
2. File extension matches content
3. File size is within limits
4. File type is allowed for the endpoint

### Issue: Tokens expiring too quickly
**Solution:** Adjust token expiry:
```typescript
import { TOKEN_EXPIRY } from '@/lib/video-token';
signVideoToken(payload, TOKEN_EXPIRY.LONG_LIVED);
```

## Performance Considerations

- Redis rate limiting adds ~1-2ms per request
- CSRF validation adds ~0.1ms per request
- File validation adds ~5-10ms per upload
- Overall impact: < 1% in most cases

## Rollback Plan

If you need to rollback:

1. Remove CSRF validation from middleware
2. Use old rate-limit.ts (in-memory)
3. Revert to direct `process.env` access
4. Keep using console.log (not recommended)

However, it's strongly recommended to fix forward rather than rollback.

## Getting Help

1. Check `SECURITY_IMPLEMENTATION.md` for detailed API docs
2. Review `SECURITY_FIXES_SUMMARY.md` for what was changed
3. Check console/logs for specific error messages
4. Verify all environment variables are set correctly

## Production Deployment Checklist

- [ ] All environment variables configured
- [ ] Upstash Redis set up and tested
- [ ] CSRF tokens working in production
- [ ] File upload validation tested with real files
- [ ] Rate limiting tested under load
- [ ] Logging configured (no debug logs in production)
- [ ] Secrets rotated (especially CONTENT_TOKEN_SECRET)
- [ ] Monitoring set up for security events
- [ ] Backup and recovery plan in place
