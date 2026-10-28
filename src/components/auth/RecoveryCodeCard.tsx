"use client";

import { useState } from "react";
import { Check, Copy, Download, KeyRound } from "lucide-react";
import { Button, Callout } from "@/components/ui";

/**
 * Shows a freshly issued recovery code exactly once. The learner must confirm they saved it
 * before continuing — without email, this code is how they get back in after forgetting a password.
 */
export function RecoveryCodeCard({ code, username, onContinue, continueLabel = "Continue" }: { code: string; username?: string; onContinue: () => void; continueLabel?: string }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  function download() {
    const text = `CodeMentor recovery code${username ? ` for ${username}` : ""}\n\n${code}\n\nUse it on the "Forgot password?" page to choose a new password.\nIt works once; you'll get a new code each time you use it.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "codementor-recovery-code.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  }

  return (
    <div className="space-y-4" role="region" aria-labelledby="recovery-title">
      <div className="flex items-center gap-2">
        <KeyRound size={20} className="text-accent" aria-hidden />
        <h2 id="recovery-title" className="text-lg font-semibold">Save your recovery code</h2>
      </div>
      <p className="text-sm text-ink-2">
        CodeMentor doesn&apos;t need your email, so this code is how you get back in if you forget your password. Write it down or download it, and keep it somewhere safe. It&apos;s shown only now.
      </p>
      <p className="rounded-xl border border-line-strong bg-sunken px-4 py-3 text-center font-mono text-xl font-semibold tracking-wider" data-testid="recovery-code">{code}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setSaved(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copied ? "Copied" : "Copy"}
        </Button>
        <Button type="button" variant="secondary" onClick={download}><Download size={16} aria-hidden /> Download</Button>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-0.5" />
        <span>I&apos;ve saved my recovery code.</span>
      </label>
      <Callout tone="hint">Anyone with your username and this code can change your password — keep it private, like a password.</Callout>
      <Button type="button" size="lg" className="w-full" disabled={!saved} onClick={onContinue}>{continueLabel}</Button>
    </div>
  );
}
