"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import type { Roadmap } from "@/content/course";
import { ButtonLink, Button } from "@/components/ui";
import { hasProgress, progressActions, recommendedLesson, useProgress } from "@/lib/guest-progress";

export function RoadmapOverview({ roadmap }: { roadmap: Roadmap }) {
  const progress = useProgress();
  const order = roadmap.flatMap((m) => m.lessons.map((l) => l.id));
  const titles = Object.fromEntries(roadmap.flatMap((m) => m.lessons.map((l) => [l.id, l.title] as const)));
  const started = hasProgress(progress);
  const next = recommendedLesson(order, progress);
  const done = order.filter((id) => progress.lessons[id]?.completedAt).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
        <div>
          <p className="text-sm text-ink-3">{started ? `${done} of ${order.length} lessons complete` : "You haven't started yet"}</p>
          <p className="mt-0.5 text-lg font-semibold">{started ? `Recommended next: ${titles[next]}` : "Start with the very first lesson — no experience needed."}</p>
        </div>
        <ButtonLink href={`/learn/${next}`}>{started ? "Continue" : "Start Learning"} <ArrowRight size={16} aria-hidden /></ButtonLink>
      </div>

      {roadmap.map((m) => (
        <section key={m.id} aria-labelledby={`m-${m.id}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Module {m.number}</p>
          <h2 id={`m-${m.id}`} className="text-xl font-bold">{m.title}</h2>
          <p className="mt-1 text-sm text-ink-2">{m.summary}</p>
          {m.lessons.length ? (
            <ol className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {m.lessons.map((l, i) => {
                const completed = Boolean(progress.lessons[l.id]?.completedAt);
                return (
                  <li key={l.id}>
                    <Link href={`/learn/${l.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-sunken">
                      {completed ? <CheckCircle2 size={18} className="shrink-0 text-success" aria-label="completed" /> : <Circle size={18} className="shrink-0 text-line-strong" aria-hidden />}
                      <span className="w-6 shrink-0 font-mono text-xs text-ink-3">{m.number}.{i + 1}</span>
                      <span className="min-w-0 flex-1 font-medium">{l.title}</span>
                      <span className="shrink-0 text-xs text-ink-3">{l.minutes} min</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm text-ink-3">
              Coming later: {m.planned.join(" · ")}
            </div>
          )}
        </section>
      ))}

      {started && (
        <div className="border-t border-line pt-6 text-sm text-ink-3">
          <Button variant="ghost" size="sm" onClick={() => {
            if (window.confirm("Delete all progress and saved code in this browser? This can't be undone.")) progressActions.resetAll();
          }}>Reset my progress</Button>
        </div>
      )}
    </div>
  );
}
