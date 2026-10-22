import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, BookOpen, Clock, Code2, Flame, FolderKanban, Medal, RotateCcw, Target, TriangleAlert } from "lucide-react";
import { Badge, ButtonLink, Card, EmptyState, MasteryBar, pct } from "@/components/ui";
import { getPyLesson, getPyModule, pyModuleOf } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { pyState } from "@/server/python/state";
import { HUE_CLASSES } from "@/lib/palette";

export const metadata: Metadata = { title: "Python Mastery" };

function duration(s: number) {
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

function scopeTitle(kind: string, scopeId: string) {
  if (kind === "module") return `Module ${getPyModule(scopeId)?.number}: ${getPyModule(scopeId)?.title}`;
  if (kind === "level") return `Level ${scopeId} checkpoint`;
  return kind === "final" ? "Final assessment" : kind === "interview" ? "Mock interview" : "Mixed-topic test";
}

export default async function PythonDashboard() {
  const user = await requirePageUser(["STUDENT"]);
  const s = await pyState(await getDb(), user.id);
  const next = s.next ? getPyLesson(s.next) : null;
  const nextModule = next ? pyModuleOf(next.id) : null;
  const nextInfo = next ? s.lessonInfo.get(next.id) : null;
  const started = s.modules.filter((m) => m.started);
  const fresh = s.totals.questionsAnswered === 0 && s.coding.checks === 0;

  const stats = [
    { label: "Lessons completed", value: `${s.totals.lessonsDone}/${s.totals.lessonsTotal}`, icon: BookOpen, hue: HUE_CLASSES.accent },
    { label: "Modules completed", value: `${s.totals.modulesDone}/${s.totals.modulesTotal}`, icon: Target, hue: HUE_CLASSES.concept },
    { label: "Learning streak", value: `${s.streak.current} day${s.streak.current === 1 ? "" : "s"}`, hint: `best ${s.streak.best}`, icon: Flame, hue: HUE_CLASSES.clay },
    { label: "Active time", value: duration(s.timeSeconds), hint: `${duration(s.weekSeconds)} this week`, icon: Clock, hue: HUE_CLASSES.sky },
    { label: "Coding accuracy", value: s.coding.accuracy === null ? "—" : pct(s.coding.accuracy), hint: `${s.coding.passedChecks}/${s.coding.checks} checks passed`, icon: Code2, hue: HUE_CLASSES.teal },
    { label: "Question accuracy", value: s.totals.questionAccuracy === null ? "—" : pct(s.totals.questionAccuracy), hint: `${s.totals.questionsAnswered} answered`, icon: Medal, hue: HUE_CLASSES.success },
    { label: "Projects", value: `${s.projects.modulePassed + s.projects.portfolioDone.length}`, hint: `${s.projects.modulePassed} mini · ${s.projects.portfolioDone.length} portfolio`, icon: FolderKanban, hue: HUE_CLASSES.pink },
    { label: "Revision due", value: `${s.revisionDue.length}`, hint: s.revisionDue.length ? "topics to review" : "nothing due", icon: RotateCcw, hue: HUE_CLASSES.hint },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Python Mastery · beginner to professional</p>
          <h1 className="mt-1.5 text-[2rem] font-extrabold leading-10 tracking-[-0.03em]">Your Python dashboard</h1>
        </div>
        <Badge tone="clay">{s.xp} Python XP</Badge>
      </header>

      <section aria-labelledby="next-h" className="relative overflow-hidden rounded-[var(--radius-panel)] bg-hero p-6 text-white shadow-pop sm:p-8">
        <div aria-hidden className="bg-dots absolute inset-0 opacity-50" />
        <div className="relative">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">Recommended next</span>
          {next && nextModule ? (
            <>
              <h2 id="next-h" className="mt-3 text-[1.7rem] font-extrabold leading-tight">{nextInfo?.status === "in_progress" ? "Continue" : fresh ? "Start" : "Next"}: {next.title}</h2>
              <p className="mt-1 text-sm text-white/85">Module {nextModule.number}: {nextModule.title} · about {next.minutes} min</p>
            </>
          ) : <h2 id="next-h" className="mt-3 text-[1.7rem] font-extrabold">Every lesson is complete — keep your skills fresh with revision and challenges.</h2>}
          <div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-white/20" role="meter" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(s.totals.percent * 100)}>
            <div className="h-full rounded-full bg-white" style={{ width: `${s.totals.percent * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-white/80">{Math.round(s.totals.percent * 100)}% of lessons completed (a lesson counts when its exercise passes and its questions are mastered)</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {next && <ButtonLink href={`/app/python/learn/${next.id}`} size="lg" variant="inverse">Open the lesson <ArrowRight size={18} aria-hidden /></ButtonLink>}
            {s.revisionDue.length > 0 && <ButtonLink href="/app/python/revise" size="lg" variant="inverse">Revise {s.revisionDue.length} topic{s.revisionDue.length > 1 ? "s" : ""}</ButtonLink>}
            <ButtonLink href="/app/python/roadmap" size="lg" variant="inverse">See the roadmap</ButtonLink>
          </div>
        </div>
      </section>

      <section aria-label="Your numbers" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon, hue }) => (
          <Card key={label} className="p-4">
            <span className={clsx("grid h-9 w-9 place-items-center rounded-xl", hue.soft, hue.text)}><Icon size={18} aria-hidden /></span>
            <p className="mt-2 text-xl font-extrabold tabular">{value}</p>
            <p className="text-xs font-semibold text-ink-2">{label}</p>
            {hint && <p className="text-xs text-ink-3">{hint}</p>}
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5" as="section" aria-labelledby="mastery-h">
          <h2 id="mastery-h" className="font-bold">Topic mastery</h2>
          {started.length ? (
            <ul className="mt-3 space-y-3">
              {started.map((m) => (
                <li key={m.id}>
                  <div className="flex items-baseline justify-between gap-2 text-sm"><Link href={`/app/python/module/${m.id}`} className="font-semibold hover:text-accent">{m.number}. {m.title}</Link><span className="font-mono text-ink-2">{pct(m.mastery)}</span></div>
                  <MasteryBar value={m.mastery} className="mt-1" label={`${m.title} mastery`} />
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-ink-3">Mastery appears once you answer questions in a module.</p>}
        </Card>

        <Card className="p-5" as="section" aria-labelledby="weak-h">
          <h2 id="weak-h" className="flex items-center gap-2 font-bold"><TriangleAlert size={16} className="text-hint" aria-hidden /> Weak topics</h2>
          {s.weak.length ? (
            <ul className="mt-3 space-y-2">
              {s.weak.slice(0, 6).map((w) => (
                <li key={w.lessonId} className="flex flex-wrap items-center gap-2 text-sm">
                  <Link href={`/app/python/learn/${w.lessonId}`} className="min-w-0 flex-1 font-semibold hover:text-accent">{w.title}</Link>
                  <span className="font-mono text-xs text-ink-2">{pct(w.mastery)} · {w.attempts} attempts</span>
                  <Link href={`/app/python/practice?lesson=${w.lessonId}`} className="text-xs font-bold text-accent hover:underline">Practise</Link>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-ink-3">No weak topics. A topic shows up here when your recent accuracy on it drops below 60% (after at least 3 attempts).</p>}
          {s.mistakes.length > 0 && <p className="mt-3 text-sm"><Link href="/app/python/revise#mistakes" className="font-semibold text-accent hover:underline">{s.mistakes.length} question{s.mistakes.length > 1 ? "s" : ""} to get right next time →</Link></p>}
        </Card>

        <Card className="p-5" as="section" aria-labelledby="scores-h">
          <h2 id="scores-h" className="font-bold">Assessment scores</h2>
          {s.assessments.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {s.assessments.slice(0, 8).map((a) => (
                <li key={a.id}><Link href={`/app/python/assessment/${a.id}`} className="flex flex-wrap items-center gap-2 hover:text-accent">
                  <span className="min-w-0 flex-1">{scopeTitle(a.kind, a.scopeId)}</span>
                  <span className="font-mono">{a.score}/{a.total}</span>
                  {a.passed ? <Badge tone="success">passed</Badge> : <Badge tone="hint">not passed</Badge>}
                </Link></li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-ink-3">No assessments yet. Each module ends with one.</p>}
        </Card>

        <Card className="p-5" as="section" aria-labelledby="history-h">
          <h2 id="history-h" className="font-bold">Practice history</h2>
          {s.history.length ? (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs text-ink-3"><tr><th scope="col" className="pb-1">Day</th><th scope="col" className="pb-1">Questions</th><th scope="col" className="pb-1">Code checks</th><th scope="col" className="pb-1">Modes</th></tr></thead>
              <tbody>
                {s.history.slice(0, 7).map((h) => (
                  <tr key={h.day} className="border-t border-line">
                    <td className="py-1.5 font-mono text-xs">{h.day}</td>
                    <td className="py-1.5">{h.correct}/{h.answered}</td>
                    <td className="py-1.5">{h.passed}/{h.checks}</td>
                    <td className="py-1.5 text-xs text-ink-3">{h.modes.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="mt-3 text-sm text-ink-3">Your daily activity will appear here.</p>}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-5" as="section" aria-labelledby="levels-h">
          <h2 id="levels-h" className="font-bold">Levels</h2>
          <ul className="mt-3 space-y-2.5">
            {s.levels.map((lv) => (
              <li key={lv.number} className="text-sm">
                <div className="flex justify-between gap-2"><span className="font-semibold">Level {lv.number}: {lv.title}</span><span className="text-ink-3">{lv.modulesDone}/{lv.modulesTotal} modules</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunken"><div className="h-full rounded-full bg-concept" style={{ width: `${lv.modulesTotal ? (lv.modulesDone / lv.modulesTotal) * 100 : 0}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5" as="section" aria-labelledby="ms-h">
          <h2 id="ms-h" className="font-bold">Milestones</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {s.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                <span aria-hidden>{m.at ? "🏅" : "○"}</span>
                <span className={m.at ? "font-semibold" : "text-ink-3"}>{m.title}</span>
                {m.at && <span className="ml-auto text-xs text-ink-3">{m.at.toLocaleDateString("en-IN")}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {fresh && (
        <EmptyState title="New to Python? Start with lesson 1." action={<ButtonLink href="/app/python/learn/py-what-is-python">Start learning Python</ButtonLink>}>
          All numbers on this page come from what you actually do: answers, judged code, assessments and active time. Nothing is pre-filled.
        </EmptyState>
      )}
    </div>
  );
}
