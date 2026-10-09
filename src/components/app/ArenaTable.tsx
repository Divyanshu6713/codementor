"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Circle, CircleDot, Search, Zap } from "lucide-react";
import { DIFFICULTY, HUE_CLASSES, topicHue } from "@/lib/palette";
import { StartSessionButton } from "@/components/app/StartSessionButton";
import type { ArenaProblem } from "@/server/services/arena";

const STATUS = {
  solved: { icon: CheckCircle2, cls: "text-success", label: "Solved" },
  attempted: { icon: CircleDot, cls: "text-hint", label: "Attempted" },
  new: { icon: Circle, cls: "text-line-strong", label: "Not tried" },
} as const;

export function ArenaTable({ problems }: { problems: ArenaProblem[] }) {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<number | null>(null);
  const [status, setStatus] = useState<"all" | "solved" | "unsolved">("all");
  const list = useMemo(() => problems.filter((p) =>
    (!q || `${p.title} ${p.tags.join(" ")} ${p.conceptTitle}`.toLowerCase().includes(q.toLowerCase())) &&
    (diff === null || p.difficulty === diff) &&
    (status === "all" || (status === "solved" ? p.status === "solved" : p.status !== "solved"))), [problems, q, diff, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">Search problems</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems or tags" className="h-10 w-full rounded-[0.75rem] border border-line bg-surface pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Difficulty">
          {[null, 1, 2, 3, 4, 5].map((d) => {
            const meta = d ? DIFFICULTY[d] : null;
            const on = diff === d;
            return (
              <button key={String(d)} type="button" onClick={() => setDiff(d)} aria-pressed={on}
                className={clsx("rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                  on ? (meta ? `${HUE_CLASSES[meta.hue].soft} ${HUE_CLASSES[meta.hue].text} ${HUE_CLASSES[meta.hue].border}` : "border-accent bg-accent text-on-accent") : "border-line bg-surface text-ink-2 hover:bg-sunken")}>
                {meta ? meta.short : "All levels"}
              </button>
            );
          })}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status" className="h-10 rounded-[0.75rem] border border-line bg-surface px-3 text-sm font-semibold">
          <option value="all">All problems</option>
          <option value="unsolved">Unsolved</option>
          <option value="solved">Solved</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line/80 bg-surface shadow-card">
        <table className="w-full text-sm">
          <caption className="sr-only">Practice problems</caption>
          <thead className="bg-sunken/70 text-left text-xs font-semibold uppercase tracking-wider text-ink-3">
            <tr>
              <th scope="col" className="w-12 px-4 py-3"><span className="sr-only">Status</span></th>
              <th scope="col" className="px-2 py-3">Problem</th>
              <th scope="col" className="hidden px-2 py-3 md:table-cell">Topic</th>
              <th scope="col" className="px-2 py-3">Difficulty</th>
              <th scope="col" className="hidden px-2 py-3 sm:table-cell">Acceptance</th>
              <th scope="col" className="hidden px-2 py-3 sm:table-cell">Reward</th>
              <th scope="col" className="px-4 py-3 text-right"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, i) => {
              const S = STATUS[p.status];
              const d = DIFFICULTY[p.difficulty];
              const hue = HUE_CLASSES[topicHue(p.conceptId)];
              return (
                <tr key={p.id} className={clsx("border-t border-line/70 transition-colors hover:bg-sunken/40", i % 2 === 1 && "bg-sunken/20")}>
                  <td className="px-4 py-3"><S.icon size={18} className={S.cls} aria-label={S.label} /></td>
                  <td className="px-2 py-3">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {p.title}
                      {p.daily && <span className="rounded-full bg-hero px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Daily</span>}
                      {p.soloSolved && <span title="Solved first try without hints" className="text-clay"><Zap size={14} aria-label="Solved solo" /></span>}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-3">{p.tags.join(" · ")}</p>
                  </td>
                  <td className="hidden px-2 py-3 md:table-cell"><span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", hue.soft, hue.text)}>{p.conceptTitle}</span></td>
                  <td className="px-2 py-3"><span className={clsx("rounded-full px-2.5 py-1 text-xs font-bold", HUE_CLASSES[d.hue].soft, HUE_CLASSES[d.hue].text)}>{d.short}</span></td>
                  <td className="hidden px-2 py-3 font-mono text-xs text-ink-2 sm:table-cell" title={`${p.submissions} finished attempts across all students`}>{p.acceptance === null ? "new" : `${Math.round(p.acceptance * 100)}%`}</td>
                  <td className="hidden px-2 py-3 text-xs font-bold text-clay sm:table-cell">+{p.xp} XP</td>
                  <td className="px-4 py-3 text-right">
                    <StartSessionButton size="sm" variant={p.status === "solved" ? "secondary" : "primary"} body={{ mode: "problem", questionId: p.id }} label={p.status === "solved" ? "Retry" : "Solve"} />
                  </td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-2">No problems match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-3">Acceptance = share of finished attempts (all students) that ended correct; shown once a problem has {3}+ attempts. Reward is the full XP for a first-try, hint-free solve.</p>
    </div>
  );
}
