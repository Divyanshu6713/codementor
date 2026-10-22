"use client";

import clsx from "clsx";
import { CheckCircle2, CircleX } from "lucide-react";
import { Markdown } from "@/components/Markdown";

export interface Feedback { title: string; body: string; line?: number | null }

export interface PyRunResult {
  compile: { status: "success" | "error" | "rejected"; output: string };
  run: { status: string; stdout: string; stderr: string; detail: string | null; timeMs: number; exitCode: number | null } | null;
  feedback: Feedback[];
  isolation?: string;
}

export function FeedbackList({ items }: { items: Feedback[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      {items.map((f, i) => (
        <div key={i} className="rounded-xl border border-hint/30 bg-hint-soft px-4 py-3 text-sm">
          <p className="font-semibold text-ink">{f.title}{f.line ? <span className="font-normal text-ink-2"> · line {f.line}</span> : null}</p>
          <Markdown text={f.body} className="mt-1 space-y-2 text-ink-2" codeLanguage="python" />
        </div>
      ))}
    </div>
  );
}

export function Console({ title, text, tone = "plain" }: { title: string; text: string; tone?: "plain" | "error" }) {
  return (
    <div className="overflow-hidden rounded-xl border border-code-line bg-code-bg">
      <p className="border-b border-code-line px-3 py-1.5 text-xs text-code-dim">{title}</p>
      <pre className={clsx("max-h-80 overflow-auto whitespace-pre-wrap p-3 font-mono text-[13px] leading-6", tone === "error" ? "text-[#ffb4b4]" : "text-code-ink")}>{text || "(no output)"}</pre>
    </div>
  );
}

/** Output of one real run: syntax error, or stdout + traceback with a plain-language explanation. */
export function RunOutput({ r }: { r: PyRunResult }) {
  if (r.compile.status !== "success") {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-semibold text-danger"><CircleX size={18} aria-hidden /> {r.compile.status === "rejected" ? "Not allowed in the sandbox" : "Syntax error — the program didn't run"}</p>
        <FeedbackList items={r.feedback} />
        <Console title={r.compile.status === "rejected" ? "Message" : "Python's message"} text={r.compile.output} tone="error" />
      </div>
    );
  }
  const ok = r.run?.status === "ok";
  return (
    <div className="space-y-3">
      <p className={clsx("flex items-center gap-2 font-semibold", ok ? "text-success" : "text-danger")}>
        {ok ? <CheckCircle2 size={18} aria-hidden /> : <CircleX size={18} aria-hidden />}
        {ok ? `Ran successfully in ${r.run?.timeMs ?? 0} ms` : r.run?.status === "runtime_error" ? "The program stopped with an error" : (r.run?.detail ?? "The program didn't finish normally")}
      </p>
      <Console title="Output" text={r.run?.stdout ?? ""} />
      {r.run?.stderr && <Console title="Traceback (read it from the bottom up)" text={r.run.stderr} tone="error" />}
      <FeedbackList items={r.feedback} />
    </div>
  );
}
