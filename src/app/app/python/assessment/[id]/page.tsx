import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft, CircleX, RotateCcw } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { AssessmentRunner, StartAssessmentButton } from "@/components/python/Assessment";
import { Badge, ButtonLink, Callout, PageHeader } from "@/components/ui";
import { getPyLesson, getPyModule, PY_LEVELS } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { isAppError } from "@/server/errors";
import { executionStatus } from "@/server/execution/providers";
import { getAssessment } from "@/server/python/assessments";
import { exerciseState, loadCode } from "@/server/python/exercises";
import { PASS_MARK } from "@/server/python/state";

export const metadata: Metadata = { title: "Python assessment" };

function titleFor(kind: string, scopeId: string) {
  switch (kind) {
    case "module": return `Module assessment: ${getPyModule(scopeId)?.title ?? scopeId}`;
    case "level": return `Level ${scopeId} checkpoint: ${PY_LEVELS.find((l) => String(l.number) === scopeId)?.title ?? ""}`;
    case "final": return "Final comprehensive assessment";
    case "mixed": return "Mixed-topic test";
    case "interview": return "Mock interview";
    default: return "Assessment";
  }
}

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await getDb();
  let a: Awaited<ReturnType<typeof getAssessment>>;
  try {
    a = await getAssessment(db, user.id, id);
  } catch (err) {
    if (isAppError(err) && err.status === 404) notFound();
    throw err;
  }
  const title = titleFor(a.kind, a.scopeId);
  const back = a.kind === "module" ? `/app/python/module/${a.scopeId}` : a.kind === "interview" ? "/app/python/interview" : "/app/python/practice";

  if (!a.submitted) {
    const exec = await executionStatus("python");
    const exercise = a.exercise ? await (async () => {
      const [st, saved] = await Promise.all([exerciseState(db, user.id, a.exercise!.key), loadCode(db, user.id, `ex:${a.exercise!.key}`)]);
      return { ex: a.exercise!, initial: { hintLevel: st.hintLevel, solutionViewed: st.solutionViewed, passed: st.passed, saved: saved?.code ?? null, bestMs: st.bestMs } };
    })() : null;
    return (
      <div>
        <Link href={back} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft size={16} aria-hidden /> Back</Link>
        <PageHeader title={title} subtitle={`${a.questions.length} questions${a.exercise ? " + 1 coding problem" : ""}${a.timeLimitS ? ` · ${Math.round(a.timeLimitS / 60)} minutes` : " · untimed"} · pass mark ${Math.round(PASS_MARK * 100)}%`} />
        <AssessmentRunner id={a.id} questions={a.questions} startedAt={a.startedAt} timeLimitS={a.timeLimitS} exercise={exercise}
          exec={{ available: exec.available, devOnly: exec.devOnly, message: exec.message }} />
      </div>
    );
  }

  const d = a.details!;
  const percent = a.total ? Math.round(((a.score ?? 0) / a.total) * 100) : 0;
  const byId = new Map(a.questions.map((q) => [q.id, q]));
  return (
    <div className="space-y-6">
      <Link href={back} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft size={16} aria-hidden /> Back</Link>
      <PageHeader title={title} subtitle={`Submitted ${new Date(a.submittedAt!).toLocaleString("en-IN")}`} />
      <div className={`rounded-[var(--radius-card)] p-5 shadow-card ${a.passed ? "bg-success-soft" : "bg-hint-soft"}`} role="status">
        <p className="text-3xl font-extrabold">{a.score}/{a.total} <span className="text-lg font-bold text-ink-2">({percent}%)</span></p>
        <p className="mt-1 font-semibold">{a.passed ? "Passed — well done!" : d.late ? "Submitted after the time limit, so it can't count as a pass — but every answer was graded below." : `Not passed yet — the pass mark is ${Math.round(PASS_MARK * 100)}%.`}</p>
        {d.weakLessons.length > 0 && (
          <div className="mt-3 text-sm">
            <p className="font-semibold">Revisit these lessons (they&apos;re now due in Revise):</p>
            <ul className="mt-1 flex flex-wrap gap-2">{d.weakLessons.map((l) => <li key={l}><Link href={`/app/python/learn/${l}`} className="rounded-full bg-surface px-3 py-1 font-semibold text-accent shadow-card hover:underline">{getPyLesson(l)?.title ?? l}</Link></li>)}</ul>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {a.kind === "module" && <StartAssessmentButton kind="module" scopeId={a.scopeId} label="Take it again (new mix of questions)" variant="secondary" />}
          <ButtonLink href="/app/python/revise" variant="secondary"><RotateCcw size={16} aria-hidden /> Go to revision</ButtonLink>
        </div>
      </div>
      {d.exercise && (
        <Callout tone={d.exercise.passed ? "success" : "hint"} title={`Coding problem: ${d.exercise.passed ? "passed" : "not passed during the interview"}`}>
          {d.exercise.passed ? "Your solution passed every test." : <>You can keep working on it in <Link className="font-semibold underline" href={`/app/python/challenges/${encodeURIComponent(d.exercise.key)}`}>Challenges</Link>.</>}
        </Callout>
      )}
      <ol className="space-y-4">
        {d.items.map((item, i) => {
          const q = byId.get(item.questionId);
          return (
            <li key={item.questionId} className="space-y-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-ink-3">Q{i + 1}</span>
                {item.correct ? <Badge tone="success"><CheckCircle2 size={12} aria-hidden /> Correct</Badge> : <Badge tone="danger"><CircleX size={12} aria-hidden /> {item.answered ? "Wrong" : "Not answered"}</Badge>}
                {item.lessonId && <Link href={`/app/python/learn/${item.lessonId}`} className="text-xs font-semibold text-accent hover:underline">{getPyLesson(item.lessonId)?.title}</Link>}
              </div>
              {q && <Markdown text={q.prompt} className="font-medium text-ink" codeLanguage="python" />}
              {q?.code && q.kind !== "fill" && <CodeBlock code={q.code} language="python" />}
              {q?.kind === "fill" && <CodeBlock code={q.code!} language="python" />}
              {item.your && <p className="text-sm"><span className="font-semibold">Your answer:</span> <code className="whitespace-pre-wrap rounded bg-sunken px-1.5 font-mono">{item.your}</code></p>}
              <Markdown text={item.feedback} className="text-sm text-ink-2" codeLanguage="python" />
              {!item.correct && (
                item.correctAnswer.kind === "bug"
                  ? <div className="space-y-1 text-sm"><p className="font-semibold">The bug is on line {item.correctAnswer.line}. Fixed:</p><CodeBlock code={item.correctAnswer.code!} language="python" /></div>
                  : item.correctAnswer.kind === "predict"
                    ? <div className="text-sm"><p className="font-semibold">Python prints:</p><pre className="mt-1 whitespace-pre-wrap rounded-lg bg-code-bg px-3 py-2 font-mono text-[13px] text-code-ink">{item.correctAnswer.text}</pre></div>
                    : <p className="text-sm"><span className="font-semibold">Correct answer:</span> {item.correctAnswer.text}</p>
              )}
              <Markdown text={`**Why:** ${item.explanation}`} className="text-sm text-ink-2" codeLanguage="python" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
