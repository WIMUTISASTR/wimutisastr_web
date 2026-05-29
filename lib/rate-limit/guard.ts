import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createRateLimitResponse,
  rateLimit,
  RateLimitPresets,
  type RateLimitConfig,
} from "./redis";

/**
 * Apply rate limiting at the start of a route handler.
 * Returns a 429 response when exceeded, otherwise null.
 */
export async function enforceRateLimit(
  request: NextRequest,
  scope: string,
  config: RateLimitConfig = RateLimitPresets.standard
): Promise<NextResponse | null> {
  const result = await rateLimit(request, { ...config, scope });
  if (!result.success) {
    return createRateLimitResponse(result);
  }
  return null;
}
