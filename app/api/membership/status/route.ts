import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type MembershipStatus = "pending" | "approved" | "denied" | "none";

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
    return NextResponse.json({ status: "none" satisfies MembershipStatus, membershipEndsAt: null }, { status: 200 });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseWithToken(token);

    const { data: authData } = await supabase.auth.getUser(token);
    const user = authData.user;
    if (!user) {
      return NextResponse.json({ status: "none" satisfies MembershipStatus, membershipEndsAt: null }, { status: 200 });
    }

    const [{ data: profile }, { data: latestVerified }] = await Promise.all([
      supabase.from("user_profiles").select("membership_status").eq("id", user.id).maybeSingle(),
      supabase
        .from("payment_proofs")
        .select("membership_ends_at")
        .eq("user_id", user.id)
        .eq("status", "verified")
        .order("membership_ends_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const status = (profile?.membership_status as MembershipStatus | undefined) ?? ("pending" satisfies MembershipStatus);
    const membershipEndsAt = (latestVerified?.membership_ends_at as string | null | undefined) ?? null;

    return NextResponse.json({ status, membershipEndsAt }, { status: 200 });
  } catch (e) {
    console.error("GET /api/membership/status failed:", e);
    return NextResponse.json({ status: "none" satisfies MembershipStatus, membershipEndsAt: null }, { status: 200 });
  }
}
