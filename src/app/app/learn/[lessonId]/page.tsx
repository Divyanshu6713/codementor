import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { DryRun } from "@/components/lesson/DryRun";
import { Visual } from "@/components/lesson/Visuals";
import { ExercisePanel } from "@/components/learn/ExercisePanel";
import { FillInToggle } from "@/components/learn/FillInPanel";
import { fillInView } from "@/server/services/lesson-exercises";
import { HelpPanel } from "@/components/learn/HelpPanel";
import { LessonFooter } from "@/components/learn/LessonFooter";
import { LessonStateProvider } from "@/components/learn/LessonState";
import { PracticeLadder } from "@/components/learn/PracticeLadder";
import { PredictOutput } from "@/components/learn/PredictOutput";
import { QuickCheck } from "@/components/learn/QuickCheck";
import { Badge } from "@/components/ui";
import { COURSE_MODULES, FILL_SUFFIX, exerciseKey, getCourseLesson, neighbours, toPublicLesson } from "@/content/course";
import { getTrace } from "@/content/traces";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { executionStatus } from "@/server/execution/providers";
import { pathProgress } from "@/server/services/lesson-path";
import { mentorStatus } from "@/server/services/mentor";
import { HUE_CLASSES } from "@/lib/palette";

type Params = { params: Promise<{ lessonId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const lesson = getCourseLesson((await params).lessonId);
  return { title: lesson ? lesson.title : "Lesson" };
}

const STEP_HUES = (["accent", "concept", "teal", "pink", "success"] as const).map((h) => `${HUE_CLASSES[h].soft} ${HUE_CLASSES[h].text}`);

function Step({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20">
      <h2 id={`${id}-h`} className="flex items-center gap-2.5 text-xl font-bold">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-sm ${STEP_HUES[(n - 1) % STEP_HUES.length]}`} aria-hidden>{n}</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default async function LessonPage({ params }: Params) {
  const user = await requirePageUser(["STUDENT"]);
  const lesson = getCourseLesson((await params).lessonId);
  if (!lesson) notFound();
  const pub = toPublicLesson(lesson);
  const mod = COURSE_MODULES.find((m) => m.id === lesson.moduleId)!;
  const indexInModule = mod.lessons.indexOf(lesson.id) + 1;
  const { prev, next } = neighbours(lesson.id);
  const db = await getDb();
  const [progress, exec, mentor] = await Promise.all([pathProgress(db, user.id), executionStatus(), mentorStatus(user.id)]);
  const state = progress.lessonState(lesson.id);
  const moduleProgress = progress.modules.find((m) => m.id === mod.id)!;
  const fill = fillInView(lesson.id);

  return (
    <LessonStateProvider
      userId={user.id} lessonId={lesson.id} starterCode={pub.exercise.starterCode}
      initial={{ hintLevel: state.hintLevel, solutionViewed: state.solutionViewed, passed: state.passed }}
      execution={{ available: exec.available, devOnly: exec.devOnly, message: exec.message }}
      mentor={mentor}
    >
      <div className="space-y-12">
        <header className="animate-rise">
          <Link href="/app/learn" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft size={16} aria-hidden /> Learn</Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-accent">Module {mod.number} · {mod.title} · Lesson {indexInModule} of {mod.lessons.length}</p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{lesson.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Badge tone="neutral">about {lesson.minutes} min</Badge>
            {state.passed ? <Badge tone="success">Completed · +{state.xp} XP</Badge> : <Badge tone="clay"><Sparkles size={12} aria-hidden /> up to 25 XP</Badge>}
            <Badge tone="concept">{moduleProgress.done}/{moduleProgress.lessons.length} done in this module</Badge>
          </div>
          <nav aria-label="Lesson sections" className="mt-4 flex flex-wrap gap-2 text-sm">
            {[["learn", "What you'll learn"], ["understand", "Understand"], ["example", "Try it"], ["practise", "Practise"], ["continue", "Next"]].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-line bg-surface px-3 py-1 font-medium text-ink-2 shadow-card hover:text-ink">{label}</a>
            ))}
          </nav>
        </header>

        <Step id="learn" n={1} title="What you'll learn">
          <ul className="space-y-1.5">
            {lesson.goals.map((g) => <li key={g} className="flex gap-2"><span className="text-accent" aria-hidden>→</span><Markdown text={g} className="text-ink" /></li>)}
          </ul>
          <Markdown text={lesson.intro} />
        </Step>

        <Step id="understand" n={2} title="Understand the idea">
          {lesson.sections.map((s) => {
            const trace = s.traceId ? getTrace(s.traceId) : undefined;
            return (
              <div key={s.title} className="space-y-3">
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <Markdown text={s.body} />
                {s.visual && <div className="rounded-xl border border-line bg-surface p-4 shadow-card"><Visual id={s.visual} /></div>}
                {trace && <DryRun code={trace.code} steps={trace.steps} />}
              </div>
            );
          })}
          <div className="rounded-xl border border-hint/30 bg-hint-soft/60 p-4">
            <h3 className="font-semibold">Common mistakes</h3>
            <ul className="mt-2 space-y-3">
              {lesson.mistakes.map((m) => (
                <li key={m.title}><Markdown text={`**${m.title}.** ${m.body}`} className="text-sm leading-relaxed text-ink-2" /></li>
              ))}
            </ul>
          </div>
        </Step>

        <Step id="example" n={3} title="Try an example">
          <h3 className="text-lg font-semibold">{lesson.example.title}</h3>
          <Markdown text={lesson.example.intro} />
          <CodeBlock code={lesson.example.code} label={lesson.example.title} />
          <ul className="space-y-1.5 text-sm">
            {lesson.example.notes.map((n) => (
              <li key={n.line} className="flex gap-2"><span className="shrink-0 font-mono text-xs leading-6 text-ink-3">line {n.line}</span><Markdown text={n.text} className="text-ink-2" /></li>
            ))}
          </ul>
          <PredictOutput output={lesson.example.output} input={lesson.example.input} playgroundHref={`/app/playground?example=${lesson.id}`} />
          {lesson.quickCheck && (
            <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Quick check</p>
              <QuickCheck q={lesson.quickCheck} />
            </div>
          )}
        </Step>

        <Step id="practise" n={4} title={`Practise: ${pub.exercise.title}`}>
          <PracticeLadder
            lessonId={lesson.id} current={null}
            items={[
              { id: null, level: "beginner", title: pub.exercise.title, passed: state.passed },
              ...pub.practice.map((p) => ({ id: p.id, level: p.level, title: p.title, passed: progress.lessonState(exerciseKey(lesson.id, p.id)).passed })),
            ]}
          />
          <ExercisePanel exercise={{ title: pub.exercise.title, prompt: pub.exercise.prompt, samples: pub.exercise.samples, hiddenCount: pub.exercise.hiddenCount }} />
          <HelpPanel exerciseTitle={pub.exercise.title} />
          {fill && <FillInToggle exerciseKey={lesson.id} view={fill} executionAvailable={exec.available} alreadyPassed={progress.lessonState(`${lesson.id}${FILL_SUFFIX}`).passed} />}
        </Step>

        <Step id="continue" n={5} title="Key points and next step">
          <ul className="space-y-1.5">
            {lesson.summary.map((s) => <li key={s} className="flex gap-2"><span className="text-success" aria-hidden>✓</span><Markdown text={s} className="text-ink" /></li>)}
          </ul>
          <LessonFooter prev={prev && { id: prev.id, title: prev.title }} next={next && { id: next.id, title: next.title }} />
        </Step>
      </div>
    </LessonStateProvider>
  );
}
