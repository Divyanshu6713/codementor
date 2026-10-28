import { z } from "zod";
import { claimGuestAccount, createSession } from "@/server/auth/auth";
import { setSessionCookie } from "@/server/auth/current";
import { config } from "@/server/config";
import { issueRecoveryCode } from "@/server/auth/recovery";
import { rateLimit, readJson, withStudent } from "@/server/http";

const Body = z.object({
  username: z.string().trim().min(3, "At least 3 characters").max(32).regex(/^[a-zA-Z0-9_.-]+$/, "Letters, numbers, dots, dashes and underscores only")
    .refine((u) => !u.toLowerCase().startsWith("guest_"), "Choose a name that doesn't start with guest_"),
  displayName: z.string().trim().min(1, "Tell us what to call you").max(40),
  password: z.string().min(8, "At least 8 characters").max(128),
});

/** Keep a guest's progress for good: give the account a username and password. */
export const POST = withStudent(async (req, user) => {
  rateLimit(`claim:${user.id}`, 5, 1);
  const body = await readJson(req, Body, 4 * 1024);
  const claimed = await claimGuestAccount(user.id, body);
  const recoveryCode = await issueRecoveryCode(claimed.id);
  // Fresh session with the normal lifetime now that the account has a password.
  const { token, expiresAt } = await createSession(claimed.id, config.sessionDays);
  await setSessionCookie(token, expiresAt);
  return Response.json({ ok: true, username: claimed.username, recoveryCode });
});
