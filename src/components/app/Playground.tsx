"use client";

import { useState } from "react";
import { Bug, Loader2, MessageCircleQuestion, Play, RotateCcw, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { Markdown } from "@/components/Markdown";
import { Badge, Button, Callout } from "@/components/ui";

const STARTER = `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    cout << n * 2;

    return 0;
}
`;

export interface PlaygroundExample {
  id: string;
  label: string;
  group: string;
  code: string;
  input: string;
}

interface RunResult {
  compile: { status: string; output: string };
  run: { status: string; stdout: string; stderr: string; detail: string | null; timeMs: number } | null;
  feedback: { title: string; body: string; line?: number | null }[];
  isolation: string;
}

interface MentorAnswer {
  source: "ai" | "curated";
  text: string;
  notice: string | null;
  remaining: number | null;
}

/**
 * Free-form C++ playground: write anything, run it, load and remix any lesson example, and ask the
 * mentor about an error or a question. Experimenting never changes progress.
 */
export function Playground({ available, message, examples, initial, mentor }: {
  available: boolean;
  message: string | null;
  examples: PlaygroundExample[];
  initial: { code: string; input: string; exampleId: string | null } | null;
  mentor: { aiEnabled: boolean; dailyLimit: number; remaining: number | null };
}) {
  const [code, setCode] = useState(initial?.code ?? STARTER);
  const [input, setInput] = useState(initial?.input ?? "21");
  const [exampleId, setExampleId] = useState(initial?.exampleId ?? "");
  const [res, setRes] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState<"run" | "error" | "ask" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<(MentorAnswer & { label: string }) | null>(null);
  const [remaining, setRemaining] = useState(mentor.remaining);

  async function run() {
    setBusy("run");
    setError(null);
    try {
      setRes(await api<RunResult>("/api/code/run", { body: { source: code, input } }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function askMentor(mode: "error" | "ask") {
    setBusy(mode);
    setError(null);
    try {
      const a = await api<MentorAnswer>("/api/mentor", { body: { lessonId: null, mode, code, input, question: mode === "ask" ? question : null }, timeoutMs: 120_000 });
      setAnswer({ ...a, label: mode === "error" ? "About your error" : `You asked: ${question.slice(0, 80)}` });
      if (a.remaining !== null) setRemaining(a.remaining);
      if (mode === "ask") setQuestion("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function loadExample(id: string) {
    setExampleId(id);
    const ex = examples.find((e) => e.id === id);
    if (!ex) return;
    if (code !== STARTER && code !== examples.find((e) => e.id === exampleId)?.code && !window.confirm("Replace your current code with this example?")) return;
    setCode(ex.code);
    setInput(ex.input);
    setRes(null);
  }

  const failed = res && (res.compile.status !== "success" || res.run?.status !== "ok");
  const status = !res ? null : res.compile.status !== "success" ? (res.compile.status === "rejected" ? "Not allowed here" : "Compile error")
    : res.run?.status === "ok" ? `Ran successfully in ${res.run.timeMs} ms` : res.run?.detail ?? res.run?.status;
  const groups = [...new Set(examples.map((e) => e.group))];

  return (
    <div className="space-y-4">
      {!available && <Callout tone="hint" title="Code execution isn't available right now.">{message ?? "Programs can't be compiled or run on this server right now."} Nothing will be simulated.</Callout>}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="pg-example" className="text-sm font-semibold">Load an example</label>
        <select id="pg-example" value={exampleId} onChange={(e) => loadExample(e.target.value)} className="h-9 max-w-full rounded-[0.75rem] border border-line bg-surface px-2 text-sm">
          <option value="">— choose a lesson example —</option>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {examples.filter((e) => e.group === g).map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <CodeEditor value={code} onChange={setCode} height={420} label="Playground code" />
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="pg-input" className="text-sm font-semibold">Input (stdin)</label>
            <textarea id="pg-input" value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-line-strong bg-surface p-2 font-mono text-sm" spellCheck={false} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={busy !== null || !available}>{busy === "run" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Play size={16} aria-hidden />} {busy === "run" ? "Running…" : "Run"}</Button>
            <Button variant="ghost" onClick={() => { setCode(STARTER); setInput("21"); setExampleId(""); setRes(null); setAnswer(null); }}><RotateCcw size={15} aria-hidden /> Reset</Button>
          </div>
          <div className="flex-1" aria-live="polite">
            <p className="text-sm font-semibold">Output {status && <span className="font-normal text-ink-3">· {status}</span>}</p>
            <pre className="mt-1 min-h-40 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-code-bg p-3 font-mono text-sm text-code-ink">
              {error ?? (res ? (res.compile.status !== "success" ? res.compile.output : `${res.run?.stdout || "(no output)"}${res.run?.stderr ? `\n[stderr] ${res.run.stderr}` : ""}`) : "Your program's output appears here.")}
            </pre>
            {res?.feedback.map((f, i) => (
              <div key={i} className="mt-2 rounded-xl border border-hint/30 bg-hint-soft px-3 py-2 text-sm">
                <p className="font-semibold text-ink">{f.title}{f.line ? <span className="font-normal text-ink-2"> · line {f.line}</span> : null}</p>
                <Markdown text={f.body} className="mt-1 text-ink-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <section aria-label="Mentor" className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold"><Sparkles size={18} className="text-concept" aria-hidden /> Ask your mentor</h2>
          {mentor.aiEnabled ? <Badge tone="concept">AI mentor on{remaining !== null ? ` · ${remaining} of ${mentor.dailyLimit} left today` : ""}</Badge> : <Badge>Built-in help</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => askMentor("error")} disabled={busy !== null || !code.trim()}>
            {busy === "error" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Bug size={15} aria-hidden />} {failed ? "Explain this error" : "Explain what my code does wrong"}
          </Button>
        </div>
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (question.trim()) askMentor("ask"); }}>
          <label htmlFor="pg-ask" className="sr-only">Ask a question</label>
          <input id="pg-ask" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={1000} placeholder={mentor.aiEnabled ? "Ask about your code or any C++ idea…" : "Ask a question (AI is off)"}
            className="h-9 min-w-0 flex-1 rounded-[0.75rem] border border-line bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
          <Button size="sm" type="submit" disabled={busy !== null || !question.trim()} aria-label="Send question">{busy === "ask" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Send size={15} aria-hidden />}</Button>
        </form>
        {answer && (
          <div className="mt-3 rounded-xl border border-line bg-sunken/50 p-3" aria-live="polite">
            <div className="mb-2 flex flex-wrap items-center gap-2"><MessageCircleQuestion size={16} aria-hidden /><p className="text-sm font-semibold">{answer.label}</p><Badge tone={answer.source === "ai" ? "concept" : "neutral"}>{answer.source === "ai" ? "AI mentor" : "Built-in"}</Badge></div>
            {answer.notice && <p className="mb-2 text-xs text-ink-3">{answer.notice}</p>}
            <Markdown text={answer.text} className="space-y-2 text-sm leading-relaxed text-ink-2" />
          </div>
        )}
      </section>
      <p className="text-xs text-ink-3">The playground is for experimenting — it never changes your progress. Programs run in an isolated sandbox with time, memory and output limits.</p>
    </div>
  );
}
