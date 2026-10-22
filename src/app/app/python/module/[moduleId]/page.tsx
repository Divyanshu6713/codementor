import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { STATUS_ICON } from "@/components/python/status";
import { ExercisePanel } from "@/components/python/ExercisePanel";
import { StartAssessmentButton } from "@/components/python/Assessment";
import { Badge, ButtonLink, Callout, MasteryBar, pct } from "@/components/ui";
import { getPyModule, publicExercise, getPyExercise, PY_LEVELS } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { executionStatus } from "@/server/execution/providers";
import { exerciseState, loadCode } from "@/server/python/exercises";
import { PASS_MARK, pyState } from "@/server/python/state";

type Params = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = getPyModule((await params).moduleId);
  return { title: m ? `Module ${m.number}: ${m.title}` : "Python module" };
}


export default async function ModulePage({ params }: Params) {
  const user = await requirePageUser(["STUDENT"]);
  const m = getPyModule((await params).moduleId);
  if (!m) notFound();
  const db = await getDb();
  const [state, exec] = await Promise.all([pyState(db, user.id), executionStatus("python")]);
  const mv = state.modules.find((x) => x.id === m.id)!;
  const level = PY_LEVELS.find((l) => l.number === m.level)!;
  const projectKey = `${m.id}/${m.project.id}`;
  const [pst, saved] = await Promise.all([exerciseState(db, user.id, projectKey), loadCode(db, user.id, `ex:${projectKey}`)]);
  const exams = state.assessments.filter((a) => a.kind === "module" && a.scopeId === m.id);
  const prereqs = m.prereqs.map((p) => state.modules.find((x) => x.id === p)!).filter(Boolean);

  return (
    <div className="space-y-8">
      <header>
        <Link href="/app/python/roadmap" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft size={16} aria-hidden /> Roadmap</Link>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-accent">Level {level.number}: {level.title}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em]">Module {m.number}: {m.title}</h1>
        <p className="mt-2 max-w-3xl text-ink-2">{m.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Badge tone={m.track === "core" ? "accent" : "clay"}>{m.track === "core" ? "Core Python" : "Specialist path (optional)"}</Badge>
          <Badge>{mv.lessonsDone}/{mv.lessonsTotal} lessons</Badge>
          {mv.complete && <Badge tone="success">Module complete</Badge>}
          {mv.projectPassed && <Badge tone="pink">Mini-project passed</Badge>}
        </div>
        {m.optionalNote && <p className="mt-3 max-w-3xl rounded-xl bg-clay-soft/60 px-4 py-2 text-sm text-ink-2"><span className="font-semibold text-clay">Who needs this: </span>{m.optionalNote}</p>}
        {prereqs.length > 0 && <p className="mt-2 text-sm text-ink-2">Recommended first: {prereqs.map((p, i) => <span key={p.id}>{i > 0 && ", "}<Link className="font-semibold text-accent hover:underline" href={`/app/python/module/${p.id}`}>Module {p.number}: {p.title}</Link>{p.complete ? " ✓" : ""}</span>)}</p>}
      </header>

      <section aria-labelledby="lessons-h" className="space-y-3">
        <h2 id="lessons-h" className="text-xl font-bold">Lessons</h2>
        <ol className="space-y-2">
          {mv.lessons.map((l, i) => (
            <li key={l.id}>
              <Link href={`/app/python/learn/${l.id}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card hover:border-accent/40">
                <span className="w-6 text-right font-mono text-xs text-ink-3">{i + 1}</span>
                {STATUS_ICON[l.status]}
                <span className="min-w-0 flex-1 font-semibold">{l.title}</span>
                <span className="text-xs text-ink-3">{l.minutes} min · {l.questionsDone}/{l.questionsTotal} questions · {l.exercisesPassed}/{l.exercisesTotal} exercises</span>
                <span className="flex w-28 items-center gap-2"><MasteryBar value={l.mastery} label={`${l.title} mastery`} /><span className="w-9 text-right font-mono text-xs text-ink-2">{pct(l.mastery)}</span></span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="exam-h" className="space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
        <h2 id="exam-h" className="text-xl font-bold">Module assessment</h2>
        <p className="text-sm text-ink-2">A comprehensive check of the whole module: questions you haven&apos;t seen in the lessons come first. Pass mark {Math.round(PASS_MARK * 100)}%. You can retake it with a new mix of questions; wrong answers send their lessons to revision.</p>
        {mv.lessonsDone < mv.lessonsTotal && <p className="text-sm text-hint">Tip: finish the lessons first — but you can take it now if you feel ready.</p>}
        {exams.length > 0 && (
          <ul className="space-y-1 text-sm">
            {exams.map((e) => <li key={e.id}><Link href={`/app/python/assessment/${e.id}`} className="hover:underline">{e.at.toLocaleDateString("en-IN")}: <strong>{e.score}/{e.total}</strong> {e.passed ? <Badge tone="success">passed</Badge> : <Badge tone="hint">not passed</Badge>}</Link></li>)}
          </ul>
        )}
        <StartAssessmentButton kind="module" scopeId={m.id} label={exams.length ? "Take the assessment again" : "Start the module assessment"} />
      </section>

      <section aria-labelledby="proj-h" className="space-y-3 rounded-[var(--radius-card)] border border-pink/25 bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-2"><Badge tone="pink">Practical mini-project</Badge><Badge>Level {m.project.difficulty}</Badge>{pst.passed && <Badge tone="success">Passed</Badge>}</div>
        <h2 id="proj-h" className="text-xl font-bold">{m.project.title}</h2>
        {!exec.available && <Callout tone="hint" title="Code can't run right now">{exec.message}</Callout>}
        <ExercisePanel exercise={publicExercise(getPyExercise(projectKey)!)} mode="project"
          initial={{ hintLevel: pst.hintLevel, solutionViewed: pst.solutionViewed, passed: pst.passed, saved: saved?.code ?? null, bestMs: pst.bestMs }}
          exec={{ available: exec.available, devOnly: exec.devOnly, message: exec.message }} />
      </section>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/app/python/practice?module=${m.id}`} variant="secondary">Practise this module</ButtonLink>
        <ButtonLink href="/app/python/roadmap" variant="ghost">All modules</ButtonLink>
      </div>
    </div>
  );
}
