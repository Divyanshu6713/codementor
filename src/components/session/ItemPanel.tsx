"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Eye, FlaskConical, Lightbulb, Play, Send, SkipForward } from "lucide-react";
import { api } from "@/lib/api";
import { Markdown } from "@/components/Markdown";
import { CodeBlock } from "@/components/CodeBlock";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { Badge, Button, Callout } from "@/components/ui";
import type { StudentAnswer } from "@/types/questions";
import { ChoiceInput, CompleteCodeInput, ExplainInput, ReorderInput, TraceInput } from "./AnswerInputs";
import { FeedbackPanel, JudgeResults } from "./FeedbackPanel";
import type { Feedback, ItemView } from "./types";

const HINT_NAMES = ["Think about it", "The concept", "Where to look", "The idea behind it", "A structure to fill in"];

interface Props {
  sessionId: string;
  item: ItemView;
  busy: boolean;
  executionAvailable: boolean;
  onAnswer: (answer: StudentAnswer, selfConfidence: "guessing" | "somewhat" | "very" | null, durationMs: number) => Promise<void>;
  onHint: () => Promise<void>;
  onReveal: () => Promise<void>;
  onSkip: () => Promise<void>;
  onContinue: () => Promise<void>;
}

interface RunResult {
  compile: { status: string; output: string };
  run: { status: string; stdout: string; stderr: string; detail: string | null } | null;
}

export function ItemPanel({ sessionId, item, busy, executionAvailable, onAnswer, onHint, onReveal, onSkip, onContinue }: Props) {
  const q = item.question;
  const c = q.content;
  const [answer, setAnswer] = useState<StudentAnswer | null>(null);
  const [source, setSource] = useState(item.lastSource ?? (c.type === "write_code" ? c.starterCode : ""));
  const [stdin, setStdin] = useState(c.type === "write_code" ? c.samples[0]?.input ?? "" : "");
  const [run, setRun] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [testRun, setTestRun] = useState<Feedback["judge"]>(null);
  const [testing, setTesting] = useState(false);
  const [confidence, setConfidence] = useState<"guessing" | "somewhat" | "very" | null>(null);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const started = useRef(0);
  const continueRef = useRef<HTMLButtonElement>(null);
  const diagnostic = item.role === "diagnostic";
  const locked = item.resolved || busy;

  useEffect(() => {
    started.current = Date.now();
  }, []);
  useEffect(() => {
    if (item.resolved) continueRef.current?.focus();
  }, [item.resolved]);

  const submit = () => {
    const a: StudentAnswer | null = c.type === "write_code" ? { type: "code", source } : answer;
    if (!a) return;
    void onAnswer(a, confidence, Date.now() - started.current);
  };

  async function runAllTests() {
    setTesting(true);
    setRunError(null);
    try {
      const res = await api<{ result: NonNullable<Feedback["judge"]> }>(`/api/learning-session/${sessionId}/run-tests`, { body: { itemKey: item.itemKey, source } });
      setTestRun(res.result);
    } catch (err) {
      setRunError((err as Error).message);
    } finally {
      setTesting(false);
    }
  }

  async function runCode() {
    setRunning(true);
    setRunError(null);
    try {
      setRun(await api<RunResult>("/api/code/run", { body: { source, input: stdin, sessionId, itemKey: item.itemKey } }));
    } catch (err) {
      setRunError((err as Error).message);
    } finally {
      setRunning(false);
    }
  }

  const canSubmit = !locked && (c.type === "write_code" ? source.trim().length > 0 && executionAvailable : answer !== null &&
    (answer.type !== "text" || answer.text.trim().length > 0) && (answer.type !== "fields" || answer.values.some((v) => v?.trim())));

  return (
    <article className="@container space-y-5" aria-labelledby="item-prompt">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={item.role === "exit" || diagnostic ? "concept" : item.role === "checkpoint" || item.role === "retry" ? "accent" : "neutral"}>{item.roleLabel}</Badge>
        {item.mode && <Badge>{item.mode === "guided" ? "Guided" : item.mode === "independent" ? "On your own" : "Debugging"}</Badge>}
        <Badge>{q.difficultyLabel}</Badge>
        <span className="text-xs text-ink-3">{q.conceptTitle}</span>
        {item.attempts > 0 && !item.resolved && <span className="text-xs text-ink-3">· attempt {item.attempts + 1}</span>}
      </div>

      <div id="item-prompt" className="text-lg font-semibold leading-snug text-ink"><Markdown text={c.prompt} className="space-y-2" /></div>
      {"code" in c && c.code && c.type !== "complete_code" && c.type !== "trace" && <CodeBlock code={c.code} />}
      {(c.type === "predict_output" || c.type === "identify_error" || c.type === "trace") && <p className="-mt-2 text-xs text-ink-3">Assume the usual <code className="font-mono">#include &lt;iostream&gt;</code> and <code className="font-mono">using namespace std;</code></p>}

      {(c.type === "mcq" || c.type === "predict_output" || c.type === "identify_error") && (
        <ChoiceInput content={c} disabled={locked} value={answer?.type === "choice" ? answer.optionId : null} onChange={setAnswer} />
      )}
      {c.type === "complete_code" && <CompleteCodeInput code={c.code} disabled={locked} value={answer?.type === "text" ? answer.text : ""} onChange={setAnswer} />}
      {c.type === "reorder" && <ReorderInput lines={c.lines} disabled={locked} onChange={setAnswer} />}
      {c.type === "trace" && <TraceInput code={c.code} fields={c.fields} disabled={locked} values={answer?.type === "fields" ? answer.values : []} results={item.last?.fieldResults} onChange={setAnswer} />}
      {c.type === "explain" && <ExplainInput value={answer?.type === "text" ? answer.text : ""} disabled={locked} onChange={setAnswer} />}

      {c.type === "write_code" && (
        <div className="space-y-3">
          {c.samples.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <caption className="sr-only">Example tests</caption>
                <thead className="bg-sunken text-left"><tr><th className="px-3 py-1.5 font-semibold">Example</th><th className="px-3 py-1.5 font-semibold">Input</th><th className="px-3 py-1.5 font-semibold">Expected output</th></tr></thead>
                <tbody>{c.samples.map((s) => (
                  <tr key={s.label} className="border-t border-line align-top">
                    <td className="px-3 py-1.5 text-ink-2">{s.label}</td>
                    <td className="px-3 py-1.5"><pre className="font-mono text-xs">{s.input.trim() || "(none)"}</pre></td>
                    <td className="px-3 py-1.5"><pre className="font-mono text-xs">{s.output.trim() || "(nothing)"}</pre></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <CodeEditor value={source} onChange={setSource} readOnly={item.resolved} label="Your C++ program" />
          {!item.resolved && (
            <div className="grid gap-3 @xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div>
                <label htmlFor="stdin" className="text-xs font-semibold text-ink-2">Input for “Run” (stdin)</label>
                <textarea id="stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-line-strong bg-surface p-2 font-mono text-sm" spellCheck={false} />
              </div>
              <div aria-live="polite">
                <p className="text-xs font-semibold text-ink-2">Console</p>
                <pre className="mt-1 h-[84px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-code-bg p-2 font-mono text-xs text-code-ink">
                  {running ? "Compiling and running…" : runError ? runError : run ? (
                    run.compile.status !== "success" ? run.compile.output : run.run?.status === "ok" ? (run.run.stdout || "(no output)") : `${run.run?.stdout ?? ""}\n[${run.run?.detail ?? run.run?.status}]`
                  ) : "Press Run to try your program with this input. Run doesn't count as a submission."}
                </pre>
              </div>
            </div>
          )}
          {!executionAvailable && <Callout tone="hint" title="Code execution environment not configured.">You can write code, but it can&apos;t be compiled or checked right now. Nothing is simulated.</Callout>}
        </div>
      )}

      {item.askConfidence && !item.resolved && (
        <fieldset className="flex flex-wrap items-center gap-2 text-sm">
          <legend className="sr-only">How confident are you?</legend>
          <span className="text-ink-2">How sure are you? <span className="text-ink-3">(optional)</span></span>
          {(["guessing", "somewhat", "very"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setConfidence(confidence === v ? null : v)} aria-pressed={confidence === v}
              className={clsx("rounded-full border px-3 py-1 text-xs font-semibold", confidence === v ? "border-concept bg-concept-soft text-concept" : "border-line-strong text-ink-2 hover:bg-sunken")}>
              {v === "guessing" ? "Guessing" : v === "somewhat" ? "Somewhat sure" : "Very sure"}
            </button>
          ))}
        </fieldset>
      )}

      {item.hints.length > 0 && (
        <section aria-label="Hints" className="space-y-2">
          {item.hints.map((h) => (
            <div key={h.level} className="rounded-xl border border-hint/30 bg-hint-soft p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-hint">Hint {h.level + 1} · {HINT_NAMES[h.level]}{h.source === "ai" ? " · personalised" : ""}</p>
              {h.level === 4 ? <pre className="mt-1.5 whitespace-pre-wrap rounded-lg bg-code-bg p-2 font-mono text-xs text-code-ink">{h.text}</pre> : <div className="mt-1 text-ink"><Markdown text={h.text} className="space-y-1" /></div>}
            </div>
          ))}
        </section>
      )}

      {testRun && !item.resolved && (
        <div className="space-y-1.5" aria-live="polite">
          <JudgeResults judge={testRun} title="Test run (not a submission)" />
          {!item.testsRevealed && testRun.tests.some((t) => t.hidden && !t.passed) && (
            <p className="text-xs text-ink-3">Hidden cases show their inputs after a wrong submission.</p>
          )}
        </div>
      )}

      {item.last && <FeedbackPanel fb={item.last} resolved={item.resolved} explanation={item.explanation} diagnostic={diagnostic} />}

      {item.solution && (
        <section className="space-y-2 rounded-xl border border-line p-4" aria-label="Solution">
          <p className="flex items-center gap-1.5 font-semibold"><Eye size={16} aria-hidden /> Solution</p>
          <p className="text-sm text-ink-2">{item.solution.walkthrough}</p>
          {item.solution.answer && <p className="font-mono text-sm">{item.solution.answer}</p>}
          {item.solution.code && <CodeBlock code={item.solution.code} />}
          <p className="text-xs text-ink-3">This one counts as “not solved yet” — you&apos;ll get a similar question later to try on your own.</p>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {!item.resolved ? (
          <>
            {c.type === "write_code" && (
              <>
                <Button variant="secondary" onClick={runCode} disabled={running || busy || !executionAvailable} title="Run with your own input"><Play size={16} aria-hidden /> Run</Button>
                {item.canRunTests && (
                  <Button variant="secondary" onClick={runAllTests} disabled={testing || busy || !executionAvailable} title="Check against every test case — doesn't count as a submission">
                    <FlaskConical size={16} aria-hidden /> {testing ? "Testing…" : "Run tests"}
                  </Button>
                )}
              </>
            )}
            <Button onClick={submit} disabled={!canSubmit}>
              <Send size={16} aria-hidden /> {busy ? "Checking…" : c.type === "write_code" ? "Submit" : diagnostic ? "Save answer" : "Check answer"}
            </Button>
            {item.canHint && <Button variant="hint" onClick={() => void onHint()} disabled={busy}><Lightbulb size={16} aria-hidden /> {item.hints.length ? "Another hint" : "Get a hint"}</Button>}
            {item.canReveal && (confirmReveal
              ? <Button variant="secondary" onClick={() => void onReveal()} disabled={busy}>Yes, show the solution</Button>
              : <Button variant="ghost" onClick={() => setConfirmReveal(true)} disabled={busy}><Eye size={16} aria-hidden /> Show solution</Button>)}
            {item.canSkip && <Button variant="ghost" onClick={() => void onSkip()} disabled={busy} className="ml-auto"><SkipForward size={16} aria-hidden /> Skip for now</Button>}
          </>
        ) : (
          <Button ref={continueRef} onClick={() => void onContinue()} disabled={busy} size="lg">Continue</Button>
        )}
      </div>
      {!item.resolved && !item.canReveal && item.canHint && item.attempts > 0 && <p className="text-xs text-ink-3">The full solution unlocks after all hints or three attempts.</p>}
    </article>
  );
}
