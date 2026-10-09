import { z } from "zod";
import { rateLimit, readJson, withUser } from "@/server/http";
import { linkWithCode } from "@/server/services/parents";

const Body = z.object({ code: z.string().trim().min(6).max(12) });

export const POST = withUser(async (req, user) => {
  rateLimit(`link:${user.id}`, 5, 2);
  await linkWithCode(user.id, (await readJson(req, Body)).code);
  return Response.json({ ok: true });
}, ["PARENT"]);
