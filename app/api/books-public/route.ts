import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient, createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALL_CATEGORY_ID = "__all__";
const UNCATEGORIZED_ID = "__uncategorized__";

type MembershipGate = "anonymous" | "not-approved" | "approved";

type PublicBookRow = {
  id: string;
  title: string;
  author: string;
  year: number;
  description: string | null;
  cover_url: string | null;
  category_id: string | null;
  uploaded_at: string | null;
};

type PublicCategoryRow = {
  id: string;
  name?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  parent_id?: string | null;
} & Record<string, unknown>;

type BooksPublicDebug = {
  categoryId: string | null;
  booksCount: number;
  categoriesCount: number;
  virtualCategoriesCount: number;
  membershipGate: MembershipGate;
  serverKeyMode: "service_role" | "anon";
  hasBooks: boolean;
  hasUncategorized: boolean;
};

type BooksPublicResponse = {
  categories: PublicCategoryRow[];
  books: PublicBookRow[];
  debug?: BooksPublicDebug;
};

export async function GET(req: NextRequest) {
  try {
    console.log('[books-public] Starting request');
    // Public endpoint:
    // - Anyone can browse categories + covers (no auth required)
    // - Never expose book file URLs here
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    // Use service role (bypass RLS) for public browsing, but only return safe fields (no file_url).
    const supabase = hasServiceRole ? createAdminClient() : createServerClient();
    const serverKeyMode = hasServiceRole ? "service_role" : "anon";
    console.log('[books-public] Server key mode:', serverKeyMode);

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
    console.log('[books-public] Category ID:', categoryId, 'Debug:', debug);

    console.log('[books-public] Building books query...');
    const booksQuery = (() => {
      // Special virtual categories
      if (!categoryId || categoryId === ALL_CATEGORY_ID) {
        return supabase
          .from<PublicBookRow>("books")
          .select("id,title,author,year,description,cover_url,category_id,uploaded_at")
          .order("uploaded_at", { ascending: false });
      }
      if (categoryId === UNCATEGORIZED_ID) {
        return supabase
          .from<PublicBookRow>("books")
          .select("id,title,author,year,description,cover_url,category_id,uploaded_at")
          .is("category_id", null)
          .order("uploaded_at", { ascending: false });
      }
      return supabase
        .from<PublicBookRow>("books")
        .select("id,title,author,year,description,cover_url,category_id,uploaded_at")
        .eq("category_id", categoryId)
        .order("uploaded_at", { ascending: false });
    })();

    console.log('[books-public] Executing books query...');
    const { data: books, error: bookErr } = await booksQuery;
    console.log('[books-public] Books query completed. Count:', books?.length ?? 0);
    
    if (bookErr) {
      console.error("[books-public] Books query error:", bookErr);
      return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
    }

    // When browsing all categories (no categoryId specified), fetch ALL categories
    // When browsing a specific category, fetch all categories (so user can navigate)
    // This ensures categories are always shown even if books don't reference them
    
    console.log('[books-public] Building categories query...');
    const categoriesQuery = supabase
      .from<PublicCategoryRow>("categories")
      .select("*")
      .order("created_at", { ascending: false });

    console.log('[books-public] Executing categories query...');
    const { data: categories, error: catErr } = await categoriesQuery;
    console.log('[books-public] Categories query completed. Count:', categories?.length ?? 0);

    if (catErr) {
      console.error("[books-public] Categories query error:", catErr);
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }

    // Browsing is always allowed, but never expose actual file URLs from this endpoint.
    const safeBooks = books ?? [];

    const hasBooks = (books ?? []).length > 0;
    const hasUncategorized = (books ?? []).some((b) => b.category_id == null);

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

    console.log('[books-public] Preparing response...');
    const payload: BooksPublicResponse = {
      categories: [...virtualCategories, ...((categories ?? []) as PublicCategoryRow[])],
      books: safeBooks,
    };
    if (debug) {
      payload.debug = {
        categoryId,
        booksCount: (books ?? []).length,
        categoriesCount: (categories ?? []).length,
        virtualCategoriesCount: virtualCategories.length,
        membershipGate,
        serverKeyMode,
        hasBooks,
        hasUncategorized,
      };
    }
    console.log('[books-public] Sending response with', payload.categories.length, 'categories and', payload.books.length, 'books');
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[books-public] Unexpected error:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
