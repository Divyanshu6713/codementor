"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { Button, Callout } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { PublicQuestion } from "@/content/python";
import { QuestionCard } from "./QuestionCard";

interface RoundSet { lesson: { id: string; title: string; reteach: string; summary: string[] }; questions: PublicQuestion[] }
interface RoundResult { correct: number; total: number; good: boolean; box: number; days: number }

/**
 * Revision mode for one lesson: read the revision notes, answer three questions (missed ones
 * first), then the server reschedules the topic further out — or brings it back tomorrow.
 */
export function RevisionRound({ lessonId, title }: { lessonId: string; title: string }) {
  const router = useRouter();
  const [set, setSet] = useState<RoundSet | null>(null);
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<RoundResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      setSet(await api<RoundSet>("/api/python/revision-set", { body: { lessonId } }));
      setAnswered({});
      setResult(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't start revision.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (!set) return;
    setBusy(true);
    try {
      setResult(await api<RoundResult>("/api/python/revision-done", { body: { lessonId, questionIds: set.questions.map((q) => q.id) } }));
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save the result.");
    } finally {
      setBusy(false);
    }
  }

  if (!set) {
    return (
      <div>
        <Button size="sm" onClick={start} disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <RotateCcw size={14} aria-hidden />} Revise “{title}”</Button>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    );
  }
  const allDone = set.questions.every((q) => q.id in answered);
  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-sky/30 bg-sky-soft/30 p-4">
      <div>
        <p className="font-semibold">Revision notes: {set.lesson.title}</p>
        <ul className="mt-1 space-y-1 text-sm">{set.lesson.summary.map((s) => <li key={s} className="flex gap-2"><span className="text-success" aria-hidden>✓</span><Markdown text={s} className="text-ink-2" codeLanguage="python" /></li>)}</ul>
      </div>
      {set.questions.map((q) => <QuestionCard key={q.id} q={q} mode="revision" onAnswered={(ok) => setAnswered((a) => (q.id in a ? a : { ...a, [q.id]: ok }))} />)}
      {!result && <Button onClick={finish} disabled={!allDone || busy}>{busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <CheckCircle2 size={16} aria-hidden />} Finish this revision round</Button>}
      {!allDone && !result && <p className="text-xs text-ink-3">Answer all {set.questions.length} questions to finish the round.</p>}
      {result && (
        <Callout tone={result.good ? "success" : "hint"} title={`${result.correct}/${result.total} correct`}>
          {result.good ? `Nice — next review in ${result.days} day${result.days > 1 ? "s" : ""}.` : "This topic needs another look, so it's back tomorrow. Here it is explained another way:"}
          {!result.good && <Markdown text={set.lesson.reteach} className="mt-2 text-ink-2" codeLanguage="python" />}
        </Callout>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
