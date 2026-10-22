"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { Button, Callout, Card, Field, inputClass } from "@/components/ui";

function subscribeText(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-text"] });
  return () => obs.disconnect();
}

export function SettingsPanel({ prefs, parents, isGuest = false }: { prefs: { askConfidence: boolean; tutorRetentionDays: number }; parents: { id: string; displayName: string }[]; isGuest?: boolean }) {
  const router = useRouter();
  const [ask, setAsk] = useState(prefs.askConfidence);
  const [retention, setRetention] = useState(prefs.tutorRetentionDays);
  const [saved, setSaved] = useState<string | null>(null);
  const [code, setCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const largeText = useSyncExternalStore(subscribeText, () => document.documentElement.dataset.text === "large", () => false);

  async function save(p: { askConfidence?: boolean; tutorRetentionDays?: number }) {
    setErr(null);
    try {
      await api("/api/me/preferences", { body: p });
      setSaved("Saved.");
      setTimeout(() => setSaved(null), 1500);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      {err && <Callout tone="danger">{err}</Callout>}
      <Card className="space-y-5 p-6" as="section" aria-labelledby="learning">
        <h2 id="learning" className="font-semibold">Learning preferences {saved && <span className="ml-2 text-sm font-normal text-success" role="status">{saved}</span>}</h2>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" checked={ask} onChange={(e) => { setAsk(e.target.checked); void save({ askConfidence: e.target.checked }); }} />
          <span><span className="font-semibold">Sometimes ask “how sure are you?”</span><br /><span className="text-ink-2">Helps tell a guess apart from a misunderstanding. Asked on about one question in three, never in checks.</span></span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" checked={largeText} onChange={(e) => {
            const v = e.target.checked ? "large" : "";
            if (v) document.documentElement.dataset.text = v; else delete document.documentElement.dataset.text;
            try { localStorage.setItem("cmk-text", v); } catch { /* not persisted; applies for this visit */ }
          }} />
          <span><span className="font-semibold">Larger text</span><br /><span className="text-ink-2">Saved on this device.</span></span>
        </label>
        <Field label="Keep my AI tutor chats" htmlFor="retention" hint="Chats are only used to show you your conversation. Turning this off deletes saved chats.">
          <select id="retention" className={inputClass} value={retention} onChange={(e) => { const v = Number(e.target.value); setRetention(v); void save({ tutorRetentionDays: v }); }}>
            <option value={0}>Don&apos;t keep them</option>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
          </select>
        </Field>
      </Card>

      <Card className="space-y-4 p-6" as="section" aria-labelledby="parents">
        <h2 id="parents" className="font-semibold">Parent / mentor access</h2>
        <p className="text-sm text-ink-2">A parent, teacher or mentor you link can see a simple summary of your progress (time spent, what you&apos;re learning, what needs practice). They can&apos;t see your code or tutor chats.</p>
        {parents.length > 0 && (
          <ul className="space-y-2">
            {parents.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm">
                <span>{p.displayName}</span>
                <Button size="sm" variant="ghost" onClick={async () => { await api("/api/me/unlink-parent", { body: { parentId: p.id } }).catch((e) => setErr(e.message)); router.refresh(); }}>Remove</Button>
              </li>
            ))}
          </ul>
        )}
        {code ? (
          <div className="rounded-xl bg-accent-soft p-4">
            <p className="text-sm text-ink-2">Share this code with your parent or mentor. It works once and expires {new Date(code.expiresAt).toLocaleString()}.</p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-[0.25em] text-accent-ink">{code.code}</p>
          </div>
        ) : (
          <Button variant="secondary" onClick={async () => { try { setCode(await api("/api/me/link-code", { body: {} })); } catch (e) { setErr((e as Error).message); } }}>Create a link code</Button>
        )}
      </Card>

      <Card className="space-y-4 p-6" as="section" aria-labelledby="data">
        <h2 id="data" className="font-semibold">Your data</h2>
        {/* A file download from an API route, not page navigation — a plain link is correct here. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/me/export" className="inline-flex h-10 items-center rounded-xl border border-line-strong px-4 text-sm font-semibold hover:bg-sunken">Download my data (JSON)</a>
        <details className="rounded-xl border border-danger/30 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-danger">Delete my account</summary>
          <p className="mt-2 text-sm text-ink-2">This permanently deletes your account, progress, mistakes and code. It can&apos;t be undone.</p>
          <form className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={async (e) => {
            e.preventDefault();
            try {
              const r = await api<{ redirect: string }>("/api/me/delete", { body: { password: pw, confirm } });
              router.push(r.redirect);
            } catch (e2) { setErr((e2 as Error).message); }
          }}>
            {!isGuest && <Field label="Password" htmlFor="del-pw"><input id="del-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={inputClass} autoComplete="current-password" /></Field>}
            <Field label='Type "DELETE"' htmlFor="del-confirm"><input id="del-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} /></Field>
            <Button type="submit" variant="danger" disabled={confirm !== "DELETE" || (!isGuest && !pw)}>Delete forever</Button>
          </form>
        </details>
      </Card>
    </div>
  );
}
