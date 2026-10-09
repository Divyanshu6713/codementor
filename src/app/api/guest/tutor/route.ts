import { z } from "zod";
import { config } from "@/server/config";
import { currentGuestId } from "@/server/guest/request";
import { clientIp, rateLimit, readJson, trustedClientIp, withPublic } from "@/server/http";
import { guestTutor } from "@/server/services/guest-tutor";

const Body = z.object({
  lessonId: z.string().regex(/^[a-z0-9-]{1,60}$/),
  mode: z.enum(["concept", "hint", "error", "review", "ask"]),
  hintLevel: z.number().int().min(1).max(4).nullable().default(null),
  code: z.string().max(64 * 1024).nullable().default(null),
  question: z.string().max(1500).nullable().default(null),
});

export const POST = withPublic(async (req) => {
  const guestId = await currentGuestId();
  rateLimit(`tutor:g:${guestId ?? clientIp(req)}`, 6, 6);
  const body = await readJson(req, Body, 100 * 1024);
  if ((body.code?.length ?? 0) + (body.question?.length ?? 0) > config.ai.maxInputChars) {
    body.code = body.code?.slice(0, Math.max(0, config.ai.maxInputChars - (body.question?.length ?? 0))) ?? null;
  }
  return Response.json(await guestTutor({ ...body, guestId, ip: trustedClientIp(req) }));
});
