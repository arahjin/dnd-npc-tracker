import { NextResponse } from "next/server";
import { prisma } from "./prisma";

/**
 * Per-user rolling-window rate limit. Returns true if the action is allowed
 * (and records it); false if the user has exceeded `limit` events in the
 * last `windowSeconds`.
 *
 * Designed for state-changing API endpoints (NPC create, quest create, …).
 * Use a stable, lowercase action key like "npc.create".
 */
export async function consumeRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const since = new Date(Date.now() - windowSeconds * 1000);
  const count = await prisma.rateLimitEvent.count({
    where: { userId, action, createdAt: { gte: since } },
  });
  if (count >= limit) return false;
  await prisma.rateLimitEvent.create({ data: { userId, action } });
  return true;
}

/**
 * Standard 429 response with a German message + Retry-After header.
 * `windowSeconds` is the original window passed to consumeRateLimit;
 * Retry-After is approximate (worst case = the full window).
 */
export function rateLimitResponse(windowSeconds: number) {
  return NextResponse.json(
    { error: "Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut." },
    { status: 429, headers: { "Retry-After": String(windowSeconds) } },
  );
}

// Reasonable per-action limits (per user, rolling 1 hour unless noted).
export const RATE_LIMITS = {
  "npc.create":      { limit: 60,  windowSeconds: 3600 },
  "quest.create":    { limit: 30,  windowSeconds: 3600 },
  "organisation.create": { limit: 30, windowSeconds: 3600 },
  "charakter.create": { limit: 10, windowSeconds: 3600 },
  "location.create": { limit: 30,  windowSeconds: 3600 },
  "journal.create":  { limit: 60,  windowSeconds: 3600 },
  "invite.create":   { limit: 10,  windowSeconds: 3600 },
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

/** Convenience wrapper using the preset limits above. */
export async function checkPresetLimit(userId: string, key: RateLimitKey): Promise<boolean> {
  const cfg = RATE_LIMITS[key];
  return consumeRateLimit(userId, key, cfg.limit, cfg.windowSeconds);
}
