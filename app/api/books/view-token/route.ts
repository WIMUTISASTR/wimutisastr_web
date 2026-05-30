import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signContentToken, TOKEN_EXPIRY } from "@/lib/security/tokens/content";
import { env } from "@/lib/utils/env";
import { logger } from "@/lib/utils/logger";
import { rateLimit, createRateLimitResponse, RateLimitPresets } from "@/lib/rate-limit/redis";
import { COOKIE_NAMES, jsonResponseWithCookie } from "@/lib/security/secure-cookies";
import { checkMembershipWithCache } from "@/lib/cache";
import { createAdminClient, createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const log = logger.child({ module: 'api/books/view-token' });

function getSupabaseWithToken(token: string) {
  return createClient(env.supabase.url(), env.supabase.anonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

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

function extractBookKey(fileUrl: string): { bucket: "book"; key: string } | null {
  // Supports:
  // - /api/storage/serve?bucket=book&key=...           (relative serve URL)
  // - https://admin.../api/storage/serve?key=...       (absolute serve URL, current uploads)
  // - https://<public>.r2.dev/<key>                    (legacy public URL: pathname = key)
  // - https://.../<key>
  const value = fileUrl.trim();
  if (!value) return null;

  if (value.startsWith("/api/storage/serve")) {
    const u = new URL(value, "http://localhost");
    const key = u.searchParams.get("key");
    if (key) return { bucket: "book", key };
    return null;
  }

  try {
    const u = new URL(value);
    // Absolute serve endpoint: extract the key query param.
    if (u.pathname.endsWith("/api/storage/serve")) {
      const key = u.searchParams.get("key");
      if (key) return { bucket: "book", key };
    }
    // Otherwise treat the URL path as the key (legacy public/custom-domain URLs).
    const key = u.pathname.replace(/^\/+/, "");
    if (!key) return null;
    return { bucket: "book", key };
  } catch {
    return null;
  }
}

function extractFileMetaFromKey(key: string): { filename: string; ext: string } {
  const filename = (key.split("/").pop() || "document").replace(/[\r\n"]/g, "_");
  const lower = filename.toLowerCase();
  const ext = lower.includes(".") ? lower.split(".").pop() || "" : "";
  return { filename, ext };
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimit(req, RateLimitPresets.standard);
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const hasAuth = authHeader.startsWith("Bearer ");

  try {
    // Free documents are viewable by anyone (including anonymous visitors). Members-only
    // documents still require an authenticated user with an active membership.
    let userId = "guest";
    let membershipSupabase: ReturnType<typeof getSupabaseWithToken> | null = null;

    if (hasAuth) {
      const token = authHeader.replace("Bearer ", "");
      membershipSupabase = getSupabaseWithToken(token);
      const { data: authData, error: authError } = await membershipSupabase.auth.getUser(token);
      const user = authData.user;
      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
    }

    const body = (await req.json().catch(() => ({}))) as { bookId?: string };
    const bookId = body.bookId ?? "";
    if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });

    // Look up the book with privileges that also work for anonymous visitors (free docs).
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const lookupClient = hasServiceRole
      ? createAdminClient()
      : membershipSupabase ?? createServerClient();

    const { data: book, error: bookErr } = await lookupClient
      .from("books")
      .select("id,file_url,access_level")
      .eq("id", bookId)
      .maybeSingle();

    if (bookErr) {
      log.error("Book lookup failed", bookErr, { bookId, userId });
      return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
    }
    if (!book?.file_url) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    if (book.access_level !== "free") {
      if (!hasAuth || !membershipSupabase) {
        return NextResponse.json({ error: "Membership required" }, { status: 403 });
      }
      const gate = await requireApprovedMembership(membershipSupabase, userId);
      if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    }

    const loc = extractBookKey(book.file_url);
    if (!loc) return NextResponse.json({ error: "Unsupported document URL format" }, { status: 400 });

    const meta = extractFileMetaFromKey(loc.key);
    const viewToken = signContentToken(
      {
        sub: userId,
        bookId,
        bucket: "book",
        key: loc.key,
      },
      TOKEN_EXPIRY.SHORT_LIVED
    );

    log.info("View token generated", { bookId, userId });
    
    const secureCookie = process.env.NODE_ENV === "production" || process.env.HTTPS === "true";
    const cookiePath = secureCookie ? "/" : "/api/books";
    log.info("Setting book token cookie", {
      bookId,
      userId,
      cookie: COOKIE_NAMES.BOOK_TOKEN,
      secure: secureCookie,
      path: cookiePath,
    });

    // Set token in secure HTTP-only cookie and return metadata
    return jsonResponseWithCookie(
      { 
        // Don't expose token in response body for security
        // Client should use the cookie automatically
        ready: true,
        expiresAt: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY.SHORT_LIVED, 
        url: "/api/books/serve",
        filename: meta.filename, 
        ext: meta.ext 
      },
      COOKIE_NAMES.BOOK_TOKEN,
      viewToken,
      { maxAge: TOKEN_EXPIRY.SHORT_LIVED, path: "/api/books" }
    );
  } catch (e) {
    log.error("POST /api/books/view-token unexpected error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

