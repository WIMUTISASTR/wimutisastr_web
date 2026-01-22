# Quick Reference: Using the New Security Features

This guide shows you how to use the security features we just implemented.

---

## 🛡️ Rate Limiting

### Basic Usage

```typescript
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = rateLimit(request, RateLimitPresets.standard);
  
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }
  
  // Continue with your logic...
}
```

### Available Presets

```typescript
RateLimitPresets.strict    // 5 requests/minute  (auth, payment)
RateLimitPresets.standard  // 30 requests/minute (general API)
RateLimitPresets.relaxed   // 100 requests/minute (read-only)
RateLimitPresets.upload    // 3 requests/5 minutes (file uploads)
```

### Custom Rate Limit

```typescript
const result = rateLimit(request, {
  windowMs: 5 * 60 * 1000,  // 5 minutes
  maxRequests: 10,           // 10 requests
});
```

---

## ✅ Input Validation

### Single Field Validation

```typescript
import { validateInput, emailSchema, uuidSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');
  
  const validation = validateInput(uuidSchema, bookId);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }
  
  // Use validation.data (guaranteed to be valid UUID)
  const book = await getBook(validation.data);
}
```

### Multiple Fields Validation

```typescript
import { validateMultiple, emailSchema, passwordSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const validation = validateMultiple({
    email: [emailSchema, body.email],
    password: [passwordSchema, body.password],
  });
  
  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 400 }
    );
  }
  
  // Use validation.data (all fields are validated)
  const { email, password } = validation.data;
}
```

### Available Schemas

```typescript
// IDs
uuidSchema
bookIdSchema
videoIdSchema
categoryIdSchema
userIdSchema

// Payment
planIdSchema
paymentReferenceSchema
amountSchema

// Tokens
tokenSchema
contentTokenSchema
videoTokenSchema
storageTokenSchema

// User Input
emailSchema
passwordSchema
searchQuerySchema

// Files
fileSizeSchema
imageMimeTypeSchema
documentMimeTypeSchema

// Pagination
pageSchema
pageSizeSchema

// Combined Schemas
paymentProofUploadSchema
loginSchema
registerSchema
paginationSchema
```

---

## 🔒 Protected Routes (Middleware)

Routes are automatically protected. No code changes needed!

### Protected Routes
- `/law_documents/*`
- `/law_video/*`
- `/payment/*`
- `/profile_page/*`

### Adding New Protected Routes

Edit `middleware.ts`:

```typescript
const PROTECTED_ROUTES = [
  '/law_documents',
  '/law_video',
  '/payment',
  '/profile_page',
  '/your_new_route',  // Add here
] as const;
```

### Adding Auth Routes

Edit `middleware.ts`:

```typescript
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',  // Add here
] as const;
```

---

## 📁 File Upload Validation

The payment route already has full validation. For new file upload routes:

```typescript
import { validateInput, imageMimeTypeSchema, fileSizeSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Validate file exists
  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }
  
  // Validate file size
  const sizeValidation = validateInput(fileSizeSchema, file.size);
  if (!sizeValidation.success) {
    return NextResponse.json(
      { error: sizeValidation.error },
      { status: 400 }
    );
  }
  
  // Validate MIME type
  const mimeValidation = validateInput(imageMimeTypeSchema, file.type);
  if (!mimeValidation.success) {
    return NextResponse.json(
      { error: mimeValidation.error },
      { status: 400 }
    );
  }
  
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name, userId);
  
  // Continue with upload...
}
```

### Filename Sanitization

```typescript
function sanitizeFilename(filename: string, userId: string): string {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);

  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || '.jpg';
  const timestamp = Date.now();
  
  return `${userId}_${timestamp}_${sanitized || 'file'}${ext}`;
}
```

---

## 🔐 Security Headers

Headers are automatically added to all responses. No code changes needed!

### Testing Headers

```bash
# Check headers in response
curl -I https://your-domain.com

# Should see:
# - Strict-Transport-Security
# - X-Frame-Options
# - X-Content-Type-Options
# - Content-Security-Policy
# ... and more
```

### Updating CSP

If you need to allow additional domains, edit `next.config.ts`:

```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "connect-src 'self' https://*.supabase.co https://*.r2.dev https://your-new-domain.com",
    // ... rest of directives
  ].join('; '),
}
```

---

## 🧪 Testing Examples

### Test Rate Limiting

```bash
# Send multiple requests quickly
for i in {1..6}; do
  curl -X POST https://your-domain.com/api/endpoint
  echo "Request $i"
done

# 6th request should return 429 Too Many Requests
```

### Test File Upload Validation

```bash
# Test with oversized file
curl -X POST https://your-domain.com/api/payment/upload-proof \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@large-file.jpg" \
  -F "planId=monthly" \
  -F "paymentReference=TEST123"

# Should return: "File too large. Maximum size is 5MB"
```

### Test Input Validation

```bash
# Test with invalid UUID
curl "https://your-domain.com/api/books?bookId=invalid-id"

# Should return: {"error":"Invalid book ID format."}
```

### Test Middleware Protection

```bash
# Try accessing protected route without auth
curl https://your-domain.com/law_documents

# Should redirect to: /auth/login?redirectTo=/law_documents
```

---

## 📊 Monitoring & Debugging

### Check Rate Limit Status

In your API route, you can log rate limit info:

```typescript
const result = rateLimit(request, RateLimitPresets.standard);

console.log({
  ip: request.headers.get('x-forwarded-for'),
  limit: result.limit,
  remaining: result.remaining,
  reset: new Date(result.reset),
});
```

### Debug Validation Errors

```typescript
const validation = validateInput(schema, data);

if (!validation.success) {
  console.error('Validation failed:', {
    input: data,
    error: validation.error,
  });
}
```

### Check Middleware Execution

Add logging in `middleware.ts`:

```typescript
export async function middleware(request: NextRequest) {
  console.log('Middleware:', {
    path: request.nextUrl.pathname,
    hasSession: !!session,
    isProtected: isProtectedRoute(request.nextUrl.pathname),
  });
  
  // ... rest of middleware
}
```

---

## 🚀 Common Patterns

### API Route Template (Secure)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitPresets, createRateLimitResponse } from '@/lib/rate-limit';
import { validateInput, uuidSchema } from '@/lib/validation';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = rateLimit(request, RateLimitPresets.standard);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }
    
    // 2. Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    // 3. Input validation
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    const validation = validateInput(uuidSchema, itemId);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // 4. Business logic
    const data = await getItem(validation.data);
    
    // 5. Response
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## ❓ Troubleshooting

### Rate Limit Not Working?

**Problem:** Rate limit not blocking requests

**Solution:** Check IP detection
```typescript
// Add to your API route
const ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown';
console.log('Client IP:', ip);
```

### Validation Always Failing?

**Problem:** Valid data being rejected

**Solution:** Check data type
```typescript
// Zod expects specific types
const validation = validateInput(
  uuidSchema,
  bookId  // Make sure this is a string, not null or undefined
);
```

### Middleware Not Redirecting?

**Problem:** Protected routes accessible without auth

**Solution:** Check matcher configuration
```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
```

### CSP Blocking Resources?

**Problem:** Images or scripts not loading

**Solution:** Update CSP in next.config.ts
```typescript
"img-src 'self' data: https: blob: https://your-cdn.com",
```

---

## 📚 Additional Resources

- [Zod Documentation](https://zod.dev/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HTTP Security Headers](https://owasp.org/www-project-secure-headers/)

---

**Need Help?** Check the full documentation in `RECOMMENDATIONS.md` and `SECURITY_FIXES_SUMMARY.md`
