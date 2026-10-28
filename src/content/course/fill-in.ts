/**
 * "Complete the code": a scaffolded version of an exercise. The worked solution is shown with a few
 * key lines removed; the learner writes just those lines. Answers are judged by splicing them into
 * the solution and running the exercise's real tests — never by comparing text — so any correct
 * line counts, not only the one we wrote.
 *
 * Blanks are chosen deterministically from the lines the learner would have had to write (lines of
 * the solution that aren't in the starter code), preferring the ones carrying the logic.
 */
import type { Exercise } from "./types";

export interface FillInBlank {
  /** Index into the solution's lines. */
  line: number;
  indent: string;
  /** Kept visible after the blank, e.g. " {" at the end of a for header. */
  suffix: string;
}

export interface FillInPuzzle {
  /** The solution's lines; blanked lines are given as null. */
  lines: (string | null)[];
  blanks: FillInBlank[];
}

export const MAX_BLANKS = 3;
export const MAX_ANSWER_LENGTH = 240;

const CONTROL = /^(for|while|if|else if|switch|return|do)\b|\b(for|while|if)\s*\(/;
const OPERATOR = /[=+\-*/%<>!&|?]/;
const CALL = /\w\s*\(/;

function score(trimmed: string): number {
  if (trimmed.length < 6) return 0;
  if (/^(#|\/\/|using |namespace |public:|private:|protected:|return 0;|\}|\{|struct |class |template\s*<)/.test(trimmed)) return 0;
  if (/^(int|long long|double|string|char|bool|auto|size_t|vector<[^>]*>)\s+\w+;$/.test(trimmed)) return 0; // bare declarations
  if (/^(cin|std::cin)\s*>>/.test(trimmed)) return 0; // reading input is boilerplate here
  let s = 1;
  if (CONTROL.test(trimmed)) s += 3;
  if (OPERATOR.test(trimmed.replace(/->|<<|>>|#include <[^>]*>/g, ""))) s += 2;
  if (/<<|>>/.test(trimmed)) s += 1;
  if (CALL.test(trimmed)) s += 1;
  return s;
}

/** The fill-in puzzle for an exercise, or null when it has no suitable lines. */
export function fillInPuzzle(exercise: Pick<Exercise, "starterCode" | "solution">): FillInPuzzle | null {
  const lines = exercise.solution.split("\n");
  const starterCounts = new Map<string, number>();
  for (const l of exercise.starterCode.split("\n")) {
    const t = l.trim();
    if (t) starterCounts.set(t, (starterCounts.get(t) ?? 0) + 1);
  }
  const candidates: { line: number; score: number }[] = [];
  lines.forEach((l, i) => {
    const t = l.trim();
    const left = starterCounts.get(t) ?? 0;
    if (left > 0) {
      starterCounts.set(t, left - 1);
      return;
    }
    const s = score(t.replace(/\s*\{$/, ""));
    if (s >= 3) candidates.push({ line: i, score: s });
  });
  if (!candidates.length) return null;
  // Best lines first; spread them out by preferring ones not next to an already chosen line.
  const chosen: number[] = [];
  const ranked = [...candidates].sort((a, b) => b.score - a.score || a.line - b.line);
  for (const c of ranked) {
    if (chosen.length >= MAX_BLANKS) break;
    if (chosen.some((x) => Math.abs(x - c.line) <= 1) && ranked.length > MAX_BLANKS * 2) continue;
    chosen.push(c.line);
  }
  for (const c of ranked) {
    if (chosen.length >= MAX_BLANKS) break;
    if (!chosen.includes(c.line)) chosen.push(c.line);
  }
  chosen.sort((a, b) => a - b);
  const blanks = chosen.map((i) => {
    const raw = lines[i];
    const indent = raw.match(/^\s*/)![0];
    const suffix = /\s*\{\s*$/.test(raw) && raw.trim() !== "{" ? " {" : "";
    return { line: i, indent, suffix };
  });
  return { lines: lines.map((l, i) => (chosen.includes(i) ? null : l)), blanks };
}

/** The text a blank replaced (for tests and the worked solution — never sent with the puzzle). */
export function blankAnswer(exercise: Pick<Exercise, "solution">, blank: FillInBlank): string {
  const raw = exercise.solution.split("\n")[blank.line];
  return raw.trim().replace(/\s*\{\s*$/, blank.suffix ? "" : "$&").trim();
}

/** Builds the full program from the learner's answers (one line each, no newlines). */
export function assembleFillIn(puzzle: FillInPuzzle, answers: string[]): string {
  if (answers.length !== puzzle.blanks.length) throw new Error("wrong number of answers");
  const out = [...puzzle.lines];
  puzzle.blanks.forEach((b, k) => {
    const text = answers[k].replace(/[\r\n]+/g, " ").trim().replace(/\s*\{$/, b.suffix ? "" : "$&");
    out[b.line] = `${b.indent}${text}${b.suffix}`;
  });
  return out.join("\n");
}
