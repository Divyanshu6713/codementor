"use client";

import { BookOpen, Bug, KeyRound, Lightbulb, Loader2, MessageCircleQuestion, ScanSearch, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Markdown } from "@/components/Markdown";
import { Badge, Button, Callout } from "@/components/ui";
import { CodeBlock } from "@/components/CodeBlock";
import { api, ApiError } from "@/lib/api";
import { useLesson, type HelpAnswer } from "./LessonState";

interface TutorAnswer {
  source: "ai" | "curated";
  text: string;
  notice: string | null;
  remaining: number | null;
}

const MAX_HINT = 4;

/**
 * Help that teaches rather than answers: hints come one level at a time, and the worked solution
 * is a separate, deliberate step. Works fully without AI (built-in help); when AI is enabled the
 * same buttons give personalised answers within a daily limit.
 */
export function HelpPanel({ exerciseTitle }: { exerciseTitle: string }) {
  const { lessonId, code, status, hintLevel, noteHint, failedChecks, answer, setAnswer, setRemaining } = useLesson();
  const [busy, setBusy] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [solution, setSolution] = useState<{ solution: string; notes: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ai = status?.tutor.aiEnabled ?? false;
  const nextHint = Math.min(hintLevel + 1, MAX_HINT);
  const solutionOffered = hintLevel >= MAX_HINT || failedChecks >= 3;

  async function ask(mode: "concept" | "hint" | "error" | "review" | "ask", label: string, extra: { hintLevel?: number; question?: string } = {}) {
    setBusy(mode);
    setError(null);
    try {
      const res = await api<TutorAnswer>("/api/guest/tutor", {
        body: { lessonId, mode, hintLevel: extra.hintLevel ?? null, code: mode === "concept" ? null : code, question: extra.question ?? null },
        timeoutMs: 120_000,
      });
      const a: HelpAnswer = { mode, label, source: res.source, text: res.text, notice: res.notice };
      setAnswer(a);
      if (res.remaining !== null) setRemaining(res.remaining);
      if (mode === "hint" && extra.hintLevel) noteHint(extra.hintLevel);
      if (mode === "ask") setQuestion("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Help isn't available right now.");
    } finally {
      setBusy(null);
    }
  }

  async function showSolution() {
    if (!window.confirm("See the worked solution?\n\nYou'll learn more by trying the hints first. The exercise still counts as complete only when your own code passes the check.")) return;
    setBusy("solution");
    setError(null);
    try {
      setSolution(await api<{ solution: string; notes: string }>("/api/guest/solution", { body: { lessonId } }));
      noteHint(5);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't load the solution.");
    } finally {
      setBusy(null);
    }
  }

  const spin = (m: string) => (busy === m ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null);

  return (
    <section aria-label="Help" className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold"><Sparkles size={18} className="text-concept" aria-hidden /> Help</h2>
        {status && (ai
          ? <Badge tone="concept">AI tutor on{status.tutor.remaining !== null ? ` · ${status.tutor.remaining} of ${status.tutor.dailyLimit} left today` : ""}</Badge>
          : <Badge>Built-in help</Badge>)}
      </div>
      <p className="mt-1 text-xs text-ink-3">Stuck on <em>{exerciseTitle}</em>? Start with a hint — each one gives a little more.</p>

      <div className="mt-3 grid gap-2">
        <Button variant="hint" onClick={() => ask("hint", `Hint ${nextHint} of ${MAX_HINT}`, { hintLevel: nextHint })} disabled={busy !== null} className="justify-start">
          {spin("hint") ?? <Lightbulb size={16} aria-hidden />} {hintLevel === 0 ? "Give me a hint" : hintLevel < MAX_HINT ? `Next hint (${nextHint} of ${MAX_HINT})` : `Show hint ${MAX_HINT} again`}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={() => ask("concept", "The idea, explained again")} disabled={busy !== null} className="justify-start">
            {spin("concept") ?? <BookOpen size={15} aria-hidden />} Explain concept
          </Button>
          <Button variant="secondary" size="sm" onClick={() => ask("error", "About your error")} disabled={busy !== null || !code.trim()} className="justify-start">
            {spin("error") ?? <Bug size={15} aria-hidden />} Explain error
          </Button>
          <Button variant="secondary" size="sm" onClick={() => ask("review", "Review of your code")} disabled={busy !== null || !code.trim()} className="col-span-2 justify-start">
            {spin("review") ?? <ScanSearch size={15} aria-hidden />} Review my code
          </Button>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim()) ask("ask", `You asked: ${question.trim().slice(0, 80)}`, { question: question.trim() });
          }}
        >
          <label htmlFor="ask-q" className="sr-only">Ask a question</label>
          <input id="ask-q" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={1000} placeholder={ai ? "Ask a question…" : "Ask a question (AI is off)"}
            className="h-9 min-w-0 flex-1 rounded-[0.75rem] border border-line bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
          <Button size="sm" type="submit" disabled={busy !== null || !question.trim()} aria-label="Send question">{spin("ask") ?? <Send size={15} aria-hidden />}</Button>
        </form>
      </div>

      {error && <Callout tone="danger" className="mt-3">{error}</Callout>}

      <div aria-live="polite" className="mt-3">
        {answer && (
          <div className="rounded-xl border border-line bg-sunken/50 p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{answer.label}</p>
              <Badge tone={answer.source === "ai" ? "concept" : "neutral"}>{answer.source === "ai" ? "AI tutor" : "Built-in"}</Badge>
            </div>
            {answer.notice && <p className="mb-2 text-xs text-ink-3">{answer.notice}</p>}
            <Markdown text={answer.text} className="space-y-2 text-sm leading-relaxed text-ink-2" />
            {answer.source === "ai" && <p className="mt-2 text-[11px] text-ink-3">AI answers can be wrong. Only <strong>Check answer</strong> decides whether your code is correct.</p>}
          </div>
        )}
      </div>

      {solutionOffered && !solution && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-xs text-ink-3">Still stuck after the hints? Seeing a worked solution is fine — then close it and write the program yourself.</p>
          <Button variant="ghost" size="sm" className="mt-1" onClick={showSolution} disabled={busy !== null}>
            {spin("solution") ?? <KeyRound size={15} aria-hidden />} Show worked solution
          </Button>
        </div>
      )}
      {solution && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          <p className="flex items-center gap-2 text-sm font-semibold"><MessageCircleQuestion size={16} aria-hidden /> Worked solution</p>
          <CodeBlock code={solution.solution} />
          <Markdown text={solution.notes} className="text-sm text-ink-2" />
          <Button variant="ghost" size="sm" onClick={() => setSolution(null)}>Hide solution</Button>
        </div>
      )}
    </section>
  );
}
