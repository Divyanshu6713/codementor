"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { GraduationCap, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Callout, Field, inputClass } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<"STUDENT" | "PARENT">(params.get("role") === "parent" ? "PARENT" : "STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries()) as Record<string, string>;
    try {
      const res = await api<{ redirect: string }>(`/api/auth/${mode}`, { body: mode === "signup" ? { ...body, role } : body });
      const next = params.get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : res.redirect);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">I am…</legend>
          <div className="grid grid-cols-2 gap-2">
            {([["STUDENT", "A learner", GraduationCap], ["PARENT", "A parent", Users]] as const).map(([value, label, Icon]) => (
              <label key={value} className={clsx("flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors", role === value ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong hover:bg-sunken")}>
                <input type="radio" name="role-choice" value={value} checked={role === value} onChange={() => setRole(value)} className="sr-only" />
                <Icon size={18} aria-hidden /> {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {mode === "signup" && (
        <Field label={role === "STUDENT" ? "What should we call you?" : "Your name"} htmlFor="displayName" hint={role === "STUDENT" ? "A first name or nickname is enough." : undefined}>
          <input id="displayName" name="displayName" required maxLength={40} className={inputClass} autoComplete="given-name" />
        </Field>
      )}
      <Field label="Username" htmlFor="username" hint={mode === "signup" ? "No email needed. Letters, numbers, dots, dashes or underscores." : undefined}>
        <input id="username" name="username" required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_.\-]+" className={inputClass} autoComplete="username" autoCapitalize="none" spellCheck={false} />
      </Field>
      <Field label="Password" htmlFor="password" hint={mode === "signup" ? "At least 8 characters." : undefined}>
        <input id="password" name="password" type="password" required minLength={mode === "signup" ? 8 : 1} maxLength={128} className={inputClass} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
      </Field>
      {error && <Callout tone="danger">{error}</Callout>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Just a moment…" : mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
