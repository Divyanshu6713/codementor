"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardCheck, Loader2, Send, Timer } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { CodeBlock } from "@/components/CodeBlock";
import { Badge, Button, Callout } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { PublicExercise, PublicQuestion } from "@/content/python";
import { AnswerInputs, KIND_LABEL, draftReady, draftToAnswer, emptyDraft, type AnswerDraft } from "./QuestionCard";
import { ExercisePanel, type ExecView, type ExerciseInitial } from "./ExercisePanel";

/** Starts an assessment on the server (questions are chosen there) and opens it. */
export function StartAssessmentButton({ kind, scopeId, label, variant = "primary" }: { kind: "module" | "level" | "final" | "mixed" | "interview"; scopeId: string; label: string; variant?: "primary" | "secondary" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-1">
      <Button variant={variant} disabled={busy} onClick={async () => {
        setBusy(true);
        setError(null);
        try {
          const { id } = await api<{ id: string }>("/api/python/assessment-start", { body: { kind, scopeId } });
          router.push(`/app/python/assessment/${id}`);
        } catch (e) {
          setError(e instanceof ApiError ? e.message : "Couldn't start the assessment.");
          setBusy(false);
        }
      }}>{busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ClipboardCheck size={16} aria-hidden />} {label}</Button>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}

/**
 * Taking an assessment: answers are collected without feedback, then graded together on the
 * server. Timed assessments show a countdown; late submissions are graded but can't pass.
 */
export function AssessmentRunner({ id, questions, startedAt, timeLimitS, exercise, exec }: {
  id: string; questions: PublicQuestion[]; startedAt: string; timeLimitS: number | null;
  exercise: { ex: PublicExercise; initial: ExerciseInitial } | null; exec: ExecView;
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, AnswerDraft>>(() => Object.fromEntries(questions.map((q) => [q.id, emptyDraft(q)])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!timeLimitS) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [timeLimitS]);
  const left = timeLimitS ? Math.max(0, Math.round(timeLimitS - (now - Date.parse(startedAt)) / 1000)) : null;
  const answered = questions.filter((q) => draftReady(drafts[q.id])).length;

  async function submit() {
    if (answered < questions.length && !window.confirm(`You've answered ${answered} of ${questions.length}. Unanswered questions count as wrong. Submit anyway?`)) return;
    setBusy(true);
    setError(null);
    try {
      const answers = Object.fromEntries(questions.filter((q) => draftReady(drafts[q.id])).map((q) => [q.id, draftToAnswer(drafts[q.id])]));
      await api("/api/python/assessment-submit", { body: { id, answers } });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't submit. Your answers are still here — try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-14 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 px-4 py-2 shadow-card backdrop-blur lg:top-2">
        <span className="text-sm font-semibold">{answered} of {questions.length} answered</span>
        {left !== null && <span className={`flex items-center gap-1.5 font-mono text-sm font-bold ${left < 120 ? "text-danger" : "text-ink"}`} aria-live="off"><Timer size={15} aria-hidden /> {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}{left === 0 ? " — time's up, submit now" : ""}</span>}
        <Button size="sm" onClick={submit} disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Send size={14} aria-hidden />} Submit</Button>
      </div>
      <p className="text-sm text-ink-2">No hints or answers until you submit. Every answer is graded on the server, and you&apos;ll see why each one is right or wrong.</p>
      <ol className="space-y-5">
        {questions.map((q, i) => (
          <li key={q.id}>
            <fieldset className="space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card sm:p-5">
              <legend className="sr-only">Question {i + 1}</legend>
              <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-bold text-ink-3">Q{i + 1}</span><Badge tone="concept">{KIND_LABEL[q.kind]}</Badge><Badge>Level {q.difficulty}</Badge></div>
              <Markdown text={q.prompt} className="font-medium text-ink" codeLanguage="python" />
              {q.kind === "mcq" && q.code && <CodeBlock code={q.code} language="python" />}
              <AnswerInputs q={q} draft={drafts[q.id]} onChange={(d) => setDrafts((all) => ({ ...all, [q.id]: d }))} disabled={busy} />
            </fieldset>
          </li>
        ))}
      </ol>
      {exercise && (
        <section className="space-y-3 rounded-[var(--radius-card)] border border-pink/30 bg-surface p-4 shadow-card sm:p-5" aria-labelledby="coding-h">
          <Badge tone="pink">Coding problem · worth 2 questions</Badge>
          <h2 id="coding-h" className="text-lg font-bold">{exercise.ex.title}</h2>
          <p className="text-sm text-ink-2">Pass it with <strong>Check answer</strong> before you submit; a pass during this interview counts.</p>
          <ExercisePanel exercise={exercise.ex} initial={exercise.initial} exec={exec} mode="interview" />
        </section>
      )}
      {error && <Callout tone="danger" title="Not submitted">{error}</Callout>}
      <Button onClick={submit} disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Send size={16} aria-hidden />} Submit {answered}/{questions.length} answers</Button>
    </div>
  );
}
