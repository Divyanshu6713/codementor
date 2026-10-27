import type { Metadata } from "next";
import { BookOpen, CheckCircle2, PenLine } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { completedLessons, nextDecision, skillMap } from "@/server/services/learner";
import { LESSONS, conceptById } from "@/content";
import { Badge, ButtonLink, Card, MasteryBar, PageHeader, pct } from "@/components/ui";
import { StartSessionButton } from "@/components/app/StartSessionButton";
import { LessonPath } from "@/components/app/LessonPath";
import { getCourseLesson } from "@/content/course";
import { pathProgress } from "@/server/services/lesson-path";

export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage() {
  const user = await requirePageUser(["STUDENT"]);
  const db = await getDb();
  const [decision, done, map, path] = await Promise.all([nextDecision(db, user.id), completedLessons(db, user.id), skillMap(db, user.id), pathProgress(db, user.id)]);
  const concepts = map.flatMap((t) => t.concepts.map((c) => ({ ...c, track: t.title })));
  const passed = new Set(path.modules.flatMap((m) => m.lessons.filter((l) => l.passed).map((l) => l.id)));

  return (
    <div className="space-y-8">
      <PageHeader title="Learn" subtitle="Step-by-step lessons from zero, plus adaptive lessons that react to your answers. Open anything — nothing is locked." />
      <LessonPath modules={path.modules} next={path.next} nextTitle={path.next ? getCourseLesson(path.next)!.title : null} passedCount={path.passedCount} total={path.total} />
      <h2 className="pt-2 text-2xl font-extrabold tracking-[-0.02em]">Adaptive lessons</h2>
      <Card className="p-6" as="section" aria-labelledby="rec">
        <Badge tone="accent">Recommended for you</Badge>
        <h2 id="rec" className="mt-2 text-xl font-bold">{decision.title}</h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-2">{decision.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        <div className="mt-4">
          {decision.action === "content_pending"
            ? <div className="flex flex-wrap gap-2">
                {decision.courseLessonId && <ButtonLink href={`/app/learn/${decision.courseLessonId}`}>Open the {decision.title.replace(/^Next up: /, "")} lesson</ButtonLink>}
                {decision.alternative && <StartSessionButton variant={decision.courseLessonId ? "secondary" : "primary"} body={{ mode: "recommended", useAlternative: true }} label={`Start ${decision.alternative.title} anyway`} />}
              </div>
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
        <h2 id="path" className="font-semibold">The full path</h2>
        <p className="mb-3 mt-1 text-sm text-ink-2">Every topic opens straight away. &ldquo;Best after&rdquo; is advice on what to learn first, not a lock.</p>
        <ol className="space-y-2">
          {concepts.map((c, i) => {
            const done = c.courseLessons.filter((l) => passed.has(l.id)).length;
            const target = c.courseLessons.find((l) => !passed.has(l.id)) ?? c.courseLessons[0];
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3" data-concept={c.id}>
                <span className="w-6 text-right font-mono text-xs text-ink-3">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{c.title} <span className="font-normal text-ink-3">· {c.track}</span></p>
                  {c.prerequisites.length > 0 && <p className="text-xs text-ink-3">Best after: {c.prerequisites.map((p) => p.title).join(", ")}</p>}
                </div>
                {c.skills.length > 0 && (
                  <div className="flex w-28 items-center gap-2" title="Adaptive mastery estimate">
                    <MasteryBar value={c.mastery} label={`${c.title} mastery`} />
                    <span className="w-9 text-right font-mono text-xs text-ink-2">{pct(c.mastery)}</span>
                  </div>
                )}
                {target ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink-3">{done === c.courseLessons.length ? <CheckCircle2 size={14} className="inline text-success" aria-label="all lessons done" /> : null} {done}/{c.courseLessons.length}</span>
                    <ButtonLink href={`/app/learn/${target.id}`} size="sm" variant={done ? "secondary" : "primary"} aria-label={`Open ${c.title}: ${target.title}`}>{done && done < c.courseLessons.length ? "Continue" : "Open"}</ButtonLink>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-ink-3"><PenLine size={13} aria-hidden /> being written</span>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
