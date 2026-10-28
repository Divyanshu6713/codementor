"use client";

import { useState } from "react";
import { Copy, Link2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Callout, Card, Field, inputClass } from "@/components/ui";
import { RecoveryCodeCard } from "./RecoveryCodeCard";

/** Change password and replace the recovery code. Shown to every signed-in account with a password. */
export function AccountSecurity({ hasRecoveryCode }: { hasRecoveryCode: boolean }) {
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [codePw, setCodePw] = useState("");

  return (
    <Card className="space-y-6 p-6" as="section" aria-labelledby="security">
      <h2 id="security" className="font-semibold">Password and recovery</h2>
      {msg && <Callout tone={msg.tone}>{msg.text}</Callout>}

      <form
        className="grid gap-3 sm:grid-cols-2 sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
          if (f.password !== f.confirm) return setMsg({ tone: "danger", text: "The two new passwords don't match." });
          setBusy(true);
          setMsg(null);
          try {
            await api("/api/me/password", { body: { current: f.current, password: f.password } });
            form.reset();
            setMsg({ tone: "success", text: "Password changed. Other devices have been signed out." });
          } catch (err) {
            setMsg({ tone: "danger", text: (err as Error).message });
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="sm:col-span-2"><Field label="Current password" htmlFor="sec-current"><input id="sec-current" name="current" type="password" required maxLength={128} className={inputClass} autoComplete="current-password" /></Field></div>
        <Field label="New password" htmlFor="sec-new" hint="At least 8 characters."><input id="sec-new" name="password" type="password" required minLength={8} maxLength={128} className={inputClass} autoComplete="new-password" /></Field>
        <Field label="New password again" htmlFor="sec-confirm"><input id="sec-confirm" name="confirm" type="password" required minLength={8} maxLength={128} className={inputClass} autoComplete="new-password" /></Field>
        <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Change password"}</Button></div>
      </form>

      <div className="space-y-3 border-t border-line pt-5">
        <h3 className="text-sm font-semibold">Recovery code</h3>
        {code ? (
          <RecoveryCodeCard code={code} continueLabel="Done" onContinue={() => { setCode(null); setMsg({ tone: "success", text: "New recovery code saved. The old one no longer works." }); }} />
        ) : (
          <>
            <p className="text-sm text-ink-2">
              {hasRecoveryCode
                ? "You have a recovery code. If you've lost it, make a new one — the old code stops working."
                : "You don't have a recovery code yet. Make one now so you can get back in if you forget your password."}
            </p>
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setMsg(null);
                try {
                  const r = await api<{ recoveryCode: string }>("/api/me/recovery-code", { body: { password: codePw } });
                  setCodePw("");
                  setCode(r.recoveryCode);
                } catch (err) {
                  setMsg({ tone: "danger", text: (err as Error).message });
                }
              }}
            >
              <div className="min-w-56 flex-1"><Field label="Your password" htmlFor="sec-code-pw"><input id="sec-code-pw" type="password" value={codePw} onChange={(e) => setCodePw(e.target.value)} required maxLength={128} className={inputClass} autoComplete="current-password" /></Field></div>
              <Button type="submit" variant="secondary">{hasRecoveryCode ? "Make a new recovery code" : "Make a recovery code"}</Button>
            </form>
          </>
        )}
      </div>
    </Card>
  );
}

/** Shows a freshly created reset link with a copy button. */
function LinkResult({ path, username, expiresAt }: { path: string; username: string; expiresAt: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? path : `${window.location.origin}${path}`;
  return (
    <div className="space-y-2 rounded-xl border border-line-strong bg-sunken p-3 text-sm">
      <p>Reset link for <strong className="font-mono">{username}</strong> — works once, until {new Date(expiresAt).toLocaleString()}:</p>
      <p className="break-all font-mono text-xs" data-testid="reset-link">{url}</p>
      <Button type="button" size="sm" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setCopied(false); } }}>
        <Copy size={14} aria-hidden /> {copied ? "Copied" : "Copy link"}
      </Button>
      <p className="text-xs text-ink-3">Give it only to the account&apos;s owner. Making a new link cancels this one.</p>
    </div>
  );
}

/** Admin: create a reset link for any account by username. */
export function AdminResetLinkForm() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<{ path: string; username: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setResult(null);
          try {
            setResult(await api("/api/admin/reset-link", { body: { username } }));
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <div className="min-w-56 flex-1"><Field label="Username" htmlFor="reset-user"><input id="reset-user" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={64} className={inputClass} autoCapitalize="none" spellCheck={false} /></Field></div>
        <Button type="submit" variant="secondary"><Link2 size={16} aria-hidden /> Create reset link</Button>
      </form>
      {error && <Callout tone="danger">{error}</Callout>}
      {result && <LinkResult {...result} />}
    </div>
  );
}

/** Parent: create a reset link for a linked child. */
export function ChildResetLinkButton({ studentId, name }: { studentId: string; name: string }) {
  const [result, setResult] = useState<{ path: string; username: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            setResult(await api("/api/parent/reset-link", { body: { studentId } }));
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Link2 size={14} aria-hidden /> {name} forgot their password
      </Button>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {result && <LinkResult {...result} />}
    </div>
  );
}
