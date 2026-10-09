import { z } from "zod";
import { createSession, createUser } from "@/server/auth/auth";
import { homeFor, setSessionCookie } from "@/server/auth/current";
import { clientIp, rateLimit, readJson, toErrorResponse } from "@/server/http";

const Body = z.object({
  username: z.string().trim().min(3, "At least 3 characters").max(32).regex(/^[a-zA-Z0-9_.-]+$/, "Letters, numbers, dots, dashes and underscores only"),
  displayName: z.string().trim().min(1, "Tell us what to call you").max(40),
  password: z.string().min(8, "At least 8 characters").max(128),
  role: z.enum(["STUDENT", "PARENT"]),
});

export async function POST(req: Request) {
  try {
    rateLimit(`signup:${clientIp(req)}`, 5, 2);
    const body = await readJson(req, Body);
    const user = await createUser(body);
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
    return Response.json({ redirect: user.role === "STUDENT" ? "/onboarding" : homeFor(user.role) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
