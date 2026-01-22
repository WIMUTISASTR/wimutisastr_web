export function normalizeNextImageSrc(src: string | null | undefined, fallback?: string): string {
  const value = (src ?? "").trim();
  if (!value) return fallback ?? "";

  // Already relative (Next can optimize without remote host config)
  if (value.startsWith("/")) return value;

  // These are valid for <img>/<Image> and should be kept as-is
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;

  try {
    const u = new URL(value);
    const relative = `${u.pathname}${u.search}${u.hash}`;

    // Dev / common loopback
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return relative;

    // Same-origin (client-side)
    if (typeof window !== "undefined" && u.origin === window.location.origin) return relative;

    return value;
  } catch {
    return value;
  }
}

