"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { Button, Callout } from "@/components/ui";

const STARTER = `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    cout << n * 2;

    return 0;
}
`;

interface RunResult {
  compile: { status: string; output: string };
  run: { status: string; stdout: string; stderr: string; detail: string | null; timeMs: number } | null;
  isolation: string;
}

export function Playground({ available, message }: { available: boolean; message: string | null }) {
  const [code, setCode] = useState(STARTER);
  const [input, setInput] = useState("21");
  const [res, setRes] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      setRes(await api<RunResult>("/api/code/run", { body: { source: code, input } }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const status = res?.compile.status !== "success" ? (res?.compile.status === "rejected" ? "Not allowed here" : "Compile error")
    : res.run?.status === "ok" ? "Ran successfully" : res.run?.detail ?? res.run?.status;

  return (
    <div className="space-y-4">
      {!available && <Callout tone="hint" title="Code execution environment not configured.">{message ?? "Programs can't be compiled or run on this server right now."} Nothing will be simulated.</Callout>}
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <CodeEditor value={code} onChange={setCode} height={420} label="Playground code" />
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="pg-input" className="text-sm font-semibold">Input (stdin)</label>
            <textarea id="pg-input" value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-line-strong bg-surface p-2 font-mono text-sm" spellCheck={false} />
          </div>
          <div className="flex gap-2">
            <Button onClick={run} disabled={busy || !available}><Play size={16} aria-hidden /> {busy ? "Running…" : "Run"}</Button>
            <Button variant="ghost" onClick={() => { setCode(STARTER); setRes(null); }}><RotateCcw size={15} aria-hidden /> Reset</Button>
          </div>
          <div className="flex-1" aria-live="polite">
            <p className="text-sm font-semibold">Output {res && <span className="font-normal text-ink-3">· {status}</span>}</p>
            <pre className="mt-1 min-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-code-bg p-3 font-mono text-sm text-code-ink">
              {error ?? (res ? (res.compile.status !== "success" ? res.compile.output : `${res.run?.stdout || "(no output)"}${res.run?.stderr ? `\n[stderr] ${res.run.stderr}` : ""}`) : "Your program's output appears here.")}
            </pre>
          </div>
        </div>
      </div>
      <p className="text-xs text-ink-3">The playground is for experimenting — it never changes your progress. Programs run in an isolated sandbox with time, memory and output limits.</p>
    </div>
  );
}
