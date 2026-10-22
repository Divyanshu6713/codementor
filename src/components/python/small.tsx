"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Eye, Footprints, Loader2, Lock, Terminal } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { normalizeOutputForCompare } from "./normalize";
import { TraceOutput } from "./ExercisePanel";

/**
 * Active-time heartbeat for the dashboard's "time spent": every 30 s, if the tab is visible and the
 * learner pressed a key, clicked or scrolled in the last minute, the server adds up to 30 s.
 */
export function Heartbeat() {
  const last = useRef(0);
  useEffect(() => {
    const mark = () => { last.current = Date.now(); };
    mark();
    const events = ["keydown", "pointerdown", "scroll", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const t = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - last.current < 60_000) {
        api("/api/python/heartbeat", { body: { seconds: 30 } }).catch(() => undefined);
      }
    }, 30_000);
    return () => {
      clearInterval(t);
      events.forEach((e) => window.removeEventListener(e, mark));
    };
  }, []);
  return null;
}

/** Predict, then reveal: the learner writes their guess before seeing the verified output. */
export function PredictReveal({ output, input, code, raises, files = [], workspaceHref, canRun }: { output: string; input?: string; code: string; raises?: string; files?: { name: string; content: string }[]; workspaceHref: string; canRun: boolean }) {
  const [guess, setGuess] = useState("");
  const [shown, setShown] = useState(false);
  const [trace, setTrace] = useState<Parameters<typeof TraceOutput>[0]["r"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const match = shown && guess.trim() && normalizeOutputForCompare(guess) === normalizeOutputForCompare(output);

  async function stepThrough() {
    setBusy(true);
    setError(null);
    try {
      setTrace(await api("/api/python/trace", { body: { source: code, input: input ?? "", files } }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't run the example.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <FilesList files={files} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="predict-guess" className="mb-1 block text-xs font-semibold text-ink-3">Your prediction {input && <span className="font-normal">(input: {input.trimEnd().replace(/\n/g, " ⏎ ")})</span>}</label>
          <textarea id="predict-guess" value={guess} onChange={(e) => setGuess(e.target.value)} rows={Math.max(3, output.split("\n").length)} spellCheck={false} disabled={shown}
            placeholder="Type what you think it prints…"
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-[13px] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-ink-3">Real output</p>
          {shown ? (
            <div className="animate-rise space-y-1">
              <pre className="whitespace-pre-wrap rounded-xl bg-code-bg p-3 font-mono text-[13px] text-code-ink">{output.trimEnd() || "(nothing)"}</pre>
              {raises && <p className="text-xs text-danger">…and then the program stops with <code>{raises}</code> (the traceback goes to the error output).</p>}
              {guess.trim() && <p className={match ? "text-sm font-semibold text-success" : "text-sm text-ink-2"}>{match ? "Your prediction was exactly right!" : "Compare it with your prediction — where did it differ, and why?"}</p>}
            </div>
          ) : (
            <div className="flex h-[calc(100%-1.25rem)] min-h-20 flex-wrap items-center gap-3 rounded-xl border border-dashed border-line-strong p-3">
              <p className="text-sm text-ink-2">Predict first — then check yourself.</p>
              <Button size="sm" variant="secondary" onClick={() => setShown(true)}><Eye size={14} aria-hidden /> Reveal the output</Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={stepThrough} disabled={!canRun || busy}>{busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Footprints size={14} aria-hidden />} Step through it line by line</Button>
        <ButtonLink href={workspaceHref} size="sm" variant="ghost" className="h-auto! min-h-8 whitespace-normal! py-1.5 text-left"><Terminal size={14} aria-hidden /> Open in the workspace and change it</ButtonLink>
      </div>
      {!canRun && <p className="text-xs text-ink-3">Stepping through needs the code runner, which isn&apos;t available right now.</p>}
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      {trace && <TraceOutput r={trace} code={code} />}
    </div>
  );
}

/** Helper modules / data files that sit next to a program, shown read-only. */
export function FilesList({ files }: { files: { name: string; content: string }[] }) {
  if (!files.length) return null;
  return (
    <details className="rounded-xl border border-line bg-surface px-4 py-2 text-sm">
      <summary className="cursor-pointer font-semibold">Files next to this program: {files.map((f) => f.name).join(", ")}</summary>
      <div className="mt-2 space-y-2">
        {files.map((f) => (
          <div key={f.name} className="overflow-hidden rounded-xl border border-code-line bg-code-bg">
            <p className="border-b border-code-line px-3 py-1 font-mono text-xs text-code-dim">{f.name}</p>
            <pre className="max-h-60 overflow-auto p-3 font-mono text-[12.5px] text-code-ink">{f.content}</pre>
          </div>
        ))}
      </div>
    </details>
  );
}

/** Explicit learner choice to open a lesson before its prerequisites are complete. */
export function UnlockButton({ lessonId, label = "Open it anyway" }: { lessonId: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button size="sm" variant="secondary" disabled={busy} onClick={async () => {
      setBusy(true);
      try {
        await api("/api/python/unlock", { body: { lessonId } });
        router.refresh();
      } finally {
        setBusy(false);
      }
    }}><Lock size={14} aria-hidden /> {label}</Button>
  );
}

export function GuidedToggle({ guided }: { guided: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={guided} disabled={busy} onChange={async (e) => {
        setBusy(true);
        try {
          await api("/api/python/settings", { body: { guided: e.target.checked } });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }} />
      <span><span className="font-semibold">Guided order</span> <span className="text-ink-3">— unlock lessons as you master the ones before (you can still open any lesson on purpose)</span></span>
    </label>
  );
}
