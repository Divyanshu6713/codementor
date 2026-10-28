import { z } from "zod";
import { createSession, createUser } from "@/server/auth/auth";
import { homeFor, setSessionCookie } from "@/server/auth/current";
import { issueRecoveryCode } from "@/server/auth/recovery";
import { rateLimit, readJson, toErrorResponse, trustedClientIp } from "@/server/http";

const Body = z.object({
  username: z.string().trim().min(3, "At least 3 characters").max(32).regex(/^[a-zA-Z0-9_.-]+$/, "Letters, numbers, dots, dashes and underscores only"),
  displayName: z.string().trim().min(1, "Tell us what to call you").max(40),
  password: z.string().min(8, "At least 8 characters").max(128),
  role: z.enum(["STUDENT", "PARENT"]),
});

export async function POST(req: Request) {
  try {
    const ip = trustedClientIp(req);
    if (ip) rateLimit(`signup:ip:${ip}`, 20, 5);
    rateLimit("signup:all", 300, 60);
    const body = await readJson(req, Body);
    const user = await createUser(body);
    const recoveryCode = await issueRecoveryCode(user.id);
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
    return Response.json({ redirect: user.role === "STUDENT" ? "/onboarding" : homeFor(user.role), recoveryCode });
  } catch (err) {
    return toErrorResponse(err);
  }
}
