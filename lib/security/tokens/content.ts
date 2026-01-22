import crypto from "crypto";
import { env } from "../../utils/env";

type Json = Record<string, unknown>;

/**
 * Token expiration configurations (in seconds)
 */
export const TOKEN_EXPIRY = {
  CONTENT_VIEW: 3600, // 1 hour - enough for reading
  SHORT_LIVED: 300, // 5 minutes - for quick operations
  LONG_LIVED: 86400, // 24 hours - for extended access
} as const;

function b64urlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

function hmac(secret: string, data: string): string {
  return b64urlEncode(crypto.createHmac("sha256", secret).update(data).digest());
}

function timingSafeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export type ContentViewTokenPayload = {
  sub: string; // user id
  bookId: string;
  bucket: "book";
  key: string;
  exp: number; // unix seconds
  iat: number; // issued at (unix seconds)
};

export function signContentToken(
  payload: Omit<ContentViewTokenPayload, 'exp' | 'iat'>,
  expirySeconds: number = TOKEN_EXPIRY.CONTENT_VIEW
): string {
  const secret = env.security.contentTokenSecret();
  const now = Math.floor(Date.now() / 1000);
  
  const fullPayload: ContentViewTokenPayload = {
    ...payload,
    iat: now,
    exp: now + expirySeconds,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const headerPart = b64urlEncode(JSON.stringify(header));
  const payloadPart = b64urlEncode(JSON.stringify(fullPayload));
  const data = `${headerPart}.${payloadPart}`;
  const sig = hmac(secret, data);
  return `${data}.${sig}`;
}

export function verifyContentToken(token: string): ContentViewTokenPayload | null {
  try {
    const secret = env.security.contentTokenSecret();

    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h, p, sig] = parts;
    const data = `${h}.${p}`;
    const expected = hmac(secret, data);
    if (!timingSafeEqual(sig, expected)) return null;

    const payload = JSON.parse(b64urlDecode(p).toString("utf8")) as ContentViewTokenPayload;
    
    // Validate all required fields
    if (!payload?.sub || !payload?.bookId || !payload?.key || !payload?.bucket || !payload?.exp || !payload?.iat) {
      return null;
    }
    
    if (payload.bucket !== "book") return null;
    
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp < now) return null;
    
    // Check if token was issued in the future (clock skew tolerance: 60 seconds)
    if (payload.iat > now + 60) return null;
    
    return payload;
  } catch {
    return null;
  }
}

