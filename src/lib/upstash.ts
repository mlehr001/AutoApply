import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ─── REDIS CLIENT ─────────────────────────────────────────────────────────────
const upstashEnabled =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = upstashEnabled
  ? new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// ─── RATE LIMITERS ────────────────────────────────────────────────────────────
const passThroughLimiter = {
  limit: async () => ({ success: true, limit: Infinity, remaining: Infinity }),
};

// Rewrite endpoint: 10 rewrites per minute
export const rewriteRatelimit =
  upstashEnabled && redis
    ? new Ratelimit({
        redis,
        limiter:   Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix:    "resumai:rewrite",
      })
    : passThroughLimiter;

// Scoring endpoint: 3 full score runs per hour
export const scoringRatelimit =
  upstashEnabled && redis
    ? new Ratelimit({
        redis,
        limiter:   Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
        prefix:    "resumai:scoring",
      })
    : passThroughLimiter;

// ─── CACHE HELPERS ────────────────────────────────────────────────────────────
const SCORE_TTL = 3600; // 1 hour

export async function getCachedScores(cacheKey: string) {
  if (!redis) return null;
  return redis.get<Record<string, unknown>[]>(cacheKey);
}

export async function setCachedScores(
  cacheKey: string,
  scores: Record<string, unknown>[]
): Promise<void> {
  if (!redis) return;
  await redis.setex(cacheKey, SCORE_TTL, JSON.stringify(scores));
}

export function buildScoreCacheKey(
  jobIds: (string | number)[],
  keywords: string
): string {
  return `resumai:scores:${jobIds.join("-")}:${keywords.slice(0, 40)}`;
}

// ─── GENERIC CACHE ────────────────────────────────────────────────────────────
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  return redis.get<T>(key);
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 3600
): Promise<void> {
  if (!redis) return;
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;
  await redis.del(key);
}
