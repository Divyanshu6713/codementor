"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Callout, Field, inputClass } from "@/components/ui";
import { RecoveryCodeCard } from "./RecoveryCodeCard";

type Result = { redirect: string; recoveryCode: string };

function useReset() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  async function submit(url: string, body: Record<string, string>) {
    setBusy(true);
    setError(null);
    try {
      setResult(await api<Result>(url, { body }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const finish = () => { if (result) { router.push(result.redirect); router.refresh(); } };
  return { busy, error, result, submit, finish };
}

function Done({ result, username, finish }: { result: Result; username?: string; finish: () => void }) {
  return (
    <div className="space-y-5">
      <Callout tone="success" title="Password changed">You&apos;re signed in. Every other device has been signed out.</Callout>
      <RecoveryCodeCard code={result.recoveryCode} username={username} onContinue={finish} continueLabel="Continue to CodeMentor" />
    </div>
  );
}

function NewPasswordFields() {
  return (
    <>
      <Field label="New password" htmlFor="password" hint="At least 8 characters.">
        <input id="password" name="password" type="password" required minLength={8} maxLength={128} className={inputClass} autoComplete="new-password" />
      </Field>
      <Field label="Type it again" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" required minLength={8} maxLength={128} className={inputClass} autoComplete="new-password" />
      </Field>
    </>
  );
}

function read(form: HTMLFormElement): Record<string, string> | string {
  const body = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
  if (body.password !== body.confirm) return "The two passwords don't match.";
  delete body.confirm;
  return body;
}

/** Forgot password: username + recovery code. */
export function RecoverWithCodeForm() {
  const { busy, error, result, submit, finish } = useReset();
  const [mismatch, setMismatch] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  if (result) return <Done result={result} username={username} finish={finish} />;
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const body = read(e.currentTarget);
        if (typeof body === "string") return setMismatch(body);
        setMismatch(null);
        setUsername(body.username);
        void submit("/api/auth/recover", body);
      }}
    >
      <Field label="Username" htmlFor="username">
        <input id="username" name="username" required maxLength={64} className={inputClass} autoComplete="username" autoCapitalize="none" spellCheck={false} />
      </Field>
      <Field label="Recovery code" htmlFor="code" hint="The code you saved when you created your account, like 7KQ2-…">
        <input id="code" name="code" required maxLength={40} className={`${inputClass} font-mono uppercase tracking-wider`} autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} />
      </Field>
      <NewPasswordFields />
      {(mismatch || error) && <Callout tone="danger">{mismatch ?? error}</Callout>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Checking…" : "Set new password"}</Button>
    </form>
  );
}

/** A one-time reset link from an admin or a parent. */
export function ResetWithLinkForm({ token, username }: { token: string; username: string }) {
  const { busy, error, result, submit, finish } = useReset();
  const [mismatch, setMismatch] = useState<string | null>(null);
  if (result) return <Done result={result} username={username} finish={finish} />;
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const body = read(e.currentTarget);
        if (typeof body === "string") return setMismatch(body);
        setMismatch(null);
        void submit("/api/auth/reset", { ...body, token });
      }}
    >
      <NewPasswordFields />
      {(mismatch || error) && <Callout tone="danger">{mismatch ?? error}</Callout>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Saving…" : "Set new password"}</Button>
    </form>
  );
}
