/**
 * CSRF Token endpoint
 * Provides CSRF tokens for client-side requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCsrfToken, setCsrfTokenCookie } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = getCsrfToken(request);
  const response = NextResponse.json({ csrfToken: token });
  setCsrfTokenCookie(response, token);
  return response;
}
