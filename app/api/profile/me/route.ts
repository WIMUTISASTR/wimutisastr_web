import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MembershipStatus = "pending" | "approved" | "denied" | "none";
type PaymentProofStatus = "pending" | "verified" | "rejected" | string;

function getSupabaseWithToken(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase env");

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function normalizeDuration(row: Record<string, unknown> | null | undefined): string | null {
  const explicit =
    (row?.duration as unknown) ??
    (row?.duration_label as unknown) ??
    (row?.duration_text as unknown) ??
    (row?.period as unknown) ??
    (row?.label as unknown);
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();

  const months = toNumber((row?.duration_months as unknown) ?? (row?.months as unknown));
  if (months !== null) {
    if (months === 1) return "1 Month";
    if (months === 12) return "1 Year";
    return `${months} Months`;
  }

  const days = toNumber((row?.duration_days as unknown) ?? (row?.days as unknown));
  if (days !== null) return `${days} days`;

  return null;
}

async function lookupPlan(planId: string) {
  const db = createServerClient();
  const candidates = [
    process.env.PRICING_PLANS_TABLE,
    "subscription_plans",
    "pricing_plans",
    "plans",
  ].filter(Boolean) as string[];

  for (const table of Array.from(new Set(candidates))) {
    const { data, error } = await db.from(table).select("*").eq("id", planId).maybeSingle();
    if (error || !data) continue;
    const row = data as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name : typeof row.title === "string" ? row.title : null;
    const price = toNumber(row.price ?? row.amount ?? row.price_usd ?? row.usd_price);
    const currency = typeof row.currency === "string" ? row.currency : null;
    const qrCodeUrl = typeof row.qr_code_url === "string" ? row.qr_code_url : null;
    return {
      id: planId,
      name,
      price,
      currency,
      duration: normalizeDuration(row),
      qrCodeUrl,
    };
  }

  return null;
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

    const db = createServerClient();

    const [{ data: profile }, { data: latestProof }, { data: latestVerified }] = await Promise.all([
      db
        .from("user_profiles")
        .select("id,full_name,email,membership_status,membership_notes,membership_approved_at,membership_denied_at,created_at,updated_at")
        .eq("id", user.id)
        .maybeSingle(),
      db
        .from("payment_proofs")
        .select("id,status,amount,plan_id,payment_reference,uploaded_at,membership_starts_at,membership_ends_at,proof_url")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      db
        .from("payment_proofs")
        .select("membership_ends_at")
        .eq("user_id", user.id)
        .eq("status", "verified")
        .order("membership_ends_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const membershipEndsAt = (latestVerified?.membership_ends_at as string | null | undefined) ?? null;

    const membershipStatusRaw = (profile as { membership_status?: unknown } | null)?.membership_status;
    const membershipStatus: MembershipStatus =
      membershipStatusRaw === "approved" || membershipStatusRaw === "pending" || membershipStatusRaw === "denied"
        ? (membershipStatusRaw as MembershipStatus)
        : membershipStatusRaw === "none"
          ? "none"
          : "none";

    const proofStatus = (latestProof?.status as PaymentProofStatus | null | undefined) ?? null;
    const planId = (latestProof?.plan_id as string | null | undefined) ?? null;
    const plan = planId ? await lookupPlan(planId) : null;

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email ?? null,
          createdAt: user.created_at ?? null,
          lastSignInAt: (user.last_sign_in_at as string | null | undefined) ?? null,
          userMetadata: user.user_metadata ?? {},
        },
        profile: profile ?? null,
        membership: {
          status: membershipStatus,
          membershipEndsAt,
          notes: (profile as { membership_notes?: unknown } | null)?.membership_notes ?? null,
        },
        latestProof: latestProof
          ? {
              id: latestProof.id as string,
              status: proofStatus,
              planId,
              amount: (latestProof.amount as number | null | undefined) ?? null,
              reference: (latestProof.payment_reference as string | null | undefined) ?? null,
              uploadedAt: (latestProof.uploaded_at as string | null | undefined) ?? null,
              membershipStartsAt: (latestProof.membership_starts_at as string | null | undefined) ?? null,
              membershipEndsAt: (latestProof.membership_ends_at as string | null | undefined) ?? null,
              proofUrl: (latestProof.proof_url as string | null | undefined) ?? null,
            }
          : null,
        plan,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/profile/me failed:", e);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

