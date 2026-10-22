import { z } from "zod";
import { createSession, normalizeUsername, verifyCredentials } from "@/server/auth/auth";
import { homeFor, setSessionCookie } from "@/server/auth/current";
import { rateLimit, readJson, toErrorResponse, trustedClientIp } from "@/server/http";
import { logger } from "@/server/logger";

const Body = z.object({ username: z.string().trim().min(1).max(64), password: z.string().min(1).max(128) });

export async function POST(req: Request) {
  try {
    const ip = trustedClientIp(req);
    // Per network (only when a trusted proxy supplies it), per account (slows password guessing)
    // and a generous global cap — never one shared bucket for a whole campus.
    if (ip) rateLimit(`login:ip:${ip}`, 30, 15);
    rateLimit("login:all", 600, 300);
    const body = await readJson(req, Body, 4 * 1024);
    rateLimit(`login:user:${normalizeUsername(body.username)}`, 8, 2);
    const user = await verifyCredentials(body.username, body.password).catch((err) => {
      logger.warn("auth.login_failed", {});
      throw err;
    });
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
    return Response.json({ redirect: homeFor(user.role) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
