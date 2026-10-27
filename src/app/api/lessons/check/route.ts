import { z } from "zod";
import { EXERCISE_KEY } from "@/content/course";
import { rateLimit, readJson, withStudent } from "@/server/http";
import { checkExercise } from "@/server/services/lesson-exercises";
import { recordPass } from "@/server/services/lesson-path";

const Body = z.object({
  lessonId: z.string().regex(EXERCISE_KEY),
  source: z.string().min(1).max(64 * 1024),
  showFailingHidden: z.boolean().default(false),
});

/** Judges a lesson exercise with the real compiler; a first pass is recorded and earns XP. */
export const POST = withStudent(async (req, user) => {
  rateLimit(`run:${user.id}`, 15, 15);
  const body = await readJson(req, Body, 100 * 1024);
  const result = await checkExercise(body.lessonId, body.source, body.showFailingHidden);
  const reward = result.passed ? await recordPass(user.id, body.lessonId) : null;
  return Response.json({ ...result, reward });
});
