import { z } from "zod";
import { EXERCISE_KEY } from "@/content/course";
import { rateLimit, readJson, withStudent } from "@/server/http";
import { workedSolution } from "@/server/services/lesson-exercises";
import { noteSolutionViewed } from "@/server/services/lesson-path";

const Body = z.object({ lessonId: z.string().regex(EXERCISE_KEY) });

/** Level 5 help: the worked solution, only on explicit request. Viewing it lowers the XP a later pass earns. */
export const POST = withStudent(async (req, user) => {
  rateLimit(`solution:${user.id}`, 20, 10);
  const body = await readJson(req, Body, 4 * 1024);
  const solution = workedSolution(body.lessonId);
  await noteSolutionViewed(user.id, body.lessonId);
  return Response.json(solution, { headers: { "cache-control": "no-store" } });
});
