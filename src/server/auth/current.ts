import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { AuthError, SESSION_COOKIE, getUserBySessionToken, type SessionUser } from "./auth";
import { config } from "@/server/config";
import type { Role } from "@/server/db/schema";

/** Current user for server components and route handlers (deduplicated per request). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  return getUserBySessionToken(store.get(SESSION_COOKIE)?.value);
});

/** Where each role lands after signing in. */
export function homeFor(role: Role) {
  return role === "PARENT" ? "/parent" : role === "ADMIN" || role === "CONTENT_EDITOR" ? "/admin" : "/app";
}

/** For pages: redirect to login when signed out, or to the right area when the role doesn't fit. */
export async function requirePageUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

/** For route handlers: throw a 401/403 that the API wrapper turns into JSON. */
export async function requireApiUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Please sign in again.");
  if (roles && !roles.includes(user.role)) throw new AuthError("You don't have access to that.", 403);
  return user;
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: config.isProduction, path: "/", expires: expiresAt });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
