"use client";

import { useState } from "react";
import { CircleAlert, Eraser, FileText, Footprints, Loader2, Play, RotateCcw, Save } from "lucide-react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { Button, Callout, inputClass } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { RunOutput, type PyRunResult } from "./Output";
import { TraceOutput } from "./ExercisePanel";

export interface Sample { id: string; label: string; group: string; code: string; input: string }

const STARTER = `# Your Python workspace — write anything and press Run.
name = input("What's your name? ")
print(f"Hello, {name}!")
for i in range(1, 4):
    print(i, "squared is", i * i)
`;

type Result = { kind: "run"; data: PyRunResult } | { kind: "trace"; data: Parameters<typeof TraceOutput>[0]["r"]; code: string } | { kind: "error"; message: string };

/**
 * The free Python workspace: editor, input, Run, step-through trace, output console, samples,
 * one optional data file, and five save slots kept on the server. Experimenting never changes progress.
 */
export function Workspace({ samples, initial, slots, exec }: {
  samples: Sample[];
  initial: { code: string; input: string; sampleId: string | null } | null;
  slots: { slot: number; code: string; updatedAt: string }[];
  exec: { available: boolean; devOnly: boolean; message: string | null; isolation: string | null };
}) {
  const [code, setCode] = useState(initial?.code ?? STARTER);
  const [input, setInput] = useState(initial?.input ?? "Asha");
  const [sampleId, setSampleId] = useState(initial?.sampleId ?? "");
  const [fileName, setFileName] = useState("data.txt");
  const [fileText, setFileText] = useState("");
  const [showFile, setShowFile] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState<"run" | "trace" | "save" | null>(null);
  const [slot, setSlot] = useState(1);
  const [saved, setSaved] = useState(() => new Map(slots.map((s) => [s.slot, s])));
  const [notice, setNotice] = useState<string | null>(null);
  const files = showFile && fileText ? [{ name: fileName.trim() || "data.txt", content: fileText }] : [];

  async function go(kind: "run" | "trace") {
    setBusy(kind);
    try {
      const data = await api<PyRunResult & Parameters<typeof TraceOutput>[0]["r"]>(`/api/python/${kind}`, { body: { source: code, input, files } });
      setResult(kind === "run" ? { kind, data } : { kind, data, code });
    } catch (e) {
      setResult({ kind: "error", message: e instanceof ApiError ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    try {
      const r = await api<{ savedAt: string }>("/api/python/save", { body: { key: `ws:${slot}`, code } });
      setSaved((m) => new Map(m).set(slot, { slot, code, updatedAt: r.savedAt }));
      setNotice(`Saved to slot ${slot}.`);
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Couldn't save.");
    } finally {
      setBusy(null);
    }
  }

  function load(n: number) {
    const s = saved.get(n);
    if (!s) return;
    if (code !== s.code && !window.confirm(`Replace the editor with slot ${n}?`)) return;
    setCode(s.code);
    setNotice(`Loaded slot ${n}.`);
  }

  function pickSample(id: string) {
    const s = samples.find((x) => x.id === id);
    setSampleId(id);
    if (!s) return;
    if (code !== STARTER && !window.confirm("Replace the editor with this sample?")) return;
    setCode(s.code);
    setInput(s.input);
    setResult(null);
  }

  const groups = [...new Set(samples.map((s) => s.group))];
  const canRun = exec.available && busy === null && code.trim().length > 0;

  return (
    <div className="space-y-4">
      {!exec.available && <Callout tone="hint" icon={<CircleAlert size={18} />} title="Running code isn't available right now">{exec.message} Nothing will be simulated.</Callout>}
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div>
          <label htmlFor="sample" className="mb-1 block text-sm font-semibold">Load a sample</label>
          <select id="sample" value={sampleId} onChange={(e) => pickSample(e.target.value)} className={inputClass}>
            <option value="">Choose a lesson example or reference snippet…</option>
            {groups.map((g) => <optgroup key={g} label={g}>{samples.filter((s) => s.group === g).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</optgroup>)}
          </select>
        </div>
        <div>
          <label htmlFor="slot" className="mb-1 block text-sm font-semibold">Save slot</label>
          <select id="slot" value={slot} onChange={(e) => setSlot(Number(e.target.value))} className={inputClass}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Slot {n}{saved.get(n) ? ` · ${new Date(saved.get(n)!.updatedAt).toLocaleDateString("en-IN")}` : " · empty"}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={save} disabled={busy !== null}><Save size={16} aria-hidden /> Save</Button>
          <Button variant="ghost" onClick={() => load(slot)} disabled={!saved.get(slot)}>Load</Button>
        </div>
      </div>
      {notice && <p className="text-xs text-ink-3" aria-live="polite">{notice}</p>}

      <CodeEditor value={code} onChange={setCode} height={380} label="Python workspace editor" language="python" />

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label htmlFor="ws-input" className="mb-1 block text-sm font-semibold">Input <span className="font-normal text-ink-3">(each <code>input()</code> reads one line)</span></label>
          <textarea id="ws-input" value={input} onChange={(e) => setInput(e.target.value)} rows={3} spellCheck={false}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-[13px] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => go("run")} disabled={!canRun}>{busy === "run" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Play size={16} aria-hidden />} Run</Button>
          <Button variant="secondary" onClick={() => go("trace")} disabled={!canRun}>{busy === "trace" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Footprints size={16} aria-hidden />} Step through</Button>
          <Button variant="ghost" onClick={() => setResult(null)} disabled={!result}><Eraser size={16} aria-hidden /> Clear output</Button>
          <Button variant="ghost" onClick={() => { if (window.confirm("Reset the editor to the starter program?")) { setCode(STARTER); setResult(null); } }}><RotateCcw size={16} aria-hidden /> Reset</Button>
        </div>
      </div>

      <details open={showFile} onToggle={(e) => setShowFile((e.target as HTMLDetailsElement).open)} className="rounded-xl border border-line bg-surface px-4 py-2 text-sm">
        <summary className="cursor-pointer font-semibold"><FileText size={14} className="mr-1 inline" aria-hidden /> Add a data file next to your program (for file-handling practice)</summary>
        <div className="mt-2 grid gap-2 sm:grid-cols-[12rem_1fr]">
          <input aria-label="File name" value={fileName} onChange={(e) => setFileName(e.target.value)} className={inputClass} />
          <textarea aria-label="File contents" value={fileText} onChange={(e) => setFileText(e.target.value)} rows={4} spellCheck={false} placeholder={"name,score\nasha,91"}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-[13px]" />
        </div>
      </details>

      <div aria-live="polite" aria-busy={busy !== null}>
        {result?.kind === "error" && <Callout tone="danger" title="That didn't work">{result.message}</Callout>}
        {result?.kind === "run" && <RunOutput r={result.data} />}
        {result?.kind === "trace" && <TraceOutput r={result.data} code={result.code} />}
      </div>

      <details className="text-xs text-ink-3">
        <summary className="cursor-pointer font-semibold">What the sandbox allows</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Python {">"}= 3.10 with the full standard library. Third-party packages (numpy, pandas, flask, requests…) are not installed — lessons show that code separately, to run on your own computer.</li>
          <li>No network access, no starting other programs, no access to files outside the program&apos;s own temporary folder (which is emptied after every run).</li>
          <li>Limits per run: about 2 seconds of CPU, 256 MB of memory, 64 KB of output.</li>
          <li>Isolation in use: {exec.isolation ?? "unknown"}</li>
        </ul>
      </details>
    </div>
  );
}
