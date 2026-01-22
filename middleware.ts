import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { csrfProtection } from '@/lib/security/csrf';
import { env } from '@/lib/utils/env';

/**
 * Routes that require authentication
 * Note: /law_documents and /law_video are now PUBLIC for browsing
 * Only payment and profile require authentication
 */
const PROTECTED_ROUTES = [
  '/payment',
  '/profile_page',
] as const;

/**
 * Routes that should redirect to home if user is already authenticated
 */
const AUTH_ROUTES = ['/auth/login', '/auth/register'] as const;

/**
 * Check if the pathname matches any of the protected routes
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if the pathname is an authentication route
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply CSRF protection to API routes (except public ones)
  if (pathname.startsWith('/api/')) {
    const publicApiRoutes = [
      '/api/csrf-token',
      '/api/home',
      '/api/videos-public',
      '/api/books-public',
      '/api/pricing-plans',
    ];

    const isPublicRoute = publicApiRoutes.some(route => pathname.startsWith(route));
    
    if (!isPublicRoute) {
      const csrfError = csrfProtection(request);
      if (csrfError) {
        return csrfError;
      }
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    env.supabase.url(),
    env.supabase.anonKey(),
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Set cookie in request for current execution
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Set cookie in response for client
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          // Remove cookie from request
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          // Remove cookie from response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute(pathname) && !session) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to home
  if (isAuthRoute(pathname) && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

/**
 * Matcher configuration for middleware
 * Excludes: API routes, static files, images, and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (e.g., .png, .jpg, .css, .js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
