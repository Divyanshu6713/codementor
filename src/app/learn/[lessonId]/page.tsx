import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { DryRun } from "@/components/lesson/DryRun";
import { Visual } from "@/components/lesson/Visuals";
import { ExercisePanel } from "@/components/learn/ExercisePanel";
import { HelpPanel } from "@/components/learn/HelpPanel";
import { LessonFooter } from "@/components/learn/LessonFooter";
import { LessonStateProvider } from "@/components/learn/LessonState";
import { QuickCheck } from "@/components/learn/QuickCheck";
import { RoadmapNav } from "@/components/learn/RoadmapNav";
import { SiteHeader } from "@/components/learn/SiteHeader";
import { COURSE_LESSONS, COURSE_MODULES, getCourseLesson, neighbours, roadmap, toPublicLesson } from "@/content/course";
import { getTrace } from "@/content/traces";

type Params = { params: Promise<{ lessonId: string }> };

export function generateStaticParams() {
  return COURSE_LESSONS.map((l) => ({ lessonId: l.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const lesson = getCourseLesson((await params).lessonId);
  return { title: lesson ? lesson.title : "Lesson" };
}

function Step({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20">
      <h2 id={`${id}-h`} className="flex items-center gap-2.5 text-xl font-bold">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-sm text-accent-ink" aria-hidden>{n}</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default async function LessonPage({ params }: Params) {
  const lesson = getCourseLesson((await params).lessonId);
  if (!lesson) notFound();
  const pub = toPublicLesson(lesson);
  const mod = COURSE_MODULES.find((m) => m.id === lesson.moduleId)!;
  const indexInModule = mod.lessons.indexOf(lesson.id) + 1;
  const { prev, next } = neighbours(lesson.id);

  return (
    <div className="min-h-screen">
      <SiteHeader wide />
      <LessonStateProvider lessonId={lesson.id} exerciseVersion={pub.exercise.version} starterCode={pub.exercise.starterCode}>
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[240px_minmax(0,1fr)_340px]">
          <aside className="lg:sticky lg:top-20 lg:row-span-3 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-auto lg:pr-1">
            <RoadmapNav roadmap={roadmap()} currentId={lesson.id} />
          </aside>

          <main id="main" className="min-w-0 space-y-12 lg:col-start-2">
            <header>
              <p className="text-sm text-ink-3">Module {mod.number} · {mod.title} · Lesson {indexInModule} of {mod.lessons.length} · about {lesson.minutes} min</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{lesson.title}</h1>
              <nav aria-label="Lesson sections" className="mt-4 flex flex-wrap gap-2 text-sm">
                {[["learn", "What you'll learn"], ["understand", "Understand"], ["example", "Example"], ["practise", "Practise"], ["continue", "Continue"]].map(([id, label]) => (
                  <a key={id} href={`#${id}`} className="rounded-full border border-line bg-surface px-3 py-1 text-ink-2 hover:text-ink">{label}</a>
                ))}
              </nav>
            </header>

            <Step id="learn" n={1} title="What you'll learn">
              <ul className="space-y-1.5">
                {lesson.goals.map((g) => <li key={g} className="flex gap-2"><span className="text-accent" aria-hidden>→</span><Markdown text={g} className="text-ink" /></li>)}
              </ul>
              <Markdown text={lesson.intro} />
            </Step>

            <Step id="understand" n={2} title="Understand the concept">
              {lesson.sections.map((s) => {
                const trace = s.traceId ? getTrace(s.traceId) : undefined;
                return (
                  <div key={s.title} className="space-y-3">
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <Markdown text={s.body} />
                    {s.visual && <div className="rounded-xl border border-line bg-surface p-4"><Visual id={s.visual} /></div>}
                    {trace && <DryRun code={trace.code} steps={trace.steps} />}
                  </div>
                );
              })}
              <div className="rounded-xl border border-hint/30 bg-hint-soft/60 p-4">
                <h3 className="font-semibold">Common mistakes</h3>
                <ul className="mt-2 space-y-3">
                  {lesson.mistakes.map((m) => (
                    <li key={m.title}>
                      <Markdown text={`**${m.title}.** ${m.body}`} className="text-sm leading-relaxed text-ink-2" />
                    </li>
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
              <div className="grid gap-3 sm:grid-cols-2">
                {lesson.example.input && (
                  <div><p className="mb-1 text-xs font-semibold text-ink-3">Input</p><pre className="rounded-xl bg-sunken p-3 font-mono text-[13px]">{lesson.example.input.trimEnd()}</pre></div>
                )}
                <div className={lesson.example.input ? "" : "sm:col-span-2"}><p className="mb-1 text-xs font-semibold text-ink-3">Output</p><pre className="whitespace-pre-wrap rounded-xl bg-sunken p-3 font-mono text-[13px]">{lesson.example.output.trimEnd()}</pre></div>
              </div>
              {lesson.quickCheck && (
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Quick check</p>
                  <QuickCheck q={lesson.quickCheck} />
                </div>
              )}
            </Step>

            <Step id="practise" n={4} title={`Practise: ${pub.exercise.title}`}>
              <ExercisePanel exercise={{ title: pub.exercise.title, prompt: pub.exercise.prompt, samples: pub.exercise.samples, hiddenCount: pub.exercise.hiddenCount }} />
            </Step>
          </main>

          <div className="min-w-0 lg:col-start-2 xl:col-start-3 xl:row-span-2 xl:row-start-1">
            <div className="xl:sticky xl:top-20">
              <HelpPanel exerciseTitle={pub.exercise.title} />
            </div>
          </div>

          <div className="min-w-0 lg:col-start-2 xl:row-start-2">
            <Step id="continue" n={5} title="Key points and next step">
              <ul className="space-y-1.5">
                {lesson.summary.map((s) => <li key={s} className="flex gap-2"><span className="text-success" aria-hidden>✓</span><Markdown text={s} className="text-ink" /></li>)}
              </ul>
              <LessonFooter lessonId={lesson.id} prev={prev && { id: prev.id, title: prev.title }} next={next && { id: next.id, title: next.title }} />
            </Step>
          </div>
        </div>
      </LessonStateProvider>
    </div>
  );
}
