import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALL_CATEGORY_ID = "__all__";
const UNCATEGORIZED_ID = "__uncategorized__";

type MembershipGate = "anonymous" | "not-approved" | "approved";

export async function GET(req: NextRequest) {
  try {
    // Public endpoint:
    // - Anyone can browse categories + covers (no auth required)
    // - Never expose book file URLs here
    const supabase = createServerClient(); // uses service role if configured (bypasses RLS)
    const serverKeyMode = process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon";

    const authHeader = req.headers.get("authorization") ?? "";
    let membershipGate: MembershipGate = "anonymous";
    if (authHeader.startsWith("Bearer ")) {
      // Best-effort: determine if caller is approved (for debug/UI hints). Browsing is allowed regardless.
      try {
        const token = authHeader.replace("Bearer ", "");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
        if (supabaseUrl && supabaseAnonKey) {
          const authClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } },
          });
          const { data: authData } = await authClient.auth.getUser(token);
          const userId = authData.user?.id ?? null;
          if (userId) {
            const { data: profile } = await authClient
              .from("user_profiles")
              .select("membership_status")
              .eq("id", userId)
              .maybeSingle();
            membershipGate = profile?.membership_status === "approved" ? "approved" : "not-approved";
          } else {
            membershipGate = "anonymous";
          }
        }
      } catch {
        membershipGate = "anonymous";
      }
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const debug = searchParams.get("debug") === "1";

    const booksQuery = (() => {
      // Special virtual categories
      if (!categoryId || categoryId === ALL_CATEGORY_ID) {
        return supabase
          .from("books")
          .select("id,title,author,year,description,cover_url,category_id,uploaded_at")
          .order("uploaded_at", { ascending: false });
      }
      if (categoryId === UNCATEGORIZED_ID) {
        return supabase
          .from("books")
          .select("id,title,author,year,description,cover_url,category_id,uploaded_at")
          .is("category_id", null)
          .order("uploaded_at", { ascending: false });
      }
      return supabase
        .from("books")
        .select("id,title,author,year,description,cover_url,category_id,uploaded_at")
        .eq("category_id", categoryId)
        .order("uploaded_at", { ascending: false });
    })();

    const { data: books, error: bookErr } = await booksQuery;
    if (bookErr) {
      console.error("GET /api/books-public failed:", { bookErr });
      return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
    }

    // Fetch only categories that are actually referenced by the returned books (plus the requested categoryId),
    // so categories display even if the categories table is large or if you only care about linked categories.
    const referencedIds = new Set<string>();
    for (const b of books ?? []) {
      const cid = (b as { category_id?: string | null }).category_id ?? null;
      if (cid) referencedIds.add(cid);
    }
    if (categoryId && categoryId !== ALL_CATEGORY_ID && categoryId !== UNCATEGORIZED_ID) referencedIds.add(categoryId);

    const categoryIds = Array.from(referencedIds);
    const categoriesQuery =
      categoryIds.length > 0
        ? supabase.from("categories").select("*").in("id", categoryIds).order("created_at", { ascending: false })
        : supabase.from("categories").select("*").order("created_at", { ascending: false });

    const { data: categories, error: catErr } = await categoriesQuery;

    if (catErr) {
      console.error("GET /api/books-public failed:", { catErr });
      return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
    }

    // Browsing is always allowed, but never expose actual file URLs from this endpoint.
    const safeBooks = books ?? [];

    const hasBooks = (books ?? []).length > 0;
    const hasUncategorized = (books ?? []).some((b: any) => (b as { category_id?: string | null }).category_id == null);

    const virtualCategories = [
      ...(hasBooks
        ? [
            {
              id: ALL_CATEGORY_ID,
              name: "All Documents",
              description: "Browse all available documents",
            },
          ]
        : []),
      ...(hasUncategorized
        ? [
            {
              id: UNCATEGORIZED_ID,
              name: "Uncategorized",
              description: "Documents that haven’t been assigned to a category yet",
            },
          ]
        : []),
    ];

    const payload: any = { categories: [...virtualCategories, ...(categories ?? [])], books: safeBooks };
    if (debug) {
      payload.debug = {
        categoryId,
        booksCount: (books ?? []).length,
        categoriesCount: (categories ?? []).length,
        referencedCategoryIds: categoryIds,
        membershipGate,
        serverKeyMode,
      };
    }
    return NextResponse.json(payload);
  } catch (e) {
    console.error("GET /api/books-public unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
