import { cookies } from "next/headers";
import { rateLimit, clientIp } from "@/server/http";
import { GUEST_COOKIE, guestCookieOptions, newGuestToken, verifyGuestToken } from "./identity";

/** The verified guest id from the request's cookie, or null. */
export async function currentGuestId(): Promise<string | null> {
  const store = await cookies();
  return verifyGuestToken(store.get(GUEST_COOKIE)?.value);
}

/**
 * Returns the guest id, issuing a new signed cookie when there isn't a valid one. New ids are
 * rate-limited per address so a script can't mint fresh identities to dodge the daily AI quota.
 */
export async function ensureGuestId(req: Request): Promise<string | null> {
  const existing = await currentGuestId();
  if (existing) return existing;
  try {
    rateLimit(`guest-mint:${clientIp(req)}`, 60, 20);
  } catch {
    return null;
  }
  const fresh = newGuestToken();
  if (!fresh) return null;
  const store = await cookies();
  store.set(GUEST_COOKIE, fresh.token, guestCookieOptions);
  return fresh.id;
}
