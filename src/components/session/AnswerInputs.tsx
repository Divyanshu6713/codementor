"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp } from "lucide-react";
import { CodeBlock, highlightCpp } from "@/components/CodeBlock";
import type { StudentAnswer } from "@/types/questions";
import type { ItemView } from "./types";

type Content = ItemView["question"]["content"];

/** Multiple choice (MCQ, predict output, identify the error). Options that look like code render as code. */
export function ChoiceInput({ content, disabled, onChange, value }: { content: Extract<Content, { options: unknown }>; disabled: boolean; value: string | null; onChange: (a: StudentAnswer) => void }) {
  const codeLike = (t: string) => /[;{}()]|^\s*-?\d[\d\s.-]*$|^".*"$/.test(t) || content.type === "predict_output";
  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Choose one answer</legend>
      <div className="grid gap-2">
        {content.options.map((o, i) => (
          <label key={o.id} className={clsx("flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
            value === o.id ? "border-accent bg-accent-soft" : "border-line-strong bg-surface hover:bg-sunken", disabled && "cursor-default opacity-80")}>
            <input type="radio" name="choice" value={o.id} checked={value === o.id} onChange={() => onChange({ type: "choice", optionId: o.id })} className="mt-1 accent-[var(--accent)]" />
            <span className="mr-1 font-mono text-xs font-bold text-ink-3">{String.fromCharCode(65 + i)}</span>
            {codeLike(o.text) ? <code className="whitespace-pre-wrap font-mono text-sm text-ink">{highlightCpp(o.text)}</code> : <span className="text-sm text-ink">{o.text}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Code with one blank to fill in. */
export function CompleteCodeInput({ code, disabled, onChange, value }: { code: string; disabled: boolean; value: string; onChange: (a: StudentAnswer) => void }) {
  const lines = code.split("\n");
  return (
    <div className="overflow-x-auto rounded-xl border border-code-line bg-code-bg py-3 font-mono text-[13.5px] leading-7 text-code-ink">
      {lines.map((line, i) => {
        const at = line.indexOf("____");
        return (
          <div key={i} className="flex pr-4">
            <span className="w-10 shrink-0 select-none pr-3 text-right text-code-faint" aria-hidden>{i + 1}</span>
            {at < 0 ? <span className="whitespace-pre">{highlightCpp(line)}</span> : (
              <span className="whitespace-pre">
                {highlightCpp(line.slice(0, at))}
                <input
                  aria-label="Fill in the blank"
                  value={value}
                  disabled={disabled}
                  onChange={(e) => onChange({ type: "text", text: e.target.value })}
                  className="mx-0.5 w-36 rounded border border-code-line bg-code-hl px-1.5 font-mono text-[#ffd166] outline-none focus:border-accent"
                  autoComplete="off" spellCheck={false}
                />
                {highlightCpp(line.slice(at + 4))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Reorder lines with keyboard-accessible up/down buttons. */
export function ReorderInput({ lines, disabled, onChange }: { lines: string[]; disabled: boolean; onChange: (a: StudentAnswer) => void }) {
  const [order, setOrder] = useState(() => lines.map((_, i) => i));
  const move = (pos: number, dir: -1 | 1) => {
    const next = [...order];
    const j = pos + dir;
    if (j < 0 || j >= next.length) return;
    [next[pos], next[j]] = [next[j], next[pos]];
    setOrder(next);
    onChange({ type: "order", order: next });
  };
  return (
    <ol className="space-y-1.5" aria-label="Program lines — move them into the right order">
      {order.map((idx, pos) => (
        <li key={idx} className="flex items-center gap-2 rounded-xl border border-line-strong bg-code-bg px-2 py-1.5">
          <span className="w-5 text-right font-mono text-xs text-code-faint">{pos + 1}</span>
          <code className="flex-1 whitespace-pre font-mono text-sm text-code-ink">{highlightCpp(lines[idx])}</code>
          <button type="button" disabled={disabled || pos === 0} onClick={() => move(pos, -1)} className="rounded p-1 text-code-dim hover:bg-code-line hover:text-code-ink disabled:opacity-30" aria-label={`Move "${lines[idx].trim()}" up`}><ArrowUp size={16} /></button>
          <button type="button" disabled={disabled || pos === order.length - 1} onClick={() => move(pos, 1)} className="rounded p-1 text-code-dim hover:bg-code-line hover:text-code-ink disabled:opacity-30" aria-label={`Move "${lines[idx].trim()}" down`}><ArrowDown size={16} /></button>
        </li>
      ))}
    </ol>
  );
}

export function TraceInput({ code, fields, disabled, values, results, onChange }: { code: string; fields: { label: string }[]; disabled: boolean; values: string[]; results?: boolean[]; onChange: (a: StudentAnswer) => void }) {
  return (
    <div className="@container"><div className="grid gap-4 @xl:grid-cols-2">
      <CodeBlock code={code} />
      <div className="space-y-2">
        {fields.map((f, i) => (
          <label key={i} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
            <span className="text-ink-2">{f.label}</span>
            <input
              value={values[i] ?? ""}
              disabled={disabled}
              inputMode="numeric"
              onChange={(e) => { const next = [...values]; next[i] = e.target.value; onChange({ type: "fields", values: next }); }}
              className={clsx("h-9 w-24 rounded-lg border bg-surface px-2 text-center font-mono", results ? (results[i] ? "border-success" : "border-danger") : "border-line-strong")}
              aria-invalid={results ? !results[i] : undefined}
            />
          </label>
        ))}
      </div>
    </div></div>
  );
}

export function ExplainInput({ value, disabled, onChange }: { value: string; disabled: boolean; onChange: (a: StudentAnswer) => void }) {
  return (
    <div>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange({ type: "text", text: e.target.value })}
        rows={6}
        maxLength={3000}
        className="w-full rounded-xl border border-line-strong bg-surface p-3 text-sm leading-relaxed focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        placeholder="Explain it in your own words. Spelling and grammar don't matter — the ideas do."
        aria-label="Your explanation"
      />
      <p className="mt-1 text-xs text-ink-3">{value.trim().split(/\s+/).filter(Boolean).length} words</p>
    </div>
  );
}
