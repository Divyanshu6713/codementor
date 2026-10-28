import type { Metadata } from "next";
import Link from "next/link";
import { RecoverWithCodeForm } from "@/components/auth/PasswordResetForms";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
      <p className="mt-1 mb-6 text-sm text-ink-2">Use the recovery code you saved when you created your account to choose a new password.</p>
      <RecoverWithCodeForm />
      <div className="mt-6 space-y-2 rounded-xl bg-sunken p-4 text-sm text-ink-2">
        <p className="font-semibold text-ink">Lost the recovery code too?</p>
        <p>If a parent has linked their account to yours, they can create a reset link for you from their dashboard. Otherwise ask whoever runs this CodeMentor site — an admin can create one.</p>
      </div>
      <p className="mt-6 text-center text-sm text-ink-2">
        Remembered it? <Link href="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
      </p>
    </Card>
  );
}
