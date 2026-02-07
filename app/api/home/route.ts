import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import logger from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HomeVideoCategory = {
  id: string;
  name: string | null;
  description: string | null;
  cover_url: string | null;
  videoCount: number;
};

type HomeBook = {
  id: string;
  title: string;
  description: string | null;
  author: string;
  year: number;
  cover_url: string | null;
};

type VideoCategoryRow = {
  id: string;
  name: string | null;
  description: string | null;
  cover_url: string | null;
  created_at: string | null;
};

type VideoRow = {
  id: string;
  category_id: string | null;
  access_level: "free" | "members" | null;
};

type BookRow = {
  id: string;
  title: string;
  description: string | null;
  author: string;
  year: number;
  cover_url: string | null;
  uploaded_at: string | null;
  access_level: "free" | "members" | null;
};

export async function GET() {
  try {
    // Home is public; use service role to avoid RLS hiding content.
    // Only select safe public fields (never return file URLs).
    const supabase = createAdminClient();

    const [
      { data: videoCategories, error: vcErr },
      { data: videos, error: vErr, count: videosCount },
      { data: books, error: bErr, count: booksCount },
    ] = await Promise.all([
      supabase
        .from("video_categories")
        .select("id,name,description,cover_url,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("videos").select("id,category_id,access_level", { count: "exact" }),
      supabase
        .from("books")
        .select("id,title,description,author,year,cover_url,uploaded_at,access_level", { count: "exact" })
        .order("uploaded_at", { ascending: false })
        .limit(6),
    ]);

    const typedVideoCategories = videoCategories as VideoCategoryRow[] | null;
    const typedVideos = videos as VideoRow[] | null;
    const typedBooks = books as BookRow[] | null;

    if (vcErr || vErr || bErr) {
      logger.error("GET /api/home failed:", { vcErr, vErr, bErr });
      return NextResponse.json({ error: "Failed to fetch home data" }, { status: 500 });
    }

    const counts = new Map<string, number>();
    for (const v of typedVideos ?? []) {
      const cid = v.category_id ?? "";
      if (!cid) continue;
      counts.set(cid, (counts.get(cid) ?? 0) + 1);
    }

    const categories: HomeVideoCategory[] = (typedVideoCategories ?? []).map((c) => ({
      id: c.id,
      name: c.name ?? null,
      description: c.description ?? null,
      cover_url: c.cover_url ?? null,
      videoCount: counts.get(c.id) ?? 0,
    }));

    const featuredBooks: HomeBook[] = (typedBooks ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description ?? null,
      author: b.author,
      year: b.year,
      cover_url: b.cover_url ?? null,
    }));

    return NextResponse.json(
      {
        categories,
        featuredBooks,
        stats: {
          categoriesCount: categories.length,
          videosCount: videosCount ?? (typedVideos?.length ?? 0),
          booksCount: booksCount ?? (typedBooks?.length ?? 0),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    logger.error("GET /api/home unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
