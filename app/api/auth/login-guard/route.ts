import { NextRequest, NextResponse } from "next/server";
import {
  clearFailedAttempts,
  getLockoutTimeRemaining,
  isLockedOut,
  recordFailedAuth,
} from "@/lib/security/auth-lockout";
import { getClientIpFromRequest } from "@/lib/security/client-ip";
import { enforceRateLimit } from "@/lib/rate-limit/guard";
import { RateLimitPresets } from "@/lib/rate-limit/redis";

export const dynamic = "force-dynamic";

async function guardRateLimit(request: NextRequest) {
  return enforceRateLimit(request, "auth-login-guard", RateLimitPresets.auth);
}

export async function GET(request: NextRequest) {
  const limited = await guardRateLimit(request);
  if (limited) return limited;

  const ip = getClientIpFromRequest(request);
  const locked = await isLockedOut(ip);

  if (!locked) {
    return NextResponse.json({ locked: false, retryAfter: 0 });
  }

  const retryAfter = await getLockoutTimeRemaining(ip);
  return NextResponse.json(
    { locked: true, retryAfter },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(retryAfter, 60)) },
    }
  );
}

export async function POST(request: NextRequest) {
  const limited = await guardRateLimit(request);
  if (limited) return limited;

  const ip = getClientIpFromRequest(request);
  let body: { action?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "success") {
    await clearFailedAttempts(ip);
    return NextResponse.json({ ok: true, locked: false, retryAfter: 0 });
  }

  if (body.action === "failed") {
    const locked = await recordFailedAuth(ip);
    const retryAfter = locked ? await getLockoutTimeRemaining(ip) : 0;

    if (locked) {
      return NextResponse.json(
        { ok: false, locked: true, retryAfter },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(retryAfter, 60)) },
        }
      );
    }

    return NextResponse.json({ ok: true, locked: false, retryAfter: 0 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
