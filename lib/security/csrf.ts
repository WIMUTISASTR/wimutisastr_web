/**
 * CSRF (Cross-Site Request Forgery) protection
 * Implements double-submit cookie pattern
 * Note: Uses Web Crypto API for Edge Runtime compatibility
 */

import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_MAX_AGE = 60 * 60; // 1 hour

/**
 * Generate a cryptographically secure CSRF token
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify CSRF token from request
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Timing-safe string comparison
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  // Simple constant-time comparison for strings
  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to JavaScript for reading
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_MAX_AGE,
    path: '/',
  });
}

/**
 * Get or create CSRF token from request
 */
export function getCsrfToken(request: NextRequest): string {
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  
  if (existingToken && existingToken.length === CSRF_TOKEN_LENGTH * 2) {
    return existingToken;
  }
  
  return generateCsrfToken();
}

/**
 * Middleware to enforce CSRF protection on state-changing methods
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();
  
  // Only check CSRF for state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null;
  }

  // Skip CSRF check for routes that use other authentication methods
  const pathname = request.nextUrl.pathname;
  const skipRoutes = [
    '/api/auth/', // Supabase auth routes
  ];

  if (skipRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  // Verify CSRF token
  if (!verifyCsrfToken(request)) {
    return NextResponse.json(
      { 
        error: 'Invalid CSRF token. Please refresh the page and try again.',
        code: 'CSRF_VALIDATION_FAILED',
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Create API route handler with CSRF protection
 */
export function withCsrfProtection<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const csrfError = csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }
    
    return handler(request, ...args);
  };
}

/**
 * API route to get CSRF token
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = getCsrfToken(request);
  const response = NextResponse.json({ csrfToken: token });
  setCsrfTokenCookie(response, token);
  return response;
}
