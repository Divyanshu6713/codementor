import { z } from "zod";
import { rateLimit, readJson, withStudent } from "@/server/http";
import { runCode } from "@/server/services/code-runs";

const Body = z.object({
  source: z.string().min(1).max(64 * 1024),
  input: z.string().max(16 * 1024).default(""),
  sessionId: z.string().uuid().nullable().optional(),
  itemKey: z.string().max(200).nullable().optional(),
});

export const POST = withStudent(async (req, user) => {
  rateLimit(`run:${user.id}`, 15, 15);
  return Response.json(await runCode(user.id, await readJson(req, Body)));
});
