"use client";

import { useState } from "react";
import clsx from "clsx";

/* ── Memory boxes: what a pointer stores ─────────────────────────────────── */

type Mem = { x: number; y: number; p: "x" | "y" | null; log: string[] };
const ADDR = { x: "0x7ffc10", y: "0x7ffc14", p: "0x7ffc18" } as const;

export function MemoryBoxes() {
  const [m, setM] = useState<Mem>({ x: 7, y: 20, p: null, log: ["int x = 7, y = 20;", "int* p = nullptr;"] });
  const act = (code: string, f: (s: Mem) => Partial<Mem> | string) =>
    setM((s) => {
      const r = f(s);
      if (typeof r === "string") return { ...s, log: [...s.log, `${code}   // ✗ ${r}`].slice(-6) };
      return { ...s, ...r, log: [...s.log, code].slice(-6) };
    });
  const box = (name: "x" | "y" | "p", value: string, pointed: boolean) => (
    <div className={clsx("rounded-xl border-2 p-3 text-center transition-colors", pointed ? "border-concept bg-concept-soft" : "border-line bg-surface")}>
      <p className="font-mono text-xs text-ink-3">{ADDR[name]}</p>
      <p className="mt-1 font-mono text-xl font-bold">{value}</p>
      <p className="mt-1 font-mono text-sm font-semibold">{name}</p>
    </div>
  );
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="grid grid-cols-3 gap-3" aria-live="polite">
        {box("x", String(m.x), m.p === "x")}
        {box("y", String(m.y), m.p === "y")}
        {box("p", m.p ? ADDR[m.p] : "nullptr", false)}
      </div>
      <p className="mt-3 text-sm text-ink-2">
        {m.p ? <>p holds the <strong>address</strong> of {m.p}, so <span className="font-mono">*p</span> means &ldquo;the box at {ADDR[m.p]}&rdquo; — that is, {m.p} itself ({m[m.p]}).</> : <>p holds no address yet. Dereferencing it now (<span className="font-mono">*p</span>) would be undefined behaviour.</>}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {([
          ["p = &x;", () => ({ p: "x" as const })],
          ["p = &y;", () => ({ p: "y" as const })],
          ["*p = 42;", (s: Mem) => (s.p ? { [s.p]: 42 } : "p is nullptr: crash")],
          ["*p += 1;", (s: Mem) => (s.p ? { [s.p]: s[s.p] + 1 } : "p is nullptr: crash")],
          ["x = 5;", () => ({ x: 5 })],
          ["p = nullptr;", () => ({ p: null })],
        ] as [string, (s: Mem) => Partial<Mem> | string][]).map(([code, f]) => (
          <button key={code} type="button" onClick={() => act(code, f)} className="rounded-lg border border-line bg-sunken px-3 py-1.5 font-mono text-sm hover:border-accent">{code}</button>
        ))}
        <button type="button" onClick={() => setM({ x: 7, y: 20, p: null, log: ["int x = 7, y = 20;", "int* p = nullptr;"] })} className="rounded-lg px-3 py-1.5 text-sm text-ink-3 hover:text-ink">Reset</button>
      </div>
      <pre className="mt-4 rounded-lg bg-code-bg p-3 font-mono text-[13px] leading-6 text-code-ink">{m.log.join("\n")}</pre>
    </div>
  );
}

/* ── Growth chart: how fast step counts grow ─────────────────────────────── */

const CLASSES = [
  { key: "log n", f: (n: number) => Math.log2(Math.max(n, 2)) },
  { key: "n", f: (n: number) => n },
  { key: "n log n", f: (n: number) => n * Math.log2(Math.max(n, 2)) },
  { key: "n²", f: (n: number) => n * n },
  { key: "2ⁿ", f: (n: number) => Math.pow(2, Math.min(n, 1024)) },
] as const;
const SIZES = [10, 20, 100, 1_000, 10_000, 100_000, 1_000_000];
const BUDGET = 1e8;

function fmt(x: number) {
  if (!Number.isFinite(x) || x > 1e300) return "astronomical";
  if (x < 1000) return x.toFixed(x < 10 ? 1 : 0);
  const e = Math.floor(Math.log10(x));
  return `${(x / 10 ** e).toFixed(1)}×10^${e}`;
}

export function GrowthChart() {
  const [k, setK] = useState(3);
  const n = SIZES[k];
  const maxLog = Math.log10(BUDGET * 100);
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <label className="flex flex-wrap items-center gap-3 text-sm font-semibold">
        Input size n = <span className="w-24 font-mono">{n.toLocaleString()}</span>
        <input type="range" min={0} max={SIZES.length - 1} value={k} onChange={(e) => setK(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" aria-label="Input size" />
      </label>
      <ul className="mt-4 space-y-2" aria-live="polite">
        {CLASSES.map((c) => {
          const steps = c.f(n);
          const fits = steps <= BUDGET;
          const width = Math.max(2, Math.min(100, (Math.log10(Math.max(steps, 1)) / maxLog) * 100));
          return (
            <li key={c.key} className="grid grid-cols-[4.5rem_1fr_7.5rem] items-center gap-3 text-sm">
              <span className="font-mono font-semibold">O({c.key})</span>
              <span className="h-5 overflow-hidden rounded-full bg-sunken">
                <span className={clsx("block h-full rounded-full transition-[width] duration-300", fits ? "bg-success" : "bg-danger")} style={{ width: `${width}%` }} />
              </span>
              <span className={clsx("text-right font-mono text-xs", fits ? "text-success" : "text-danger")}>{fmt(steps)} {fits ? "✓" : "✗"}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-3">Bars use a log scale. ✓ = fits in about one second (~10⁸ simple steps).</p>
    </div>
  );
}

/* ── Stack vs queue ───────────────────────────────────────────────────────── */

export function StackQueue() {
  const [items, setItems] = useState<number[]>([1, 2, 3]);
  const [next, setNext] = useState(4);
  const [mode, setMode] = useState<"stack" | "queue">("stack");
  const [last, setLast] = useState<string>("");
  const push = () => { setItems((s) => [...s, next]); setLast(`${mode === "stack" ? "push" : "push"}(${next})`); setNext((x) => x + 1); };
  const pop = () => {
    if (!items.length) return setLast("empty — nothing to remove");
    if (mode === "stack") { setLast(`pop() removed ${items.at(-1)} (the newest)`); setItems((s) => s.slice(0, -1)); }
    else { setLast(`pop() removed ${items[0]} (the oldest)`); setItems((s) => s.slice(1)); }
  };
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Container">
          {(["stack", "queue"] as const).map((x) => (
            <button key={x} type="button" aria-pressed={mode === x} onClick={() => { setMode(x); setLast(""); }} className={clsx("rounded-md px-3 py-1 font-mono text-sm font-bold", mode === x ? "bg-accent text-on-accent" : "text-ink-2")}>{x}</button>
          ))}
        </div>
        <button type="button" onClick={push} className="rounded-lg border border-line bg-sunken px-3 py-1.5 font-mono text-sm hover:border-accent">push({next})</button>
        <button type="button" onClick={pop} className="rounded-lg border border-line bg-sunken px-3 py-1.5 font-mono text-sm hover:border-accent">pop()</button>
      </div>
      <div className={clsx("mt-4 flex gap-1.5", mode === "stack" ? "flex-col-reverse items-start" : "flex-row flex-wrap items-center")} aria-label={`${mode} contents`}>
        {items.map((v, i) => {
          const leaving = mode === "stack" ? i === items.length - 1 : i === 0;
          return (
            <span key={`${v}-${i}`} className={clsx("grid h-10 min-w-14 place-items-center rounded-lg border px-3 font-mono font-bold", leaving ? "border-accent bg-accent-soft text-accent-ink" : "border-line bg-surface")}>
              {v}{leaving && <span className="sr-only"> (removed next)</span>}
            </span>
          );
        })}
        {!items.length && <span className="text-sm text-ink-3">(empty)</span>}
      </div>
      <p className="mt-3 text-sm text-ink-2" aria-live="polite">
        {last || (mode === "stack" ? "A stack is last-in, first-out: the highlighted top leaves first." : "A queue is first-in, first-out: the highlighted front leaves first.")}
      </p>
    </div>
  );
}
