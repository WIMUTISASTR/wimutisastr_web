import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit/guard";
import { RateLimitPresets } from "@/lib/rate-limit/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "api-videos-public", RateLimitPresets.publicRead);
  if (limited) return limited;

  try {
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = hasServiceRole ? createAdminClient() : createServerClient();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const videosQuery = categoryId
      ? supabase
          .from("videos")
          .select("id, title, description, thumbnail_url, category_id, uploaded_at, presented_by, access_level")
          .eq("category_id", categoryId)
          .order("uploaded_at", { ascending: false })
      : supabase
          .from("videos")
          .select("id, title, description, thumbnail_url, category_id, uploaded_at, presented_by, access_level")
          .order("uploaded_at", { ascending: false });

    const [{ data: categories, error: catErr }, { data: videos, error: vidErr }] = await Promise.all([
      supabase.from("video_categories").select("id, name, description, cover_url").order("created_at", { ascending: false }),
      videosQuery,
    ]);

    if (catErr || vidErr) {
      console.error("GET /api/videos-public failed:", { catErr, vidErr });
      return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }

    return NextResponse.json({ categories: categories ?? [], videos: videos ?? [] });
  } catch (e) {
    console.error("GET /api/videos-public unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
