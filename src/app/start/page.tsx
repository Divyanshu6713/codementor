import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GuestStart } from "@/components/auth/GuestStart";
import { getCurrentUser, homeFor } from "@/server/auth/current";

export const metadata: Metadata = { title: "Start learning" };

export default async function StartPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  return (
    <div className="bg-grid min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="main" className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Start coding in <span className="text-hero">one click</span></h1>
        <p className="mt-3 max-w-2xl text-ink-2">No sign-up, no email, no password. Your progress, XP and achievements are saved to this browser&apos;s guest account — add a username any time to keep them for good and use them on other devices.</p>
        <GuestStart variant="cards" className="mt-8" />
        <p className="mt-8 text-sm text-ink-3">Already have a username? <Link href="/login" className="font-semibold text-accent hover:underline">Sign in</Link></p>
      </main>
    </div>
  );
}
