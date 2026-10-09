import { z } from "zod";
import { currentGuestId } from "@/server/guest/request";
import { clientIp, rateLimit, readJson, withPublic } from "@/server/http";
import { guestCheck } from "@/server/services/guest";

const Body = z.object({
  lessonId: z.string().regex(/^[a-z0-9-]{1,60}$/),
  source: z.string().min(1).max(64 * 1024),
  showFailingHidden: z.boolean().default(false),
});

export const POST = withPublic(async (req) => {
  const guestId = await currentGuestId();
  rateLimit(`run:ip:${clientIp(req)}`, 240, 240);
  rateLimit(`run:g:${guestId ?? clientIp(req)}`, 20, 30);
  const body = await readJson(req, Body, 100 * 1024);
  return Response.json(await guestCheck(body.lessonId, body.source, body.showFailingHidden));
});
