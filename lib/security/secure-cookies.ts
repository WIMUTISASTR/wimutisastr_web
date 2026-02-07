/**
 * Secure HTTP-only cookie utilities for content tokens
 * 
 * This module handles secure storage and retrieval of content access tokens
 * using HTTP-only cookies instead of URL parameters for enhanced security.
 */

import { NextRequest, NextResponse } from "next/server";
import { env } from "../utils/env";

/**
 * Cookie names for different content types
 */
export const COOKIE_NAMES = {
  VIDEO_TOKEN: "__Host-video_token",
  BOOK_TOKEN: "__Host-book_token",
} as const;

/**
 * Cookie options for maximum security
 */
interface SecureCookieOptions {
  /** Cookie expiry time in seconds (defaults to 1 hour) */
  maxAge?: number;
  /** Cookie path (defaults to /) */
  path?: string;
}

/**
 * Determine if we're in a secure context (HTTPS)
 */
function isSecureContext(): boolean {
  // In production, always use secure cookies
  // In development, check if HTTPS is being used
  return process.env.NODE_ENV === "production" || process.env.HTTPS === "true";
}

/**
 * Get the cookie name based on security context
 * __Host- prefix requires secure + path=/ + no domain
 * Falls back to regular name in development HTTP
 */
function getEffectiveCookieName(name: string): string {
  if (isSecureContext()) {
    return name; // Uses __Host- prefix
  }
  // In development over HTTP, can't use __Host- prefix
  return name.replace("__Host-", "");
}

/**
 * Set a secure HTTP-only cookie on a response
 */
export function setSecureCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: SecureCookieOptions = {}
): NextResponse {
  const { maxAge = 3600, path = "/" } = options;
  const secure = isSecureContext();
  const effectiveName = getEffectiveCookieName(name);

  // Build cookie string with security attributes
  const cookieParts = [
    `${effectiveName}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    "HttpOnly", // Not accessible via JavaScript
    "SameSite=Strict", // Only sent to same origin
  ];

  if (secure) {
    cookieParts.push("Secure"); // Only sent over HTTPS
  }

  response.headers.append("Set-Cookie", cookieParts.join("; "));
  return response;
}

/**
 * Get a secure cookie value from a request
 */
export function getSecureCookie(request: NextRequest, name: string): string | null {
  const effectiveName = getEffectiveCookieName(name);
  const cookieValue = request.cookies.get(effectiveName)?.value;
  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

/**
 * Clear a secure cookie from a response
 */
export function clearSecureCookie(response: NextResponse, name: string): NextResponse {
  const secure = isSecureContext();
  const effectiveName = getEffectiveCookieName(name);

  const cookieParts = [
    `${effectiveName}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Strict",
  ];

  if (secure) {
    cookieParts.push("Secure");
  }

  response.headers.append("Set-Cookie", cookieParts.join("; "));
  return response;
}

/**
 * Create a JSON response with a secure cookie set
 */
export function jsonResponseWithCookie<T extends Record<string, unknown>>(
  data: T,
  cookieName: string,
  cookieValue: string,
  cookieOptions: SecureCookieOptions = {},
  responseOptions: { status?: number } = {}
): NextResponse {
  const response = NextResponse.json(data, { status: responseOptions.status ?? 200 });
  setSecureCookie(response, cookieName, cookieValue, cookieOptions);
  return response;
}

/**
 * Get token from request - checks cookie first, then falls back to query param for backwards compatibility
 * This allows gradual migration while maintaining security
 */
export function getTokenFromRequest(
  request: NextRequest,
  cookieName: string,
  queryParamName: string = "token"
): string | null {
  // Prefer cookie (more secure)
  const cookieToken = getSecureCookie(request, cookieName);
  if (cookieToken) return cookieToken;

  // Fall back to query param for backwards compatibility
  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get(queryParamName);
  return queryToken;
}
