"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Field, inputClass } from "@/components/ui";
import { RecoveryCodeCard } from "@/components/auth/RecoveryCodeCard";

/** Optional: give a guest account a username and password so progress is kept for good. */
export function ClaimAccount({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState(displayName);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ username: string; code: string } | null>(null);

  if (done) {
    return (
      <RecoveryCodeCard
        code={done.code}
        username={done.username}
        continueLabel="Done"
        onContinue={() => { router.replace("/app/settings?claimed=1"); router.refresh(); }}
      />
    );
  }

  return (
    <form
      className="grid gap-3 sm:grid-cols-3 sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const r = await api<{ username: string; recoveryCode: string }>("/api/auth/claim", { body: { username, password, displayName: name } });
          setDone({ username: r.username, code: r.recoveryCode });
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Username" htmlFor="claim-user" hint="3–32 letters, numbers, . - _"><input id="claim-user" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} autoComplete="username" required /></Field>
      <Field label="Display name" htmlFor="claim-name"><input id="claim-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required maxLength={40} /></Field>
      <Field label="Password" htmlFor="claim-pw" hint="At least 8 characters"><input id="claim-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="new-password" required minLength={8} /></Field>
      <div className="sm:col-span-3">
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Keep my progress"}</Button>
        {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
      </div>
    </form>
  );
}
