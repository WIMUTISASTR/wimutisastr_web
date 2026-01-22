import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PricingPlan = {
  id: string;
  name: string;
  duration: string;
  price: number;
  description?: string | null;
  currency?: string | null;
  qrCodeUrl?: string | null;
  originalPrice?: number;
  discount?: string;
  features: string[];
  popular?: boolean;
};

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function normalizeFeatures(row: any): string[] {
  const v = row?.features ?? row?.feature_list ?? row?.benefits ?? row?.items;
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string") {
    // JSON array or newline-separated
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return v
      .split(/\r?\n|•|- /g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeDuration(row: any): string {
  const explicit =
    row?.duration ??
    row?.duration_label ??
    row?.duration_text ??
    row?.period ??
    row?.label;
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();

  const months = toNumber(row?.duration_months ?? row?.months);
  if (months !== null) {
    if (months === 1) return "1 Month";
    if (months === 12) return "1 Year";
    return `${months} Months`;
  }

  const days = toNumber(row?.duration_days ?? row?.days);
  if (days !== null) return `${days} days`;

  return "";
}

function normalizePlan(row: any): PricingPlan | null {
  const id = String(row?.id ?? row?.plan_id ?? row?.slug ?? row?.code ?? "").trim();
  const name = String(row?.name ?? row?.title ?? row?.plan_name ?? "").trim();

  const price = toNumber(row?.price ?? row?.amount ?? row?.price_usd ?? row?.usd_price);
  if (!id || !name || price === null) return null;

  const description = typeof row?.description === "string" ? row.description : row?.description ?? null;
  const currency = typeof row?.currency === "string" ? row.currency : row?.currency ?? null;
  const qrCodeUrl =
    typeof row?.qr_code_url === "string"
      ? row.qr_code_url
      : typeof row?.qrCodeUrl === "string"
        ? row.qrCodeUrl
        : typeof row?.qr_code === "string"
          ? row.qr_code
          : null;

  const originalPrice = toNumber(row?.original_price ?? row?.originalPrice ?? row?.compare_at_price);
  const discount = String(row?.discount ?? row?.discount_text ?? row?.badge ?? "").trim() || undefined;
  const popular = Boolean(row?.popular ?? row?.is_popular ?? false);

  const duration = normalizeDuration(row);
  const features = normalizeFeatures(row);

  return {
    id,
    name,
    duration,
    price,
    ...(description !== undefined ? { description } : {}),
    ...(currency !== undefined ? { currency } : {}),
    ...(qrCodeUrl !== undefined ? { qrCodeUrl } : {}),
    ...(originalPrice !== null ? { originalPrice } : {}),
    ...(discount ? { discount } : {}),
    ...(popular ? { popular } : {}),
    features,
  };
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const idFilter = searchParams.get("id");

  const candidates = uniq(
    [
      process.env.PRICING_PLANS_TABLE,
      "subscription_plans",
      "pricing_plans",
      "plans",
    ].filter(Boolean) as string[]
  );

  for (const table of candidates) {
    const query = idFilter ? supabase.from(table).select("*").eq("id", idFilter) : supabase.from(table).select("*");
    const { data, error } = await query;
    if (error) continue;

    const rows = (data ?? []) as any[];
    const activeRows = rows.filter((r) => {
      const active = r?.active ?? r?.is_active;
      return active === undefined ? true : Boolean(active);
    });

    const plans = activeRows
      .map(normalizePlan)
      .filter(Boolean) as PricingPlan[];

    plans.sort((a, b) => {
      const ai = rows.find((r) => String(r?.id ?? r?.plan_id ?? r?.slug ?? r?.code) === a.id);
      const bi = rows.find((r) => String(r?.id ?? r?.plan_id ?? r?.slug ?? r?.code) === b.id);
      const ao = toNumber((ai as any)?.sort_order ?? (ai as any)?.position) ?? 0;
      const bo = toNumber((bi as any)?.sort_order ?? (bi as any)?.position) ?? 0;
      if (ao !== bo) return ao - bo;
      return a.price - b.price;
    });

    if (plans.length > 0) {
      return NextResponse.json({ table, plans });
    }
  }

  return NextResponse.json(
    {
      error:
        "No pricing plans table found. Set PRICING_PLANS_TABLE env or create a table named subscription_plans/pricing_plans/plans with columns like id,name,price,features.",
      plans: [],
    },
    { status: 404 }
  );
}

