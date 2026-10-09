import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Let&apos;s get you started</h1>
      <p className="mt-1 mb-6 text-sm text-ink-2">We only ask for what helps us teach you. No email, no ads, no public profile.</p>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <p className="mt-6 text-center text-sm text-ink-2">
        Already have an account? <Link href="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
      </p>
    </Card>
  );
}
