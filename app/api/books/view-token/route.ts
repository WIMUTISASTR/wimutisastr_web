import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signContentToken, TOKEN_EXPIRY } from "@/lib/security/tokens/content";
import { env } from "@/lib/utils/env";
import { logger } from "@/lib/utils/logger";
import { rateLimit, createRateLimitResponse, RateLimitPresets } from "@/lib/rate-limit/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const log = logger.child({ module: 'api/books/view-token' });

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

function extractBookKey(fileUrl: string): { bucket: "book"; key: string } | null {
  // Supports:
  // - /api/storage/serve?bucket=book&key=...
  // - https://<public>.r2.dev/<key>
  // - https://.../<key>
  const value = fileUrl.trim();
  if (!value) return null;

  if (value.startsWith("/api/storage/serve")) {
    const u = new URL(value, "http://localhost");
    const bucket = u.searchParams.get("bucket");
    const key = u.searchParams.get("key");
    if (bucket === "book" && key) return { bucket: "book", key };
    return null;
  }

  try {
    const u = new URL(value);
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

    const gate = await requireApprovedMembership(supabase, user.id);
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const body = (await req.json().catch(() => ({}))) as { bookId?: string };
    const bookId = body.bookId ?? "";
    if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });

    const { data: book, error: bookErr } = await supabase
      .from("books")
      .select("id,file_url")
      .eq("id", bookId)
      .maybeSingle();

    if (bookErr) {
      log.error("Book lookup failed", bookErr, { bookId, userId: user.id });
      return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
    }
    if (!book?.file_url) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const loc = extractBookKey(book.file_url);
    if (!loc) return NextResponse.json({ error: "Unsupported document URL format" }, { status: 400 });

    const meta = extractFileMetaFromKey(loc.key);
    const viewToken = signContentToken(
      {
        sub: user.id,
        bookId,
        bucket: "book",
        key: loc.key,
      },
      TOKEN_EXPIRY.SHORT_LIVED
    );

    log.info("View token generated", { bookId, userId: user.id });
    return NextResponse.json({ 
      token: viewToken, 
      expiresAt: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY.SHORT_LIVED, 
      filename: meta.filename, 
      ext: meta.ext 
    });
  } catch (e) {
    log.error("POST /api/books/view-token unexpected error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

