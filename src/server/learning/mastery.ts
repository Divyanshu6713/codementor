/**
 * Skill mastery model — deterministic and unit-tested.
 *
 * Each skill keeps Beta-style pseudo-counts (alpha = evidence of understanding, beta = evidence
 * against). Every finished item adds evidence weighted by:
 *   - credit: correctness reduced by retries, hint level and solution reveal (independence matters);
 *   - difficulty: succeeding on a hard item says more than on an easy one, failing an easy item
 *     says more than failing a hard one;
 *   - source: revision recall counts a little more (retention), explanations count less.
 * Old evidence decays toward the prior so recent performance dominates and mastery can fall again.
 *
 *   mastery    = alpha / (alpha + beta)            — how likely the student understands
 *   confidence = f(amount of evidence, consistency) — how much we trust that estimate
 *
 * Time taken is deliberately NOT an input: slow learning isn't weak learning.
 */
import type { SkillStatus } from "@/server/db/schema";

export const PRIOR = 0.5;
export const DECAY = 0.9;

export const MASTERY_THRESHOLD = 0.8;
export const MASTERY_MIN_CONFIDENCE = 0.45;

export type EvidenceKind = "diagnostic" | "lesson" | "practice" | "revision" | "exit_check" | "explain";

const KIND_WEIGHT: Record<EvidenceKind, number> = {
  diagnostic: 1, lesson: 1, practice: 1, exit_check: 1.2, revision: 1.2, explain: 0.5,
};

/** Credit multipliers for the highest hint level used (index = level 0..4). */
export const HINT_FACTORS = [0.9, 0.8, 0.65, 0.5, 0.35] as const;
const ATTEMPT_FACTORS = [1, 0.75, 0.6, 0.5] as const;

export interface RecentOutcome {
  /** credit 0..1 */
  c: number;
  /** correct */
  ok: boolean;
  /** solved independently (correct, no hints, no solution) */
  i: boolean;
  /** max hint level used (-1 none, 5 = solution) */
  h: number;
  /** difficulty 1..5 */
  d: number;
  at: string;
}

export interface SkillState {
  alpha: number;
  beta: number;
  mastery: number;
  confidence: number;
  evidenceCount: number;
  correctCount: number;
  independentCount: number;
  recent: RecentOutcome[];
  explainScore: number | null;
  status: SkillStatus;
  source: "assessed" | "inferred";
  lastPracticedAt: Date | null;
}

export interface ItemResult {
  correct: boolean;
  attempts: number;
  maxHintLevel: number;
  solutionRevealed: boolean;
}

export interface Evidence {
  credit: number;
  correct: boolean;
  independent: boolean;
  maxHintLevel: number;
  difficulty: number;
  kind: EvidenceKind;
  /** The question's weight for this skill (secondary skills get less). */
  weight?: number;
  at: Date;
}

const round = (n: number, dp = 4) => Math.round(n * 10 ** dp) / 10 ** dp;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Credit for one finished item: 1 = first try, no help; 0 = wrong or solution revealed. */
export function itemCredit(r: ItemResult): number {
  if (!r.correct || r.solutionRevealed) return 0;
  const attemptFactor = ATTEMPT_FACTORS[Math.min(Math.max(r.attempts, 1), ATTEMPT_FACTORS.length) - 1];
  const hintFactor = r.maxHintLevel < 0 ? 1 : HINT_FACTORS[Math.min(r.maxHintLevel, 4)];
  return round(attemptFactor * hintFactor, 3);
}

export function isIndependent(r: ItemResult): boolean {
  return r.correct && !r.solutionRevealed && r.maxHintLevel < 0;
}

export function newSkillState(): SkillState {
  return {
    alpha: PRIOR, beta: PRIOR, mastery: 0.5, confidence: 0, evidenceCount: 0, correctCount: 0,
    independentCount: 0, recent: [], explainScore: null, status: "NEW", source: "assessed", lastPracticedAt: null,
  };
}

/** Skills the diagnostic skipped because a harder concept above them was passed. */
export function inferredKnownState(): SkillState {
  const s = newSkillState();
  s.alpha = PRIOR + 1.6;
  s.beta = PRIOR + 0.1;
  s.mastery = round(s.alpha / (s.alpha + s.beta));
  s.confidence = 0.15;
  s.source = "inferred";
  s.status = "PRACTICING";
  return s;
}

export function recentStats(recent: RecentOutcome[]) {
  const n = recent.length;
  if (!n) return { n: 0, accuracy: null, independentAccuracy: null, hintDependency: null };
  const accuracy = recent.filter((r) => r.ok).length / n;
  const independentAccuracy = recent.filter((r) => r.i).length / n;
  // 0 = never needed help; 1 = needed the full solution every time.
  const hintDependency = recent.reduce((s, r) => s + (r.h < 0 ? 0 : (r.h + 1) / 6), 0) / n;
  return { n, accuracy: round(accuracy, 3), independentAccuracy: round(independentAccuracy, 3), hintDependency: round(hintDependency, 3) };
}

export function computeConfidence(alpha: number, beta: number, recent: RecentOutcome[]): number {
  const n = Math.max(0, alpha + beta - 2 * PRIOR);
  const amount = n / (n + 3);
  if (recent.length < 3) return round(amount, 3);
  const mean = recent.reduce((s, r) => s + r.c, 0) / recent.length;
  const sd = Math.sqrt(recent.reduce((s, r) => s + (r.c - mean) ** 2, 0) / recent.length);
  // Inconsistent results (sd up to 0.5) cut confidence by up to half.
  const consistency = clamp(1 - sd, 0.5, 1);
  return round(amount * consistency, 3);
}

export function isMastered(s: Pick<SkillState, "mastery" | "confidence" | "recent" | "independentCount">): boolean {
  const st = recentStats(s.recent);
  return (
    s.mastery >= MASTERY_THRESHOLD &&
    s.confidence >= MASTERY_MIN_CONFIDENCE &&
    s.independentCount >= 1 &&
    (st.independentAccuracy ?? 0) >= 0.6 &&
    (st.hintDependency ?? 1) <= 0.35
  );
}

/** Lifecycle: NEW → LEARNING → PRACTICING → MASTERED → (REVISION_DUE) → REINFORCING → MASTERED. */
export function nextStatus(prev: SkillStatus, s: SkillState): SkillStatus {
  if (s.evidenceCount === 0 && s.source !== "inferred") return "NEW";
  if (isMastered(s)) return "MASTERED";
  if (prev === "MASTERED" || prev === "REINFORCING" || prev === "REVISION_DUE") return "REINFORCING";
  if (s.mastery >= 0.5 && s.evidenceCount >= 2) return "PRACTICING";
  return "LEARNING";
}

/** Applies one piece of evidence. Pure: returns a new state. */
export function applyEvidence(prev: SkillState, ev: Evidence): SkillState {
  const w = (ev.weight ?? 1) * KIND_WEIGHT[ev.kind];
  const d = clamp(ev.difficulty, 1, 5);
  const successW = w * (0.7 + 0.15 * (d - 1));
  const failW = w * (0.7 + 0.15 * (5 - d));
  const credit = clamp(ev.credit, 0, 1);

  // Inferred estimates are replaced by real evidence rather than averaged with it.
  const base = prev.source === "inferred" ? newSkillState() : prev;
  const alpha = PRIOR + (base.alpha - PRIOR) * DECAY + successW * credit;
  const beta = PRIOR + (base.beta - PRIOR) * DECAY + failW * (1 - credit);
  const recent = [...base.recent, { c: credit, ok: ev.correct, i: ev.independent, h: ev.maxHintLevel, d, at: ev.at.toISOString() }].slice(-10);

  const next: SkillState = {
    ...base,
    alpha: round(alpha),
    beta: round(beta),
    mastery: round(alpha / (alpha + beta)),
    confidence: computeConfidence(alpha, beta, recent),
    evidenceCount: base.evidenceCount + 1,
    correctCount: base.correctCount + (ev.correct ? 1 : 0),
    independentCount: base.independentCount + (ev.independent ? 1 : 0),
    recent,
    explainScore: ev.kind === "explain" ? credit : base.explainScore,
    source: "assessed",
    lastPracticedAt: ev.at,
  };
  next.status = nextStatus(prev.status, next);
  return next;
}

export type ConfidenceLabel = "Low" | "Medium" | "High";
export function confidenceLabel(c: number): ConfidenceLabel {
  return c < 0.35 ? "Low" : c < 0.6 ? "Medium" : "High";
}

/** Concept-level summary from its skills (only skills with evidence or an inferred estimate count). */
export function conceptMastery(skills: { mastery: number; confidence: number; evidenceCount: number; source: string; status: SkillStatus }[], totalSkills: number) {
  const known = skills.filter((s) => s.evidenceCount > 0 || s.source === "inferred");
  if (!known.length) return { mastery: null, confidence: 0, coverage: 0, mastered: false };
  const mastery = known.reduce((s, k) => s + k.mastery, 0) / known.length;
  const confidence = known.reduce((s, k) => s + k.confidence, 0) / totalSkills;
  return {
    mastery: round(mastery, 3),
    confidence: round(confidence, 3),
    coverage: round(known.length / totalSkills, 3),
    mastered: known.length === totalSkills && known.every((k) => k.status === "MASTERED"),
  };
}
