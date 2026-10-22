"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Badge, Button, Callout, EmptyState, inputClass } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { PublicQuestion } from "@/content/python";
import { QuestionCard } from "./QuestionCard";

type Scope = { type: "lesson" | "module"; id: string } | { type: "mixed" | "weak" | "level"; id?: string };
interface Next { question: PublicQuestion | null; targetDifficulty: number | null; reason: string }

export interface ScopeOption { value: string; label: string; group: string }

const decode = (v: string): Scope => {
  const [type, id] = v.split(":");
  return (type === "lesson" || type === "module") ? { type, id } : { type: type as "mixed" | "weak" | "level", id: id || undefined };
};

/**
 * Practice mode: one question at a time, no solutions shown unless asked. The server picks the
 * next question at the learner's level (it gets harder after two right, easier after a miss).
 */
export function PracticeRunner({ options, initial }: { options: ScopeOption[]; initial: string }) {
  const [scope, setScope] = useState(initial);
  const [next, setNext] = useState<Next | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [tally, setTally] = useState({ right: 0, total: 0 });
  const [round, setRound] = useState(0);

  const load = useCallback(async (v: string) => {
    setBusy(true);
    setError(null);
    setAnswered(null);
    try {
      setNext(await api<Next>("/api/python/practice", { body: { scope: decode(v) } }));
      setRound((r) => r + 1);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't load a question.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first question loads after mount
    void load(initial);
  }, [load, initial]);

  const groups = [...new Set(options.map((o) => o.group))];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="scope" className="mb-1 block text-sm font-semibold">What do you want to practise?</label>
          <select id="scope" value={scope} onChange={(e) => { setScope(e.target.value); setTally({ right: 0, total: 0 }); void load(e.target.value); }} className={inputClass}>
            {groups.map((g) => <optgroup key={g} label={g}>{options.filter((o) => o.group === g).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>)}
          </select>
        </div>
        <Badge tone="accent">This session: {tally.right}/{tally.total} correct</Badge>
      </div>
      {error && <Callout tone="danger" title="Something went wrong">{error}</Callout>}
      {busy && !next && <p className="flex items-center gap-2 text-sm text-ink-3"><Loader2 size={14} className="animate-spin" aria-hidden /> Choosing a question…</p>}
      {next && !next.question && <EmptyState title="Nothing to practise here yet">{next.reason}</EmptyState>}
      {next?.question && (
        <div className="space-y-3">
          <p className="text-xs text-ink-3">{next.reason}</p>
          <QuestionCard key={`${next.question.id}-${round}`} q={next.question} mode="practice" onAnswered={(ok) => {
            if (answered === null) setTally((t) => ({ right: t.right + (ok ? 1 : 0), total: t.total + 1 }));
            setAnswered(ok);
          }} />
          {answered !== null && <Button onClick={() => load(scope)} disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null} Next question <ArrowRight size={16} aria-hidden /></Button>}
        </div>
      )}
    </div>
  );
}
