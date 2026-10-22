"use client";

import { Eye, Terminal } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui";

/** "Predict, then reveal": the student commits to a guess before seeing the real output. */
export function PredictOutput({ output, input, playgroundHref }: { output: string; input?: string; playgroundHref: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {input && (
          <div><p className="mb-1 text-xs font-semibold text-ink-3">Input</p><pre className="rounded-xl bg-sunken p-3 font-mono text-[13px]">{input.trimEnd()}</pre></div>
        )}
        <div className={input ? "" : "sm:col-span-2"}>
          <p className="mb-1 text-xs font-semibold text-ink-3">Output</p>
          {shown
            ? <pre className="animate-rise whitespace-pre-wrap rounded-xl bg-code-bg p-3 font-mono text-[13px] text-code-ink">{output.trimEnd()}</pre>
            : (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-line-strong p-3">
                <p className="text-sm text-ink-2">Predict what it prints first — then check yourself.</p>
                <Button size="sm" variant="secondary" onClick={() => setShown(true)}><Eye size={14} aria-hidden /> Reveal the output</Button>
              </div>
            )}
        </div>
      </div>
      <ButtonLink href={playgroundHref} size="sm" variant="ghost" className="h-auto! min-h-8 whitespace-normal! py-1.5 text-left"><Terminal size={14} aria-hidden /> Open this example in the Playground and change it</ButtonLink>
    </div>
  );
}
