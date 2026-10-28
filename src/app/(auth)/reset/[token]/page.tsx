import type { Metadata } from "next";
import Link from "next/link";
import { peekResetLink } from "@/server/auth/recovery";
import { ResetWithLinkForm } from "@/components/auth/PasswordResetForms";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const account = await peekResetLink(token);
  return (
    <Card className="p-6 sm:p-8">
      {account ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
          <p className="mt-1 mb-6 text-sm text-ink-2">For <strong>{account.displayName}</strong> (username <span className="font-mono">{account.username}</span>). This link works once.</p>
          <ResetWithLinkForm token={token} username={account.username} />
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight">This link doesn&apos;t work any more</h1>
          <p className="mt-2 text-sm text-ink-2">Reset links expire after 24 hours and can only be used once. Ask for a new one, or use your recovery code.</p>
          <p className="mt-6 text-sm"><Link href="/forgot" className="font-semibold text-accent hover:underline">Use a recovery code</Link></p>
        </>
      )}
    </Card>
  );
}
