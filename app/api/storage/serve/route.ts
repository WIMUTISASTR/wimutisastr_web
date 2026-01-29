import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, type GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { r2Client } from "@/lib/storage/r2-client";
import { verifyStorageToken } from "@/lib/security/tokens/storage";
import { env } from "@/lib/utils/env";

export const runtime = "nodejs";

const TRANSPARENT_1PX_PNG = Buffer.from(
  // 1x1 transparent PNG
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6Xn8S0AAAAASUVORK5CYII=",
  "base64"
);

function toWebStream(body: unknown): BodyInit {
  if (body instanceof Readable) return Readable.toWeb(body) as unknown as ReadableStream<Uint8Array>;
  if (typeof body === "object" && body !== null && "stream" in body && typeof (body as { stream?: unknown }).stream === "function") {
    return (body as { stream: () => BodyInit }).stream();
  }
  return body as BodyInit;
}

function awsStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  if (!("$metadata" in err)) return undefined;
  const m = (err as { $metadata?: { httpStatusCode?: unknown } }).$metadata;
  return typeof m?.httpStatusCode === "number" ? m.httpStatusCode : undefined;
}

function awsName(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  return "name" in err ? String((err as { name?: unknown }).name) : undefined;
}

function contentTypeFromKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

function isImageKey(key: string): boolean {
  const ext = key.split(".").pop()?.toLowerCase();
  return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif" || ext === "webp" || ext === "svg";
}

function resolveBucket(bucketParam: string | null): string | null {
  switch (bucketParam) {
    case "book":
      return env.r2.bookBucket();
    case "video":
      return env.r2.videoBucket();
    case "proof-payment":
      return env.r2.proofOfPaymentBucket();
    default:
      return null;
  }
}

function isSafeKey(key: string): boolean {
  // prevent path traversal and weird absolute paths
  if (!key) return false;
  if (key.startsWith("/")) return false;
  if (key.includes("..")) return false;
  return true;
}

function rawQueryParam(url: string, name: string): string | null {
  // URLSearchParams already decodes values. For storage keys, we sometimes need the raw
  // encoded value to handle double-encoding or keys containing '%' literally.
  const m = new RegExp(`[?&]${name}=([^&]*)`).exec(url);
  return m ? m[1] : null;
}

function uniqueStrings(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const v = String(s ?? "");
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function keyCandidates(reqUrl: string, decodedKey: string): string[] {
  const raw = rawQueryParam(reqUrl, "key");
  const candidates: string[] = [];

  // decoded from URLSearchParams (most common)
  if (decodedKey) candidates.push(decodedKey);

  // if key was double-encoded, raw might still contain %2F after one decoding
  if (raw) {
    candidates.push(raw); // literal raw key (rare but possible)
    try {
      candidates.push(decodeURIComponent(raw));
    } catch {
      // ignore
    }
    try {
      candidates.push(decodeURIComponent(decodeURIComponent(raw)));
    } catch {
      // ignore
    }
  }

  return uniqueStrings(candidates);
}

function imageFallbackResponse(status: number, reason: string) {
  return new NextResponse(TRANSPARENT_1PX_PNG, {
    status,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "X-Storage-Fallback": reason,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const key = searchParams.get("key") ?? "";
  const bucketParam = searchParams.get("bucket");

  // Token mode (recommended for protected media tags)
  if (token) {
    const payload = verifyStorageToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSafeKey(payload.key)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const bucket = resolveBucket(payload.bucket);
    if (!bucket) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    try {
      const obj = await r2Client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: payload.key,
        })
      );

      if (!obj.Body) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const contentType = obj.ContentType || contentTypeFromKey(payload.key);

      const body = toWebStream(obj.Body);

      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          // short-lived tokens; cache only in browser memory (avoid CDN caching)
          "Cache-Control": "private, max-age=60",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (err: unknown) {
      const status = awsStatus(err);
      const name = awsName(err);
      if (status === 404 || name === "NoSuchKey") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      console.error("GET /api/storage/serve (token) failed:", err);
      return NextResponse.json({ error: "Failed to fetch object" }, { status: 500 });
    }
  }

  if (!isSafeKey(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const bucket = resolveBucket(bucketParam);
  if (!bucket) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  try {
    // Try a few key variants to reduce false 404s due to encoding differences.
    const candidates = keyCandidates(req.url, key).filter(isSafeKey);

    let obj: GetObjectCommandOutput | null = null;
    let resolvedKey: string | null = null;
    for (const candidate of candidates) {
      try {
        obj = await r2Client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: candidate,
          })
        );
        resolvedKey = candidate;
        break;
      } catch (err: unknown) {
        const status = awsStatus(err);
        const name = awsName(err);
        if (status === 404 || name === "NoSuchKey") {
          continue;
        }
        throw err;
      }
    }

    if (!obj?.Body || !resolvedKey) {
      // Avoid Next/Image "invalid image" spam: return a tiny valid PNG for missing images.
      if (isImageKey(key)) {
        return imageFallbackResponse(200, "not-found");
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const contentType = obj.ContentType || contentTypeFromKey(resolvedKey);

    const body = toWebStream(obj.Body);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Keys include timestamps; safe to cache aggressively.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    const status = awsStatus(err);
    const name = awsName(err);
    if (status === 404 || name === "NoSuchKey") {
      if (isImageKey(key)) {
        return imageFallbackResponse(200, "not-found");
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("GET /api/storage/serve failed:", err);
    return NextResponse.json({ error: "Failed to fetch object" }, { status: 500 });
  }
}

