"use client";

import clsx from "clsx";
import Link from "next/link";
import { CheckCircle2, Circle, CircleDot, Map } from "lucide-react";
import type { Roadmap } from "@/content/course";
import { useProgress } from "@/lib/guest-progress";

/** Left-hand course map. On small screens it collapses into a "Course map" disclosure. */
export function RoadmapNav({ roadmap, currentId }: { roadmap: Roadmap; currentId: string }) {
  const progress = useProgress();
  const currentModule = roadmap.find((m) => m.lessons.some((l) => l.id === currentId));
  const total = roadmap.reduce((n, m) => n + m.lessons.length, 0);
  const done = roadmap.reduce((n, m) => n + m.lessons.filter((l) => progress.lessons[l.id]?.completedAt).length, 0);

  const list = (
    <nav aria-label="Course map" className="space-y-4">
      {roadmap.map((m) => (
        <div key={m.id}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">Module {m.number}</p>
          <p className="mb-1 text-sm font-semibold">{m.title}</p>
          {m.lessons.length ? (
            <ol className="space-y-0.5">
              {m.lessons.map((l) => {
                const completed = Boolean(progress.lessons[l.id]?.completedAt);
                const current = l.id === currentId;
                return (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${l.id}`}
                      aria-current={current ? "page" : undefined}
                      className={clsx("flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm", current ? "bg-accent-soft font-semibold text-accent-ink" : "text-ink-2 hover:bg-sunken hover:text-ink")}
                    >
                      {completed
                        ? <CheckCircle2 size={15} className="shrink-0 text-success" aria-label="completed" />
                        : current ? <CircleDot size={15} className="shrink-0 text-accent" aria-hidden /> : <Circle size={15} className="shrink-0 text-line-strong" aria-hidden />}
                      <span className="min-w-0">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : <p className="px-2 text-xs text-ink-3">Coming later</p>}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <details className="rounded-xl border border-line bg-surface lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold">
          <Map size={16} aria-hidden /> Course map
          <span className="font-normal text-ink-3">{currentModule ? `· Module ${currentModule.number} ` : ""}· {done}/{total} done</span>
        </summary>
        <div className="max-h-[60vh] overflow-auto border-t border-line px-3 py-3">{list}</div>
      </details>
      <div className="hidden lg:block">
        <p className="mb-3 text-xs text-ink-3"><span className="font-semibold text-ink">{done} of {total}</span> lessons done</p>
        {list}
      </div>
    </>
  );
}
