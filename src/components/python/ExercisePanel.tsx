"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2, CircleAlert, CircleX, Eye, FileText, Footprints, KeyRound, Lightbulb, Loader2, PartyPopper, Play, RotateCcw, ShieldCheck, Sparkles, Timer, Trophy,
} from "lucide-react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { Badge, Button, Callout } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { PublicExercise } from "@/content/python";
import type { PythonTrace } from "@/server/execution/protocol";
import { Console, FeedbackList, RunOutput, type Feedback, type PyRunResult } from "./Output";
import { TraceViewer } from "./TraceViewer";

interface CheckResult {
  passed: boolean;
  compileStatus: "success" | "error" | "rejected";
  compileOutput: string;
  testsPassed: number;
  testsTotal: number;
  tests: { label: string; hidden: boolean; category: string; passed: boolean; status: string; input?: string; expected?: string; actual?: string; detail: string | null }[];
  revealedHidden: { label: string; input: string; expected: string; actual: string } | null;
  feedback: Feedback[];
  reward: { firstPass: boolean; xp: number; lessonCompleted: { id: string; title: string } | null; achievements: { code: string; title: string }[]; timeMs: number | null } | null;
}

interface TraceResult { ok: boolean; compile: PyRunResult["compile"]; trace: PythonTrace | null; feedback: Feedback[]; status: string | null }

type Result = { kind: "run"; data: PyRunResult } | { kind: "check"; data: CheckResult } | { kind: "trace"; data: TraceResult; code: string } | { kind: "error"; message: string };

export interface ExerciseInitial { hintLevel: number; solutionViewed: boolean; passed: boolean; saved: string | null; bestMs: number | null }
export interface ExecView { available: boolean; devOnly: boolean; message: string | null }

const show = (s: string) => (s === "" ? "(nothing)" : s);

/**
 * A Python coding exercise: editor, input, Run, Step through, Check (judged by tests in the
 * sandbox), progressive hints, the worked solution on request, and server-side save & resume.
 */
export function ExercisePanel({ exercise, initial, exec, mode = "learn", timed = false }: {
  exercise: PublicExercise; initial: ExerciseInitial; exec: ExecView; mode?: "learn" | "challenge" | "project" | "interview"; timed?: boolean;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initial.saved ?? exercise.starter);
  const [input, setInput] = useState(exercise.samples[0]?.input ?? "");
  const [busy, setBusy] = useState<"run" | "check" | "trace" | "reveal" | "hint" | "solution" | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(initial.hintLevel);
  const [solution, setSolution] = useState<{ solution: string; notes: string } | null>(null);
  const [passed, setPassed] = useState(initial.passed);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(initial.saved ? "saved" : "idle");
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const files = exercise.files;

  useEffect(() => {
    if (!timerStart) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [timerStart]);

  const persist = useCallback((next: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        await api("/api/python/save", { body: { key: `ex:${exercise.key}`, code: next } });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 1500);
  }, [exercise.key]);

  function edit(next: string) {
    setCode(next);
    persist(next);
  }

  async function call<T>(kind: NonNullable<typeof busy>, url: string, body: unknown): Promise<T | null> {
    setBusy(kind);
    try {
      return await api<T>(url, { body });
    } catch (e) {
      setResult({ kind: "error", message: e instanceof ApiError ? e.message : "Something went wrong." });
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function run() {
    const data = await call<PyRunResult>("run", "/api/python/run", { source: code, input, files });
    if (data) setResult({ kind: "run", data });
  }

  async function trace() {
    const data = await call<TraceResult>("trace", "/api/python/trace", { source: code, input, files });
    if (data) setResult({ kind: "trace", data, code });
  }

  async function check(showFailingHidden = false) {
    const data = await call<CheckResult>(showFailingHidden ? "reveal" : "check", "/api/python/check", { key: exercise.key, source: code, showFailingHidden, mode });
    if (!data) return;
    setResult({ kind: "check", data });
    if (data.passed && !showFailingHidden) {
      setPassed(true);
      if (data.reward?.firstPass) router.refresh();
    }
  }

  async function nextHint() {
    const level = Math.min(4, hints.length + 1);
    const data = await call<{ level: number; hint: string }>("hint", "/api/python/hint", { key: exercise.key, level });
    if (!data) return;
    setHints((h) => [...h, data.hint]);
    setHintLevel((l) => Math.max(l, data.level));
  }

  async function showSolution() {
    if (!window.confirm("See the worked solution? Try the hints first — passing after viewing the solution earns the minimum XP.")) return;
    const data = await call<{ solution: string; notes: string }>("solution", "/api/python/solution", { key: exercise.key });
    if (data) setSolution(data);
  }

  async function startTimer() {
    const data = await call<{ startedAt: string }>("run", "/api/python/timer", { key: exercise.key });
    if (data) setTimerStart(Date.parse(data.startedAt));
  }

  function reset() {
    if (code !== exercise.starter && !window.confirm("Replace your code with the starter code? Your current code will be lost.")) return;
    edit(exercise.starter);
    setResult(null);
  }

  const canRun = exec.available && busy === null && code.trim().length > 0;

  return (
    <div className="space-y-4">
      <Markdown text={exercise.prompt} codeLanguage="python" />

      {exercise.samples.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">Example tests</caption>
            <thead className="bg-sunken text-left"><tr><th scope="col" className="px-3 py-2">Example</th><th scope="col" className="px-3 py-2">Input</th><th scope="col" className="px-3 py-2">Expected output</th></tr></thead>
            <tbody>
              {exercise.samples.map((s) => (
                <tr key={s.label} className="border-t border-line align-top">
                  <td className="px-3 py-2 text-ink-2">{s.label}</td>
                  <td className="px-3 py-2"><pre className="whitespace-pre-wrap font-mono text-[13px]">{show(s.input.trimEnd())}</pre></td>
                  <td className="px-3 py-2"><pre className="whitespace-pre-wrap font-mono text-[13px]">{show(s.output)}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
          {exercise.hiddenCount > 0 && <p className="border-t border-line px-3 py-2 text-xs text-ink-3">Check also runs {exercise.hiddenCount} hidden test{exercise.hiddenCount > 1 ? "s" : ""} with other inputs — make it work for any valid input.</p>}
        </div>
      )}

      {files.length > 0 && (
        <details className="rounded-xl border border-line bg-surface px-4 py-2 text-sm">
          <summary className="cursor-pointer font-semibold"><FileText size={14} className="mr-1 inline" aria-hidden />Files next to your program: {files.map((f) => f.name).join(", ")}</summary>
          <div className="mt-2 space-y-2">{files.map((f) => <Console key={f.name} title={f.name} text={f.content} />)}</div>
        </details>
      )}

      {!exec.available && (
        <Callout tone="hint" icon={<CircleAlert size={18} />} title="Running code isn't available right now">
          {exec.message ?? "The code runner is offline."} Nothing will be simulated. You can still write your code (it&apos;s saved to your account) and use hints.
        </Callout>
      )}
      {passed && !(result?.kind === "check" && result.data.reward?.firstPass) && <Callout tone="success" icon={<CheckCircle2 size={18} />} title="You've already passed this exercise">Practise again any time — the XP for it is already yours.</Callout>}

      {timed && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2 text-sm">
          <Timer size={16} className="text-pink" aria-hidden />
          {timerStart ? <span className="font-mono font-semibold tabular">{Math.floor((now - timerStart) / 60000)}:{String(Math.floor(((now - timerStart) / 1000) % 60)).padStart(2, "0")}</span> : <span className="text-ink-2">Timed mode: start the clock when you&apos;re ready. Your fastest judged pass is kept.</span>}
          {!timerStart && <Button size="sm" variant="secondary" onClick={startTimer} disabled={busy !== null}>Start timer</Button>}
          {initial.bestMs !== null && <Badge tone="pink">Best: {Math.round(initial.bestMs / 1000)} s</Badge>}
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Your code</p>
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <span aria-live="polite">{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved to your account" : saveState === "error" ? "Couldn't save — check your connection" : ""}</span>
            <Button size="sm" variant="ghost" onClick={reset} aria-label="Reset to starter code"><RotateCcw size={14} aria-hidden /> Reset</Button>
          </div>
        </div>
        <CodeEditor value={code} onChange={edit} height={320} label={`Code editor for ${exercise.title}`} language="python" />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label htmlFor={`stdin-${exercise.key}`} className="mb-1 block text-sm font-semibold">Input <span className="font-normal text-ink-3">(what <code>input()</code> reads — one value per line)</span></label>
          <textarea id={`stdin-${exercise.key}`} value={input} onChange={(e) => setInput(e.target.value)} rows={2} spellCheck={false}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-[13px] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={run} disabled={!canRun}>{busy === "run" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Play size={16} aria-hidden />} Run</Button>
          <Button variant="secondary" onClick={trace} disabled={!canRun} title="Run it step by step and watch the variables">{busy === "trace" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Footprints size={16} aria-hidden />} Step through</Button>
          <Button onClick={() => check(false)} disabled={!canRun}>{busy === "check" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />} Check answer</Button>
        </div>
      </div>
      {exec.devOnly && exec.available && <p className="text-xs text-ink-3">Running on the local development sandbox.</p>}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <Button size="sm" variant="hint" onClick={nextHint} disabled={busy !== null || hints.length >= 4}>
          {busy === "hint" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Lightbulb size={14} aria-hidden />}
          {hints.length === 0 ? "Get a hint" : hints.length < 4 ? `Next hint (${hints.length + 1} of 4)` : "All hints shown"}
        </Button>
        {(hints.length >= 2 || hintLevel >= 2 || (result?.kind === "check" && !result.data.passed)) && !solution && (
          <Button size="sm" variant="ghost" onClick={showSolution} disabled={busy !== null}><KeyRound size={14} aria-hidden /> Show the worked solution</Button>
        )}
        {hintLevel > hints.length && hints.length === 0 && <span className="text-xs text-ink-3">You&apos;ve opened {hintLevel} hint{hintLevel > 1 ? "s" : ""} before.</span>}
      </div>
      {hints.length > 0 && (
        <ol className="space-y-2">
          {hints.map((h, i) => (
            <li key={i} className="rounded-xl bg-hint-soft px-4 py-2.5 text-sm"><span className="font-semibold text-hint">Hint {i + 1}. </span><Markdown text={h} className="inline text-ink-2" codeLanguage="python" /></li>
          ))}
        </ol>
      )}
      {solution && (
        <div className="space-y-2 rounded-xl border border-line bg-sunken/60 p-4">
          <p className="font-semibold">Worked solution</p>
          <CodeBlock code={solution.solution} language="python" />
          <Markdown text={solution.notes} codeLanguage="python" />
          <p className="text-xs text-ink-3">Close it, then write the solution yourself from memory — that&apos;s what makes it stick.</p>
        </div>
      )}

      <div aria-live="polite" aria-busy={busy !== null}>
        {result?.kind === "error" && <Callout tone="danger" title="That didn't work">{result.message}</Callout>}
        {result?.kind === "run" && <RunOutput r={result.data} />}
        {result?.kind === "trace" && <TraceOutput r={result.data} code={result.code} />}
        {result?.kind === "check" && <CheckOutput r={result.data} busy={busy === "reveal"} onReveal={() => check(true)} />}
      </div>
    </div>
  );
}

export function TraceOutput({ r, code }: { r: TraceResult; code: string }) {
  if (r.compile.status !== "success") {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-semibold text-danger"><CircleX size={18} aria-hidden /> Syntax error — nothing to step through yet</p>
        <FeedbackList items={r.feedback} />
        <Console title="Python's message" text={r.compile.output} tone="error" />
      </div>
    );
  }
  if (!r.trace) {
    return <div className="space-y-3"><p className="font-semibold text-danger">The program couldn&apos;t be traced ({r.status}).</p><FeedbackList items={r.feedback} /></div>;
  }
  return (
    <div className="space-y-3">
      <TraceViewer code={code} trace={r.trace} />
      {r.trace.error && <FeedbackList items={r.feedback} />}
    </div>
  );
}

function CheckOutput({ r, busy, onReveal }: { r: CheckResult; busy: boolean; onReveal: () => void }) {
  if (r.compileStatus !== "success") {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-semibold text-danger"><CircleX size={18} aria-hidden /> Python couldn&apos;t read the program, so no tests ran</p>
        <FeedbackList items={r.feedback} />
        <Console title="Python's message" text={r.compileOutput} tone="error" />
      </div>
    );
  }
  const hiddenFailed = r.tests.some((t) => t.hidden && !t.passed);
  return (
    <div className="space-y-3">
      {r.passed ? (
        <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-3">
          <p className="flex items-center gap-2 font-semibold text-success"><CheckCircle2 size={18} aria-hidden /> All {r.testsTotal} tests passed</p>
        </div>
      ) : (
        <p className="flex items-center gap-2 font-semibold text-danger"><CircleX size={18} aria-hidden /> {r.testsPassed} of {r.testsTotal} tests passed</p>
      )}
      {!r.passed && <FeedbackList items={r.feedback} />}
      <ul className="space-y-2">
        {r.tests.map((t, i) => (
          <li key={i} className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              {t.passed ? <CheckCircle2 size={16} className="text-success" aria-label="passed" /> : <CircleX size={16} className="text-danger" aria-label="failed" />}
              <span className="font-medium">{t.label}</span>
              {t.hidden && <Badge>{t.category === "edge" ? "edge case" : t.category === "boundary" ? "boundary" : "normal"}</Badge>}
              {t.detail && <span className="text-ink-3">· {t.detail}</span>}
            </div>
            {!t.hidden && !t.passed && (
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <Mini label="Input" text={t.input ?? ""} />
                <Mini label="Expected" text={t.expected ?? ""} />
                <Mini label="Your output" text={t.actual ?? ""} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {!r.passed && hiddenFailed && !r.revealedHidden && (
        <Button variant="ghost" size="sm" onClick={onReveal} disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Eye size={14} aria-hidden />} Show me one failing hidden test</Button>
      )}
      {r.revealedHidden && (
        <div className="rounded-xl border border-line bg-sunken/60 p-3 text-sm">
          <p className="font-semibold">Hidden test: {r.revealedHidden.label}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <Mini label="Input" text={r.revealedHidden.input} />
            <Mini label="Expected" text={r.revealedHidden.expected} />
            <Mini label="Your output" text={r.revealedHidden.actual} />
          </div>
        </div>
      )}
      {r.passed && r.reward?.firstPass && <Celebration reward={r.reward} />}
    </div>
  );
}

function Mini({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-ink-3">{label}</p>
      <pre className="mt-0.5 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-sunken px-2 py-1 font-mono text-[12.5px]">{show(text.trimEnd())}</pre>
    </div>
  );
}

function Celebration({ reward }: { reward: NonNullable<CheckResult["reward"]> }) {
  return (
    <div className="animate-rise mt-3 overflow-hidden rounded-[var(--radius-card)] bg-hero p-5 text-white shadow-pop" role="status">
      <p className="flex items-center gap-2 text-lg font-extrabold"><Sparkles size={20} aria-hidden /> +{reward.xp} XP</p>
      {reward.lessonCompleted && <p className="mt-2 flex items-center gap-2 font-semibold"><PartyPopper size={18} aria-hidden /> Lesson complete: {reward.lessonCompleted.title}</p>}
      {reward.timeMs !== null && <p className="mt-2 font-semibold">Solved in {Math.round(reward.timeMs / 1000)} s</p>}
      {reward.achievements.map((a) => <p key={a.code} className="mt-2 flex items-center gap-2 font-semibold"><Trophy size={17} aria-hidden /> Achievement unlocked: {a.title}</p>)}
    </div>
  );
}
