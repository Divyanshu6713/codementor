import type { Metadata } from "next";
import clsx from "clsx";
import { requirePageUser } from "@/server/auth/current";
import { revisionOverview } from "@/server/services/students";
import { Badge, Card, EmptyState, MasteryBar, PageHeader, pct, ButtonLink } from "@/components/ui";
import { StartSessionButton } from "@/components/app/StartSessionButton";

export const metadata: Metadata = { title: "Revise" };

const REASON: Record<string, string> = { scheduled: "scheduled review", misconception: "brought forward: a misunderstanding came up", failed_recall: "brought forward: last review was hard" };

function when(iso: string) {
  const d = new Date(iso);
  const days = Math.round((d.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "due now";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export default async function RevisePage() {
  const user = await requirePageUser(["STUDENT"]);
  const items = await revisionOverview(user.id);
  const due = items.filter((i) => i.due);
  const upcoming = items.filter((i) => !i.due);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Revise"
        subtitle="Spaced reviews: each skill comes back after 1, 3, 7, 14… days. Easy recall stretches the gap; a hard review brings it back sooner."
        actions={due.length > 0 ? <StartSessionButton body={{ mode: "revision", skills: due.map((d) => d.skillId) }} label={`Review ${due.length} skill${due.length === 1 ? "" : "s"}`} /> : undefined}
      />
      {!items.length && <EmptyState title="Nothing to revise yet" action={<ButtonLink href="/app/learn">Start learning</ButtonLink>}>Skills you practise are scheduled for review automatically.</EmptyState>}
      {[["Due now", due], ["Coming up", upcoming]].map(([title, list]) => (list as typeof items).length > 0 && (
        <section key={title as string} aria-label={title as string}>
          <h2 className="mb-3 font-semibold">{title as string}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(list as typeof items).map((i) => (
              <Card key={i.skillId} className={clsx("p-4", i.due && "border-hint/40")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{i.skill}</p>
                    <p className="text-xs text-ink-3">{i.concept}</p>
                  </div>
                  <Badge tone={i.due ? "hint" : "neutral"}>{when(i.dueAt)}</Badge>
                </div>
                <MasteryBar value={i.mastery} className="mt-3" label={`${i.skill} mastery`} />
                <p className="mt-2 text-xs text-ink-3">{pct(i.mastery)} · {REASON[i.reason]} · reviewed {i.reviews}×{i.lastQuality !== null ? ` · last recall ${Math.round(i.lastQuality * 100)}%` : ""}</p>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
