/**
 * Keyed one-way hashing for AI quota counters, so the quota table never holds raw account ids or
 * network addresses. The key is GUEST_SECRET (name kept for compatibility); without it in
 * production, paid AI stays off (quotas can't be enforced), and curated help is used instead.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "@/server/config";

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
      /* in-memory only for this process */
    }
  }
  return devSecret;
}

/** One-way, keyed hash for quota keys — the database never sees raw ids or network addresses. */
export function quotaKey(kind: "g" | "ip", value: string, salt = ""): string | null {
  const secret = guestSecret();
  if (!secret) return null;
  return `${kind}:${crypto.createHmac("sha256", secret).update(`${kind}:${salt}:${value}`).digest("base64url").slice(0, 24)}`;
}
