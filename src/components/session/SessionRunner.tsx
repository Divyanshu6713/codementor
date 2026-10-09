"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Callout } from "@/components/ui";
import type { StudentAnswer } from "@/types/questions";
import { ItemPanel } from "./ItemPanel";
import { StepPanel } from "./StepPanel";
import { TutorPanel } from "./TutorPanel";
import type { View } from "./types";

/**
 * Renders whatever the server says is current (a lesson step, a notice, or a question) and sends
 * actions back. All learning decisions happen on the server.
 */
export function SessionRunner({ initial }: { initial: View }) {
  const router = useRouter();
  const [view, setView] = useState<View>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const base = `/api/learning-session/${view.id}`;

  useEffect(() => {
    if (view.entry.kind === "finished") router.replace(`/app/session/${view.id}/report`);
  }, [view.entry.kind, view.id, router]);

  async function act<T>(fn: () => Promise<T>): Promise<T | null> {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const e = err as Error & { code?: string };
      setError(e.message);
      // A stale item (e.g. another tab moved on) is fixed by reloading the current state.
      if (e.code === "stale_item" || e.code === "session_finished") setView(await api<View>(base));
      return null;
    } finally {
      setBusy(false);
    }
  }

  const advance = () => act(async () => {
    setView(await api<View>(`${base}/advance`, { body: {} }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }).then(() => undefined);

  const answer = (a: StudentAnswer, selfConfidence: "guessing" | "somewhat" | "very" | null, durationMs: number) => act(async () => {
    if (view.entry.kind !== "item") return;
    const res = await api<{ view: View }>(`${base}/answer`, { body: { itemKey: view.entry.item.itemKey, answer: a, selfConfidence, durationMs } });
    setView(res.view);
  }).then(() => undefined);

  const itemAction = (action: "hint" | "solution" | "skip") => act(async () => {
    if (view.entry.kind !== "item") return;
    const res = await api<{ view: View }>(`${base}/${action}`, { body: { itemKey: view.entry.item.itemKey } });
    setView(res.view);
  }).then(() => undefined);

  const end = () => act(async () => {
    setView(await api<View>(`${base}/end`, { body: {} }));
  });

  const pct = view.progress.total ? Math.min(100, Math.round((view.progress.done / view.progress.total) * 100)) : null;
  const isItem = view.entry.kind === "item";

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{view.kind === "diagnostic" ? "Placement check" : view.conceptTitle ?? view.kind}</p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{view.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        {view.kind !== "diagnostic" && (
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold shadow-card" aria-live="polite">
            <span className="text-clay tabular">+{view.score.xp} XP</span>
            <span className="text-ink-3">·</span>
            <span className="tabular" title="Correct answers in a row with no hints">{view.score.soloRun} solo in a row</span>
          </div>
        )}
        {view.status === "active" && (confirmEnd ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-2">End now? What you&apos;ve done still counts.</span>
            <Button size="sm" variant="secondary" onClick={() => void end()} disabled={busy}>End session</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmEnd(false)}>Keep going</Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmEnd(true)}><X size={16} aria-hidden /> End session</Button>
        ))}
        </div>
      </header>

      <div className="h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct ?? undefined}
        aria-valuetext={pct === null ? `${view.progress.done} answered` : `${pct}%`}>
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct ?? Math.min(100, view.progress.done * 9)}%` }} />
      </div>

      {view.execution.available && view.execution.devOnly && isItem && view.entry.kind === "item" && view.entry.item.question.type === "write_code" && (
        <p className="flex items-center gap-1.5 text-xs text-ink-3" title={view.execution.isolation ?? ""}><ShieldAlert size={14} aria-hidden /> Code runs in a local development sandbox (resource limits, no network isolation).</p>
      )}

      {error && <Callout tone="danger">{error}</Callout>}

      <div className={isItem ? "grid gap-6 xl:grid-cols-[1fr_320px]" : "grid gap-6 xl:grid-cols-[1fr_320px]"}>
        <div className="min-w-0 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-7">
          {view.entry.kind === "step" && (
            <StepPanel key={view.entry.step.key} sessionId={view.id} step={view.entry.step} busy={busy} tutorAvailable={view.tutor.available} onContinue={advance} />
          )}
          {view.entry.kind === "notice" && (
            <div className="space-y-4">
              <Callout tone="hint" title={view.entry.title}>{view.entry.body}</Callout>
              <Button size="lg" onClick={() => void advance()} disabled={busy}>Continue</Button>
            </div>
          )}
          {view.entry.kind === "item" && (
            <ItemPanel
              key={view.entry.item.itemKey}
              sessionId={view.id}
              item={view.entry.item}
              busy={busy}
              executionAvailable={view.execution.available}
              onAnswer={answer}
              onHint={() => itemAction("hint")}
              onReveal={() => itemAction("solution")}
              onSkip={() => itemAction("skip")}
              onContinue={advance}
            />
          )}
          {view.entry.kind === "finished" && <p className="text-ink-2">Session complete — opening your report…</p>}
        </div>
        <aside className="space-y-4">
          {view.why.length > 0 && view.kind !== "diagnostic" && (
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm">
              <p className="font-semibold">Why this session?</p>
              <ul className="mt-2 space-y-1.5 text-ink-2">{view.why.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          )}
          {view.kind !== "diagnostic" && <TutorPanel sessionId={view.id} available={view.tutor.available} />}
          {view.kind === "diagnostic" && (
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm text-ink-2">
              <p className="font-semibold text-ink">How this check works</p>
              <p className="mt-1">Questions adapt to your answers: get one right and the next is harder; get one wrong and we check that idea once more before moving on. No hints here — it&apos;s fine not to know things yet.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
