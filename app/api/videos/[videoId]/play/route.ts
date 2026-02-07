import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signVideoToken, TOKEN_EXPIRY } from "@/lib/security/tokens/video";
import { env } from "@/lib/utils/env";
import logger from "@/lib/utils/logger";
import { rateLimit, createRateLimitResponse, RateLimitPresets } from "@/lib/rate-limit/redis";
import { COOKIE_NAMES, jsonResponseWithCookie } from "@/lib/security/secure-cookies";
import { checkMembershipWithCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

const log = logger.child({ module: 'api/videos/play' });

function getSupabaseWithToken(token: string) {
  return createClient(env.supabase.url(), env.supabase.anonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

/**
 * Check membership with caching support
 * First tries the cache, then falls back to database query
 */
async function requireApprovedMembership(supabase: ReturnType<typeof getSupabaseWithToken>, userId: string) {
  const result = await checkMembershipWithCache(userId, async () => {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("membership_status, membership_ends_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      log.error("Membership check failed", error, { userId });
      throw error;
    }

    return {
      status: (profile?.membership_status as 'approved' | 'pending' | 'rejected' | 'expired' | 'none') ?? 'none',
      membershipEndsAt: profile?.membership_ends_at ?? null,
    };
  });

  if (result.status !== "approved") {
    return { ok: false as const, status: 403, error: "Membership required" };
  }

  return { ok: true as const };
}

function extractR2Key(fileUrl: string): { kind: "r2"; key: string } | { kind: "unknown"; url: string } {
  const trimmed = (fileUrl ?? "").trim();
  if (!trimmed) return { kind: "unknown", url: "" };

  try {
    const u = new URL(trimmed);

    // If this is already our storage serve endpoint, try to extract key=...
    if (u.pathname.endsWith("/api/storage/serve")) {
      const key = u.searchParams.get("key") ?? "";
      if (key) return { kind: "r2", key };
    }

    // Otherwise treat URL path as key (common for public R2/custom domains): https://host/<key>
    const key = u.pathname.replace(/^\/+/, "");
    if (key) return { kind: "r2", key };
    return { kind: "unknown", url: trimmed };
  } catch {
    // Not a URL; assume it is already a key
    return { kind: "r2", key: trimmed.replace(/^\/+/, "") };
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ videoId: string }> }) {
  // Rate limiting
  const rateLimitResult = await rateLimit(req, RateLimitPresets.standard);
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = await ctx.params;
  if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

  try {
    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseWithToken(token);

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData.user;
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: video, error: vidErr } = await supabase
      .from("videos")
      .select("id,file_url,access_level")
      .eq("id", videoId)
      .maybeSingle();
    if (vidErr) {
      log.error("GET /api/videos/[id]/play failed", vidErr, { videoId, userId: user.id });
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
    }
    if (!video?.file_url) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (video.access_level !== "free") {
      const gate = await requireApprovedMembership(supabase, user.id);
      if (!gate.ok) {
        return NextResponse.json({ error: gate.error }, { status: gate.status });
      }
    }

    const extracted = extractR2Key(String(video.file_url));

    if (extracted.kind !== "r2" || !extracted.key) {
      return NextResponse.json({ error: "Unsupported video URL" }, { status: 400 });
    }

    const playToken = signVideoToken(
      {
        sub: user.id,
        videoId,
        bucket: "video",
        key: extracted.key,
      },
      TOKEN_EXPIRY.VIDEO_PLAY
    );

    // URL for the serve endpoint (token will be in cookie)
    const url = `/api/videos/serve`;
    
    log.info("Video play token generated", { videoId, userId: user.id });
    
    // Set token in secure HTTP-only cookie and return the serve URL
    return jsonResponseWithCookie(
      { 
        kind: "r2_proxy", 
        url, 
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY.VIDEO_PLAY 
      },
      COOKIE_NAMES.VIDEO_TOKEN,
      playToken,
      { maxAge: TOKEN_EXPIRY.VIDEO_PLAY, path: "/api/videos" }
    );
  } catch (e) {
    log.error("GET /api/videos/[id]/play unexpected error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

