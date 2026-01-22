import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signStorageToken, TOKEN_EXPIRY } from "@/lib/security/tokens/storage";
import { env } from "@/lib/utils/env";
import { logger } from "@/lib/utils/logger";
import { rateLimit, createRateLimitResponse, RateLimitPresets } from "@/lib/rate-limit/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const log = logger.child({ module: 'api/storage/view-token' });

function getSupabaseWithToken(token: string) {
  return createClient(env.supabase.url(), env.supabase.anonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

async function requireApprovedMembership(supabase: ReturnType<typeof getSupabaseWithToken>, userId: string) {
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("membership_status")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    log.error("Membership check failed", error, { userId });
    return { ok: false as const, status: 500, error: "Failed to verify membership" };
  }

  if (profile?.membership_status !== "approved") {
    return { ok: false as const, status: 403, error: "Membership required" };
  }

  return { ok: true as const };
}

function isSafeKey(key: string): boolean {
  if (!key) return false;
  if (key.startsWith("/")) return false;
  if (key.includes("..")) return false;
  return true;
}

type Body = {
  bucket?: "book" | "video" | "proof-payment";
  key?: string;
};

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimit(req, RateLimitPresets.standard);
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseWithToken(token);

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData.user;
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const bucket = body.bucket ?? null;
    const key = (body.key ?? "").trim();

    if (!bucket || !key) return NextResponse.json({ error: "Missing bucket or key" }, { status: 400 });
    if (!isSafeKey(key)) return NextResponse.json({ error: "Invalid key" }, { status: 400 });

    // For protected media, require membership.
    // If you later want public thumbnails/covers, we can relax this per-bucket or per-prefix.
    if (bucket === "book" || bucket === "video") {
      const gate = await requireApprovedMembership(supabase, user.id);
      if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    }

    // proof-payment should not be publicly mintable from user sessions here
    if (bucket === "proof-payment") {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const viewToken = signStorageToken(
      { sub: user.id, bucket, key },
      TOKEN_EXPIRY.SHORT_LIVED
    );

    log.info("Storage view token generated", { userId: user.id, bucket });

    return NextResponse.json(
      {
        token: viewToken,
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY.SHORT_LIVED,
        url: `/api/storage/serve?token=${encodeURIComponent(viewToken)}`,
      },
      { status: 200 }
    );
  } catch (e) {
    log.error("POST /api/storage/view-token failed", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

