"use client";

import clsx from "clsx";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Callout, buttonClass } from "@/components/ui";

/**
 * One click to start: creates a guest account (no username, password or email) and goes straight
 * into the app. `variant="cards"` shows the two starting points side by side.
 */
export function GuestStart({ variant = "button", label = "Start learning", className, tone = "primary", path = "beginner" }: { variant?: "button" | "cards"; label?: string; className?: string; tone?: "primary" | "brand" | "secondary"; path?: "beginner" | "python" }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(start: "beginner" | "placement" | "python") {
    setBusy(start);
    setError(null);
    try {
      const res = await api<{ redirect: string }>("/api/auth/guest", { body: { start } });
      router.push(res.redirect);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  if (variant === "button") {
    return (
      <div className={className}>
        <button type="button" onClick={() => start(path)} disabled={busy !== null} className={buttonClass(tone, "lg")}>
          {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null} {label} <ArrowRight size={18} aria-hidden />
        </button>
        {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
      </div>
    );
  }

  const cards = [
    { key: "beginner" as const, title: "I'm new to programming", text: "Start with lesson 1 — what a program is — and build up step by step.", cta: "Start lesson 1" },
    { key: "placement" as const, title: "I already know some C++", text: "Take a short adaptive placement check so you skip what you already know.", cta: "Find my level" },
  ];
  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <button key={c.key} type="button" onClick={() => start(c.key)} disabled={busy !== null}
            className={clsx("group flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-6 text-left shadow-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-pop disabled:opacity-60")}>
            <span className="text-lg font-bold">{c.title}</span>
            <span className="mt-1 flex-1 text-sm text-ink-2">{c.text}</span>
            <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-accent">
              {busy === c.key ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}{c.cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </button>
        ))}
      </div>
      {error && <Callout tone="danger" className="mt-4">{error}</Callout>}
    </div>
  );
}
