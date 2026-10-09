"use client";

import { useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { api } from "@/lib/api";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui";

interface Turn { role: "student" | "tutor"; text: string }

/** Socratic tutor chat. Only shown when an AI provider is configured; never invents results. */
export function TutorPanel({ sessionId, available }: { sessionId: string; available: boolean }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  if (!available) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-4 text-sm text-ink-2">
        <p className="flex items-center gap-1.5 font-semibold text-ink"><Bot size={16} aria-hidden /> AI tutor</p>
        <p className="mt-1">Not configured on this server. Hints, feedback and re-teaching still come from reviewed lesson content.</p>
      </div>
    );
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = msg.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    const next: Turn[] = [...turns, { role: "student", text }];
    setTurns(next);
    setMsg("");
    try {
      const res = await api<{ reply: string }>(`/api/learning-session/${sessionId}/tutor`, { body: { message: text, recentTurns: turns.slice(-8) } });
      setTurns([...next, { role: "tutor", text: res.reply }]);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex max-h-[70vh] flex-col rounded-[var(--radius-card)] border border-line bg-surface shadow-card" aria-label="Ask the tutor">
      <p className="flex items-center gap-1.5 border-b border-line px-4 py-3 text-sm font-semibold"><Bot size={16} className="text-concept" aria-hidden /> Ask the tutor</p>
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
        {!turns.length && <p className="text-ink-3">Stuck or curious? Ask a question. The tutor helps you think it through rather than handing over answers.</p>}
        {turns.map((t, i) => (
          <div key={i} className={t.role === "student" ? "ml-6 rounded-xl bg-accent-soft p-2.5 text-ink" : "mr-6 rounded-xl bg-sunken p-2.5"}>
            {t.role === "tutor" ? <Markdown text={t.text} className="space-y-2 text-ink" /> : t.text}
          </div>
        ))}
        {busy && <p className="text-ink-3">Thinking…</p>}
        {error && <p className="text-danger">{error}</p>}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
        <label htmlFor="tutor-msg" className="sr-only">Your question</label>
        <input id="tutor-msg" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={1500} placeholder="Why does i <= 5 run 5 times?" className="h-10 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-3 text-sm" />
        <Button type="submit" size="md" disabled={busy || !msg.trim()} aria-label="Send"><Send size={16} aria-hidden /></Button>
      </form>
    </section>
  );
}
