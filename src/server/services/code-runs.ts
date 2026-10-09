/**
 * Running code without grading: the playground and "Run" (custom input) inside a coding task.
 * Uses the same sandbox; never touches mastery.
 */
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/server/db/client";
import { execute } from "@/server/execution/providers";
import { AppError } from "@/server/errors";
import type { SessionState } from "./session-types";

export async function runCode(studentId: string, args: { source: string; input: string; sessionId?: string | null; itemKey?: string | null }) {
  const db = await getDb();
  let questionVersionId: string | null = null;
  if (args.sessionId) {
    const s = await db.query.learningSessions.findFirst({ where: eq(schema.learningSessions.id, args.sessionId) });
    if (!s || s.studentId !== studentId) throw new AppError("That session wasn't found.", 404, "not_found");
    const item = (s.state as SessionState).item;
    if (item && item.itemKey === args.itemKey) questionVersionId = item.versionId;
  }
  const res = await execute({ language: "cpp", source: args.source, tests: [{ id: "run", input: args.input }] });
  const run = res.tests[0];
  await db.insert(schema.codeSubmissions).values({
    studentId, sessionId: args.sessionId ?? null, questionVersionId, kind: args.sessionId ? "run" : "playground", language: "cpp", source: args.source,
  });
  return {
    compile: res.compile,
    run: run ? { status: run.status, stdout: run.stdout, stderr: run.stderr.slice(0, 4000), detail: run.detail, timeMs: run.timeMs } : null,
    executor: res.executor,
    isolation: res.isolation,
  };
}
