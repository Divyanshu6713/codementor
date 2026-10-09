import { uuidParam, withStudent } from "@/server/http";
import { getSessionView } from "@/server/services/sessions";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withStudent(async (_req, user, ctx: Ctx) => {
  const id = uuidParam.parse((await ctx.params).id);
  return Response.json(await getSessionView(user.id, id));
});
