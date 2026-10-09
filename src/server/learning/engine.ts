/**
 * The Learning Engine: decides what the student should do next. Pure and deterministic — the AI
 * never chooses progression. Every reason it gives is computed from stored data.
 *
 * Priority (§28): overdue revision → recurring misconceptions → prerequisite weaknesses →
 * current goal / unfinished lesson → new concepts.
 */
import { conceptMastery, isMastered, recentStats, type RecentOutcome } from "./mastery";
import { isRecurring } from "./adaptivity";

export interface ConceptInfo {
  id: string;
  title: string;
  status: "active" | "planned";
  order: number;
  prerequisites: { id: string; strength: "required" | "recommended" }[];
  skills: { id: string; title: string }[];
  coreLessonId: string | null;
  remediationLessonId: string | null;
  /** Has practice questions in the pool (so a practice session is possible). */
  practiceable: boolean;
}

export interface SkillInfo {
  skillId: string;
  mastery: number;
  confidence: number;
  evidenceCount: number;
  independentCount: number;
  source: "assessed" | "inferred";
  status: string;
  recent: RecentOutcome[];
}

export interface MisconceptionInfo {
  code: string;
  title: string;
  conceptId: string;
  occurrences: number;
  recurrences: number;
  status: "active" | "resolved";
  lastDetectedAt: Date;
}

export interface LearnerSnapshot {
  diagnosticDone: boolean;
  goal: string | null;
  concepts: ConceptInfo[];
  skills: Map<string, SkillInfo>;
  misconceptions: MisconceptionInfo[];
  revisionDue: { skillId: string; dueAt: Date }[];
  completedLessons: Set<string>;
  now: Date;
}

export type DecisionAction = "diagnostic" | "revise" | "remediate" | "practice" | "learn" | "content_pending" | "all_done";

export interface Decision {
  action: DecisionAction;
  conceptId: string | null;
  lessonId: string | null;
  /** Skills a practice/revision session should target. */
  skills: string[];
  /** Misconception being targeted, if any. */
  misconception: string | null;
  title: string;
  /** "Why this?" — sentences built from real data only. */
  reasons: string[];
  /** When the ideal next concept has no lesson yet, the closest thing available. */
  alternative: { conceptId: string; lessonId: string; title: string } | null;
}

const DAY = 86_400_000;

function conceptState(c: ConceptInfo, skills: Map<string, SkillInfo>) {
  const rows = c.skills.map((s) => skills.get(s.id)).filter((s): s is SkillInfo => Boolean(s));
  const summary = conceptMastery(rows.map((r) => ({ ...r, status: r.status as never })), c.skills.length || 1);
  const mastered = c.skills.length > 0 && c.skills.every((s) => {
    const r = skills.get(s.id);
    return r && (r.source === "inferred" ? r.mastery >= 0.7 : isMastered(r));
  });
  return { ...summary, mastered, assessed: rows.filter((r) => r.source === "assessed" && r.evidenceCount > 0).length };
}

/** Weak = we have real evidence it's below 60%, with at least some confidence. */
function isWeak(c: ConceptInfo, skills: Map<string, SkillInfo>) {
  const st = conceptState(c, skills);
  return st.mastery !== null && st.assessed > 0 && st.mastery < 0.6 && st.confidence >= 0.15;
}

function weakestSkills(c: ConceptInfo, skills: Map<string, SkillInfo>, n = 3) {
  return c.skills
    .map((s) => ({ id: s.id, title: s.title, m: skills.get(s.id)?.mastery ?? 0, seen: (skills.get(s.id)?.evidenceCount ?? 0) > 0 }))
    .sort((a, b) => Number(b.seen) - Number(a.seen) || a.m - b.m)
    .slice(0, n);
}

function recentMissesText(skill: { id: string; title: string }, skills: Map<string, SkillInfo>): string | null {
  const s = skills.get(skill.id);
  if (!s || s.recent.length < 2) return null;
  const st = recentStats(s.recent);
  const missed = s.recent.filter((r) => !r.ok).length;
  if (!missed) return null;
  return `${missed} of your last ${st.n} ${skill.title.toLowerCase()} questions went wrong`;
}

/** Goal-based nudges to the default concept order (only among concepts that are ready). */
const GOAL_PRIORITY: Record<string, string[]> = {
  prepare_dsa: ["arrays", "nested-loops", "functions"],
  problem_solving: ["nested-loops", "arrays", "functions"],
  school_college: ["functions", "arrays", "strings"],
  placements: ["arrays", "strings", "functions"],
  competitive: ["arrays", "nested-loops", "functions"],
};

export function decideNext(s: LearnerSnapshot): Decision {
  const byId = new Map(s.concepts.map((c) => [c.id, c]));
  const blank: Pick<Decision, "conceptId" | "lessonId" | "skills" | "misconception" | "alternative"> = { conceptId: null, lessonId: null, skills: [], misconception: null, alternative: null };

  if (!s.diagnosticDone) {
    return { ...blank, action: "diagnostic", title: "Find your starting point", reasons: ["A short check of what you already know, so lessons start at the right place."] };
  }

  // 1. Overdue revision.
  const due = s.revisionDue.filter((r) => r.dueAt <= s.now);
  const overdue = due.filter((r) => s.now.getTime() - r.dueAt.getTime() > 2 * DAY);
  if (due.length >= 3 || overdue.length) {
    const titles = due.slice(0, 3).map((r) => skillTitleOf(r.skillId, s.concepts)).filter(Boolean);
    return {
      ...blank, action: "revise", skills: due.map((r) => r.skillId), title: "Review time",
      reasons: [
        `${due.length} skill${due.length === 1 ? " is" : "s are"} due for review${titles.length ? `: ${titles.join(", ")}` : ""}.`,
        ...(overdue.length ? [`${overdue.length} ${overdue.length === 1 ? "has" : "have"} been waiting more than 2 days — reviewing now helps it stick.`] : []),
      ],
    };
  }

  // Where the student is: the first concept (in teaching order) that isn't secure yet.
  // "Secure" = mastered, or — for a concept whose lesson they haven't taken — passed in the diagnostic
  // (≥ 70% on real or inferred evidence). After taking a lesson, only full mastery counts.
  const ordered = s.concepts.filter((c) => c.status === "active" && c.skills.length).sort((a, b) => a.order - b.order);
  const secure = (c: ConceptInfo) => {
    const st = conceptState(c, s.skills);
    if (st.mastered) return true;
    const tookLesson = Boolean(c.coreLessonId && s.completedLessons.has(c.coreLessonId));
    return !tookLesson && st.mastery !== null && st.mastery >= 0.7 && st.coverage >= 0.5;
  };
  const ready = (c: ConceptInfo) => c.prerequisites.filter((p) => p.strength === "required").every((p) => {
    const pc = byId.get(p.id);
    return !pc || !pc.skills.length || secure(pc) || (conceptState(pc, s.skills).mastery ?? 0) >= 0.6;
  });
  // The goal reorders concepts that are equally ready (e.g. arrays before functions for DSA prep).
  const priorities = GOAL_PRIORITY[s.goal ?? ""] ?? [];
  const rank = (c: ConceptInfo) => (priorities.includes(c.id) ? priorities.indexOf(c.id) : 100);
  // Concepts we can actually teach or practise come first; a content-less one is only chosen
  // (honestly, as "coming soon") when nothing teachable is ready.
  const hasContent = (c: ConceptInfo) => Boolean(c.coreLessonId || c.remediationLessonId || c.practiceable);
  const target = ordered
    .filter((c) => !secure(c) && ready(c))
    .sort((a, b) => Number(hasContent(b)) - Number(hasContent(a)) || rank(a) - rank(b) || a.order - b.order)[0];

  // 2. Recurring, unresolved misconceptions.
  const recurring = s.misconceptions
    .filter((m) => m.status === "active" && isRecurring(m))
    .sort((a, b) => b.occurrences - a.occurrences || b.lastDetectedAt.getTime() - a.lastDetectedAt.getTime());
  for (const m of recurring) {
    const mc = byId.get(m.conceptId);
    if (!mc) continue;
    const reason = `"${m.title}" has come up ${m.occurrences} time${m.occurrences === 1 ? "" : "s"}${m.recurrences ? ` (and came back after being fixed ${m.recurrences}×)` : ""}.`;
    // A misconception in a prerequisite (e.g. < vs <= while learning loops) is fixed at its source.
    const dependent = ordered.find((c) => c.id !== mc.id && c.prerequisites.some((p) => p.id === mc.id) && !secure(c));
    if (dependent && mc.remediationLessonId && !s.completedLessons.has(mc.remediationLessonId)) {
      return {
        ...blank, action: "remediate", conceptId: mc.id, lessonId: mc.remediationLessonId, misconception: m.code,
        skills: mc.skills.map((x) => x.id), title: `Strengthen ${mc.title.toLowerCase()} first`,
        reasons: [reason, `It's a ${mc.title.toLowerCase()} idea that ${dependent.title.toLowerCase()} depend on, so we'll fix it there instead of repeating more ${dependent.title.toLowerCase()} exercises.`],
      };
    }
    if (mc.practiceable) {
      return {
        ...blank, action: "practice", conceptId: mc.id, misconception: m.code, skills: mc.skills.map((x) => x.id),
        title: `Targeted practice: ${m.title.toLowerCase()}`,
        reasons: [reason, "A short set of questions chosen to check exactly this idea. Two correct answers in a row marks it as fixed."],
      };
    }
  }

  if (!target) {
    const blocked = ordered.find((c) => !secure(c));
    if (!blocked) {
      return { ...blank, action: "all_done", title: "You've mastered everything available", reasons: ["Every skill with content so far is at mastery. New topics are on the way; revision keeps them fresh."] };
    }
  }

  // 3. Prerequisite weakness: the next concept isn't ready because something under it is weak.
  const next = ordered.find((c) => !secure(c))!;
  if (!ready(next) || !target) {
    for (const p of next.prerequisites.filter((x) => x.strength === "required")) {
      const pc = byId.get(p.id);
      if (!pc || !isWeak(pc, s.skills)) continue;
      const st = conceptState(pc, s.skills);
      const weak = weakestSkills(pc, s.skills, 2);
      const misses = weak.map((w) => recentMissesText(w, s.skills)).filter((x): x is string => Boolean(x));
      const reasons = [
        `Your ${pc.title.toLowerCase()} estimate is ${Math.round((st.mastery ?? 0) * 100)}%, and ${next.title.toLowerCase()} build directly on it.`,
        ...(misses.length ? [`${cap(misses[0])}.`] : []),
      ];
      if (pc.remediationLessonId && !s.completedLessons.has(pc.remediationLessonId)) {
        return { ...blank, action: "remediate", conceptId: pc.id, lessonId: pc.remediationLessonId, skills: pc.skills.map((x) => x.id), title: `Review ${pc.title.toLowerCase()} first`, reasons };
      }
      if (pc.practiceable) {
        return { ...blank, action: "practice", conceptId: pc.id, skills: weak.map((w) => w.id), title: `Practise ${pc.title.toLowerCase()}`, reasons };
      }
    }
  }
  const focus = target ?? next;

  // 4. Learn the concept (core lesson, or the review lesson when that's all there is).
  const st = conceptState(focus, s.skills);
  const lessonId = focus.coreLessonId ?? focus.remediationLessonId;
  if (lessonId && !s.completedLessons.has(lessonId)) {
    const reasons: string[] = [];
    const strong = focus.prerequisites.map((p) => byId.get(p.id)).filter((pc): pc is ConceptInfo => Boolean(pc && (conceptState(pc, s.skills).mastery ?? 0) >= 0.7));
    if (strong.length) reasons.push(`You're doing well with ${strong.map((p) => p.title.toLowerCase()).join(" and ")}, which ${focus.title.toLowerCase()} build on.`);
    if (st.mastery === null) reasons.push(`${focus.title} is the next topic on your path.`);
    else reasons.push(`Your current ${focus.title.toLowerCase()} estimate is ${Math.round(st.mastery * 100)}%${st.assessed ? "" : " (not tested yet)"}.`);
    return {
      ...blank, action: focus.coreLessonId ? "learn" : "remediate", conceptId: focus.id, lessonId,
      skills: focus.skills.map((x) => x.id), title: `${focus.coreLessonId ? "Learn" : "Review"}: ${focus.title}`, reasons,
    };
  }

  // 5. Lesson done but not mastered → adaptive practice on the weakest skills.
  if (focus.practiceable) {
    const weak = weakestSkills(focus, s.skills, 3);
    const misses = weak.map((w) => recentMissesText(w, s.skills)).filter((x): x is string => Boolean(x));
    return {
      ...blank, action: "practice", conceptId: focus.id, skills: weak.map((w) => w.id), title: `Practise ${focus.title.toLowerCase()}`,
      reasons: [
        lessonId ? `You've finished the ${focus.title.toLowerCase()} lesson; it isn't at mastery yet (${Math.round((st.mastery ?? 0) * 100)}%).` : `${focus.title} isn't at mastery yet (${Math.round((st.mastery ?? 0) * 100)}%).`,
        misses.length ? `${cap(misses[0])}.` : `Weakest right now: ${weak.map((w) => w.title.toLowerCase()).join(", ")}.`,
      ],
    };
  }

  // Honest: the right next topic has no content yet. Offer the nearest concept that does.
  const alt = ordered.find((c) => c.coreLessonId && !secure(c) && !s.completedLessons.has(c.coreLessonId));
  return {
    ...blank, action: "content_pending", conceptId: focus.id, title: `Next up: ${focus.title}`,
    reasons: [
      `Based on your answers, ${focus.title.toLowerCase()} is the right next step for you.`,
      "That lesson hasn't been built yet in this early version of CodeMentor.",
      ...(alt ? [`The lesson available now is ${alt.title}. It assumes some earlier topics, so expect a few new ideas.`] : []),
    ],
    alternative: alt ? { conceptId: alt.id, lessonId: alt.coreLessonId!, title: alt.title } : null,
  };
}

const cap = (t: string) => `${t[0].toUpperCase()}${t.slice(1)}`;

function skillTitleOf(skillId: string, concepts: ConceptInfo[]): string | undefined {
  for (const c of concepts) {
    const s = c.skills.find((x) => x.id === skillId);
    if (s) return s.title;
  }
  return undefined;
}

// ── Session planner (§28) ──────────────────────────────────────────────────

export type SessionLength = "quick" | "normal" | "deep";

/** Questions per practice/revision session by length. */
export const SESSION_QUESTIONS: Record<SessionLength, number> = { quick: 5, normal: 8, deep: 12 };

export interface PlanBlock {
  minutes: number;
  label: string;
}

/** A transparent outline of a session, built from the decision and what's actually due. */
export function planSession(d: Decision, length: SessionLength, extras: { revisionDue: number; openMistakes: number }): PlanBlock[] {
  const total = { quick: 10, normal: 25, deep: 45 }[length];
  const blocks: PlanBlock[] = [];
  if (extras.revisionDue && d.action !== "revise") blocks.push({ minutes: length === "quick" ? 2 : 3, label: `Recall ${extras.revisionDue} skill${extras.revisionDue === 1 ? "" : "s"} due for review` });
  if (d.action === "learn" || d.action === "remediate") {
    blocks.push({ minutes: 0, label: d.action === "learn" ? "Learn the idea, with checkpoints" : "Re-teach the weak idea, with checkpoints" });
    blocks.push({ minutes: 0, label: "Guided and independent coding" });
    blocks.push({ minutes: 0, label: "Short exit check" });
  } else if (d.action === "practice" || d.action === "revise") {
    blocks.push({ minutes: 0, label: `${SESSION_QUESTIONS[length]} adaptive questions` });
  }
  if (extras.openMistakes && length !== "quick") blocks.push({ minutes: 3, label: "Retry a mistake from your Mistake Book" });
  const fixed = blocks.reduce((s, b) => s + b.minutes, 0);
  const flexible = blocks.filter((b) => b.minutes === 0);
  for (const b of flexible) b.minutes = Math.max(2, Math.round((total - fixed) / flexible.length));
  return blocks;
}
