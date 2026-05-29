/**
 * CSRF Token endpoint
 * Provides CSRF tokens for client-side requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCsrfToken, setCsrfTokenCookie } from '@/lib/security/csrf';
import { enforceRateLimit } from '@/lib/rate-limit/guard';
import { RateLimitPresets } from '@/lib/rate-limit/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const limited = await enforceRateLimit(request, 'api-csrf-token', RateLimitPresets.standard);
  if (limited) return limited;

  const token = getCsrfToken(request);
  const response = NextResponse.json({ csrfToken: token });
  setCsrfTokenCookie(response, token);
  return response;
}
