# Security Implementation Guide

This document describes the security improvements implemented in the application and how to use them.

## Overview

The following security issues have been addressed:

1. Environment variable exposure risks
2. Debug logs in production code
3. In-memory rate limiting (replaced with Redis/Upstash)
4. Missing CSRF protection
5. Weak file upload validation
6. Token expiration policy improvements

## 1. Environment Variable Management

### What Changed
- Created centralized environment variable management in `lib/env.ts`
- All environment variables are now validated at startup
- Secure getter functions prevent accidental exposure
- TypeScript types ensure proper usage

### Usage

```typescript
import { env } from '@/lib/env';

// Access environment variables securely
const supabaseUrl = env.supabase.url();
const r2BucketName = env.r2.bookBucket();
const tokenSecret = env.security.contentTokenSecret();

// Check environment
if (env.isProduction()) {
  // Production-specific code
}
```

### Migration
Replace direct `process.env` access:

```typescript
// Before
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const bucketName = process.env.R2_BOOK_BUCKET_NAME;

// After
import { env } from '@/lib/env';
const supabaseUrl = env.supabase.url();
const bucketName = env.r2.bookBucket();
```

## 2. Production-Safe Logging

### What Changed
- Created structured logging system in `lib/logger.ts`
- Automatically sanitizes sensitive data (passwords, tokens, etc.)
- Debug logs only appear in development
- Includes timestamps and context

### Usage

```typescript
import { logger } from '@/lib/logger';

// Create a module-specific logger
const log = logger.child({ module: 'api/payment' });

// Log at different levels
log.debug('Detailed debug info', { userId, action });
log.info('Important info', { orderId });
log.warn('Warning message', { reason });
log.error('Error occurred', error, { context });
```

### Migration
Replace all `console.log` and `console.error`:

```typescript
// Before
console.error('Error uploading:', error);

// After
import { logger } from '@/lib/logger';
const log = logger.child({ module: 'upload' });
log.error('Error uploading', error, { filename });
```

## 3. Redis-Based Rate Limiting

### What Changed
- Implemented production-ready rate limiting using Upstash Redis
- Falls back to in-memory storage in development
- Supports different rate limit presets
- Automatic cleanup and TTL management

### Setup

1. Sign up for Upstash Redis (free tier available)
2. Add to `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### Usage

```typescript
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limit-redis';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimitPresets.strict);
  
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }
  
  // Process request...
}
```

### Available Presets

- `strict`: 5 requests per minute (auth, payment)
- `standard`: 30 requests per minute (regular APIs)
- `relaxed`: 100 requests per minute (read-only)
- `upload`: 3 uploads per 5 minutes

## 4. CSRF Protection

### What Changed
- Implemented double-submit cookie pattern
- Automatic validation on state-changing methods (POST, PUT, PATCH, DELETE)
- Public routes exempted from CSRF checks

### Client-Side Usage

```typescript
// 1. Get CSRF token on app initialization
async function getCsrfToken() {
  const response = await fetch('/api/csrf-token');
  const data = await response.json();
  return data.csrfToken;
}

// 2. Include token in API requests
const csrfToken = await getCsrfToken();

await fetch('/api/payment/upload-proof', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'X-CSRF-Token': csrfToken,
  },
  body: formData,
});
```

### Server-Side Usage

CSRF protection is automatically applied by middleware. To manually check:

```typescript
import { withCsrfProtection } from '@/lib/csrf';

export const POST = withCsrfProtection(async (request: NextRequest) => {
  // Handler logic - CSRF already validated
});
```

## 5. Enhanced File Validation

### What Changed
- Validates file content using magic numbers (file signatures)
- Checks MIME type, file extension, and actual file content
- Sanitizes filenames to prevent path traversal attacks
- Configurable validation profiles

### Usage

```typescript
import { validateFileBuffer, sanitizeFilename, FileTypeConfigs } from '@/lib/file-validation';

// Validate uploaded file
const buffer = Buffer.from(await file.arrayBuffer());
const validation = validateFileBuffer(buffer, file.name, file.type, 'paymentProof');

if (!validation.valid) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}

// Sanitize filename
const safeFilename = sanitizeFilename(file.name);
```

### Available Validation Profiles

- `image`: JPEG, PNG, GIF, WebP (5MB max)
- `paymentProof`: JPEG, PNG, PDF (5MB max)
- `document`: PDF only (10MB max)

## 6. Token Expiration Improvements

### What Changed
- Added configurable expiration times for all tokens
- Tokens now include `iat` (issued at) field
- Clock skew tolerance (60 seconds)
- Proper validation of expiration and issuance times

### Usage

```typescript
import { signVideoToken, TOKEN_EXPIRY } from '@/lib/video-token';

// Sign token with default expiry (1 hour)
const token = signVideoToken({
  sub: userId,
  videoId,
  bucket: 'video',
  key: fileKey,
});

// Or use custom expiry
const shortLivedToken = signVideoToken(
  { sub: userId, videoId, bucket: 'video', key: fileKey },
  TOKEN_EXPIRY.SHORT_LIVED // 5 minutes
);
```

### Available Expiry Constants

- `SHORT_LIVED`: 5 minutes (quick operations)
- `VIDEO_PLAY` / `CONTENT_VIEW` / `STORAGE_ACCESS`: 1 hour
- `LONG_LIVED`: 24 hours (extended access)

## Environment Variables Reference

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# R2 Storage
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BOOK_BUCKET_NAME=book-bucket
R2_VIDEO_BUCKET_NAME=video-bucket
R2_PROOF_OF_PAYMENT_BUCKET_NAME=payment-proofs

# Security
CONTENT_TOKEN_SECRET=your_secret_key_min_32_chars

# Node Environment
NODE_ENV=production
```

### Optional Variables

```env
# Telegram Notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Redis/Upstash (highly recommended for production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

## Migration Checklist

- [ ] Add Upstash Redis credentials to production environment
- [ ] Update all API routes to use new logger
- [ ] Update all API routes to use env module
- [ ] Add rate limiting to sensitive endpoints
- [ ] Update client-side code to include CSRF tokens
- [ ] Test file upload with new validation
- [ ] Verify token expiration works correctly
- [ ] Remove old console.log statements
- [ ] Update deployment documentation

## Best Practices

1. **Never** access `process.env` directly in your code
2. **Always** use the logger instead of console methods
3. **Apply** rate limiting to all public-facing APIs
4. **Include** CSRF tokens in all state-changing requests
5. **Validate** file uploads on both client and server
6. **Use** appropriate token expiry times for your use case
7. **Monitor** logs for security events in production
8. **Rotate** secrets regularly (especially `CONTENT_TOKEN_SECRET`)

## Testing

### Development
```bash
# Run without Redis (uses in-memory fallback)
npm run dev
```

### Production
```bash
# Ensure Redis is configured
# Check environment variables
npm run build
npm start
```

## Troubleshooting

### Rate Limiting Issues
- Check if Redis credentials are correct
- Verify Redis is accessible from your deployment
- In development, in-memory fallback is used automatically

### CSRF Token Issues
- Ensure client fetches token before making requests
- Check that token is included in `X-CSRF-Token` header
- Verify cookies are enabled in browser

### File Validation Failures
- Check file is not corrupted
- Verify file type matches extension
- Ensure file size is within limits

## Security Incident Response

If you discover a security vulnerability:

1. Do NOT commit sensitive information to git
2. Rotate compromised credentials immediately
3. Review logs for suspicious activity
4. Update this documentation with lessons learned
