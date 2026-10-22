import { z } from "zod";
import { createGuestUser, createSession } from "@/server/auth/auth";
import { getCurrentUser, homeFor, setSessionCookie } from "@/server/auth/current";
import { config } from "@/server/config";
import { rateLimit, readJson, trustedClientIp, withPublic } from "@/server/http";

const Body = z.object({ start: z.enum(["beginner", "placement", "python"]).default("beginner") });

const FIRST_LESSON = "/app/learn/what-is-programming";
const DESTINATION = { beginner: FIRST_LESSON, placement: "/app/diagnostic", python: "/app/python" } as const;

/**
 * One click to start learning: creates a guest student account and signs it in.
 * Abuse brakes: a per-network bucket (only when a trusted proxy supplies the address — shared
 * campus networks get a generous allowance) and a global hourly cap.
 */
export const POST = withPublic(async (req) => {
  const existing = await getCurrentUser();
  const body = await readJson(req, Body, 1024);
  if (existing) return Response.json({ redirect: existing.role === "STUDENT" ? DESTINATION[body.start] : homeFor(existing.role) });
  const ip = trustedClientIp(req);
  if (ip) rateLimit(`guest-create:${ip}`, 60, 2);
  rateLimit("guest-create:all", config.guestCreationsPerHour, config.guestCreationsPerHour / 60);
  const user = await createGuestUser(body.start === "placement" ? "placement" : "beginner");
  const { token, expiresAt } = await createSession(user.id, config.guestSessionDays);
  await setSessionCookie(token, expiresAt);
  return Response.json({ redirect: DESTINATION[body.start] });
});
