import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, Circle, Lock } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { ExercisePanel } from "@/components/python/ExercisePanel";
import { QuestionCard } from "@/components/python/QuestionCard";
import { PredictReveal, UnlockButton } from "@/components/python/small";
import { Badge, ButtonLink, Callout, MasteryBar, pct } from "@/components/ui";
import { DIFFICULTY_NAMES, getPyLesson, lessonPrereqs, publicLesson, pyModuleOf, pyNeighbours, type PyDifficulty } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { executionStatus } from "@/server/execution/providers";
import { exerciseState, loadCode } from "@/server/python/exercises";
import { MASTERY_GOOD, pyState } from "@/server/python/state";
import { HUE_CLASSES } from "@/lib/palette";

type Params = { params: Promise<{ lessonId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const l = getPyLesson((await params).lessonId);
  return { title: l ? `${l.title} · Python` : "Python lesson" };
}

const HUES = (["accent", "concept", "teal", "pink", "success", "clay", "sky", "hint"] as const).map((h) => `${HUE_CLASSES[h].soft} ${HUE_CLASSES[h].text}`);

function Step({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20">
      <h2 id={`${id}-h`} className="flex items-center gap-2.5 text-xl font-bold">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-sm ${HUES[(n - 1) % HUES.length]}`} aria-hidden>{n}</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default async function PyLessonPage({ params }: Params) {
  const user = await requirePageUser(["STUDENT"]);
  const lesson = getPyLesson((await params).lessonId);
  if (!lesson) notFound();
  const pub = publicLesson(lesson);
  const mod = pyModuleOf(lesson.id)!;
  const db = await getDb();
  const [state, exec] = await Promise.all([pyState(db, user.id), executionStatus("python")]);
  const info = state.lessonInfo.get(lesson.id)!;
  const { prev, next } = pyNeighbours(lesson.id);
  const prereqs = lessonPrereqs(lesson.id).map((id) => ({ id, title: getPyLesson(id)!.title, done: state.lessonInfo.get(id)?.status === "completed" }));
  const execView = { available: exec.available, devOnly: exec.devOnly, message: exec.message };
  const index = mod.lessons.findIndex((l) => l.id === lesson.id) + 1;

  const header = (
    <header className="animate-rise">
      <Link href={`/app/python/module/${mod.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft size={16} aria-hidden /> Module {mod.number}: {mod.title}</Link>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-accent">Python · Level {mod.level} · Module {mod.number} · Lesson {index} of {mod.lessons.length}</p>
      <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{lesson.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <Badge>about {lesson.minutes} min</Badge>
        <Badge tone="sky">Level {lesson.difficulty}: {DIFFICULTY_NAMES[lesson.difficulty as PyDifficulty]}</Badge>
        {lesson.version && <Badge tone="clay">{lesson.version}</Badge>}
        {info.status === "completed" ? <Badge tone="success">Completed</Badge> : info.status === "in_progress" ? <Badge tone="accent">In progress</Badge> : null}
        {info.mastery !== null && <Badge tone={info.mastery >= MASTERY_GOOD ? "success" : "hint"}>Mastery {pct(info.mastery)}</Badge>}
      </div>
    </header>
  );

  if (info.status === "locked") {
    return (
      <div className="space-y-6">
        {header}
        <Callout tone="hint" icon={<Lock size={18} />} title="This lesson unlocks after the ones before it">
          <p>Guided order is on: lessons open once you&apos;ve completed what they build on. Finish these first:</p>
          <ul className="mt-2 space-y-1">{prereqs.filter((p) => !p.done).map((p) => <li key={p.id}><Link className="font-semibold text-accent hover:underline" href={`/app/python/learn/${p.id}`}>{p.title}</Link></li>)}</ul>
          <p className="mt-2">Already know this? You can open it now — your choice is remembered. (Turn guided order off on the Python roadmap to open everything.)</p>
          <div className="mt-3"><UnlockButton lessonId={lesson.id} /></div>
        </Callout>
        <div>
          <p className="font-semibold">You&apos;ll learn to</p>
          <ul className="mt-2 space-y-1">{lesson.objectives.map((o) => <li key={o} className="flex gap-2"><span className="text-accent" aria-hidden>→</span><Markdown text={o} className="text-ink-2" codeLanguage="python" /></li>)}</ul>
        </div>
      </div>
    );
  }

  const exercises = await Promise.all(pub.exercises.map(async (ex) => {
    const [st, saved] = await Promise.all([exerciseState(db, user.id, ex.key), loadCode(db, user.id, `ex:${ex.key}`)]);
    return { ex, initial: { hintLevel: st.hintLevel, solutionViewed: st.solutionViewed, passed: st.passed, saved: saved?.code ?? null, bestMs: st.bestMs } };
  }));
  const sectionLinks: [string, string][] = [["warmup", "Warm-up"], ["learn", "Goals"], ["concept", "Concept"], ["example", "Example"], ["questions", "Questions"], ["code", "Code"], ["summary", "Summary"]];

  let n = 0;
  return (
    <div className="space-y-12">
      <div>
        {header}
        <nav aria-label="Lesson sections" className="mt-4 flex flex-wrap gap-2 text-sm">
          {sectionLinks.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-full border border-line bg-surface px-3 py-1 font-medium text-ink-2 shadow-card hover:text-ink">{label}</a>)}
        </nav>
      </div>

      <Step id="warmup" n={++n} title="Warm-up: what do you already know?">
        <p className="text-sm text-ink-2">One quick question before we start. It doesn&apos;t affect your mastery — it shows you (and us) where you&apos;re starting from.</p>
        <QuestionCard q={pub.warmup} mode="learn" title="Warm-up" />
      </Step>

      <Step id="learn" n={++n} title="What you'll learn and why it matters">
        <ul className="space-y-1.5">
          {lesson.objectives.map((o) => <li key={o} className="flex gap-2"><span className="text-accent" aria-hidden>→</span><Markdown text={o} className="text-ink" codeLanguage="python" /></li>)}
        </ul>
        {prereqs.length > 0 && (
          <p className="text-sm text-ink-2">Builds on: {prereqs.map((p, i) => (
            <span key={p.id}>{i > 0 && ", "}<Link href={`/app/python/learn/${p.id}`} className="font-semibold text-accent hover:underline">{p.title}</Link>{p.done ? " ✓" : ""}</span>
          ))}</p>
        )}
        <div className="rounded-xl border border-concept/25 bg-concept-soft/50 p-4"><p className="text-sm font-semibold text-concept">Why it matters</p><Markdown text={lesson.why} className="mt-1 text-ink-2" codeLanguage="python" /></div>
      </Step>

      <Step id="concept" n={++n} title="Understand the idea">
        {lesson.concept.map((s, i) => (
          <div key={s.title} className="space-y-3">
            <h3 className="text-lg font-semibold"><span className="mr-2 font-mono text-sm text-ink-3">{i + 1}/{lesson.concept.length}</span>{s.title}</h3>
            <Markdown text={s.body} codeLanguage="python" />
          </div>
        ))}
      </Step>

      <Step id="example" n={++n} title={`Example: ${lesson.example.title}`}>
        <CodeBlock code={lesson.example.code} language="python" label="main.py" />
        <div>
          <p className="mb-2 text-sm font-semibold">Line by line</p>
          <ul className="space-y-1.5 text-sm">
            {lesson.example.lines.map(([line, text]) => (
              <li key={line} className="flex gap-2"><span className="w-12 shrink-0 font-mono text-xs leading-6 text-ink-3">line {line}</span><Markdown text={text} className="text-ink-2" codeLanguage="python" /></li>
            ))}
          </ul>
        </div>
        <PredictReveal output={lesson.example.output} input={lesson.example.input} code={lesson.example.code} raises={lesson.example.raises} files={lesson.example.files}
          workspaceHref={`/app/python/workspace?example=${lesson.id}`} canRun={exec.available} />
        <div className="rounded-xl border border-hint/30 bg-hint-soft/60 p-4">
          <h3 className="font-semibold">Common mistakes</h3>
          <ul className="mt-2 space-y-3">{lesson.mistakes.map((m) => <li key={m.title}><Markdown text={`**${m.title}.** ${m.body}`} className="text-sm leading-relaxed text-ink-2" codeLanguage="python" /></li>)}</ul>
        </div>
      </Step>

      <Step id="questions" n={++n} title="Check your understanding">
        <p className="text-sm text-ink-2">Answer each one before looking at the answer. Use the hint if you&apos;re stuck. These count towards your mastery of this lesson.</p>
        {pub.questions.map((q) => <QuestionCard key={q.id} q={q} mode="learn" />)}
      </Step>

      <Step id="code" n={++n} title="Write the code">
        {exercises.map(({ ex, initial }, i) => (
          <div key={ex.key} className="space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={i === 0 ? "accent" : ex.kind === "debug" ? "hint" : "pink"}>{i === 0 ? "Your task" : ex.kind === "debug" ? "Debugging" : "Level up"}</Badge>
              <Badge>Level {ex.difficulty}</Badge>
              {initial.passed && <Badge tone="success">Passed</Badge>}
            </div>
            <h3 className="text-lg font-bold">{ex.title}</h3>
            <ExercisePanel exercise={ex} initial={initial} exec={execView} />
          </div>
        ))}
      </Step>

      {(lesson.cpp || lesson.libraryCode?.length) && (
        <Step id="beyond" n={++n} title="Going further">
          {lesson.cpp && (
            <div className="space-y-2">
              <h3 className="font-semibold">Compare with C++</h3>
              <div className="grid gap-3 lg:grid-cols-2">
                <CodeBlock code={lesson.cpp.python} language="python" label="Python" />
                <CodeBlock code={lesson.cpp.cpp} language="cpp" label="C++" />
              </div>
              <Markdown text={lesson.cpp.note} codeLanguage="python" />
            </div>
          )}
          {lesson.libraryCode?.map((lc) => (
            <div key={lc.title} className="space-y-2">
              <h3 className="flex flex-wrap items-center gap-2 font-semibold">{lc.title} <Badge tone="clay">Not run here — needs a library or a desktop</Badge></h3>
              <CodeBlock code={lc.code} language="python" />
              <Markdown text={lc.note} codeLanguage="python" />
            </div>
          ))}
        </Step>
      )}

      <Step id="summary" n={++n} title="Real world, summary and your progress">
        <div className="rounded-xl border border-teal/25 bg-teal-soft/50 p-4"><p className="text-sm font-semibold text-teal">In the real world</p><Markdown text={lesson.realWorld} className="mt-1 text-ink-2" codeLanguage="python" /></div>
        <div>
          <p className="font-semibold">Revision notes</p>
          <ul className="mt-2 space-y-1.5">{lesson.summary.map((s) => <li key={s} className="flex gap-2"><span className="text-success" aria-hidden>✓</span><Markdown text={s} className="text-ink" codeLanguage="python" /></li>)}</ul>
        </div>
        <details className="rounded-xl border border-concept/30 bg-concept-soft/40 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-concept">Still unsure? Explain it another way</summary>
          <Markdown text={lesson.reteach} className="mt-2 text-ink-2" codeLanguage="python" />
        </details>
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card" aria-label="Lesson checklist">
          <p className="font-semibold">To complete this lesson</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <Check done={info.corePassed}>Pass &ldquo;{lesson.exercises[0].title}&rdquo; (checked by tests)</Check>
            <Check done={info.questionsDone === info.questionsTotal}>Answer every question correctly at least once ({info.questionsDone}/{info.questionsTotal})</Check>
            <Check done={(info.mastery ?? 0) >= MASTERY_GOOD}>Reach {Math.round(MASTERY_GOOD * 100)}% mastery (recent accuracy, newest answers count most)</Check>
          </ul>
          <div className="mt-3 flex items-center gap-3"><MasteryBar value={info.mastery} label="Lesson mastery" className="max-w-xs" /><span className="font-mono text-xs text-ink-2">{pct(info.mastery)}</span></div>
          {info.status === "completed" && <p className="mt-2 text-sm font-semibold text-success">Lesson complete — it&apos;s now in your revision schedule.</p>}
        </div>
        <nav aria-label="Next and previous lesson" className="flex flex-wrap justify-between gap-3">
          {prev ? <ButtonLink variant="secondary" href={`/app/python/learn/${prev.id}`} className="h-auto! min-h-10 whitespace-normal! py-2"><ArrowLeft size={16} aria-hidden /> {prev.title}</ButtonLink> : <span />}
          {next ? <ButtonLink href={`/app/python/learn/${next.id}`} className="h-auto! min-h-10 whitespace-normal! py-2">Next: {next.title} <ArrowRight size={16} aria-hidden /></ButtonLink>
            : <ButtonLink href={`/app/python/module/${mod.id}`}>Module assessment <ArrowRight size={16} aria-hidden /></ButtonLink>}
        </nav>
        {next && pyModuleOf(next.id)?.id !== mod.id && (
          <p className="text-sm text-ink-2">This was the last lesson of Module {mod.number}. <Link href={`/app/python/module/${mod.id}`} className="font-semibold text-accent hover:underline">Take the module assessment and mini-project →</Link></p>
        )}
      </Step>
    </div>
  );
}

function Check({ done, children }: { done: boolean; children: ReactNode }) {
  return <li className="flex items-start gap-2">{done ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-label="done" /> : <Circle size={16} className="mt-0.5 shrink-0 text-line-strong" aria-label="not yet" />}<span className={done ? "text-ink" : "text-ink-2"}>{children}</span></li>;
}
