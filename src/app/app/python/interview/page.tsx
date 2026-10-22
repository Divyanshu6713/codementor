import type { Metadata } from "next";
import Link from "next/link";
import { StartAssessmentButton } from "@/components/python/Assessment";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { getPyModule } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { pyState } from "@/server/python/state";

export const metadata: Metadata = { title: "Python interview prep" };

const MODULES = ["py-ds", "py-algorithms", "py-interview"];

/** Interview mode: data structures, algorithms, language concepts and timed mock interviews. */
export default async function InterviewPage() {
  const user = await requirePageUser(["STUDENT"]);
  const s = await pyState(await getDb(), user.id);
  const mocks = s.assessments.filter((a) => a.kind === "interview");
  const mods = MODULES.map((id) => s.modules.find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => Boolean(m));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Interview mode" title="Prepare for coding interviews"
        subtitle="Mock interviews mix six technical questions (data structures, algorithms and Python concepts) with one coding problem, in 45 minutes. Everything is graded on the server, with explanations afterwards." />
      <Card className="space-y-3 p-5" as="section" aria-labelledby="mock-h">
        <h2 id="mock-h" className="text-lg font-bold">Mock interview</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-2">
          <li>Read each question fully and restate it in your own words before answering.</li>
          <li>For the coding problem: work out 2–3 examples by hand, including an edge case, then write the simplest correct solution.</li>
          <li>Say (or jot down) the time and space complexity of your approach — interviewers always ask.</li>
          <li>Check with the examples, then submit before the timer runs out.</li>
        </ol>
        <StartAssessmentButton kind="interview" scopeId="all" label="Start a mock interview (45 min)" />
        {mocks.length > 0 && (
          <ul className="space-y-1 text-sm">{mocks.map((m) => <li key={m.id}><Link href={`/app/python/assessment/${m.id}`} className="hover:underline">{m.at.toLocaleDateString("en-IN")}: <strong>{m.score}/{m.total}</strong> {m.passed ? <Badge tone="success">strong</Badge> : <Badge tone="hint">keep practising</Badge>}</Link></li>)}</ul>
        )}
      </Card>
      <section aria-labelledby="study-h" className="space-y-3">
        <h2 id="study-h" className="text-lg font-bold">Study plan</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {mods.map((m) => (
            <Card key={m.id} className="space-y-2 p-4">
              <Link href={`/app/python/module/${m.id}`} className="font-bold hover:text-accent">Module {m.number}: {m.title}</Link>
              <p className="text-xs text-ink-3">{m.lessonsDone}/{m.lessonsTotal} lessons · {getPyModule(m.id)?.summary}</p>
              <ButtonLink size="sm" variant="secondary" href={`/app/python/practice?module=${m.id}`}>Practise questions</ButtonLink>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/app/python/challenges?level=4" variant="secondary">Timed coding problems</ButtonLink>
          <ButtonLink href="/app/python/reference" variant="ghost">Syntax and complexity cheat sheet</ButtonLink>
        </div>
      </section>
    </div>
  );
}
