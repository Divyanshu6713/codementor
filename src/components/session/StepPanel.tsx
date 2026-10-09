"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { Markdown } from "@/components/Markdown";
import { CodeBlock } from "@/components/CodeBlock";
import { DryRun } from "@/components/lesson/DryRun";
import { Visual } from "@/components/lesson/Visuals";
import { Badge, Button, Callout } from "@/components/ui";
import type { StepView } from "./types";

export function StepPanel({ sessionId, step, busy, tutorAvailable, onContinue }: {
  sessionId: string; step: StepView; busy: boolean; tutorAvailable: boolean; onContinue: () => Promise<void>;
}) {
  const [alt, setAlt] = useState<{ text: string } | null>(null);
  const [altState, setAltState] = useState<"idle" | "loading" | "unavailable" | "error">("idle");

  async function explainDifferently() {
    setAltState("loading");
    try {
      const res = await api<{ result: { text: string } | null }>(`/api/learning-session/${sessionId}/explain`, { body: { stepKey: step.key } });
      if (res.result) {
        setAlt(res.result);
        setAltState("idle");
      } else setAltState("unavailable");
    } catch {
      setAltState("error");
    }
  }

  return (
    <article className="space-y-5 animate-rise" aria-labelledby="step-title">
      {step.reteach && <Badge tone="concept">Let&apos;s look at it another way</Badge>}
      <h2 id="step-title" className="text-2xl font-bold tracking-tight">{step.title}</h2>
      {step.body && <Markdown text={step.body} />}
      {step.visual && <Visual id={step.visual} />}
      {step.trace && <DryRun code={step.trace.code} steps={step.trace.steps} />}
      {step.code && (
        <div className="space-y-2">
          <CodeBlock code={step.code.code} />
          <div className="rounded-xl bg-code-bg px-3 py-2 font-mono text-sm text-code-ink"><span className="text-xs text-code-dim">Output</span><pre>{step.code.output}</pre></div>
        </div>
      )}
      {alt && (
        <div className="rounded-xl border border-concept/30 bg-concept-soft p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-concept"><Sparkles size={15} aria-hidden /> Explained differently (AI tutor)</p>
          <Markdown text={alt.text} />
        </div>
      )}
      {altState === "unavailable" && <Callout tone="neutral">The AI tutor isn&apos;t configured, so there&apos;s no alternative explanation for this step. If a checkpoint shows a misunderstanding, the lesson will re-teach it another way automatically.</Callout>}
      {altState === "error" && <Callout tone="danger">Couldn&apos;t get another explanation right now. Please try again.</Callout>}
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <Button size="lg" onClick={() => void onContinue()} disabled={busy}>{busy ? "Loading…" : "Continue"}</Button>
        {step.body && step.kind !== "summary" && tutorAvailable && !alt && (
          <Button variant="ghost" onClick={explainDifferently} disabled={altState === "loading"}>
            <Sparkles size={16} aria-hidden /> {altState === "loading" ? "Thinking…" : "Explain it differently"}
          </Button>
        )}
      </div>
    </article>
  );
}
