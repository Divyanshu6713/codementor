import { z } from "zod";
import { EXERCISE_KEY } from "@/content/course";
import { config } from "@/server/config";
import { rateLimit, readJson, trustedClientIp, withStudent } from "@/server/http";
import { noteHint } from "@/server/services/lesson-path";
import { mentorHelp } from "@/server/services/mentor";

const Body = z.object({
  lessonId: z.string().regex(EXERCISE_KEY).nullable().default(null),
  mode: z.enum(["concept", "hint", "error", "review", "ask"]),
  hintLevel: z.number().int().min(1).max(4).nullable().default(null),
  code: z.string().max(64 * 1024).nullable().default(null),
  input: z.string().max(16 * 1024).default(""),
  question: z.string().max(1500).nullable().default(null),
});

/** The AI mentor panel (lessons and playground). Curated answers when AI is off or unavailable. */
export const POST = withStudent(async (req, user) => {
  rateLimit(`mentor:${user.id}`, 8, 6);
  const body = await readJson(req, Body, 100 * 1024);
  const room = Math.max(0, config.ai.maxInputChars - (body.question?.length ?? 0));
  const code = body.code ? body.code.slice(0, room) : null;
  const answer = await mentorHelp({ ...body, code, studentId: user.id, ip: trustedClientIp(req) });
  if (body.mode === "hint" && body.lessonId && body.hintLevel) await noteHint(user.id, body.lessonId, body.hintLevel);
  return Response.json(answer);
});
