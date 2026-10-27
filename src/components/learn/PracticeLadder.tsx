import Link from "next/link";
import clsx from "clsx";
import { CheckCircle2, Circle, Flame, Sprout, Swords } from "lucide-react";

export interface LadderItem {
  /** null = the lesson's own exercise (the beginner problem). */
  id: string | null;
  level: "beginner" | "intermediate" | "challenge";
  title: string;
  passed: boolean;
}

const LEVEL = {
  beginner: { label: "Beginner", xp: 25, icon: Sprout, tone: "text-success" },
  intermediate: { label: "Intermediate", xp: 20, icon: Swords, tone: "text-concept" },
  challenge: { label: "Challenge", xp: 30, icon: Flame, tone: "text-clay" },
} as const;

/**
 * The three graded problems of a lesson: the lesson exercise (beginner), then the intermediate and
 * challenge practice problems. Nothing is locked — the order is a suggestion.
 */
export function PracticeLadder({ lessonId, items, current }: { lessonId: string; items: LadderItem[]; current?: string | null }) {
  if (items.length < 2) return null;
  const solved = items.filter((i) => i.passed).length;
  return (
    <nav aria-label="Practice problems" className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Practice problems</p>
        <p className="font-mono text-xs text-ink-3">{solved}/{items.length} solved</p>
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-3">
        {items.map((it) => {
          const L = LEVEL[it.level];
          const Icon = L.icon;
          const href = it.id ? `/app/learn/${lessonId}/practice/${it.id}` : `/app/learn/${lessonId}#practise`;
          const isCurrent = (current ?? null) === it.id;
          return (
            <li key={it.level}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={clsx(
                  "flex h-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                  isCurrent ? "border-accent bg-accent-soft/60" : "border-line hover:border-line-strong hover:bg-sunken/50",
                )}
              >
                <Icon size={18} className={clsx("mt-0.5 shrink-0", L.tone)} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wider text-ink-3">{L.label} · {L.xp} XP</span>
                  <span className="block truncate font-medium text-ink">{it.title}</span>
                </span>
                {it.passed
                  ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-label="solved" />
                  : <Circle size={16} className="mt-0.5 shrink-0 text-line-strong" aria-label="not solved yet" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
