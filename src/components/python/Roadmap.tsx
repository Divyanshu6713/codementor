"use client";

import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Badge, MasteryBar, inputClass, pct } from "@/components/ui";
import { STATUS_ICON } from "./status";

export interface RoadmapLevel {
  number: number;
  title: string;
  summary: string;
  modulesDone: number;
  modulesTotal: number;
  modules: {
    id: string; number: number; title: string; summary: string; track: "core" | "specialist"; lessonsDone: number; lessonsTotal: number;
    complete: boolean; projectPassed: boolean; examBest: number | null; mastery: number | null;
    lessons: { id: string; title: string; minutes: number; status: "locked" | "available" | "in_progress" | "completed"; mastery: number | null }[];
  }[];
}

/** The full course: expandable levels → modules → lessons, with statuses and a title search. */
export function Roadmap({ levels, openLevel }: { levels: RoadmapLevel[]; openLevel: number }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<number>>(() => new Set([openLevel]));
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => levels.map((lv) => ({
    ...lv,
    modules: lv.modules.map((m) => ({
      ...m,
      shown: q ? m.lessons.filter((l) => l.title.toLowerCase().includes(q)) : m.lessons,
      hit: q ? m.title.toLowerCase().includes(q) : true,
    })).filter((m) => !q || m.hit || m.shown.length),
  })).filter((lv) => !q || lv.modules.length), [levels, q]);

  const toggle = <T,>(set: Set<T>, v: T) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v); else n.add(v);
    return n;
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter modules and lessons…" aria-label="Filter the roadmap" className={clsx(inputClass, "pl-9")} />
      </div>
      {filtered.length === 0 && <p className="text-sm text-ink-3">Nothing matches “{query}”. Try the full-text <Link href={`/app/search?q=${encodeURIComponent(query)}`} className="font-semibold text-accent hover:underline">search</Link>.</p>}
      {filtered.map((lv) => {
        const isOpen = Boolean(q) || open.has(lv.number);
        return (
          <section key={lv.number} className="rounded-[var(--radius-card)] border border-line bg-surface shadow-card">
            <h2>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen((s) => toggle(s, lv.number))} className="flex w-full items-center gap-4 px-5 py-4 text-left">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft font-mono text-sm font-bold text-accent">L{lv.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">Level {lv.number}: {lv.title}</span>
                  <span className="block text-sm text-ink-2">{lv.summary}</span>
                </span>
                <span className="hidden text-sm text-ink-3 sm:block">{lv.modulesDone}/{lv.modulesTotal} modules</span>
                <ChevronDown size={18} className={clsx("shrink-0 transition-transform", isOpen && "rotate-180")} aria-hidden />
              </button>
            </h2>
            {isOpen && (
              <div className="grid gap-3 border-t border-line p-4 lg:grid-cols-2">
                {lv.modules.map((m) => {
                  const mOpen = Boolean(q) || openModules.has(m.id);
                  return (
                    <div key={m.id} className={clsx("rounded-xl border p-4", m.complete ? "border-success/40 bg-success-soft/30" : "border-line")}>
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-sm font-bold text-ink-3">{m.number}</span>
                        <div className="min-w-0 flex-1">
                          <Link href={`/app/python/module/${m.id}`} className="font-bold hover:text-accent">{m.title}</Link>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {m.track === "specialist" && <Badge tone="clay">Optional path</Badge>}
                            {m.complete && <Badge tone="success">Complete</Badge>}
                            {m.examBest !== null && <Badge tone={m.examBest >= 0.7 ? "success" : "hint"}>Exam best {Math.round(m.examBest * 100)}%</Badge>}
                            {m.projectPassed && <Badge tone="pink">Project ✓</Badge>}
                          </div>
                        </div>
                        <span className="text-xs text-ink-3">{m.lessonsDone}/{m.lessonsTotal}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken" role="meter" aria-label={`${m.title} progress`} aria-valuemin={0} aria-valuemax={m.lessonsTotal} aria-valuenow={m.lessonsDone}>
                        <div className="h-full rounded-full bg-accent" style={{ width: `${m.lessonsTotal ? (m.lessonsDone / m.lessonsTotal) * 100 : 0}%` }} />
                      </div>
                      <button type="button" className="mt-2 text-xs font-semibold text-accent hover:underline" aria-expanded={mOpen} onClick={() => setOpenModules((s) => toggle(s, m.id))}>
                        {mOpen ? "Hide lessons" : `Show ${m.lessonsTotal} lessons`}
                      </button>
                      {mOpen && (
                        <ol className="mt-2 space-y-0.5">
                          {m.shown.map((l) => (
                            <li key={l.id}>
                              <Link href={`/app/python/learn/${l.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-sunken">
                                {STATUS_ICON[l.status]}
                                <span className={clsx("min-w-0 flex-1", l.status === "locked" ? "text-ink-3" : "text-ink")}>{l.title}</span>
                                {l.mastery !== null ? <span className="flex w-20 items-center gap-1"><MasteryBar value={l.mastery} label={`${l.title} mastery`} /><span className="sr-only">{pct(l.mastery)}</span></span> : <span className="text-xs text-ink-3">{l.minutes}m</span>}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
      <p className="flex flex-wrap gap-4 text-xs text-ink-3">
        <span className="flex items-center gap-1">{STATUS_ICON.completed} completed</span>
        <span className="flex items-center gap-1">{STATUS_ICON.in_progress} in progress</span>
        <span className="flex items-center gap-1">{STATUS_ICON.available} available</span>
        <span className="flex items-center gap-1">{STATUS_ICON.locked} locked until earlier lessons are done</span>
      </p>
    </div>
  );
}
