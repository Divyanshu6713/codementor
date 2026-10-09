import clsx from "clsx";
import { Flame, Mountain, Target, TrendingUp } from "lucide-react";
import { DIFFICULTY_LABELS } from "@/server/learning/adaptivity";

/** Circular progress (0..1). Decorative ring + readable label for screen readers. */
export function ProgressRing({ value, size = 88, stroke = 8, color = "var(--accent)", label, children }: {
  value: number; size?: number; stroke?: number; color?: string; label: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sunken)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} className="transition-[stroke-dashoffset] duration-700 ease-[var(--ease-calm)]" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export interface ProgressData {
  xp: number;
  level: { index: number; name: string; next: string | null; nextAt: number | null; progress: number; toNext: number };
  week: { xp: number; lastWeekXp: number };
  streak: { best: number; current: number };
  hardestSolo: number | null;
  bestSession: { accuracy: number; questions: number } | null;
  solvedSolo: number;
}

export function LevelCard({ p }: { p: ProgressData }) {
  const diff = p.week.xp - p.week.lastWeekXp;
  return (
    <div className="flex h-full flex-col gap-4 rounded-[var(--radius-card)] border border-line/80 bg-surface p-5 shadow-card">
      <div className="flex items-center gap-4">
        <ProgressRing value={p.level.progress} color="var(--clay)" label={`Level ${p.level.index + 1}, ${p.level.name}: ${Math.round(p.level.progress * 100)}% to next level`}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Level</span>
          <span className="text-2xl font-extrabold leading-none tabular">{p.level.index + 1}</span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Your rank</p>
          <p className="text-xl font-bold tracking-tight">{p.level.name}</p>
          <p className="text-sm text-ink-2 tabular">{p.xp.toLocaleString()} XP{p.level.next ? <> · <span className="font-semibold text-clay">{p.level.toNext} to {p.level.next}</span></> : " · top rank"}</p>
        </div>
      </div>
      <div className="rounded-[0.75rem] bg-sunken/70 px-3.5 py-3 text-sm">
        <p className="flex items-center gap-1.5 font-semibold"><TrendingUp size={15} className="text-clay" aria-hidden /> This week vs last week</p>
        <div className="mt-2 flex items-end gap-3">
          <WeekBar label="Last" value={p.week.lastWeekXp} max={Math.max(p.week.xp, p.week.lastWeekXp, 1)} muted />
          <WeekBar label="This" value={p.week.xp} max={Math.max(p.week.xp, p.week.lastWeekXp, 1)} />
          <p className="ml-auto max-w-[11rem] text-right text-xs text-ink-2">
            {p.week.xp === 0 && p.week.lastWeekXp === 0 ? "Earn XP by solving — harder and hint-free counts more."
              : diff > 0 ? <><span className="font-semibold text-success">+{diff} XP</span> ahead of last week</>
              : diff === 0 ? "Level with last week" : <><span className="font-semibold text-clay">{-diff} XP</span> to beat last week</>}
          </p>
        </div>
      </div>
      <ul className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-3 text-xs text-ink-2">
        <li><span className="font-semibold text-ink">10–26 XP</span> per solve, more for hard &amp; hint-free</li>
        <li><span className="font-semibold text-ink">+15</span> each mistake you fix</li>
        <li><span className="font-semibold text-ink">+20</span> each misunderstanding cleared</li>
        <li><span className="font-semibold text-ink">+30</span> per lesson finished</li>
      </ul>
    </div>
  );
}

function WeekBar({ label, value, max, muted }: { label: string; value: number; max: number; muted?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold tabular">{value}</span>
      <div className="flex h-14 w-7 items-end overflow-hidden rounded-md bg-surface">
        <div className={clsx("w-full rounded-md transition-[height] duration-700", muted ? "bg-line-strong" : "bg-clay")} style={{ height: `${Math.max(6, (value / max) * 100)}%` }} />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-ink-3">{label}</span>
    </div>
  );
}

export function PersonalBests({ p, learningDays, weeklyTarget = 4 }: { p: ProgressData; learningDays: number; weeklyTarget?: number }) {
  const tiles = [
    {
      icon: Flame, label: "Solo streak", value: `${p.streak.current}`, unit: p.streak.current === 1 ? "in a row" : "in a row",
      note: p.streak.best ? `Best: ${p.streak.best}${p.streak.current && p.streak.current === p.streak.best ? " — that's now!" : ""}` : "Solve without hints to start one",
    },
    {
      icon: Mountain, label: "Hardest solved solo", value: p.hardestSolo ? DIFFICULTY_LABELS[p.hardestSolo] : "—", unit: "",
      note: p.hardestSolo && p.hardestSolo < 5 ? `Next: try ${DIFFICULTY_LABELS[p.hardestSolo + 1].toLowerCase()}` : p.hardestSolo === 5 ? "You've cleared a challenge" : "No solo solve yet",
    },
    {
      icon: Target, label: "Best session", value: p.bestSession ? `${Math.round(p.bestSession.accuracy * 100)}%` : "—", unit: p.bestSession ? "accuracy" : "",
      note: p.bestSession ? `over ${p.bestSession.questions} questions` : "Finish a 5+ question session",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map(({ icon: Icon, label, value, unit, note }) => (
        <div key={label} className="rounded-[var(--radius-card)] border border-line/80 bg-surface p-4 shadow-card">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-3"><Icon size={14} className="text-clay" aria-hidden /> {label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular">{value} <span className="text-sm font-medium text-ink-3">{unit}</span></p>
          <p className="mt-1 text-xs text-ink-2">{note}</p>
        </div>
      ))}
      <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line/80 bg-surface p-4 shadow-card">
        <ProgressRing value={learningDays / weeklyTarget} size={64} stroke={6} label={`${learningDays} of ${weeklyTarget} learning days this week`}>
          <span className="text-sm font-bold tabular">{learningDays}/{weeklyTarget}</span>
        </ProgressRing>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Weekly goal</p>
          <p className="mt-0.5 text-sm text-ink-2">{learningDays >= weeklyTarget ? "Goal met — rest is part of learning too." : `${weeklyTarget - learningDays} more learning day${weeklyTarget - learningDays === 1 ? "" : "s"} this week.`}</p>
        </div>
      </div>
    </div>
  );
}
