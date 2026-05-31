import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { PublicTrainingProgram } from "@/lib/data/training-programs";
import logger from "@/lib/utils/logger";
import { enforceRateLimit } from "@/lib/rate-limit/guard";
import { RateLimitPresets } from "@/lib/rate-limit/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((s) => s.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(
    request,
    "api-training-programs-public",
    RateLimitPresets.publicRead
  );
  if (limited) return limited;

  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let query = supabase
      .from("training_programs")
      .select(
        "id,title,program_type,description,cover_url,event_start_at,event_end_at,location,instructor,highlights,cta_label,cta_url,sort_order"
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("event_start_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (id) {
      query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) {
      logger.error("GET /api/training-programs-public failed:", error);
      return NextResponse.json({ error: "Failed to fetch training programs" }, { status: 500 });
    }

    const programs: PublicTrainingProgram[] = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      program_type: row.program_type,
      description: row.description ?? null,
      cover_url: row.cover_url ?? null,
      event_start_at: row.event_start_at ?? null,
      event_end_at: row.event_end_at ?? null,
      location: row.location ?? null,
      instructor: row.instructor ?? null,
      highlights: normalizeHighlights(row.highlights),
      cta_label: row.cta_label?.trim() || "សួរព័ត៌មាន",
      cta_url: row.cta_url?.trim() || "/contact",
      sort_order: row.sort_order ?? 0,
    }));

    return NextResponse.json({ programs }, { status: 200 });
  } catch (e) {
    logger.error("GET /api/training-programs-public unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
