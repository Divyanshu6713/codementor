/**
 * Anonymous guest identity — no account, no personal data.
 *
 * A guest gets a random id in an httpOnly cookie, signed with GUEST_SECRET so it can't be forged
 * or chosen. It exists only to apply fair daily AI quotas; progress lives in the browser, not here.
 * Clearing cookies gives a new id — which is why AI quotas are layered (per guest, per network
 * address, global) rather than relying on this alone.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "@/server/config";

export const GUEST_COOKIE = "cm_guest";
const MAX_AGE_SECONDS = 365 * 24 * 3600;

let devSecret: string | null = null;

/** GUEST_SECRET, or (development only) a random secret persisted in the data directory. */
export function guestSecret(): string | null {
  if (config.guest.secret && config.guest.secret.length >= 32) return config.guest.secret;
  if (config.isProduction) return null;
  if (devSecret) return devSecret;
  const file = path.join(config.dataDir, "guest-secret");
  try {
    devSecret = fs.readFileSync(file, "utf8").trim();
  } catch {
    devSecret = crypto.randomBytes(32).toString("base64url");
    try {
      fs.mkdirSync(config.dataDir, { recursive: true });
      fs.writeFileSync(file, devSecret, { mode: 0o600 });
    } catch {
      /* in-memory only; cookies reset on restart */
    }
  }
  return devSecret;
}

const sign = (secret: string, id: string) => crypto.createHmac("sha256", secret).update(`guest:${id}`).digest("base64url").slice(0, 32);

export function newGuestToken(): { id: string; token: string } | null {
  const secret = guestSecret();
  if (!secret) return null;
  const id = crypto.randomBytes(16).toString("base64url");
  return { id, token: `v1.${id}.${sign(secret, id)}` };
}

/** The guest id from a cookie value, or null if missing, malformed or forged. */
export function verifyGuestToken(token: string | undefined | null): string | null {
  const secret = guestSecret();
  if (!secret || !token) return null;
  const m = /^v1\.([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{32})$/.exec(token);
  if (!m) return null;
  const expected = Buffer.from(sign(secret, m[1]));
  const given = Buffer.from(m[2]);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given) ? m[1] : null;
}

export const guestCookieOptions = {
  httpOnly: true, sameSite: "lax" as const, secure: config.isProduction, path: "/", maxAge: MAX_AGE_SECONDS,
};

/** One-way, keyed hash for quota keys — the database never sees raw ids or network addresses. */
export function quotaKey(kind: "g" | "ip", value: string, salt = ""): string | null {
  const secret = guestSecret();
  if (!secret) return null;
  return `${kind}:${crypto.createHmac("sha256", secret).update(`${kind}:${salt}:${value}`).digest("base64url").slice(0, 24)}`;
}
