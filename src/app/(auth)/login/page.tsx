import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-ink-2">Pick up exactly where you left off.</p>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <p className="mt-6 text-center text-sm text-ink-2">
        New here? <Link href="/signup" className="font-semibold text-accent hover:underline">Create an account</Link>
      </p>
    </Card>
  );
}
