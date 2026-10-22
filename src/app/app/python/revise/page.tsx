import type { Metadata } from "next";
import Link from "next/link";
import { RevisionRound } from "@/components/python/RevisionRunner";
import { QuestionCard } from "@/components/python/QuestionCard";
import { Badge, ButtonLink, Card, EmptyState, PageHeader, pct } from "@/components/ui";
import { getPyLesson, getPyQuestion, publicQuestion } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb, schema } from "@/server/db/client";
import { pyState, REVIEW_INTERVALS_DAYS } from "@/server/python/state";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Python revision" };

export default async function RevisePage() {
  const user = await requirePageUser(["STUDENT"]);
  const db = await getDb();
  const s = await pyState(db, user.id);
  const upcoming = (await db.select().from(schema.pyReviews).where(eq(schema.pyReviews.studentId, user.id)))
    .filter((r) => r.dueAt > new Date()).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime()).slice(0, 8);
  const mistakes = s.mistakes.slice(-6).reverse().map((m) => getPyQuestion(m.questionId)).filter((r) => r && r.source !== "exam");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Revision mode" title="Revise what you've learned"
        subtitle={`Spaced revision: each completed lesson comes back after ${REVIEW_INTERVALS_DAYS.join(", ")} days as you keep getting it right. A wrong answer anywhere makes its lesson due again.`} />

      <section aria-labelledby="due-h" className="space-y-3">
        <h2 id="due-h" className="text-xl font-bold">Due now <Badge tone="hint">{s.revisionDue.length}</Badge></h2>
        {s.revisionDue.length ? (
          <div className="space-y-3">
            {s.revisionDue.map((d) => (
              <Card key={d.lessonId} className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/app/python/learn/${d.lessonId}`} className="font-bold hover:text-accent">{d.title}</Link>
                  <Badge>box {d.box} of {REVIEW_INTERVALS_DAYS.length}</Badge>
                  <span className="text-xs text-ink-3">mastery {pct(s.lessonInfo.get(d.lessonId)?.mastery ?? null)}</span>
                </div>
                <RevisionRound lessonId={d.lessonId} title={d.title} />
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing is due right now" action={<ButtonLink href="/app/python/practice" variant="secondary">Practise instead</ButtonLink>}>
            Lessons join your revision schedule when you complete them.
          </EmptyState>
        )}
      </section>

      {s.weak.length > 0 && (
        <section aria-labelledby="weak-h" className="space-y-2">
          <h2 id="weak-h" className="text-xl font-bold">Weak topics — reteach and practise</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {s.weak.map((w) => (
              <li key={w.lessonId}><Card className="space-y-2 p-4">
                <p className="font-semibold">{w.title} <span className="font-mono text-xs text-ink-3">{pct(w.mastery)}</span></p>
                <details className="text-sm"><summary className="cursor-pointer font-semibold text-concept">Explain it another way</summary><p className="mt-1 text-ink-2">{getPyLesson(w.lessonId)!.reteach}</p></details>
                <div className="flex flex-wrap gap-2"><ButtonLink size="sm" href={`/app/python/practice?lesson=${w.lessonId}`}>Practise</ButtonLink><ButtonLink size="sm" variant="ghost" href={`/app/python/learn/${w.lessonId}`}>Reread the lesson</ButtonLink></div>
              </Card></li>
            ))}
          </ul>
        </section>
      )}

      <section id="mistakes" aria-labelledby="mis-h" className="space-y-3">
        <h2 id="mis-h" className="text-xl font-bold">Your recent mistakes</h2>
        {mistakes.length ? mistakes.map((r) => <QuestionCard key={r!.id} q={publicQuestion(r!)} mode="revision" title={`Retry · ${getPyLesson(r!.lessonId ?? "")?.title ?? "Question"}`} />)
          : <p className="text-sm text-ink-3">No open mistakes — every question you missed has been answered correctly since.</p>}
      </section>

      {upcoming.length > 0 && (
        <section aria-labelledby="up-h">
          <h2 id="up-h" className="mb-2 text-xl font-bold">Coming up</h2>
          <ul className="space-y-1 text-sm">{upcoming.map((u) => <li key={u.lessonId}>{getPyLesson(u.lessonId)?.title} — {u.dueAt.toLocaleDateString("en-IN")}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
