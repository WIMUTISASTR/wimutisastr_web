import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { r2Client } from "@/lib/storage/r2-client";
import { verifyVideoToken } from "@/lib/security/tokens/video";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSafeKey(key: string): boolean {
  if (!key) return false;
  if (key.startsWith("/")) return false;
  if (key.includes("..")) return false;
  return true;
}

function inferContentTypeFromKey(key: string): string {
  const lower = key.toLowerCase();
  const ext = lower.includes(".") ? lower.split(".").pop() : "";
  if (ext === "mp4") return "video/mp4";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  if (ext === "m4v") return "video/x-m4v";
  if (ext === "mkv") return "video/x-matroska";
  if (ext === "m3u8") return "application/vnd.apple.mpegurl";
  if (ext === "ts") return "video/mp2t";
  return "application/octet-stream";
}

function toWebStream(body: unknown): BodyInit {
  if (body instanceof Readable) return Readable.toWeb(body) as unknown as ReadableStream<Uint8Array>;
  if (typeof body === "object" && body !== null && "stream" in body && typeof (body as { stream?: unknown }).stream === "function") {
    return (body as { stream: () => BodyInit }).stream();
  }
  return body as BodyInit;
}

function parseRange(rangeHeader: string | null, size: number): { start: number; end: number } | null {
  if (!rangeHeader) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!m) return null;
  const startStr = m[1];
  const endStr = m[2];

  let start = startStr ? Number(startStr) : NaN;
  let end = endStr ? Number(endStr) : NaN;

  if (Number.isNaN(start) && Number.isNaN(end)) return null;

  // bytes=-500 (last 500 bytes)
  if (Number.isNaN(start) && !Number.isNaN(end)) {
    const suffix = end;
    if (suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
    return { start, end };
  }

  // bytes=500- (from 500 to end)
  if (!Number.isNaN(start) && Number.isNaN(end)) {
    if (start < 0 || start >= size) return null;
    end = size - 1;
    return { start, end };
  }

  // bytes=500-999
  if (!Number.isNaN(start) && !Number.isNaN(end)) {
    if (start < 0 || end < start) return null;
    if (start >= size) return null;
    end = Math.min(end, size - 1);
    return { start, end };
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const payload = token ? verifyVideoToken(token) : null;

  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSafeKey(payload.key)) return NextResponse.json({ error: "Invalid key" }, { status: 400 });

  const bucketName = process.env.R2_VIDEO_BUCKET_NAME;
  if (!bucketName) return NextResponse.json({ error: "Storage not configured" }, { status: 500 });

  try {
    const head = await r2Client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: payload.key,
      })
    );

    const size = head.ContentLength ?? 0;
    if (!size) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const range = parseRange(req.headers.get("range"), size);

    const obj = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: payload.key,
        Range: range ? `bytes=${range.start}-${range.end}` : undefined,
      })
    );

    if (!obj.Body) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = toWebStream(obj.Body);
    const contentType = head.ContentType || obj.ContentType || inferContentTypeFromKey(payload.key);

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
      "Accept-Ranges": "bytes",
    };

    if (range) {
      const contentLength = range.end - range.start + 1;
      headers["Content-Range"] = `bytes ${range.start}-${range.end}/${size}`;
      headers["Content-Length"] = String(contentLength);
      return new NextResponse(body, { status: 206, headers });
    }

    headers["Content-Length"] = String(size);
    return new NextResponse(body, { status: 200, headers });
  } catch (err: unknown) {
    const status =
      typeof err === "object" && err !== null && "$metadata" in err
        ? (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
        : undefined;
    const name = typeof err === "object" && err !== null && "name" in err ? String((err as { name?: unknown }).name) : undefined;
    if (status === 404 || name === "NoSuchKey") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("GET /api/videos/serve failed:", err);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

