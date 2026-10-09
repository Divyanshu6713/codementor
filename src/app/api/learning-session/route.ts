import { z } from "zod";
import { rateLimit, readJson, withStudent } from "@/server/http";
import { startRecommended, startSession } from "@/server/services/sessions";

const Length = z.enum(["quick", "normal", "deep"]).default("normal");
const Body = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("recommended"), length: Length, useAlternative: z.boolean().optional() }),
  z.object({ mode: z.literal("diagnostic") }),
  z.object({ mode: z.literal("lesson"), lessonId: z.string().max(80), length: Length }),
  z.object({ mode: z.literal("practice"), conceptId: z.string().max(80).optional(), skills: z.array(z.string().max(80)).max(20).optional(), length: Length }),
  z.object({ mode: z.literal("revision"), skills: z.array(z.string().max(80)).min(1).max(30), length: Length }),
  z.object({ mode: z.literal("mistake"), mistakeId: z.string().uuid() }),
  z.object({ mode: z.literal("problem"), questionId: z.string().max(80) }),
]);

export const POST = withStudent(async (req, user) => {
  rateLimit(`start:${user.id}`, 20, 10);
  const b = await readJson(req, Body);
  let id: string;
  switch (b.mode) {
    case "recommended": id = await startRecommended(user.id, b.length, b.useAlternative); break;
    case "diagnostic": id = await startSession(user.id, { kind: "diagnostic" }); break;
    case "lesson": id = await startSession(user.id, { kind: "lesson", lessonId: b.lessonId, length: b.length }); break;
    case "practice": id = await startSession(user.id, { kind: "practice", conceptId: b.conceptId, skills: b.skills, length: b.length }); break;
    case "revision": id = await startSession(user.id, { kind: "revision", skills: b.skills, length: b.length }); break;
    case "mistake": id = await startSession(user.id, { kind: "practice", mistakeId: b.mistakeId, length: "quick" }); break;
    case "problem": id = await startSession(user.id, { kind: "practice", questionId: b.questionId, length: "quick" }); break;
  }
  return Response.json({ id, url: `/app/session/${id}` });
});
