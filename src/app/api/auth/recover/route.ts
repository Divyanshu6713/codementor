import { z } from "zod";
import { createSession, normalizeUsername } from "@/server/auth/auth";
import { homeFor, setSessionCookie } from "@/server/auth/current";
import { resetWithRecoveryCode } from "@/server/auth/recovery";
import { rateLimit, readJson, toErrorResponse, trustedClientIp } from "@/server/http";
import { logger } from "@/server/logger";

const Body = z.object({
  username: z.string().trim().min(1).max(64),
  code: z.string().trim().min(10).max(40),
  password: z.string().min(8, "At least 8 characters").max(128),
});

/** Forgot password: username + recovery code → new password (and a new recovery code). */
export async function POST(req: Request) {
  try {
    const ip = trustedClientIp(req);
    if (ip) rateLimit(`recover:ip:${ip}`, 10, 15);
    rateLimit("recover:all", 200, 300);
    const body = await readJson(req, Body, 4 * 1024);
    rateLimit(`recover:user:${normalizeUsername(body.username)}`, 5, 15);
    const { user, recoveryCode } = await resetWithRecoveryCode(body.username, body.code, body.password).catch((err) => {
      logger.warn("auth.recovery_failed", {});
      throw err;
    });
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
    return Response.json({ redirect: homeFor(user.role), recoveryCode });
  } catch (err) {
    return toErrorResponse(err);
  }
}
