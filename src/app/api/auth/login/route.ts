import { z } from "zod";
import { createSession, verifyCredentials } from "@/server/auth/auth";
import { homeFor, setSessionCookie } from "@/server/auth/current";
import { clientIp, rateLimit, readJson, toErrorResponse } from "@/server/http";
import { logger } from "@/server/logger";

const Body = z.object({ username: z.string().trim().min(1).max(64), password: z.string().min(1).max(128) });

export async function POST(req: Request) {
  try {
    rateLimit(`login:${clientIp(req)}`, 10, 5);
    const body = await readJson(req, Body);
    const user = await verifyCredentials(body.username, body.password).catch((err) => {
      logger.warn("auth.login_failed", { ip: clientIp(req) });
      throw err;
    });
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
    return Response.json({ redirect: homeFor(user.role) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
