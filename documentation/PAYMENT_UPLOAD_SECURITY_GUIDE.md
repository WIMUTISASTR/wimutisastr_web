# How to Apply Security Fixes to Payment Upload Route

Due to the complexity of the existing `/app/api/payment/upload-proof/route.ts` file, here's a step-by-step guide to add security features:

## Step 1: Add Imports

At the top of the file, add:

```typescript
import { rateLimit, createRateLimitResponse, RateLimitPresets } from '@/lib/rate-limit';
```

## Step 2: Add Constants (after imports)

```typescript
// File Upload Security Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
```

## Step 3: Add Validation Functions (before POST function)

```typescript
function validateUploadedFile(file: File): string | null {
  if (!file || !file.name) return 'No file provided';
  if (file.size === 0) return 'File is empty';
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
    return `File too large. Maximum size is ${maxSizeMB}MB`;
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return `Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} are allowed`;
  }
  const fileExt = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt as any)) {
    return `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed`;
  }
  return null;
}

function sanitizeFilename(filename: string, userId: string): string {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || '.jpg';
  const timestamp = Date.now();
  return `${userId}_${timestamp}_${sanitized || 'payment_proof'}${ext}`;
}
```

## Step 4: Add Rate Limiting (at start of POST function)

```typescript
export async function POST(request: NextRequest) {
  try {
    // Add rate limiting check
    const rateLimitResult = rateLimit(request, RateLimitPresets.upload);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(
        rateLimitResult,
        'Too many upload attempts. Please try again later.'
      );
    }
    
    // ... rest of your existing code
```

## Step 5: Add File Validation (after getting file from formData)

```typescript
    const file = formData.get('proof') as File;
    
    // Add validation
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const fileValidationError = validateUploadedFile(file);
    if (fileValidationError) {
      return NextResponse.json({ error: fileValidationError }, { status: 400 });
    }
```

## Step 6: Use Sanitized Filename (when uploading to R2)

```typescript
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const sanitizedFilename = sanitizeFilename(file.name, user.id);
    const storageKey = `payment-proofs/${sanitizedFilename}`;
    
    const proofUrl = await uploadToR2(
      bucketName,
      storageKey,
      fileBuffer,
      file.type
    );
```

## Alternatively: Use the Complete Secure Version

If you want a fully secured version from scratch, I can create a new file. The existing implementation has validation but it can be enhanced with:

1. Rate limiting (3 uploads per 5 minutes)
2. File size validation (5MB max)
3. MIME type validation (images only)
4. File extension validation
5. Filename sanitization
6. Better error messages
7. Type-safe validation with Zod

Would you like me to create a new secure version of the upload route?
