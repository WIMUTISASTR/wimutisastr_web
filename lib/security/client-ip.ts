import type { NextRequest } from "next/server";
import { getClientIdentifier } from "@/lib/rate-limit/redis";

export function getClientIpFromRequest(request: NextRequest): string {
  return getClientIdentifier(request);
}
