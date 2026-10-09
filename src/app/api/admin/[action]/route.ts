import { z } from "zod";
import { rateLimit, readJson, withUser } from "@/server/http";
import { NotFoundError } from "@/server/errors";
import { setQuestionStatus } from "@/server/services/admin";
import { generateAndValidate } from "@/server/services/question-generation";

type Ctx = { params: Promise<{ action: string }> };

const Status = z.object({ questionId: z.string().max(120), status: z.enum(["active", "disabled"]) });
const Generate = z.object({ conceptId: z.string().max(80), difficulty: z.number().int().min(1).max(5) });

export const POST = withUser(async (req, user, ctx: Ctx) => {
  switch ((await ctx.params).action) {
    case "question-status": {
      const b = await readJson(req, Status);
      await setQuestionStatus(user.id, b.questionId, b.status);
      return Response.json({ ok: true });
    }
    case "generate": {
      rateLimit(`gen:${user.id}`, 3, 1);
      const b = await readJson(req, Generate);
      return Response.json(await generateAndValidate(user.id, b.conceptId, b.difficulty));
    }
    default:
      throw new NotFoundError("That action");
  }
}, ["ADMIN", "CONTENT_EDITOR"]);
