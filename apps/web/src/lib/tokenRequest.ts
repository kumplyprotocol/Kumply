import { z } from "zod";
import { isAddress } from "viem";

/** Sumsub levels the KYC flow uses. Must match /verify and the webhook's LEVEL_TO_TIER. */
export const SUMSUB_LEVELS = [
  "basic-kyc",
  "standard-kyc",
  "enhanced-kyc",
  "business-kyb",
  "agent-kya",
] as const;

/** Body of POST /api/token: the connected wallet address and one of the known levels. */
export const TokenRequestSchema = z.object({
  userId: z.string().refine((value) => isAddress(value), {
    message: "userId must be an EVM address",
  }),
  levelName: z.enum(SUMSUB_LEVELS),
});

export type TokenRequest = z.infer<typeof TokenRequestSchema>;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller's window resets (0 when allowed). */
  retryAfterSec: number;
}

/**
 * Fixed-window, in-memory rate limiter keyed by client IP.
 * On Vercel each serverless instance keeps its own counters, so this caps
 * bursts per instance rather than globally - the same per-IP limit the
 * Express API applies (20 per minute), not a substitute for an edge limit.
 */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now: number = Date.now()): RateLimitResult {
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSec: 0 };
    }
    if (entry.count >= max) {
      return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
    }
    entry.count += 1;
    return { allowed: true, retryAfterSec: 0 };
  };
}

/** Client IP as set by Vercel (x-real-ip), falling back to the first x-forwarded-for hop. */
export function clientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}
