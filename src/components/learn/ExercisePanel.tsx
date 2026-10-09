"use client";

import clsx from "clsx";
import { CheckCircle2, CircleAlert, CircleX, Eye, Loader2, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { Markdown } from "@/components/Markdown";
import { Badge, Button, Callout } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useProgress } from "@/lib/guest-progress";
import { useLesson } from "./LessonState";

interface Feedback {
  title: string;
  body: string;
  line?: number | null;
}

interface RunResult {
  compile: { status: "success" | "error" | "rejected"; output: string };
  run: { status: string; stdout: string; stderr: string; detail: string | null; timeMs: number } | null;
  feedback: Feedback[];
}

interface CheckResult {
  passed: boolean;
  verdict: string;
  compileStatus: "success" | "error" | "rejected";
  compileOutput: string;
  testsPassed: number;
  testsTotal: number;
  tests: { label: string; hidden: boolean; category: string; passed: boolean; status: string; input?: string; expected?: string; actual?: string; detail: string | null }[];
  revealedHidden: { label: string; input: string; expected: string; actual: string } | null;
  feedback: Feedback[];
}

type Result = { kind: "run"; data: RunResult } | { kind: "check"; data: CheckResult } | { kind: "error"; message: string };

export interface ExerciseView {
  title: string;
  prompt: string;
  samples: { label: string; input: string; output: string }[];
  hiddenCount: number;
}

const show = (s: string) => (s === "" ? "(nothing)" : s);

export function ExercisePanel({ exercise }: { exercise: ExerciseView }) {
  const { lessonId, code, setCode, starterCode, status, statusError, noteCheck, exerciseVersion } = useLesson();
  const progress = useProgress();
  const saved = progress.lessons[lessonId];
  const [input, setInput] = useState(exercise.samples[0]?.input ?? "");
  const [busy, setBusy] = useState<"run" | "check" | "reveal" | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const canRun = status?.execution.available ?? false;
  const draftOutdated = Boolean(saved?.draft && saved.draftVersion && saved.draftVersion !== exerciseVersion);

  async function run() {
    setBusy("run");
    try {
      setResult({ kind: "run", data: await api<RunResult>("/api/guest/run", { body: { source: code, input } }) });
    } catch (e) {
      setResult({ kind: "error", message: e instanceof ApiError ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  }

  async function check(showFailingHidden = false) {
    setBusy(showFailingHidden ? "reveal" : "check");
    try {
      const data = await api<CheckResult>("/api/guest/check", { body: { lessonId, source: code, showFailingHidden } });
      setResult({ kind: "check", data });
      if (!showFailingHidden) noteCheck(data.passed);
    } catch (e) {
      setResult({ kind: "error", message: e instanceof ApiError ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  }

  function reset() {
    if (code !== starterCode && !window.confirm("Replace your code with the starter code? Your current code will be lost.")) return;
    setCode(starterCode);
    setResult(null);
  }

  return (
    <div className="space-y-4">
      <Markdown text={exercise.prompt} />

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
          {exercise.hiddenCount > 0 && <p className="border-t border-line px-3 py-2 text-xs text-ink-3">Check also runs {exercise.hiddenCount} hidden test{exercise.hiddenCount > 1 ? "s" : ""} with other inputs, so make your program work for any valid input — not just these examples.</p>}
        </div>
      )}

      {statusError && <Callout tone="danger" title="Couldn't reach CodeMentor">{statusError} You can keep reading and writing code; your code is saved in this browser.</Callout>}
      {status && !status.execution.available && (
        <Callout tone="hint" icon={<CircleAlert size={18} />} title="Running code isn't available right now">
          {status.execution.message ?? "The code runner is offline."} You can still read the lesson, write your code (it&apos;s saved in this browser) and use hints.
        </Callout>
      )}
      {draftOutdated && <Callout tone="hint" title="This exercise changed since you last worked on it">Your saved code is still here, but the task may be different now. Use <strong>Reset</strong> to start from the new starter code.</Callout>}

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Your code</p>
          <div className="flex items-center gap-2 text-xs text-ink-3">
            {saved?.draft && <span aria-live="polite">Saved in this browser</span>}
            <Button size="sm" variant="ghost" onClick={reset} aria-label="Reset to starter code"><RotateCcw size={14} aria-hidden /> Reset</Button>
          </div>
        </div>
        <CodeEditor value={code} onChange={setCode} height={340} label={`Code editor for ${exercise.title}`} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label htmlFor="stdin" className="mb-1 block text-sm font-semibold">Input for Run <span className="font-normal text-ink-3">(what your program reads with cin)</span></label>
          <textarea id="stdin" value={input} onChange={(e) => setInput(e.target.value)} rows={2} spellCheck={false}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-[13px] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={run} disabled={!canRun || busy !== null || !code.trim()}>
            {busy === "run" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Play size={16} aria-hidden />} Run
          </Button>
          <Button onClick={() => check(false)} disabled={!canRun || busy !== null || !code.trim()}>
            {busy === "check" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />} Check answer
          </Button>
        </div>
      </div>
      {status?.execution.devOnly && status.execution.available && <p className="text-xs text-ink-3">Running on the local development sandbox.</p>}

      <div aria-live="polite" aria-busy={busy !== null}>
        {result?.kind === "error" && <Callout tone="danger" title="That didn't work">{result.message}</Callout>}
        {result?.kind === "run" && <RunOutput r={result.data} />}
        {result?.kind === "check" && <CheckOutput r={result.data} busy={busy === "reveal"} onReveal={() => check(true)} />}
      </div>
    </div>
  );
}

function FeedbackList({ items }: { items: Feedback[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      {items.map((f, i) => (
        <div key={i} className="rounded-xl border border-hint/30 bg-hint-soft px-4 py-3 text-sm">
          <p className="font-semibold text-ink">{f.title}{f.line ? <span className="font-normal text-ink-2"> · line {f.line}</span> : null}</p>
          <Markdown text={f.body} className="mt-1 space-y-2 text-ink-2" />
        </div>
      ))}
    </div>
  );
}

function Terminal({ title, text, tone = "plain" }: { title: string; text: string; tone?: "plain" | "error" }) {
  return (
    <div className="overflow-hidden rounded-xl border border-code-line bg-code-bg">
      <p className="border-b border-code-line px-3 py-1.5 text-xs text-code-dim">{title}</p>
      <pre className={clsx("max-h-72 overflow-auto whitespace-pre-wrap p-3 font-mono text-[13px] leading-6", tone === "error" ? "text-[#ffb4b4]" : "text-code-ink")}>{text || "(no output)"}</pre>
    </div>
  );
}

function RunOutput({ r }: { r: RunResult }) {
  if (r.compile.status !== "success") {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-semibold text-danger"><CircleX size={18} aria-hidden /> {r.compile.status === "rejected" ? "Not allowed in the sandbox" : "Compile error — the program didn't run"}</p>
        <FeedbackList items={r.feedback} />
        <Terminal title="Compiler message" text={r.compile.output} tone="error" />
      </div>
    );
  }
  const ok = r.run?.status === "ok";
  return (
    <div className="space-y-3">
      <p className={clsx("flex items-center gap-2 font-semibold", ok ? "text-success" : "text-danger")}>
        {ok ? <CheckCircle2 size={18} aria-hidden /> : <CircleX size={18} aria-hidden />}
        {ok ? `Ran successfully${r.run ? ` in ${r.run.timeMs} ms` : ""}` : "The program didn't finish normally"}
      </p>
      <FeedbackList items={r.feedback} />
      <Terminal title="Output" text={r.run?.stdout ?? ""} />
      {r.run?.stderr && <Terminal title="Error output" text={r.run.stderr} tone="error" />}
      <p className="text-xs text-ink-3">Run only shows what your program prints. Use <strong>Check answer</strong> to test it.</p>
    </div>
  );
}

function CheckOutput({ r, busy, onReveal }: { r: CheckResult; busy: boolean; onReveal: () => void }) {
  if (r.compileStatus !== "success") {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-semibold text-danger"><CircleX size={18} aria-hidden /> The code didn&apos;t compile, so no tests ran</p>
        <FeedbackList items={r.feedback} />
        <Terminal title="Compiler message" text={r.compileOutput} tone="error" />
      </div>
    );
  }
  const hiddenFailed = r.tests.some((t) => t.hidden && !t.passed);
  return (
    <div className="space-y-3">
      {r.passed ? (
        <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-3">
          <p className="flex items-center gap-2 font-semibold text-success"><CheckCircle2 size={18} aria-hidden /> Exercise complete — all {r.testsTotal} tests passed</p>
          <p className="mt-1 text-sm text-ink-2">Lesson marked complete in this browser. Scroll down to continue.</p>
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
        <Button variant="ghost" size="sm" onClick={onReveal} disabled={busy}>
          {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Eye size={14} aria-hidden />} Show me one failing hidden test
        </Button>
      )}
      {r.revealedHidden && (
        <div className="rounded-xl border border-line bg-sunken/60 p-3 text-sm">
          <p className="font-semibold">Hidden test: {r.revealedHidden.label}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <Mini label="Input" text={r.revealedHidden.input} />
            <Mini label="Expected" text={r.revealedHidden.expected} />
            <Mini label="Your output" text={r.revealedHidden.actual} />
          </div>
          <p className="mt-2 text-xs text-ink-3">Try this input with Run, find why it differs, then check again.</p>
        </div>
      )}
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
