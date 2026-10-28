import { z } from "zod";
import { createSession } from "@/server/auth/auth";
import { homeFor, setSessionCookie } from "@/server/auth/current";
import { resetWithLink } from "@/server/auth/recovery";
import { rateLimit, readJson, toErrorResponse, trustedClientIp } from "@/server/http";

const Body = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{20,100}$/),
  password: z.string().min(8, "At least 8 characters").max(128),
});

/** Use a one-time reset link from an admin or a linked parent. */
export async function POST(req: Request) {
  try {
    const ip = trustedClientIp(req);
    if (ip) rateLimit(`reset:ip:${ip}`, 10, 15);
    rateLimit("reset:all", 200, 300);
    const body = await readJson(req, Body, 4 * 1024);
    const { user, recoveryCode } = await resetWithLink(body.token, body.password);
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
    return Response.json({ redirect: homeFor(user.role), recoveryCode });
  } catch (err) {
    return toErrorResponse(err);
  }
}
