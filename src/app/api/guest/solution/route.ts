import { z } from "zod";
import { clientIp, rateLimit, readJson, withPublic } from "@/server/http";
import { guestSolution } from "@/server/services/guest";

const Body = z.object({ lessonId: z.string().regex(/^[a-z0-9-]{1,60}$/) });

/** Level 5 help: the worked solution. Only sent when the student explicitly asks for it. */
export const POST = withPublic(async (req) => {
  rateLimit(`solution:${clientIp(req)}`, 60, 30);
  const body = await readJson(req, Body, 4 * 1024);
  return Response.json(guestSolution(body.lessonId), { headers: { "cache-control": "no-store" } });
});
