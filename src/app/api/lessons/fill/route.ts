import { z } from "zod";
import { EXERCISE_KEY, FILL_SUFFIX, MAX_ANSWER_LENGTH, MAX_BLANKS } from "@/content/course";
import { rateLimit, readJson, withStudent } from "@/server/http";
import { checkFillIn } from "@/server/services/lesson-exercises";
import { recordPass } from "@/server/services/lesson-path";

const Body = z.object({
  lessonId: z.string().regex(EXERCISE_KEY),
  answers: z.array(z.string().max(MAX_ANSWER_LENGTH)).min(1).max(MAX_BLANKS),
  showFailingHidden: z.boolean().default(false),
});

/** "Complete the code": the learner's lines are spliced into the solution and judged by the real tests. */
export const POST = withStudent(async (req, user) => {
  rateLimit(`run:${user.id}`, 15, 15);
  const body = await readJson(req, Body, 16 * 1024);
  const result = await checkFillIn(body.lessonId, body.answers, body.showFailingHidden);
  const reward = result.passed ? await recordPass(user.id, `${body.lessonId}${FILL_SUFFIX}`) : null;
  return Response.json({ ...result, reward });
});
