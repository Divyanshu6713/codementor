import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { ExercisePanel } from "@/components/learn/ExercisePanel";
import { HelpPanel } from "@/components/learn/HelpPanel";
import { FillInToggle } from "@/components/learn/FillInPanel";
import { fillInView } from "@/server/services/lesson-exercises";
import { LessonStateProvider } from "@/components/learn/LessonState";
import { PracticeLadder } from "@/components/learn/PracticeLadder";
import { Badge } from "@/components/ui";
import { COURSE_MODULES, FILL_SUFFIX, PRACTICE_LEVEL_LABEL, exerciseKey, getCourseLesson, toPublicProblem } from "@/content/course";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { executionStatus } from "@/server/execution/providers";
import { pathProgress } from "@/server/services/lesson-path";
import { mentorStatus } from "@/server/services/mentor";

type Params = { params: Promise<{ lessonId: string; problemId: string }> };

function find(lessonId: string, problemId: string) {
  const lesson = getCourseLesson(lessonId);
  const problem = lesson?.practice?.find((p) => p.id === problemId);
  return lesson && problem ? { lesson, problem } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lessonId, problemId } = await params;
  const f = find(lessonId, problemId);
  return { title: f ? `${f.problem.title} · ${f.lesson.title}` : "Practice" };
}

/** A lesson's intermediate (p2) or challenge (p3) practice problem: judged, with hints and XP. */
export default async function PracticeProblemPage({ params }: Params) {
  const user = await requirePageUser(["STUDENT"]);
  const { lessonId, problemId } = await params;
  const f = find(lessonId, problemId);
  if (!f) notFound();
  const { lesson, problem } = f;
  const pub = toPublicProblem(problem);
  const key = exerciseKey(lesson.id, problem.id);
  const fill = fillInView(key);
  const mod = COURSE_MODULES.find((m) => m.id === lesson.moduleId)!;
  const db = await getDb();
  const [progress, exec, mentor] = await Promise.all([pathProgress(db, user.id), executionStatus(), mentorStatus(user.id)]);
  const state = progress.lessonState(key);
  const maxXp = problem.level === "challenge" ? 30 : 20;

  return (
    <LessonStateProvider
      userId={user.id} lessonId={key} starterCode={pub.starterCode}
      initial={{ hintLevel: state.hintLevel, solutionViewed: state.solutionViewed, passed: state.passed }}
      execution={{ available: exec.available, devOnly: exec.devOnly, message: exec.message }}
      mentor={mentor}
    >
      <div className="space-y-8">
        <header className="animate-rise">
          <Link href={`/app/learn/${lesson.id}#practise`} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink">
            <ChevronLeft size={16} aria-hidden /> {lesson.title}
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Module {mod.number} · Practice · {PRACTICE_LEVEL_LABEL[problem.level]}
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{problem.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Badge tone={problem.level === "challenge" ? "clay" : "concept"}>{PRACTICE_LEVEL_LABEL[problem.level]}</Badge>
            {state.passed ? <Badge tone="success">Solved · +{state.xp} XP</Badge> : <Badge tone="clay"><Sparkles size={12} aria-hidden /> up to {maxXp} XP</Badge>}
          </div>
        </header>

        <PracticeLadder
          lessonId={lesson.id} current={problem.id}
          items={[
            { id: null, level: "beginner", title: lesson.exercise.title, passed: progress.lessonState(lesson.id).passed },
            ...(lesson.practice ?? []).map((p) => ({ id: p.id, level: p.level, title: p.title, passed: progress.lessonState(exerciseKey(lesson.id, p.id)).passed })),
          ]}
        />

        <section aria-label="Problem" className="space-y-4">
          <ExercisePanel exercise={{ title: pub.title, prompt: pub.prompt, samples: pub.samples, hiddenCount: pub.hiddenCount }} />
          <HelpPanel exerciseTitle={pub.title} />
          {fill && <FillInToggle exerciseKey={key} view={fill} executionAvailable={exec.available} alreadyPassed={progress.lessonState(`${key}${FILL_SUFFIX}`).passed} />}
        </section>
      </div>
    </LessonStateProvider>
  );
}
