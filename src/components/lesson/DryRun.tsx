"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { Button } from "@/components/ui";

export interface TraceStepView {
  line: number;
  phase: string;
  vars: Record<string, number>;
  output: string;
  note: string;
  condition?: { text: string; value: boolean };
  stack?: string[];
}

const PHASE: Record<string, { label: string; cls: string }> = {
  declare: { label: "Set up", cls: "bg-sunken text-ink-2" },
  init: { label: "Initialize", cls: "bg-concept-soft text-concept" },
  check: { label: "Check condition", cls: "bg-accent-soft text-accent-ink" },
  body: { label: "Run body", cls: "bg-success-soft text-success" },
  update: { label: "Update", cls: "bg-hint-soft text-hint" },
  after: { label: "After the loop", cls: "bg-sunken text-ink-2" },
  call: { label: "Call", cls: "bg-concept-soft text-concept" },
  return: { label: "Return", cls: "bg-success-soft text-success" },
};

/**
 * Step-through visualizer for a controlled lesson example. The steps come from a fixed trace that
 * is verified against the real compiler in tests — it does not execute arbitrary code.
 */
export function DryRun({ code, steps }: { code: string; steps: TraceStepView[] }) {
  const [i, setI] = useState(0);
  const s = steps[i];
  const prevVars = i > 0 ? steps[i - 1].vars : {};
  const go = (n: number) => setI(Math.min(steps.length - 1, Math.max(0, n)));
  return (
    <div
      className="grid gap-4 lg:grid-cols-[1.1fr_1fr]"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      }}
    >
      <CodeBlock code={code} highlightLine={s.line} label="Dry run — the highlighted line is running" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-semibold", PHASE[s.phase]?.cls)}>{PHASE[s.phase]?.label ?? s.phase}</span>
          <span className="font-mono text-xs text-ink-3">Step {i + 1} of {steps.length}</span>
        </div>
        <p className="min-h-12 text-sm text-ink" aria-live="polite">{s.note}</p>
        {s.condition && (
          <p className={clsx("rounded-lg px-3 py-2 font-mono text-sm font-semibold", s.condition.value ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
            {s.condition.text} → {String(s.condition.value)}
          </p>
        )}
        {s.stack && (
          <div className="rounded-xl border border-line">
            <p className="border-b border-line px-3 py-1.5 text-xs font-semibold text-ink-3">Call stack (newest on top)</p>
            <ol className="flex flex-col-reverse gap-1 p-2">
              {s.stack.map((frame, k) => (
                <li key={k} className={clsx("rounded-md px-2.5 py-1 font-mono text-sm", k === s.stack!.length - 1 ? "bg-concept-soft font-semibold text-concept" : "bg-sunken text-ink-2")}>{frame}</li>
              ))}
            </ol>
          </div>
        )}
        <div className="rounded-xl border border-line">
          <p className="border-b border-line px-3 py-1.5 text-xs font-semibold text-ink-3">Variables</p>
          <dl className="grid gap-px bg-line" style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(3, Object.keys(s.vars).length))}, minmax(0, 1fr))` }}>
            {Object.keys(s.vars).length ? Object.entries(s.vars).map(([k, v]) => (
              <div key={k} className={clsx("bg-surface px-3 py-2", prevVars[k] !== v && "bg-hint-soft")}>
                <dt className="font-mono text-xs text-ink-3">{k}</dt>
                <dd className="font-mono text-lg font-bold">{v}</dd>
              </div>
            )) : <div className="col-span-3 bg-surface px-3 py-2 text-sm text-ink-3">{s.stack ? "(no local variables in main)" : "(the loop variable no longer exists)"}</div>}
          </dl>
        </div>
        <div className="rounded-xl bg-code-bg px-3 py-2 font-mono text-sm text-code-ink">
          <p className="text-xs text-code-dim">Output</p>
          <pre className="min-h-6 whitespace-pre-wrap">{s.output || " "}</pre>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous step"><ChevronLeft size={16} aria-hidden /> Previous</Button>
          <Button size="sm" onClick={() => go(i + 1)} disabled={i === steps.length - 1} aria-label="Next step">Next step <ChevronRight size={16} aria-hidden /></Button>
          <Button variant="ghost" size="sm" onClick={() => setI(0)} aria-label="Reset"><RotateCcw size={15} aria-hidden /> Reset</Button>
        </div>
        <p className="text-xs text-ink-3">Tip: use the ← and → keys.</p>
      </div>
    </div>
  );
}
