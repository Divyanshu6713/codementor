"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { Button } from "@/components/ui";
import type { PythonTrace } from "@/server/execution/protocol";

/**
 * Step through a real execution. The trace was recorded by running the program in the sandbox
 * under a line tracer: every step, variable value and printed line here really happened.
 */
export function TraceViewer({ code, trace }: { code: string; trace: PythonTrace }) {
  const [i, setI] = useState(0);
  const steps = trace.steps;
  if (!steps.length) return <p className="text-sm text-ink-3">No steps were recorded (the program didn&apos;t run any lines of main.py).</p>;
  const s = steps[i];
  const prev = steps.slice(0, i).reverse().find((p) => p.func === s.func && p.depth === s.depth);
  const go = (n: number) => setI(Math.min(steps.length - 1, Math.max(0, n)));
  const what = s.event === "call" ? `Calling ${s.func}()` : s.event === "return" ? `${s.func}() returns ${s.value}` : s.event === "exception" ? `Error: ${s.value}` : `Line ${s.line} is about to run`;
  const output = trace.stdout.slice(0, s.out);
  const stack = (() => {
    const names: string[] = [];
    for (const st of steps.slice(0, i + 1)) {
      if (st.event === "call") names.push(st.func);
      else if (st.event === "return") names.pop();
    }
    return ["main program", ...names];
  })();

  return (
    <div
      className="grid gap-4 lg:grid-cols-[1.1fr_1fr]"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      }}
    >
      <CodeBlock code={code} language="python" highlightLine={s.line} label="Step through — the highlighted line runs next" />
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-semibold",
            s.event === "exception" ? "bg-danger-soft text-danger" : s.event === "call" ? "bg-concept-soft text-concept" : s.event === "return" ? "bg-success-soft text-success" : "bg-accent-soft text-accent-ink")}>{what}</span>
          <span className="font-mono text-xs text-ink-3">Step {i + 1} of {steps.length}</span>
        </div>
        <input type="range" min={0} max={steps.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-label="Step" className="w-full accent-[var(--accent)]" />
        <p className="text-xs text-ink-3">Call stack: {stack.join(" → ")}</p>
        <div className="rounded-xl border border-line">
          <p className="border-b border-line px-3 py-1.5 text-xs font-semibold text-ink-3">Variables {s.func !== "<module>" ? `in ${s.func}()` : ""}</p>
          {Object.keys(s.vars).length ? (
            <dl className="divide-y divide-line">
              {Object.entries(s.vars).map(([k, v]) => (
                <div key={k} className={clsx("grid grid-cols-[minmax(5rem,auto)_1fr] gap-3 px-3 py-1.5", prev && prev.vars[k] !== v && "bg-hint-soft")}>
                  <dt className="font-mono text-xs text-ink-3">{k}</dt>
                  <dd className="break-all font-mono text-sm font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          ) : <p className="px-3 py-2 text-sm text-ink-3">(no variables yet)</p>}
        </div>
        <div className="rounded-xl bg-code-bg px-3 py-2 font-mono text-sm text-code-ink">
          <p className="text-xs text-code-dim">Output so far</p>
          <pre className="max-h-40 min-h-6 overflow-auto whitespace-pre-wrap">{output || " "}</pre>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => go(i - 1)} disabled={i === 0}><ChevronLeft size={16} aria-hidden /> Previous</Button>
          <Button size="sm" onClick={() => go(i + 1)} disabled={i === steps.length - 1}>Next step <ChevronRight size={16} aria-hidden /></Button>
          <Button variant="ghost" size="sm" onClick={() => setI(0)}><RotateCcw size={15} aria-hidden /> Start</Button>
          <Button variant="ghost" size="sm" onClick={() => setI(steps.length - 1)}>End</Button>
        </div>
        {trace.truncated && <p className="text-xs text-ink-3">Only the first {steps.length} steps were recorded.</p>}
        {i === steps.length - 1 && trace.error && <pre className="whitespace-pre-wrap rounded-xl bg-danger-soft px-3 py-2 font-mono text-xs text-danger">{trace.error}</pre>}
        <p className="text-xs text-ink-3">Recorded from a real run in the sandbox. Tip: use the ← and → keys.</p>
      </div>
    </div>
  );
}
