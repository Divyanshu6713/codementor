"use client";

import clsx from "clsx";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui";

export interface QuickCheckView {
  prompt: string;
  code?: string;
  options: { id: string; text: string; feedback: string }[];
  correct: string;
  explanation: string;
}

/** A one-question self-check. Not graded and not required — it's for the student's own confidence. */
export function QuickCheck({ q }: { q: QuickCheckView }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const chosen = q.options.find((o) => o.id === picked);
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Quick check</legend>
      <Markdown text={q.prompt} className="font-medium text-ink" />
      {q.code && <CodeBlock code={q.code} />}
      <div className="grid gap-2">
        {q.options.map((o) => (
          <label key={o.id} className={clsx(
            "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm",
            checked && o.id === q.correct ? "border-success/50 bg-success-soft"
              : checked && o.id === picked ? "border-danger/40 bg-danger-soft"
              : picked === o.id ? "border-accent bg-accent-soft" : "border-line hover:bg-sunken",
          )}>
            <input type="radio" name="quick-check" value={o.id} checked={picked === o.id} onChange={() => { setPicked(o.id); setChecked(false); }} className="mt-1" />
            <Markdown text={o.text} className="text-ink" />
          </label>
        ))}
      </div>
      <Button size="sm" variant="secondary" disabled={!picked} onClick={() => setChecked(true)}>Check</Button>
      {checked && chosen && (
        <div aria-live="polite" className={clsx("rounded-xl px-4 py-3 text-sm", chosen.id === q.correct ? "bg-success-soft" : "bg-hint-soft")}>
          <p className="font-semibold text-ink">{chosen.id === q.correct ? "Correct." : "Not quite."}</p>
          <Markdown text={`${chosen.feedback} ${chosen.id === q.correct ? q.explanation : ""}`} className="mt-1 text-ink-2" />
        </div>
      )}
    </fieldset>
  );
}
