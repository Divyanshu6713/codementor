import { z } from "zod";
import { rateLimit, readJson, withUser } from "@/server/http";
import { createResetLink } from "@/server/auth/recovery";

const Body = z.object({ studentId: z.string().uuid() });

/** A parent creates a one-time password reset link for a linked child who forgot their password. */
export const POST = withUser(async (req, user) => {
  rateLimit(`parent-reset:${user.id}`, 10, 10);
  const link = await createResetLink(user, { userId: (await readJson(req, Body)).studentId });
  return Response.json({ path: `/reset/${link.token}`, username: link.username, expiresAt: link.expiresAt.toISOString() });
}, ["PARENT"]);
