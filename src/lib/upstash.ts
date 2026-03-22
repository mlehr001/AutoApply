import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ─── REDIS CLIENT ─────────────────────────────────────────────────────────────
export const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── RATE LIMITERS ────────────────────────────────────────────────────────────
// Rewrite endpoint: 10 rewrites per minute
export const rewriteRatelimit = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix:    "resumai:rewrite",
});

// Scoring endpoint: 3 full score runs per hour
export const scoringRatelimit = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix:    "resumai:scoring",
});

// ─── CACHE HELPERS ────────────────────────────────────────────────────────────
const SCORE_TTL = 3600; // 1 hour

export async function getCachedScores(cacheKey: string) {
  return redis.get<Record<string, unknown>[]>(cacheKey);
}

export async function setCachedScores(
  cacheKey: string,
  scores: Record<string, unknown>[]
): Promise<void> {
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
  return redis.get<T>(key);
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 3600
): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}
