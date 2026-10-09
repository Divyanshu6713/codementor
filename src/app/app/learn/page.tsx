import type { Metadata } from "next";
import { BookOpen, Lock } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { completedLessons, nextDecision, skillMap } from "@/server/services/learner";
import { LESSONS, conceptById } from "@/content";
import { Badge, Card, MasteryBar, PageHeader, pct } from "@/components/ui";
import { StartSessionButton } from "@/components/app/StartSessionButton";

export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage() {
  const user = await requirePageUser(["STUDENT"]);
  const db = await getDb();
  const [decision, done, map] = await Promise.all([nextDecision(db, user.id), completedLessons(db, user.id), skillMap(db, user.id)]);
  const concepts = map.flatMap((t) => t.concepts.map((c) => ({ ...c, track: t.title, trackStatus: t.status })));

  return (
    <div className="space-y-8">
      <PageHeader title="Learn" subtitle="Your path through C++. The recommended step comes first; you can also open any lesson that exists." />
      <Card className="p-6" as="section" aria-labelledby="rec">
        <Badge tone="accent">Recommended</Badge>
        <h2 id="rec" className="mt-2 text-xl font-bold">{decision.title}</h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-2">{decision.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        <div className="mt-4">
          {decision.action === "content_pending"
            ? decision.alternative && <StartSessionButton body={{ mode: "recommended", useAlternative: true }} label={`Start ${decision.alternative.title} anyway`} />
            : decision.action !== "all_done" && <StartSessionButton body={{ mode: "recommended" }} label="Start" />}
        </div>
      </Card>

      <section aria-labelledby="lessons">
        <h2 id="lessons" className="mb-3 font-semibold">Lessons available now</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {LESSONS.map((l) => (
            <Card key={l.id} className="flex flex-col p-5">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-concept" aria-hidden />
                <Badge tone={l.kind === "core" ? "concept" : "neutral"}>{l.kind === "core" ? "Lesson" : "Review lesson"}</Badge>
                {done.has(l.id) && <Badge tone="success">Done</Badge>}
              </div>
              <h3 className="mt-2 font-semibold">{l.title}</h3>
              <p className="mt-1 flex-1 text-sm text-ink-2">{conceptById.get(l.conceptId)?.summary} · about {l.estimatedMinutes} min</p>
              <StartSessionButton className="mt-4" size="md" variant={done.has(l.id) ? "secondary" : "primary"} body={{ mode: "lesson", lessonId: l.id }} label={done.has(l.id) ? "Take it again" : "Open lesson"} />
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="path">
        <h2 id="path" className="mb-3 font-semibold">The full path</h2>
        <ol className="space-y-2">
          {concepts.map((c, i) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
              <span className="w-6 text-right font-mono text-xs text-ink-3">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{c.title} <span className="font-normal text-ink-3">· {c.track}</span></p>
                {c.prerequisites.length > 0 && <p className="text-xs text-ink-3">needs: {c.prerequisites.map((p) => p.title).join(", ")}</p>}
              </div>
              {c.status === "planned" || c.trackStatus === "planned" ? (
                <span className="flex items-center gap-1 text-xs text-ink-3"><Lock size={13} aria-hidden /> coming later</span>
              ) : (
                <div className="flex w-36 items-center gap-2">
                  <MasteryBar value={c.mastery} label={`${c.title} mastery`} />
                  <span className="w-9 text-right font-mono text-xs text-ink-2">{pct(c.mastery)}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
