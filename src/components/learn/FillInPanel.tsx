"use client";

import { Loader2, PencilLine, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button, Callout } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { CheckOutput, Celebration, type CheckResult } from "./ExercisePanel";

export interface FillInView {
  lines: (string | null)[];
  blanks: { indent: string; suffix: string }[];
}

/**
 * "Complete the code": the worked solution with a few key lines missing. The learner types just
 * those lines; the server splices them in and runs the exercise's real tests, so any correct line
 * is accepted. Worth less XP than writing the program from scratch.
 */
export function FillInPanel({ exerciseKey, view, executionAvailable, alreadyPassed }: { exerciseKey: string; view: FillInView; executionAvailable: boolean; alreadyPassed: boolean }) {
  const [answers, setAnswers] = useState<string[]>(() => view.blanks.map(() => ""));
  const [busy, setBusy] = useState<"check" | "reveal" | null>(null);
  const [result, setResult] = useState<CheckResult | { error: string } | null>(null);
  let blank = -1;

  async function check(showFailingHidden: boolean) {
    setBusy(showFailingHidden ? "reveal" : "check");
    try {
      setResult(await api<CheckResult>("/api/lessons/fill", { body: { lessonId: exerciseKey, answers, showFailingHidden } }));
    } catch (e) {
      setResult({ error: e instanceof ApiError ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Here&apos;s a working program with <strong>{view.blanks.length} line{view.blanks.length > 1 ? "s" : ""}</strong> missing. Write each missing line — your version doesn&apos;t have to match ours, it just has to make every test pass.
        {alreadyPassed ? " You've already completed this one." : " Worth 10 XP (writing the whole program yourself is worth more)."}
      </p>
      <div className="overflow-x-auto rounded-xl border border-code-line bg-code-bg p-3">
        <pre className="font-mono text-[13px] leading-7 text-code-ink">
          {view.lines.map((line, i) => {
            if (line !== null) return <div key={i} className="whitespace-pre">{line || " "}</div>;
            blank++;
            const k = blank;
            const b = view.blanks[k];
            return (
              <div key={i} className="flex items-center whitespace-pre">
                <span>{b.indent}</span>
                <label className="sr-only" htmlFor={`fill-${exerciseKey}-${k}`}>Missing line {k + 1}</label>
                <input
                  id={`fill-${exerciseKey}-${k}`}
                  value={answers[k]}
                  onChange={(e) => setAnswers((a) => a.map((x, j) => (j === k ? e.target.value.replace(/[\r\n]/g, "") : x)))}
                  maxLength={240}
                  spellCheck={false}
                  autoCapitalize="none"
                  autoComplete="off"
                  placeholder={`missing line ${k + 1}`}
                  className="min-w-[16rem] flex-1 rounded-md border border-dashed border-accent/60 bg-white/5 px-2 font-mono text-[13px] text-code-ink placeholder:text-code-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                {b.suffix && <span>{b.suffix}</span>}
              </div>
            );
          })}
        </pre>
      </div>
      {!executionAvailable && <Callout tone="hint">Running code isn&apos;t available right now, so answers can&apos;t be checked.</Callout>}
      <Button onClick={() => check(false)} disabled={!executionAvailable || busy !== null || answers.some((a) => !a.trim())}>
        {busy === "check" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />} Check my lines
      </Button>
      <div aria-live="polite" aria-busy={busy !== null}>
        {result && "error" in result && <Callout tone="danger" title="That didn't work">{result.error}</Callout>}
        {result && !("error" in result) && (
          <>
            <CheckOutput r={result} practice busy={busy === "reveal"} onReveal={() => check(true)} successText="Every test passes with your lines. Now try writing the whole program in the editor above — it's worth more XP." />
            {result.passed && result.reward && result.reward.firstPass && <Celebration reward={result.reward} maxXp={10} note="Completed with most of the code given. Writing it from scratch earns the full XP." />}
          </>
        )}
      </div>
    </div>
  );
}

/** A collapsed entry point under the main exercise. */
export function FillInToggle(props: Parameters<typeof FillInPanel>[0]) {
  return (
    <details className="group rounded-xl border border-line bg-surface p-4 shadow-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
        <PencilLine size={18} className="text-concept" aria-hidden /> Stuck? Try &ldquo;Complete the code&rdquo; instead
        <span className="ml-auto text-xs font-normal text-ink-3 group-open:hidden">Fill in {props.view.blanks.length} missing line{props.view.blanks.length > 1 ? "s" : ""}</span>
      </summary>
      <div className="mt-4"><FillInPanel {...props} /></div>
    </details>
  );
}
