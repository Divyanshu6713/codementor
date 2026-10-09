import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { requirePageUser } from "@/server/auth/current";
import { getProfile } from "@/server/services/students";

export const metadata: Metadata = { title: "Getting started" };

export default async function OnboardingPage() {
  const user = await requirePageUser(["STUDENT"]);
  const profile = await getProfile(user.id);
  if (profile?.onboardedAt) redirect("/app");
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Logo href="/app" />
        <ThemeToggle />
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 pb-16 pt-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Step 1 of 2</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Let&apos;s understand how you code.</h1>
        <p className="mt-2 mb-8 text-ink-2">A few quick questions so your lessons start at the right level. You can change these later.</p>
        <Card className="p-5 sm:p-8">
          <OnboardingForm initialName={user.displayName} />
        </Card>
      </main>
    </div>
  );
}
