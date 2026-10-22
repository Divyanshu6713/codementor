"use client";

import clsx from "clsx";
import { CheckCircle2, CircleX, Eye, Lightbulb, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { Badge, Button } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { PublicQuestion } from "@/content/python";
import { FilesList } from "./small";

export type QuestionMode = "learn" | "practice" | "revision";

interface CorrectAnswer { kind: string; text: string; code?: string; choice?: number; line?: number; blanks?: string[] }
interface Graded { correct: boolean; feedback: string; explanation: string; correctAnswer: CorrectAnswer; reteach?: string | null; achievements?: { code: string; title: string }[]; lessonCompleted?: { id: string; title: string } | null }
interface Revealed { correctAnswer: CorrectAnswer; explanation: string }

export const KIND_LABEL: Record<string, string> = {
  mcq: "Multiple choice",
  predict: "Predict the output",
  fill: "Fill in the blanks",
  bug: "Find the bug",
};

export type AnswerDraft = { kind: "mcq"; choice: number | null } | { kind: "predict"; text: string } | { kind: "fill"; blanks: string[] } | { kind: "bug"; line: number | null };

export function emptyDraft(q: PublicQuestion): AnswerDraft {
  switch (q.kind) {
    case "mcq": return { kind: "mcq", choice: null };
    case "predict": return { kind: "predict", text: "" };
    case "fill": return { kind: "fill", blanks: Array.from({ length: q.blanks }, () => "") };
    case "bug": return { kind: "bug", line: null };
  }
}

export function draftReady(d: AnswerDraft) {
  switch (d.kind) {
    case "mcq": return d.choice !== null;
    case "predict": return d.text.trim().length > 0;
    case "fill": return d.blanks.every((b) => b.trim());
    case "bug": return d.line !== null;
  }
}

/** The answer body the API expects. */
export function draftToAnswer(d: AnswerDraft) {
  switch (d.kind) {
    case "mcq": return { kind: "mcq" as const, choice: d.choice ?? -1 };
    case "predict": return { kind: "predict" as const, text: d.text };
    case "fill": return { kind: "fill" as const, blanks: d.blanks };
    case "bug": return { kind: "bug" as const, line: d.line ?? 0 };
  }
}

/** The answer inputs for one question (shared by practice and assessments). */
export function AnswerInputs({ q, draft, onChange, disabled, result }: {
  q: PublicQuestion; draft: AnswerDraft; onChange: (d: AnswerDraft) => void; disabled?: boolean; result?: CorrectAnswer | null;
}) {
  const name = `q-${q.id}`;
  if (q.kind === "mcq" && draft.kind === "mcq") {
    return (
      <div className="grid gap-2" role="radiogroup" aria-label="Options">
        {q.options!.map((text, i) => (
          <label key={i} className={clsx(
            "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm",
            result && result.choice === i ? "border-success/50 bg-success-soft"
              : result && draft.choice === i ? "border-danger/40 bg-danger-soft"
              : draft.choice === i ? "border-accent bg-accent-soft" : "border-line hover:bg-sunken",
            disabled && "cursor-default",
          )}>
            <input type="radio" name={name} checked={draft.choice === i} disabled={disabled} onChange={() => onChange({ kind: "mcq", choice: i })} className="mt-1" aria-label={text.replace(/[`*]/g, "")} />
            <Markdown text={text} className="text-ink" codeLanguage="python" />
          </label>
        ))}
      </div>
    );
  }
  if (q.kind === "predict" && draft.kind === "predict") {
    return (
      <div className="space-y-2">
        {q.files.length > 0 && <FilesList files={q.files} />}
        <CodeBlock code={q.code!} language="python" label="main.py" />
        {q.input && <p className="text-xs text-ink-3">Input: <code className="rounded bg-sunken px-1 font-mono">{q.input.trimEnd().replace(/\n/g, " ⏎ ")}</code></p>}
        <label className="block text-sm font-semibold" htmlFor={`${name}-out`}>What does it print? <span className="font-normal text-ink-3">(one line per printed line)</span></label>
        <textarea id={`${name}-out`} value={draft.text} disabled={disabled} rows={Math.max(2, draft.text.split("\n").length)} spellCheck={false}
          onChange={(e) => onChange({ kind: "predict", text: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-[13px] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
      </div>
    );
  }
  if (q.kind === "fill" && draft.kind === "fill") {
    const parts = q.code!.split("___");
    return (
      <pre className="overflow-x-auto rounded-xl border border-code-line bg-code-bg p-3 font-mono text-[13.5px] leading-8 text-code-ink">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input aria-label={`Blank ${i + 1}`} value={draft.blanks[i]} disabled={disabled} spellCheck={false} autoCapitalize="off" autoComplete="off"
                onChange={(e) => onChange({ kind: "fill", blanks: draft.blanks.map((b, j) => (j === i ? e.target.value : b)) })}
                size={Math.max(4, draft.blanks[i].length + 1)}
                className={clsx("mx-0.5 rounded-md border bg-[#17244a] px-1.5 py-0.5 text-[#ffd166] focus:outline-none focus:ring-2 focus:ring-accent/50",
                  result ? "border-[#56658a]" : "border-[#56658a]")} />
            )}
          </span>
        ))}
      </pre>
    );
  }
  if (q.kind === "bug" && draft.kind === "bug") {
    const lines = q.code!.split("\n");
    return (
      <div className="overflow-hidden rounded-xl border border-code-line bg-code-bg" role="radiogroup" aria-label="Which line has the bug?">
        {q.input && <p className="border-b border-code-line px-3 py-1 text-xs text-code-dim">Input: {q.input.trimEnd().replace(/\n/g, " ⏎ ")}</p>}
        {lines.map((text, i) => {
          const n = i + 1;
          const picked = draft.line === n;
          return (
            <label key={n} className={clsx("flex cursor-pointer items-center gap-2 px-2 py-0.5 font-mono text-[13.5px] text-code-ink",
              result && result.line === n ? "bg-[#14532d]" : picked ? "bg-code-hl" : "hover:bg-[#17244a]", disabled && "cursor-default")}>
              <input type="radio" name={name} checked={picked} disabled={disabled} onChange={() => onChange({ kind: "bug", line: n })} aria-label={`Line ${n}`} />
              <span className="w-6 select-none text-right text-code-faint">{n}</span>
              <span className="whitespace-pre">{text || " "}</span>
            </label>
          );
        })}
      </div>
    );
  }
  return null;
}

/**
 * One question with the teaching loop: answer → (hint first, if wanted) → check → why it's right or
 * wrong → the correct answer → "explain it another way" after repeated misses → try again.
 */
export function QuestionCard({ q, mode, onAnswered, title }: { q: PublicQuestion; mode: QuestionMode; onAnswered?: (correct: boolean) => void; title?: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<AnswerDraft>(() => emptyDraft(q));
  const [hint, setHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [graded, setGraded] = useState<Graded | null>(null);
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const done = Boolean(graded || revealed);
  const answer = graded?.correctAnswer ?? revealed?.correctAnswer ?? null;

  async function check() {
    setBusy(true);
    setError(null);
    try {
      const r = await api<Graded>("/api/python/answer", { body: { questionId: q.id, answer: draftToAnswer(draft), mode, hintUsed: hint } });
      setGraded(r);
      onAnswered?.(r.correct);
      if (r.lessonCompleted) router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function reveal() {
    if (!window.confirm("Show the answer? It's better to try first — this question will count as not answered correctly.")) return;
    setBusy(true);
    try {
      setRevealed(await api<Revealed>("/api/python/reveal", { body: { questionId: q.id, mode } }));
      onAnswered?.(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setGraded(null);
    setRevealed(null);
    setDraft(emptyDraft(q));
  }

  return (
    <fieldset className="space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card sm:p-5" data-question={q.id}>
      <legend className="sr-only">{title ?? KIND_LABEL[q.kind]}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="concept">{title ?? KIND_LABEL[q.kind]}</Badge>
        <Badge>Level {q.difficulty}</Badge>
      </div>
      <Markdown text={q.prompt} className="font-medium text-ink" codeLanguage="python" />
      {q.kind === "mcq" && q.code && <CodeBlock code={q.code} language="python" />}
      <AnswerInputs q={q} draft={draft} onChange={setDraft} disabled={done || busy} result={answer} />

      {!done && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={check} disabled={busy || !draftReady(draft)}>{busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <CheckCircle2 size={14} aria-hidden />} Check answer</Button>
          {!hint && <Button size="sm" variant="hint" onClick={() => setHint(true)}><Lightbulb size={14} aria-hidden /> Hint</Button>}
          <Button size="sm" variant="ghost" onClick={reveal} disabled={busy}><Eye size={14} aria-hidden /> Show answer</Button>
        </div>
      )}
      {hint && !done && <p className="rounded-xl bg-hint-soft px-3 py-2 text-sm text-ink-2" role="note"><Lightbulb size={14} className="mr-1 inline text-hint" aria-hidden />{q.hint}</p>}
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      <div aria-live="polite">
        {graded && (
          <div className={clsx("space-y-2 rounded-xl px-4 py-3 text-sm", graded.correct ? "bg-success-soft" : "bg-danger-soft")}>
            <p className="flex items-center gap-2 font-semibold text-ink">
              {graded.correct ? <CheckCircle2 size={16} className="text-success" aria-hidden /> : <CircleX size={16} className="text-danger" aria-hidden />}
              {graded.correct ? "Correct!" : "Not quite."}
            </p>
            <Markdown text={graded.feedback} className="text-ink-2" codeLanguage="python" />
            {!graded.correct && <AnswerDisplay a={graded.correctAnswer} q={q} />}
            <Markdown text={`**Why:** ${graded.explanation}`} className="text-ink-2" codeLanguage="python" />
            {graded.lessonCompleted && <p className="font-semibold text-success">🎉 Lesson complete: {graded.lessonCompleted.title} (+10 XP)</p>}
            {graded.achievements?.map((a) => <p key={a.code} className="font-semibold text-clay">🏆 Achievement unlocked: {a.title}</p>)}
          </div>
        )}
        {revealed && (
          <div className="space-y-2 rounded-xl bg-sunken px-4 py-3 text-sm">
            <p className="font-semibold text-ink">The answer</p>
            <AnswerDisplay a={revealed.correctAnswer} q={q} />
            <Markdown text={`**Why:** ${revealed.explanation}`} className="text-ink-2" codeLanguage="python" />
          </div>
        )}
        {graded?.reteach && (
          <div className="mt-3 rounded-xl border border-concept/30 bg-concept-soft/60 px-4 py-3 text-sm">
            <p className="font-semibold text-concept">Let&apos;s look at it another way</p>
            <Markdown text={graded.reteach} className="mt-1 text-ink-2" codeLanguage="python" />
          </div>
        )}
        {done && !graded?.correct && <Button className="mt-3" size="sm" variant="secondary" onClick={retry}><RotateCcw size={14} aria-hidden /> Try again</Button>}
      </div>
    </fieldset>
  );
}

export function AnswerDisplay({ a, q }: { a: CorrectAnswer; q: PublicQuestion }) {
  if (a.kind === "predict") return <div><p className="text-xs font-semibold text-ink-3">Python prints</p><pre className="mt-1 whitespace-pre-wrap rounded-lg bg-code-bg px-3 py-2 font-mono text-[13px] text-code-ink">{a.text || "(nothing)"}</pre></div>;
  if (a.kind === "fill") return <p><span className="font-semibold">Answer:</span> {a.blanks!.map((b, i) => <code key={i} className="mx-1 rounded bg-surface px-1.5 font-mono">{b}</code>)}</p>;
  if (a.kind === "bug") return <div className="space-y-1"><p><span className="font-semibold">The bug is on line {a.line}.</span> Fixed version:</p><CodeBlock code={a.code!} language="python" /></div>;
  if (a.kind === "mcq") return <p><span className="font-semibold">Answer:</span> {q.options?.[a.choice ?? 0]}</p>;
  return null;
}
