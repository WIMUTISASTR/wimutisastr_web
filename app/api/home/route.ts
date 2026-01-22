import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

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

export async function GET() {
  try {
    const supabase = createServerClient();

    const [
      { data: videoCategories, error: vcErr },
      { data: videos, error: vErr, count: videosCount },
      { data: books, error: bErr, count: booksCount },
    ] = await Promise.all([
      supabase.from("video_categories").select("id,name,description,cover_url,created_at").order("created_at", { ascending: false }),
      supabase.from("videos").select("id,category_id", { count: "exact" }),
      supabase
        .from("books")
        .select("id,title,description,author,year,cover_url,uploaded_at", { count: "exact" })
        .order("uploaded_at", { ascending: false })
        .limit(6),
    ]);

    if (vcErr || vErr || bErr) {
      console.error("GET /api/home failed:", { vcErr, vErr, bErr });
      return NextResponse.json({ error: "Failed to fetch home data" }, { status: 500 });
    }

    const counts = new Map<string, number>();
    for (const v of videos ?? []) {
      const cid = (v as { category_id?: string | null }).category_id ?? "";
      if (!cid) continue;
      counts.set(cid, (counts.get(cid) ?? 0) + 1);
    }

    const categories: HomeVideoCategory[] = (videoCategories ?? []).map((c) => ({
      id: (c as any).id,
      name: (c as any).name ?? null,
      description: (c as any).description ?? null,
      cover_url: (c as any).cover_url ?? null,
      videoCount: counts.get((c as any).id) ?? 0,
    }));

    const featuredBooks: HomeBook[] = (books ?? []).map((b: any) => ({
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
          videosCount: videosCount ?? (videos?.length ?? 0),
          booksCount: booksCount ?? (books?.length ?? 0),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/home unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

