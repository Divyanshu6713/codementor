import { z } from "zod";
import { rateLimit, readJson, uuidParam, withStudent } from "@/server/http";
import { NotFoundError } from "@/server/errors";
import {
  advance, endSessionEarly, explainDifferently, getSessionView, requestHint, revealSolution, runTests, skipItem, submitAnswer,
} from "@/server/services/sessions";
import { tutorChat } from "@/server/services/tutor";

type Ctx = { params: Promise<{ id: string; action: string }> };

const ItemBody = z.object({ itemKey: z.string().max(200) });
const Answer = z.discriminatedUnion("type", [
  z.object({ type: z.literal("choice"), optionId: z.string().max(10) }),
  z.object({ type: z.literal("text"), text: z.string().max(4000) }),
  z.object({ type: z.literal("order"), order: z.array(z.number().int().min(0).max(50)).max(50) }),
  z.object({ type: z.literal("fields"), values: z.array(z.string().max(200)).max(20) }),
  z.object({ type: z.literal("code"), source: z.string().min(1).max(64 * 1024) }),
]);
const AnswerBody = z.object({
  itemKey: z.string().max(200),
  answer: Answer,
  selfConfidence: z.enum(["guessing", "somewhat", "very"]).nullable().optional(),
  durationMs: z.number().int().min(0).max(86_400_000).nullable().optional(),
});
const TutorBody = z.object({
  message: z.string().trim().min(1).max(1500),
  recentTurns: z.array(z.object({ role: z.enum(["student", "tutor"]), text: z.string().max(4000) })).max(20),
});

/** All in-session actions. Every one re-validates ownership and the current item on the server. */
export const POST = withStudent(async (req, user, ctx: Ctx) => {
  const params = await ctx.params;
  const id = uuidParam.parse(params.id);
  switch (params.action) {
    case "advance":
      await advance(user.id, id);
      return Response.json(await getSessionView(user.id, id));
    case "end":
      await endSessionEarly(user.id, id);
      return Response.json(await getSessionView(user.id, id));
    case "answer": {
      rateLimit(`answer:${user.id}`, 30, 30);
      const feedback = await submitAnswer(user.id, id, await readJson(req, AnswerBody));
      return Response.json({ feedback, view: await getSessionView(user.id, id) });
    }
    case "hint":
    case "solution":
    case "skip": {
      rateLimit(`${params.action}:${user.id}`, 20, 20);
      const { itemKey } = await readJson(req, ItemBody);
      const fn = params.action === "hint" ? requestHint : params.action === "solution" ? revealSolution : skipItem;
      const result = await fn(user.id, id, itemKey);
      return Response.json({ result, view: await getSessionView(user.id, id) });
    }
    case "run-tests": {
      rateLimit(`runtests:${user.id}`, 15, 15);
      const b = await readJson(req, z.object({ itemKey: z.string().max(200), source: z.string().min(1).max(64 * 1024) }));
      return Response.json({ result: await runTests(user.id, id, b.itemKey, b.source) });
    }
    case "explain": {
      rateLimit(`explain:${user.id}`, 6, 6);
      const { stepKey } = await readJson(req, z.object({ stepKey: z.string().max(80) }));
      return Response.json({ result: await explainDifferently(user.id, id, stepKey) });
    }
    case "tutor": {
      rateLimit(`tutor:${user.id}`, 10, 6);
      const body = await readJson(req, TutorBody);
      return Response.json(await tutorChat(user.id, id, body.message, body.recentTurns));
    }
    default:
      throw new NotFoundError("That action");
  }
});
