/**
 * Chooses the next question for practice, exit checks and revision. Deterministic scoring:
 * target skills, the difficulty ladder, misconceptions to probe, variety of question types, and
 * avoiding questions seen recently.
 */
import type { Purpose } from "@/content/types";

export interface PoolQuestion {
  id: string;
  type: string;
  conceptId: string;
  difficulty: number;
  purposes: string[];
  skills: { id: string; weight: number }[];
  probes: string[];
}

export interface PickContext {
  targetSkills: string[];
  targetDifficulty: number;
  purpose: Purpose;
  /** Already used in this session. */
  exclude: Set<string>;
  /** questionId → when the student last saw it. */
  lastSeen: Map<string, Date>;
  activeMisconceptions: Set<string>;
  executionAvailable: boolean;
  lastType: string | null;
  now: Date;
}

const HOUR = 3_600_000;

export function scoreQuestion(q: PoolQuestion, ctx: PickContext): number {
  const skillMatch = q.skills.reduce((s, k) => s + (ctx.targetSkills.includes(k.id) ? k.weight : 0), 0);
  if (skillMatch === 0) return -Infinity;
  let score = skillMatch * 3;
  score += q.probes.filter((p) => ctx.activeMisconceptions.has(p)).length * 2.5;
  score -= Math.abs(q.difficulty - ctx.targetDifficulty) * 1.5;
  const seen = ctx.lastSeen.get(q.id);
  if (seen) {
    const hours = (ctx.now.getTime() - seen.getTime()) / HOUR;
    score -= hours < 24 ? 4 : hours < 72 ? 1.5 : 0.5;
  }
  if (ctx.lastType && q.type === ctx.lastType) score -= 0.75;
  return score;
}

export function pickQuestion(pool: PoolQuestion[], ctx: PickContext): PoolQuestion | null {
  const eligible = pool.filter((q) =>
    !ctx.exclude.has(q.id) &&
    q.purposes.includes(ctx.purpose) &&
    q.type !== "explain" &&
    (ctx.executionAvailable || q.type !== "write_code"));
  let best: PoolQuestion | null = null;
  let bestScore = -Infinity;
  for (const q of eligible) {
    const s = scoreQuestion(q, ctx);
    // Ties break on id so the choice is reproducible.
    if (s > bestScore || (s === bestScore && best && q.id < best.id)) {
      best = q;
      bestScore = s;
    }
  }
  return bestScore === -Infinity ? null : best;
}
