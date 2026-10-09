"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-ink-2">That&apos;s on us, not you. Your saved progress is safe. Try again, or go back to the home page.</p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className="inline-flex h-10 items-center rounded-xl border border-line-strong px-4 text-sm font-semibold">Home</Link>
      </div>
    </main>
  );
}
