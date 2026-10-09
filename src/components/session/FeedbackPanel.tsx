"use client";

import clsx from "clsx";
import { CheckCircle2, CircleAlert, Lightbulb, MessageCircleQuestion, XCircle } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import type { Feedback } from "./types";

const STATUS_TEXT: Record<string, string> = {
  ok: "ran", runtime_error: "crashed", time_limit: "too slow / never stopped", memory_limit: "used too much memory",
  output_limit: "printed too much", not_run: "not run", internal_error: "runner problem",
};

export function JudgeResults({ judge, title }: { judge: NonNullable<Feedback["judge"]>; title?: string }) {
  if (judge.compileStatus !== "success") {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger-soft p-3">
        <p className="text-sm font-semibold text-danger">{judge.compileStatus === "rejected" ? "This code can't run here" : "It didn't compile"}</p>
        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-code-bg p-3 font-mono text-xs text-code-ink">{judge.compileOutput}</pre>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-line">
      <div className="flex items-center justify-between border-b border-line px-3 py-2 text-sm">
        <span className="font-semibold">{title ?? "Tests"}: {judge.testsPassed} / {judge.testsTotal} passed</span>
        <span className="text-xs text-ink-3">checked by the judge</span>
      </div>
      <ul className="divide-y divide-line">
        {judge.tests.map((t, i) => (
          <li key={i} className="px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              {t.passed ? <CheckCircle2 size={16} className="text-success" aria-label="passed" /> : <XCircle size={16} className="text-danger" aria-label="failed" />}
              <span className="font-semibold">{t.label}</span>
              {t.revealed && <span className="rounded-full bg-concept-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-concept">revealed</span>}
              <span className="text-xs text-ink-3">{t.category !== "normal" ? `${t.category} case` : ""}{t.status !== "ok" ? ` · ${STATUS_TEXT[t.status] ?? t.status}` : ""}</span>
            </div>
            {(!t.hidden || t.revealed) && !t.passed && (
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {[["Input", t.input], ["Expected", t.expected], ["Your output", t.actual]].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-ink-3">{k}</p>
                    <pre className="mt-0.5 max-h-32 overflow-auto rounded-md bg-code-bg px-2 py-1 font-mono text-xs text-code-ink">{v?.trim() || "(nothing)"}</pre>
                  </div>
                ))}
                {t.detail && <p className="text-xs text-danger sm:col-span-3">{t.detail}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
      {judge.hiddenRevealed && (
        <p className="border-t border-line bg-concept-soft/50 px-3 py-2 text-xs text-ink-2">
          Hidden cases are now shown so you can find the bug. Solving it now still counts — like using a hint, so it won&apos;t be a solo solve.
        </p>
      )}
    </div>
  );
}

export function FeedbackPanel({ fb, resolved, explanation, diagnostic }: { fb: Feedback; resolved: boolean; explanation: string | null; diagnostic: boolean }) {
  if (diagnostic) {
    return <p className="rounded-xl bg-sunken px-4 py-3 text-sm text-ink-2" role="status">Answer saved. You&apos;ll see how it went on your Skill Map at the end.</p>;
  }
  const ok = fb.correct;
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <div className={clsx("flex gap-3 rounded-xl border p-4", ok ? "border-success/30 bg-success-soft" : "border-danger/25 bg-danger-soft")}>
        {ok ? <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={20} aria-hidden /> : <CircleAlert className="mt-0.5 shrink-0 text-danger" size={20} aria-hidden />}
        <div className="min-w-0 space-y-1 text-sm">
          <p className={clsx("flex flex-wrap items-center gap-2 font-semibold", ok ? "text-success" : "text-danger")}>
            {ok ? "Correct." : resolved ? "Not this time." : "Not quite yet — have another look."}
            {fb.xp ? <span className="animate-pop rounded-full bg-clay-soft px-2 py-0.5 text-xs font-bold text-clay tabular">+{fb.xp} XP</span> : null}
          </p>
          {fb.cleared && fb.cleared.length > 0 && <p className="text-ink">Cleared: <span className="font-semibold">{fb.cleared.join(", ")}</span> — two clean answers in a row.</p>}
          {!ok && fb.whatHappened && <Markdown text={fb.whatHappened} className="text-ink" />}
          {!ok && fb.feedback && <p className="text-ink">{fb.feedback}</p>}
          {fb.uncertain && <p className="text-ink-2">You said you were guessing, so we won&apos;t treat this as a misunderstanding.</p>}
        </div>
      </div>
      {fb.tutor && !ok && (
        <div className="flex gap-3 rounded-xl border border-concept/30 bg-concept-soft p-4 text-sm">
          <MessageCircleQuestion className="mt-0.5 shrink-0 text-concept" size={20} aria-hidden />
          <div><p className="text-ink">{fb.tutor.text}</p>{fb.tutor.question && <p className="mt-1 font-semibold text-ink">{fb.tutor.question}</p>}</div>
        </div>
      )}
      {fb.misconceptions.map((m) => (
        <div key={m.code} className="flex gap-3 rounded-xl border border-hint/30 bg-hint-soft p-4 text-sm">
          <Lightbulb className="mt-0.5 shrink-0 text-hint" size={20} aria-hidden />
          <div><p className="font-semibold text-ink">Possible misunderstanding: {m.title}</p><p className="mt-0.5 text-ink-2">{m.explanation}</p></div>
        </div>
      ))}
      {fb.ideas && (
        <div className="rounded-xl border border-line p-4 text-sm">
          <p className="font-semibold">Key ideas in your explanation <span className="font-normal text-ink-3">({fb.evaluator === "ai" ? "checked by the AI tutor" : "checked against key phrases — a rough guide"})</span></p>
          <ul className="mt-2 space-y-1">
            {fb.ideas.map((i) => <li key={i.id} className="flex items-center gap-2">{i.found ? <CheckCircle2 size={15} className="text-success" aria-label="found" /> : <span className="h-3.5 w-3.5 rounded-full border-2 border-line-strong" aria-label="missing" />}<span className={i.found ? "text-ink" : "text-ink-2"}>{i.label}</span></li>)}
          </ul>
        </div>
      )}
      {fb.judge && <JudgeResults judge={fb.judge} />}
      {resolved && explanation && (
        <div className="rounded-xl border border-line bg-surface p-4 text-sm">
          <p className="mb-1 font-semibold">Why</p>
          <Markdown text={explanation} className="text-ink-2" />
        </div>
      )}
    </div>
  );
}
