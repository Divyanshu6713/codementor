import { z } from "zod";
import { readJson, withStudent } from "@/server/http";
import { saveOnboarding } from "@/server/services/students";
import { EXPERIENCE, GOALS } from "@/server/db/schema";

const Body = z.object({
  displayName: z.string().trim().min(1).max(40),
  grade: z.string().trim().max(20).nullable(),
  experience: z.enum(EXPERIENCE),
  usedCpp: z.boolean(),
  confidence: z.number().int().min(1).max(3),
  goal: z.enum(GOALS),
});

export const POST = withStudent(async (req, user) => {
  await saveOnboarding(user.id, await readJson(req, Body));
  return Response.json({ redirect: "/app/diagnostic" });
});
