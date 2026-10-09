import { z } from "zod";
import { currentGuestId } from "@/server/guest/request";
import { clientIp, rateLimit, readJson, withPublic } from "@/server/http";
import { guestRun } from "@/server/services/guest";

const Body = z.object({
  source: z.string().min(1).max(64 * 1024),
  input: z.string().max(16 * 1024).default(""),
});

export const POST = withPublic(async (req) => {
  const guestId = await currentGuestId();
  rateLimit(`run:ip:${clientIp(req)}`, 240, 240);
  rateLimit(`run:g:${guestId ?? clientIp(req)}`, 20, 30);
  const body = await readJson(req, Body, 100 * 1024);
  return Response.json(await guestRun(body.source, body.input));
});
