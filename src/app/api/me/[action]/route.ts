import { z } from "zod";
import { clearSessionCookie, currentSessionToken } from "@/server/auth/current";
import { changePassword, regenerateRecoveryCode, sessionHash } from "@/server/auth/recovery";
import { rateLimit, readJson, withStudent, withUser } from "@/server/http";
import { NotFoundError } from "@/server/errors";
import { deleteAccount, exportData, updatePreferences } from "@/server/services/privacy";
import { createLinkCode, unlinkParent } from "@/server/services/parents";
import { setLeaderboardOptIn } from "@/server/services/arena";

type Ctx = { params: Promise<{ action: string }> };

const Prefs = z.object({ tutorRetentionDays: z.union([z.literal(0), z.literal(7), z.literal(30)]).optional(), askConfidence: z.boolean().optional() });
const ChangePassword = z.object({ current: z.string().min(1).max(128), password: z.string().min(8, "At least 8 characters").max(128) });
const Confirm = z.object({ password: z.string().min(1).max(128) });
const Delete = z.object({ password: z.string().max(128).default(""), confirm: z.literal("DELETE") });

/** GET /api/me/export — download all of your data as JSON. */
export const GET = withUser(async (_req, user, ctx: Ctx) => {
  if ((await ctx.params).action !== "export") throw new NotFoundError("That page");
  const data = await exportData(user.id);
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="codementor-${user.username}-export.json"`, "cache-control": "no-store" },
  });
});

export const POST = withUser(async (req, user, ctx: Ctx) => {
  const { action } = await ctx.params;
  if (action === "delete") {
    rateLimit(`delete:${user.id}`, 3, 1);
    await deleteAccount(user.id, (await readJson(req, Delete)).password);
    await clearSessionCookie();
    return Response.json({ redirect: "/" });
  }
  if (action === "password") {
    rateLimit(`password:${user.id}`, 5, 5);
    const b = await readJson(req, ChangePassword, 4 * 1024);
    const token = await currentSessionToken();
    await changePassword(user.id, b.current, b.password, token ? sessionHash(token) : null);
    return Response.json({ ok: true });
  }
  if (action === "recovery-code") {
    rateLimit(`recovery-code:${user.id}`, 5, 5);
    return Response.json({ recoveryCode: await regenerateRecoveryCode(user.id, (await readJson(req, Confirm, 4 * 1024)).password) });
  }
  // The remaining actions are student-only.
  return studentActions(req, ctx);
});

const studentActions = withStudent(async (req, user, ctx: Ctx) => {
  const { action } = await ctx.params;
  switch (action) {
    case "preferences":
      await updatePreferences(user.id, await readJson(req, Prefs));
      return Response.json({ ok: true });
    case "leaderboard":
      await setLeaderboardOptIn(user.id, (await readJson(req, z.object({ show: z.boolean() }))).show);
      return Response.json({ ok: true });
    case "link-code":
      rateLimit(`linkcode:${user.id}`, 5, 1);
      return Response.json(await createLinkCode(user.id));
    case "unlink-parent":
      await unlinkParent(user.id, (await readJson(req, z.object({ parentId: z.string().uuid() }))).parentId, user.id);
      return Response.json({ ok: true });
    default:
      throw new NotFoundError("That action");
  }
});
