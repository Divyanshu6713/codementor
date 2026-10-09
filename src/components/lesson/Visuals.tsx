"use client";

import { useState } from "react";
import clsx from "clsx";

/* ── Loop anatomy: click each part of the header ───────────────────────── */

const PARTS = [
  { key: "init", code: "int i = 1", when: "Runs once, before anything else.", what: "Creates the counter and gives it its starting value.", cls: "bg-concept-soft text-concept ring-concept" },
  { key: "cond", code: "i <= 5", when: "Checked before every iteration.", what: "True → run the body. False → leave the loop.", cls: "bg-accent-soft text-accent-ink ring-accent" },
  { key: "update", code: "i++", when: "Runs after every iteration.", what: "Moves the counter (here: adds 1) so the condition will eventually become false.", cls: "bg-hint-soft text-hint ring-hint" },
] as const;

export function LoopAnatomy() {
  const [sel, setSel] = useState<(typeof PARTS)[number]["key"]>("cond");
  const part = PARTS.find((p) => p.key === sel)!;
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="overflow-x-auto rounded-xl bg-code-bg px-4 py-5 font-mono text-[15px] text-code-ink sm:text-lg" role="group" aria-label="for loop header parts">
        <span>for (</span>
        {PARTS.map((p, idx) => (
          <span key={p.key}>
            <button type="button" onClick={() => setSel(p.key)} aria-pressed={sel === p.key}
              className={clsx("rounded-md px-1.5 py-0.5 transition", sel === p.key ? `${p.cls} ring-2` : "hover:bg-code-line")}>
              {p.code}
            </button>
            {idx < 2 && <span>; </span>}
          </span>
        ))}
        <span>) {"{"}</span>
        <div className="pl-6 text-code-dim">{"// body: runs once per iteration"}</div>
        <span>{"}"}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr]" aria-live="polite">
        <span className={clsx("h-fit rounded-full px-3 py-1 text-sm font-semibold", part.cls)}>
          {sel === "init" ? "Initialization" : sel === "cond" ? "Condition" : "Update"}
        </span>
        <div className="text-sm">
          <p className="font-semibold text-ink">{part.when}</p>
          <p className="text-ink-2">{part.what}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Boundary explorer: < vs <= ─────────────────────────────────────────── */

export function BoundaryExplorer() {
  const [n, setN] = useState(5);
  const [op, setOp] = useState<"<" | "<=">("<=");
  const [start, setStart] = useState<0 | 1>(1);
  const values = Array.from({ length: 12 }, (_, i) => i);
  const included = (v: number) => v >= start && (op === "<" ? v < n : v <= n);
  const printed = values.filter(included);
  const last = printed.at(-1);
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          n = <input type="range" min={1} max={10} value={n} onChange={(e) => setN(Number(e.target.value))} className="accent-[var(--accent)]" aria-label="n" />
          <span className="w-6 font-mono">{n}</span>
        </label>
        <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Comparison operator">
          {(["<", "<="] as const).map((o) => (
            <button key={o} type="button" onClick={() => setOp(o)} aria-pressed={op === o} className={clsx("rounded-md px-3 py-1 font-mono text-sm font-bold", op === o ? "bg-accent text-on-accent" : "text-ink-2")}>{o}</button>
          ))}
        </div>
        <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Start value">
          {([0, 1] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStart(s)} aria-pressed={start === s} className={clsx("rounded-md px-3 py-1 font-mono text-sm", start === s ? "bg-concept text-on-accent" : "text-ink-2")}>i = {s}</button>
          ))}
        </div>
      </div>
      <p className="mt-4 rounded-lg bg-code-bg px-3 py-2 font-mono text-sm text-code-ink">for (int i = {start}; i {op} {n}; i++) cout {"<<"} i {"<<"} &quot; &quot;;</p>
      <ol className="mt-4 flex flex-wrap gap-1.5" aria-label="Values of i">
        {values.map((v) => (
          <li key={v} className={clsx("flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-sm font-bold transition-colors",
            included(v) ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-ink-3", v === n && "ring-2 ring-hint")}>
            {v}
          </li>
        ))}
      </ol>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3" aria-live="polite">
        <p><span className="text-ink-3">Prints:</span> <span className="font-mono font-semibold">{printed.join(" ") || "(nothing)"}</span></p>
        <p><span className="text-ink-3">Iterations:</span> <span className="font-semibold">{printed.length}</span></p>
        <p><span className="text-ink-3">When i = {n}:</span> <span className="font-mono font-semibold">{n} {op} {n}</span> is <span className={op === "<=" ? "font-semibold text-success" : "font-semibold text-danger"}>{String(op === "<=")}</span></p>
      </div>
      {last !== undefined && <p className="mt-2 text-xs text-ink-3">The ring marks n. The last value printed is {last}.</p>}
    </div>
  );
}

/* ── Flow of a loop ─────────────────────────────────────────────────────── */

export function LoopFlow() {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <svg viewBox="0 0 520 300" className="mx-auto w-full max-w-xl" role="img" aria-label="Flowchart: initialize once, then check the condition; if true run the body, then update and check again; if false, exit the loop.">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" /></marker>
        </defs>
        <g fontFamily="var(--font-code)" fontSize="14" textAnchor="middle">
          <rect x="190" y="10" width="140" height="40" rx="10" fill="var(--concept-soft)" stroke="var(--concept)" />
          <text x="260" y="35" fill="var(--concept)">int i = 1</text>
          <line x1="260" y1="50" x2="260" y2="88" stroke="var(--ink-3)" strokeWidth="2" markerEnd="url(#arr)" />
          <polygon points="260,90 340,135 260,180 180,135" fill="var(--accent-soft)" stroke="var(--accent)" />
          <text x="260" y="140" fill="var(--accent-ink)">i &lt;= 5 ?</text>
          <line x1="260" y1="180" x2="260" y2="218" stroke="var(--ink-3)" strokeWidth="2" markerEnd="url(#arr)" />
          <text x="276" y="204" fill="var(--success)" fontSize="12" textAnchor="start">true</text>
          <rect x="190" y="220" width="140" height="40" rx="10" fill="var(--success-soft)" stroke="var(--success)" />
          <text x="260" y="245" fill="var(--success)">body</text>
          <line x1="190" y1="240" x2="90" y2="240" stroke="var(--ink-3)" strokeWidth="2" />
          <rect x="20" y="115" width="110" height="40" rx="10" fill="var(--hint-soft)" stroke="var(--hint)" />
          <text x="75" y="140" fill="var(--hint)">i++</text>
          <line x1="75" y1="240" x2="75" y2="158" stroke="var(--ink-3)" strokeWidth="2" markerEnd="url(#arr)" />
          <line x1="130" y1="135" x2="178" y2="135" stroke="var(--ink-3)" strokeWidth="2" markerEnd="url(#arr)" />
          <line x1="340" y1="135" x2="418" y2="135" stroke="var(--ink-3)" strokeWidth="2" markerEnd="url(#arr)" />
          <text x="378" y="126" fill="var(--danger)" fontSize="12">false</text>
          <rect x="420" y="115" width="90" height="40" rx="10" fill="var(--sunken)" stroke="var(--line-strong)" />
          <text x="465" y="140" fill="var(--ink-2)">exit</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Nested loops grid ──────────────────────────────────────────────────── */

export function NestedGrid() {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(3);
  const [shown, setShown] = useState(rows * cols);
  const total = rows * cols;
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap gap-6 text-sm font-semibold">
        <label className="flex items-center gap-2">Outer (rows) <input type="range" min={1} max={4} value={rows} onChange={(e) => { setRows(Number(e.target.value)); setShown(Number(e.target.value) * cols); }} aria-label="Rows" /> <span className="font-mono">{rows}</span></label>
        <label className="flex items-center gap-2">Inner (columns) <input type="range" min={1} max={6} value={cols} onChange={(e) => { setCols(Number(e.target.value)); setShown(rows * Number(e.target.value)); }} aria-label="Columns" /> <span className="font-mono">{cols}</span></label>
      </div>
      <div className="mt-4 inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 2.5rem)` }} aria-label={`${total} cells: ${rows} rows by ${cols} columns`}>
        {Array.from({ length: total }, (_, k) => (
          <div key={k} className={clsx("flex h-10 items-center justify-center rounded-lg border font-mono text-xs", k < shown ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-ink-3")}>
            {k < shown ? `${Math.floor(k / cols) + 1},${(k % cols) + 1}` : ""}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="rounded-lg border border-line px-3 py-1 text-sm font-semibold hover:bg-sunken" onClick={() => setShown((s) => (s >= total ? 1 : s + 1))}>
          {shown >= total ? "Start again" : "Next inner iteration"}
        </button>
        <p className="text-sm text-ink-2" aria-live="polite">
          Inner body ran <span className="font-bold text-ink">{shown}</span> of {rows} × {cols} = {total} times.
        </p>
      </div>
    </div>
  );
}

/* ── Comparison number line ─────────────────────────────────────────────── */

const OPS = ["<", "<=", ">", ">=", "==", "!="] as const;
const evalOp = (x: number, op: (typeof OPS)[number], k: number) =>
  op === "<" ? x < k : op === "<=" ? x <= k : op === ">" ? x > k : op === ">=" ? x >= k : op === "==" ? x === k : x !== k;

export function ComparisonNumberLine() {
  const [op, setOp] = useState<(typeof OPS)[number]>("<");
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap gap-1" role="group" aria-label="Operator">
        {OPS.map((o) => (
          <button key={o} type="button" onClick={() => setOp(o)} aria-pressed={op === o} className={clsx("rounded-md px-3 py-1 font-mono text-sm font-bold", op === o ? "bg-accent text-on-accent" : "bg-sunken text-ink-2")}>{o}</button>
        ))}
      </div>
      <p className="mt-3 font-mono text-sm">x {op} 5</p>
      <ol className="mt-3 flex flex-wrap gap-1.5" aria-label={`Values of x where x ${op} 5 is true`}>
        {Array.from({ length: 11 }, (_, x) => {
          const t = evalOp(x, op, 5);
          return (
            <li key={x} className={clsx("flex w-11 flex-col items-center rounded-lg border py-1.5 font-mono", t ? "border-success bg-success-soft text-success" : "border-line text-ink-3", x === 5 && "ring-2 ring-hint")}>
              <span className="text-sm font-bold">{x}</span>
              <span className="text-[10px]">{t ? "true" : "false"}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-ink-2" aria-live="polite">At the edge, <span className="font-mono font-semibold">5 {op} 5</span> is <span className="font-semibold">{String(evalOp(5, op, 5))}</span>.</p>
    </div>
  );
}

export function Visual({ id }: { id: string }) {
  switch (id) {
    case "loop-anatomy": return <LoopAnatomy />;
    case "boundary-explorer": return <BoundaryExplorer />;
    case "loop-flow": return <LoopFlow />;
    case "nested-grid": return <NestedGrid />;
    case "comparison-number-line": return <ComparisonNumberLine />;
    default: return null;
  }
}
