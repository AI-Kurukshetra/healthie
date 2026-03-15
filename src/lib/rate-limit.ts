/**
 * In-memory sliding-window rate limiter for Next.js API routes.
 *
 * Each limiter instance tracks request counts per key (typically an IP or
 * user id) using a simple Map with automatic cleanup of expired entries.
 *
 * Usage:
 *   const limiter = createRateLimiter({ interval: 60_000, maxRequests: 30 });
 *   // inside a route handler:
 *   const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
 *   const result = limiter.check(ip);
 *   if (!result.allowed) return rateLimitResponse(result);
 */

import { NextResponse } from "next/server";

interface RateLimitOptions {
  /** Window length in milliseconds (default 60 000 = 1 minute). */
  interval?: number;
  /** Maximum requests allowed in the window (default 60). */
  maxRequests?: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export function createRateLimiter(opts: RateLimitOptions = {}) {
  const interval = opts.interval ?? 60_000;
  const maxRequests = opts.maxRequests ?? 60;
  const store = new Map<string, RateLimitEntry>();

  // Periodically purge expired entries to prevent memory leaks.
  const CLEANUP_INTERVAL = Math.max(interval * 2, 120_000);
  let lastCleanup = Date.now();

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }

  function check(key: string): RateLimitResult {
    cleanup();
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + interval });
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + interval, limit: maxRequests };
    }

    entry.count += 1;
    const allowed = entry.count <= maxRequests;
    return {
      allowed,
      remaining: Math.max(0, maxRequests - entry.count),
      resetAt: entry.resetAt,
      limit: maxRequests,
    };
  }

  return { check };
}

/** Standard 429 JSON response with Retry-After header. */
export function rateLimitResponse(result: RateLimitResult) {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(retryAfter, 1)),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    }
  );
}

/** Extract a client identifier from the request (IP or fallback). */
export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "anonymous";
}

// ---- Pre-configured limiters for common scenarios ----

/** General API limiter: 60 req / minute per IP. */
export const apiLimiter = createRateLimiter({ interval: 60_000, maxRequests: 60 });

/** Auth endpoints: 10 req / minute per IP (prevents brute force). */
export const authLimiter = createRateLimiter({ interval: 60_000, maxRequests: 10 });

/** Write-heavy endpoints (POST/PATCH/DELETE): 30 req / minute per IP. */
export const writeLimiter = createRateLimiter({ interval: 60_000, maxRequests: 30 });
