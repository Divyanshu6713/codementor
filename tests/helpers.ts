import { createTestDb, setDbForTesting, type DB } from "@/server/db/client";
import { createUser } from "@/server/auth/auth";
import { saveOnboarding } from "@/server/services/students";
import { setExecutionProviderForTesting } from "@/server/execution/providers";
import { executeRequest } from "../worker/sandbox/runner";
import { createWindowsJobBackend } from "../worker/sandbox/backends/windows-job";
import { questionById } from "@/content";
import { splitQuestion } from "@/server/content/question-parts";
import type { StudentAnswer } from "@/types/questions";

export const canExecute = process.platform === "win32" && Boolean(createWindowsJobBackend().compiler);

export async function freshDb(): Promise<{ db: DB; close: () => Promise<void> }> {
  const opened = await createTestDb();
  setDbForTesting(opened.db);
  return { db: opened.db, close: async () => { setDbForTesting(null); await opened.close(); } };
}

/** Routes the judge to the real local sandbox backend (no worker HTTP hop in tests). */
export async function useLocalSandbox() {
  const backend = createWindowsJobBackend();
  await backend.init();
  setExecutionProviderForTesting({
    id: "test-local",
    status: async () => ({ available: true, provider: "test-local", isolation: backend.isolation, devOnly: true, message: null }),
    execute: (req) => executeRequest(backend, req),
  });
}

export function noExecution() {
  setExecutionProviderForTesting({
    id: "none",
    status: async () => ({ available: false, provider: "none", isolation: null, devOnly: false, message: "Code execution environment not configured." }),
    execute: async () => { throw new Error("not configured"); },
  });
}

let n = 0;
export async function makeStudent(experience: "none" | "a_little" | "some" | "comfortable" = "some") {
  const user = await createUser({ username: `student${++n}_${Date.now()}`, displayName: "Asha", password: "correct-horse-1", role: "STUDENT" });
  await saveOnboarding(user.id, { displayName: "Asha", grade: "8", experience, usedCpp: experience !== "none", confidence: 2, goal: "learn_from_scratch" });
  return user;
}

/** The correct answer for a question, built from the authored content. */
export function correctAnswer(questionId: string): StudentAnswer {
  const q = questionById.get(questionId)!;
  switch (q.type) {
    case "mcq": case "predict_output": case "identify_error": return { type: "choice", optionId: q.correct };
    case "complete_code": return { type: "text", text: q.accepted[0] };
    case "reorder": {
      const key = splitQuestion(q).answerKey;
      return { type: "order", order: key.type === "reorder" ? key.order : [] };
    }
    case "trace": return { type: "fields", values: q.fields.map((f) => f.answer) };
    case "write_code": return { type: "code", source: q.referenceSolution };
    case "explain": return { type: "text", text: "With <= the loop also runs when i is equal to n, so it does one extra iteration; with < it stops before n. The loop keeps going while the condition is true." };
  }
}

/** A wrong answer that triggers a misconception when one is tagged. */
export function wrongAnswer(questionId: string): StudentAnswer {
  const q = questionById.get(questionId)!;
  switch (q.type) {
    case "mcq": case "predict_output": case "identify_error": {
      const o = q.options.find((x) => x.id !== q.correct && x.misconception) ?? q.options.find((x) => x.id !== q.correct)!;
      return { type: "choice", optionId: o.id };
    }
    case "complete_code": return { type: "text", text: q.wrongAnswers?.[0]?.answer ?? "i == 0" };
    case "trace": return { type: "fields", values: q.fields.map((f) => f.wrong?.[0]?.answer ?? "0") };
    case "reorder": return { type: "order", order: q.lines.map((_, i) => i) };
    case "write_code": return { type: "code", source: q.starterCode };
    case "explain": return { type: "text", text: "they are the same thing" };
  }
}
