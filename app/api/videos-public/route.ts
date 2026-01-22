import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseWithToken(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase env");

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const [{ data: categories, error: catErr }, { data: videos, error: vidErr }] = await Promise.all([
      supabase.from("video_categories").select("*").order("created_at", { ascending: false }),
      categoryId
        ? supabase.from("videos").select("*").eq("category_id", categoryId).order("uploaded_at", { ascending: false })
        : supabase.from("videos").select("*").order("uploaded_at", { ascending: false }),
    ]);

    if (catErr || vidErr) {
      console.error("GET /api/videos-public failed:", { catErr, vidErr });
      return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }

    // Never expose video file URLs from the "public" listing endpoint (even for approved users).
    const safeVideos = (videos ?? []).map((v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      thumbnail_url: v.thumbnail_url,
      category_id: v.category_id,
      uploaded_at: v.uploaded_at,
      presented_by: v.presented_by,
    }));

    return NextResponse.json({ categories: categories ?? [], videos: safeVideos });
  } catch (e) {
    console.error("GET /api/videos-public unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
