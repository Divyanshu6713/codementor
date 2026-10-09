import type { Metadata } from "next";
import { Lock, TriangleAlert } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { skillMap } from "@/server/services/learner";
import { Badge, Card, ConfidenceDots, EmptyState, MasteryBar, PageHeader, STATUS_LABEL, pct, ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "My progress" };

export default async function SkillsPage() {
  const user = await requirePageUser(["STUDENT"]);
  const map = await skillMap(await getDb(), user.id);
  const any = map.some((t) => t.concepts.some((c) => c.mastery !== null));

  return (
    <div className="space-y-8">
      <PageHeader title="Skill Map" subtitle="Every number here comes from your answers. “Confidence” shows how much evidence we have — one lucky answer isn't enough to call something mastered." />
      {!any && <EmptyState title="No skill estimates yet" action={<ButtonLink href="/app/diagnostic">Take the placement check</ButtonLink>}>Your map fills in as you answer questions.</EmptyState>}
      {map.map((track) => (
        <section key={track.id} aria-labelledby={`t-${track.id}`}>
          <div className="mb-3 flex items-center gap-2">
            <h2 id={`t-${track.id}`} className="text-lg font-bold">{track.title}</h2>
            {track.status === "planned" && <Badge><Lock size={12} aria-hidden /> coming later</Badge>}
          </div>
          {track.status === "planned" ? (
            <p className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm text-ink-3">{track.concepts.map((c) => c.title).join(" · ")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {track.concepts.filter((c) => c.skills.length).map((c) => (
                <Card key={c.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{c.title}</h3>
                      <p className="text-xs text-ink-3">{c.mastered ? "Mastered" : c.mastery === null ? "Not assessed yet" : `${Math.round(c.coverage * 100)}% of skills have evidence`}</p>
                    </div>
                    <span className="font-mono text-xl font-bold">{pct(c.mastery)}</span>
                  </div>
                  <MasteryBar value={c.mastery} className="mt-2" label={`${c.title} mastery`} />
                  {c.mastery !== null && <div className="mt-1.5"><ConfidenceDots label={c.confidence} /></div>}
                  {c.activeMisconceptions.length > 0 && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-hint-soft px-2.5 py-1.5 text-xs text-hint">
                      <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden /> Working on: {c.activeMisconceptions.map((m) => `${m.title} (${m.occurrences}×)`).join(", ")}
                    </p>
                  )}
                  <ul className="mt-4 space-y-2.5">
                    {c.skills.map((s) => (
                      <li key={s.id}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="min-w-0 truncate" title={s.description}>{s.title}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            <Badge tone={STATUS_LABEL[s.status]?.tone ?? "neutral"}>{STATUS_LABEL[s.status]?.label ?? s.status}</Badge>
                            <span className="w-9 text-right font-mono text-xs text-ink-2">{pct(s.mastery)}</span>
                          </span>
                        </div>
                        <MasteryBar value={s.mastery} className="mt-1 h-1.5" label={`${s.title} mastery`} />
                        {s.evidenceCount > 0 && (
                          <p className="mt-1 text-[11px] text-ink-3">
                            {s.evidenceCount} answer{s.evidenceCount === 1 ? "" : "s"}
                            {s.independentAccuracy !== null && ` · ${Math.round(s.independentAccuracy * 100)}% solved without help`}
                            {s.hintDependency !== null && s.hintDependency > 0.15 && ` · relies on hints`}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
