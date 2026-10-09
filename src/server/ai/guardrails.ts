/**
 * Post-checks on AI text before it reaches a student. A failed check means the curated content is
 * used instead (and the interaction is logged as guardrail_rejected).
 */
import type { Evidence } from "./types";

const EXEC_CLAIMS = /\b(compiles?( fine| successfully| correctly)?|compiled( fine| successfully)?|it (now )?works|(all|every) (the )?tests? (pass|passed)|passes (all|every)|test(s)? passed|runs? (correctly|perfectly)|output is correct)\b/i;

/** The AI may only talk about compiling/passing when the judge says the submission was accepted. */
export function claimsUnverifiedExecution(text: string, evidence: Evidence | null): boolean {
  if (!EXEC_CLAIMS.test(text)) return false;
  return evidence?.verdict !== "accepted";
}

const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

/**
 * Leaks the answer = contains two or more substantive lines of the reference solution, or the
 * exact correct answer text (for short-answer/MCQ questions).
 */
export function revealsSolution(text: string, opts: { referenceSolution?: string | null; answerTexts?: string[] }): boolean {
  const t = norm(text);
  if (opts.referenceSolution) {
    const lines = opts.referenceSolution.split("\n").map((l) => l.trim())
      .filter((l) => l.length > 8 && !/^(#include|using namespace|int main|return 0|[{}])/.test(l));
    const leaked = lines.filter((l) => t.includes(norm(l))).length;
    if (leaked >= 2) return true;
  }
  for (const a of opts.answerTexts ?? []) {
    const n = norm(a);
    if (n.length >= 3 && t.includes(n)) return true;
  }
  return false;
}

export function tooLong(text: string, maxWords: number): boolean {
  return text.trim().split(/\s+/).length > maxWords;
}
