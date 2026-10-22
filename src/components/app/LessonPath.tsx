import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, Circle, Lock, PartyPopper } from "lucide-react";
import { Badge, ButtonLink } from "@/components/ui";
import { HUE_CLASSES, type Hue } from "@/lib/palette";

export interface PathModuleView {
  id: string;
  number: number;
  title: string;
  summary: string;
  planned: string[];
  done: number;
  complete: boolean;
  lessons: { id: string; title: string; minutes: number; passed: boolean; xp: number }[];
}

const MODULE_HUES: Hue[] = ["sky", "pink", "accent", "success", "clay", "concept", "teal"];

/** Other learning paths: Python is live; the rest are shown honestly as not available yet. */
const FUTURE_PATHS = [
  { title: "Python", note: "Python Mastery: 7 levels from first program to professional projects.", href: "/app/python" },
  { title: "JavaScript", note: "Lessons and a JavaScript sandbox are planned." },
  { title: "Data Structures & Algorithms", note: "Starts after C++ Module 7." },
];

export function LessonPath({ modules, next, nextTitle, passedCount, total }: { modules: PathModuleView[]; next: string | null; nextTitle: string | null; passedCount: number; total: number }) {
  return (
    <section aria-labelledby="path-h" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">C++ · step by step</p>
          <h2 id="path-h" className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Lesson path</h2>
          <p className="mt-1 text-sm text-ink-2">{passedCount} of {total} lessons done. Every lesson ends with a coding exercise checked by a real compiler — pass it to earn XP.</p>
        </div>
        {next && <ButtonLink href={`/app/learn/${next}`}>{passedCount ? "Continue" : "Start"}: {nextTitle} <ArrowRight size={16} aria-hidden /></ButtonLink>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {modules.map((m, i) => {
          const hue = HUE_CLASSES[MODULE_HUES[i % MODULE_HUES.length]];
          const available = m.lessons.length > 0;
          return (
            <div key={m.id} className={clsx("rounded-[var(--radius-card)] border bg-surface p-5 shadow-card", available ? "border-line/80" : "border-dashed border-line-strong bg-surface/60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-mono text-sm font-bold", hue.soft, hue.text)}>{m.number}</span>
                  <div>
                    <h3 className="font-bold leading-tight">{m.title}</h3>
                    <p className="text-xs text-ink-3">{available ? `${m.done}/${m.lessons.length} lessons` : "coming later"}</p>
                  </div>
                </div>
                {m.complete && <Badge tone="success"><PartyPopper size={12} aria-hidden /> Complete</Badge>}
              </div>
              {available ? (
                <>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-sunken" role="meter" aria-valuemin={0} aria-valuemax={m.lessons.length} aria-valuenow={m.done} aria-label={`${m.title} progress`}>
                    <div className={clsx("h-full rounded-full transition-[width] duration-500", hue.bg)} style={{ width: `${(m.done / m.lessons.length) * 100}%` }} />
                  </div>
                  <ol className="mt-3 space-y-0.5">
                    {m.lessons.map((l) => (
                      <li key={l.id}>
                        <Link href={`/app/learn/${l.id}`} className={clsx("flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-sunken", l.id === next ? "font-semibold text-ink" : "text-ink-2")}>
                          {l.passed ? <CheckCircle2 size={16} className="shrink-0 text-success" aria-label="completed" /> : <Circle size={16} className={clsx("shrink-0", l.id === next ? hue.text : "text-line-strong")} aria-hidden />}
                          <span className="min-w-0 flex-1">{l.title}</span>
                          {l.passed ? <span className="font-mono text-xs text-success">+{l.xp}</span> : l.id === next ? <Badge tone="accent">next</Badge> : <span className="text-xs text-ink-3">{l.minutes}m</span>}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="mt-3 text-sm text-ink-3"><Lock size={13} className="mr-1 inline" aria-hidden />{m.summary} Planned: {m.planned.join(" · ")}.</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-5">
        <p className="text-sm font-semibold">More learning paths</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {FUTURE_PATHS.map((p) => (
            <li key={p.title} className="rounded-xl bg-sunken/60 px-3 py-2 text-sm">
              {"href" in p && p.href
                ? <Link href={p.href} className="font-semibold text-accent hover:underline">{p.title}</Link>
                : <span className="font-semibold">{p.title}</span>}{" "}
              {"href" in p && p.href ? <Badge tone="success">available</Badge> : <Badge>coming later</Badge>}
              <p className="mt-0.5 text-xs text-ink-3">{p.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
