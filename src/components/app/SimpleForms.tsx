"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Callout, Field, inputClass } from "@/components/ui";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button variant="ghost" size="sm" onClick={async () => {
      const r = await api<{ redirect: string }>("/api/auth/logout", { body: {} }).catch(() => ({ redirect: "/" }));
      router.push(r.redirect);
      router.refresh();
    }}>
      <LogOut size={16} aria-hidden /> Sign out
    </Button>
  );
}

export function LinkChildForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try {
        await api("/api/parent/link", { body: { code } });
        setCode("");
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
    }}>
      <Field label="Link code from the student's Settings page" htmlFor="code">
        <input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12} className={`${inputClass} font-mono tracking-widest`} autoComplete="off" />
      </Field>
      <Button type="submit" disabled={busy || code.length < 6}>Link account</Button>
      {error && <Callout tone="danger" className="sm:col-span-2">{error}</Callout>}
    </form>
  );
}

export function QuestionToggle({ questionId, status }: { questionId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const next = status === "active" ? "disabled" : "active";
  return (
    <Button size="sm" variant={status === "active" ? "ghost" : "secondary"} disabled={busy} onClick={async () => {
      setBusy(true);
      await api("/api/admin/question-status", { body: { questionId, status: next } }).catch(() => undefined);
      router.refresh();
      setBusy(false);
    }}>
      {status === "active" ? "Disable" : status === "pending_review" ? "Approve" : "Enable"}
    </Button>
  );
}

export function GenerateQuestionsForm({ concepts, aiAvailable }: { concepts: { id: string; title: string }[]; aiAvailable: boolean }) {
  const router = useRouter();
  const [concept, setConcept] = useState(concepts[0]?.id ?? "");
  const [difficulty, setDifficulty] = useState(2);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      setResult(null);
      try {
        const r = await api<{ accepted: unknown[]; rejected: { reason: string }[] }>("/api/admin/generate", { body: { conceptId: concept, difficulty } });
        setResult(`${r.accepted.length} passed validation (now awaiting review), ${r.rejected.length} rejected${r.rejected.length ? `: ${r.rejected.map((x) => x.reason).join("; ")}` : ""}.`);
        router.refresh();
      } catch (err) {
        setResult((err as Error).message);
      } finally {
        setBusy(false);
      }
    }}>
      <Field label="Concept" htmlFor="gen-concept">
        <select id="gen-concept" value={concept} onChange={(e) => setConcept(e.target.value)} className={inputClass}>{concepts.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
      </Field>
      <Field label="Difficulty" htmlFor="gen-diff">
        <select id="gen-diff" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className={inputClass}>{[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}</option>)}</select>
      </Field>
      <Button type="submit" disabled={busy || !aiAvailable}>{busy ? "Generating and validating…" : "Generate 3 coding questions"}</Button>
      {!aiAvailable && <p className="w-full text-sm text-ink-3">Needs an AI provider (ANTHROPIC_API_KEY) and the code runner.</p>}
      {result && <p className="w-full text-sm text-ink-2" role="status">{result}</p>}
    </form>
  );
}
