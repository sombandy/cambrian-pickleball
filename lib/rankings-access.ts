import { createHmac, timingSafeEqual } from "node:crypto";

export const RANKINGS_COOKIE = "rankings_access";

// The cookie holds a keyed hash of the password, never the password itself.
// Changing RANKINGS_PASSWORD invalidates every existing cookie.
export function rankingsAccessToken(): string | null {
  const password = process.env.RANKINGS_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("rankings-access").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
}

export function isValidPassword(input: string): boolean {
  const password = process.env.RANKINGS_PASSWORD;
  if (!password) return false;
  return safeEqual(input, password);
}

export function hasRankingsAccess(cookieValue: string | undefined): boolean {
  const expected = rankingsAccessToken();
  if (!expected || !cookieValue) return false;
  return safeEqual(cookieValue, expected);
}
