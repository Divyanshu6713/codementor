import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { listMistakes } from "@/server/services/students";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { StartSessionButton } from "@/components/app/StartSessionButton";

export const metadata: Metadata = { title: "My mistakes" };

export default async function MistakesPage() {
  const user = await requirePageUser(["STUDENT"]);
  const all = await listMistakes(user.id);
  const open = all.filter((m) => m.status === "open");
  const fixed = all.filter((m) => m.status === "fixed");

  return (
    <div className="space-y-8">
      <PageHeader title="My Mistakes" subtitle="Mistakes are how you learn. This book keeps the ones worth revisiting — a real misunderstanding or a logic bug, not every typo — so you can try again later." />
      {!all.length && <EmptyState title="No mistakes recorded yet">When an answer shows a misunderstanding, it lands here with an explanation and a fresh question to try.</EmptyState>}
      {open.length > 0 && (
        <section aria-labelledby="open" className="space-y-4">
          <h2 id="open" className="font-semibold">To fix ({open.length})</h2>
          {open.map((m) => (
            <Card key={m.id} className="p-5 sm:p-6" as="article">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-ink-3">Mistake #{m.number}</span>
                <Badge tone="concept">{m.topic}</Badge>
                {m.skill && <Badge>{m.skill}</Badge>}
                {m.occurrences > 1 && <Badge tone="hint">seen {m.occurrences}×</Badge>}
              </div>
              <p className="mt-3 text-sm text-ink-2">{m.question}</p>
              {m.snapshot && (/[;{}]/.test(m.snapshot) ? <CodeBlock code={m.snapshot} className="mt-3" label="Your answer" /> : <p className="mt-3 rounded-lg bg-sunken px-3 py-2 font-mono text-sm">Your answer: {m.snapshot}</p>)}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">What happened</p>
                  <div className="mt-1 text-sm text-ink"><Markdown text={m.whatHappened} className="space-y-1" /></div>
                </div>
                {m.misconception && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Possible misconception · {m.misconception.concept}</p>
                    <p className="mt-1 text-sm font-semibold">{m.misconception.title}</p>
                    <p className="text-sm text-ink-2">{m.misconception.explanation}</p>
                  </div>
                )}
              </div>
              {m.retryPrompt && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="text-sm"><span className="font-semibold">Try again:</span> <span className="text-ink-2">{m.retryPrompt}</span></p>
                  <StartSessionButton size="md" body={{ mode: "mistake", mistakeId: m.id }} label="Try it" />
                </div>
              )}
            </Card>
          ))}
        </section>
      )}
      {fixed.length > 0 && (
        <section aria-labelledby="fixed">
          <h2 id="fixed" className="mb-3 font-semibold">Fixed ({fixed.length})</h2>
          <ul className="space-y-2">
            {fixed.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                <CheckCircle2 size={18} className="shrink-0 text-success" aria-hidden />
                <span className="font-mono text-xs text-ink-3">#{m.number}</span>
                <span className="min-w-0 flex-1 truncate">{m.misconception?.title ?? m.question}</span>
                <span className="text-xs text-ink-3">{m.topic}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
