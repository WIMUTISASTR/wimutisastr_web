"use client";

import { supabase } from "@/lib/supabase/instance";

export type VideoCategory = {
  id: string;
  name?: string;
  description?: string | null;
  cover_url?: string | null;
};

export type VideoRow = {
  id: string;
  title?: string;
  description?: string | null;
  file_url?: string;
  thumbnail_url?: string | null;
  category_id?: string | null;
  uploaded_at?: string | null;
  presented_by?: string | null;
};

export type PublicVideosResponse = { categories: VideoCategory[]; videos: VideoRow[] };

export type VideoPlaybackResponse =
  | { kind: "r2_proxy"; url: string; exp: number }
  ;

export type HomeResponse = {
  categories: Array<{
    id: string;
    name: string | null;
    description: string | null;
    cover_url: string | null;
    videoCount: number;
  }>;
  featuredBooks: Array<{
    id: string;
    title: string;
    description: string | null;
    author: string;
    year: number;
    cover_url: string | null;
  }>;
  stats: { categoriesCount: number; videosCount: number; booksCount: number };
};

export type BookCategory = {
  id: string;
  name?: string;
  description?: string | null;
  parent_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BookRow = {
  id: string;
  title: string;
  author: string;
  year: number;
  description: string | null;
  file_url?: string | null;
  cover_url: string | null;
  category_id?: string | null;
  uploaded_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PublicBooksResponse = { categories: BookCategory[]; books: BookRow[] };

export type ProfileMeResponse = {
  user: {
    id: string;
    email: string | null;
    createdAt: string | null;
    lastSignInAt: string | null;
    userMetadata: Record<string, unknown>;
  };
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    membership_status: "pending" | "approved" | "denied";
    membership_notes: string | null;
    membership_approved_at: string | null;
    membership_denied_at: string | null;
    created_at: string | null;
    updated_at: string | null;
  } | null;
  membership: {
    status: "pending" | "approved" | "denied" | "none";
    membershipEndsAt: string | null;
    notes: string | null;
  };
  latestProof:
    | {
        id: string;
        status: string | null;
        planId: string | null;
        amount: number | null;
        reference: string | null;
        uploadedAt: string | null;
        membershipStartsAt: string | null;
        membershipEndsAt: string | null;
        proofUrl: string | null;
      }
    | null;
  plan:
    | {
        id: string;
        name: string | null;
        price: number | null;
        currency: string | null;
        duration: string | null;
        qrCodeUrl: string | null;
      }
    | null;
};

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T>(url: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(url, { headers, cache: "no-store" });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof (json as { error?: unknown })?.error === "string"
        ? ((json as { error?: unknown }).error as string)
        : `HTTP ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, payload: json });
  }
  return json as T;
}

function withOptionalDebugParam(url: string): string {
  // Allow debugging API responses from within the app:
  // visit /law_documents?debug=1 then fetchBooks will call /api/books-public?debug=1
  if (typeof window === "undefined") return url;
  try {
    const current = new URL(window.location.href);
    const debug = current.searchParams.get("debug");
    if (debug !== "1") return url;
    const u = new URL(url, current.origin);
    u.searchParams.set("debug", "1");
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof (json as { error?: unknown })?.error === "string"
        ? ((json as { error?: unknown }).error as string)
        : `HTTP ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, payload: json });
  }
  return json as T;
}

export function fetchMembershipStatus() {
  return apiGet<{ status: "pending" | "approved" | "denied" | "none"; membershipEndsAt: string | null }>(
    "/api/membership/status"
  );
}

export function fetchVideos(categoryId?: string) {
  const url = categoryId ? `/api/videos-public?categoryId=${encodeURIComponent(categoryId)}` : "/api/videos-public";
  return apiGet<PublicVideosResponse>(url);
}

export function fetchVideoPlaybackUrl(videoId: string) {
  return apiGet<VideoPlaybackResponse>(`/api/videos/${encodeURIComponent(videoId)}/play`);
}

export function fetchHome() {
  return apiGet<HomeResponse>("/api/home");
}

export function fetchBooks(categoryId?: string) {
  const url = categoryId ? `/api/books-public?categoryId=${encodeURIComponent(categoryId)}` : "/api/books-public";
  return apiGet<PublicBooksResponse>(withOptionalDebugParam(url)).then((data: any) => {
    if (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("debug") === "1" && data?.debug) {
      // eslint-disable-next-line no-console
      console.log("books-public debug:", data.debug);
    }
    return data as PublicBooksResponse;
  });
}

export function fetchProfileMe() {
  return apiGet<ProfileMeResponse>("/api/profile/me");
}
