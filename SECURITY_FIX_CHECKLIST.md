# 🔒 Security Fix Checklist

Quick reference for implementing security fixes from the audit report.

## ✅ CRITICAL FIXES (Do First)

### 1. XSS Protection - DOMPurify
```bash
npm install dompurify isomorphic-dompurify
npm install --save-dev @types/dompurify
```

**File:** `app/law_documents/[categoryId]/read/[bookId]/page.tsx`
- [ ] Import DOMPurify
- [ ] Sanitize `docxHtml` before rendering
- [ ] Test with malicious DOCX file

### 2. Environment Variables
**Files to update:**
- [ ] `lib/r2-client.ts` - Replace all `process.env` with `env.*`
- [ ] `lib/supabase-server.ts` - Use env.ts imports
- [ ] `lib/telegram.ts` - Use env.ts imports
- [ ] `app/api/videos/serve/route.ts` - Line 85
- [ ] `app/api/books-public/route.ts` - Line 18

### 3. Separate Admin Client
**File:** `lib/supabase-server.ts`
- [ ] Create `createAdminClient()` function
- [ ] Keep `createServerClient()` using anon key only
- [ ] Create `createAuthenticatedClient()` function
- [ ] Audit all API routes using service role

### 4. CORS Configuration
**File:** `next.config.ts`
- [ ] Add CORS headers to `/api/:path*`
- [ ] Add `ALLOWED_ORIGINS` to `.env.example`
- [ ] Configure production origins

## 🟠 HIGH PRIORITY

### 5. Redis Rate Limiting
- [ ] Sign up for Upstash Redis (free tier)
- [ ] Add credentials to `.env.local`
- [ ] Test rate limiting with Redis
- [ ] Deploy to production

### 6. Auth Rate Limiting
**Files:** `app/api/auth/**/route.ts`
- [ ] Add strict rate limiting (5 attempts per 5 min)
- [ ] Implement IP-based lockout
- [ ] Add security event logging

### 7. Input Validation
**Files:** All API routes
- [ ] `app/api/storage/serve/route.ts` - Add Zod schema
- [ ] `app/api/videos/serve/route.ts` - Add Zod schema
- [ ] `app/api/home/route.ts` - Add validation
- [ ] Test with invalid inputs

### 8. Request Size Limits
**File:** `next.config.ts`
- [ ] Add `bodySizeLimit: '10mb'`
- [ ] Add size checks to upload endpoints
- [ ] Test with large requests

### 9. Enhanced Logging
**File:** `lib/logger.ts`
- [ ] Add recursive sanitization
- [ ] Add PII detection (email, phone)
- [ ] Test with sensitive data

## 🟡 MEDIUM PRIORITY

### 10. Route-Specific Headers
**File:** `next.config.ts`
- [ ] Stricter CSP for `/payment/:path*`
- [ ] No-cache headers for `/profile_page/:path*`
- [ ] Test headers in browser devtools

### 11. Security Monitoring
**New file:** `lib/security-monitor.ts`
- [ ] Create security event logger
- [ ] Integrate into API routes
- [ ] Setup external monitoring (optional)

### 12. Token Rotation
**New file:** `lib/token-rotation.ts`
- [ ] Implement versioned tokens
- [ ] Add old secrets support
- [ ] Update token signing/verification

### 13. Audit Logging
**New file:** `lib/audit-log.ts`
- [ ] Create audit log functions
- [ ] Add database migration
- [ ] Log all admin actions

### 14. Tighten CSP
**File:** `middleware.ts`
- [ ] Implement nonce-based CSP
- [ ] Update layout to use nonces
- [ ] Remove `unsafe-inline` and `unsafe-eval`

### 15. Secure Client Storage
**New file:** `lib/secure-storage.ts`
- [ ] Create encrypted storage wrapper
- [ ] Replace localStorage usage in:
  - [ ] `app/page.tsx`
  - [ ] `app/payment/success/page.tsx`
- [ ] Use sessionStorage for temporary data

### 16. Connection Pooling
**File:** `lib/supabase-server.ts`
- [ ] Add connection options
- [ ] Disable session persistence server-side
- [ ] Monitor connection usage

## 🟢 BEST PRACTICES

### 17. Update .gitignore
- [ ] Verify all `.env*` patterns listed
- [ ] Add `*.pem`, `*.key`, `*.cert`

### 18. Subresource Integrity
- [ ] Add SRI hashes to external scripts
- [ ] Add SRI hashes to external stylesheets

### 19. DNS Security
- [ ] Enable DNSSEC for domain
- [ ] Add CAA records
- [ ] Verify DNS configuration

### 20. Security.txt
- [ ] Create `public/.well-known/security.txt`
- [ ] Add security contact info
- [ ] Set expiration date

## 📝 TESTING

### Security Testing
- [ ] Run `npm audit`
- [ ] Run Snyk scan
- [ ] Test XSS payloads
- [ ] Test file upload with malicious files
- [ ] Test SQL injection
- [ ] Test path traversal
- [ ] Test rate limiting
- [ ] Verify CSRF protection
- [ ] Test authentication bypass
- [ ] Verify authorization

### Performance Testing
- [ ] Load test with rate limiting enabled
- [ ] Monitor Redis performance
- [ ] Check response times with security headers

## 📊 PROGRESS TRACKING

**Critical:** ☐☐☐☐ (0/4)  
**High:** ☐☐☐☐☐ (0/5)  
**Medium:** ☐☐☐☐☐☐☐ (0/7)  
**Best Practices:** ☐☐☐☐ (0/4)

**Overall Progress:** 0/20 (0%)

---

## 🚀 QUICK START (First 30 Minutes)

```bash
# 1. Install DOMPurify
npm install dompurify isomorphic-dompurify @types/dompurify

# 2. Create a new branch
git checkout -b security-fixes

# 3. Fix the XSS vulnerability (highest risk)
# Edit: app/law_documents/[categoryId]/read/[bookId]/page.tsx

# 4. Run tests
npm run build
npm run dev

# 5. Test the fix
# Upload a DOCX with <script>alert('XSS')</script> in it
# Verify it doesn't execute
```

## 📞 QUESTIONS?

Refer to the full `SECURITY_AUDIT_REPORT.md` for detailed explanations and code examples.

---

**Last Updated:** January 22, 2026
