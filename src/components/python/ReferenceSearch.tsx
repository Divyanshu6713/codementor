"use client";

import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { inputClass } from "@/components/ui";
import type { RefEntry } from "@/content/python/reference";

/** Searchable quick reference (name, summary and example text are all searched). */
export function ReferenceSearch({ entries, sections, workspace = true }: { entries: (RefEntry & { lessonTitle?: string | null })[]; sections: readonly string[]; workspace?: boolean }) {
  const [q, setQ] = useState("");
  const [section, setSection] = useState<string | null>(null);
  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return entries.filter((e) => (!section || e.section === section) && words.every((w) => `${e.name} ${e.summary} ${e.example} ${e.section}`.toLowerCase().includes(w)));
  }, [entries, q, section]);
  return (
    <div className="space-y-4">
      <div className="relative max-w-lg">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: split, dict, sorted key, lru_cache…" aria-label="Search the quick reference" className={clsx(inputClass, "pl-9")} autoFocus />
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sections">
        {[null, ...sections].map((s) => (
          <button key={s ?? "all"} type="button" onClick={() => setSection(s)} aria-pressed={section === s}
            className={clsx("rounded-full border px-3 py-1 text-xs font-semibold", section === s ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-ink-2 hover:bg-sunken")}>{s ?? "All"}</button>
        ))}
      </div>
      <p className="text-xs text-ink-3" aria-live="polite">{shown.length} of {entries.length} entries</p>
      <ul className="grid gap-3 lg:grid-cols-2">
        {shown.map((e) => (
          <li key={`${e.section}-${e.name}`} className="space-y-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-mono font-bold">{e.name}</h3><span className="text-xs text-ink-3">{e.section}</span></div>
            <p className="text-sm text-ink-2">{e.summary}</p>
            <CodeBlock code={e.example} language="python" numbered={false} />
            {e.output && <pre className="whitespace-pre-wrap rounded-lg bg-sunken px-3 py-1.5 font-mono text-xs text-ink-2"><span className="text-ink-3"># output{"\n"}</span>{e.output.trimEnd()}</pre>}
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              {workspace && <Link className="text-accent hover:underline" href={`/app/python/workspace?ref=${encodeURIComponent(e.name)}`}>Try it in the workspace</Link>}
              {e.lesson && e.lessonTitle && <Link className="text-accent hover:underline" href={`/app/python/learn/${e.lesson}`}>Lesson: {e.lessonTitle}</Link>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
