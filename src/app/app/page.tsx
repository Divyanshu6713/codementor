import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CalendarDays, Code2, Dumbbell, Lightbulb, Map, Medal, NotebookPen, RotateCcw, Swords, Trophy } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { dashboard } from "@/server/services/students";
import { ButtonLink, Card, MasteryBar, pct } from "@/components/ui";
import { StartSessionButton } from "@/components/app/StartSessionButton";
import { LevelCard, PersonalBests } from "@/components/app/Progress";
import { DIFFICULTY, HUE_CLASSES, topicHue } from "@/lib/palette";

export const metadata: Metadata = { title: "Home" };

const LENGTHS = [
  { value: "quick", label: "Quick", note: "~10 min" },
  { value: "normal", label: "Normal", note: "~25 min" },
  { value: "deep", label: "Deep", note: "~45 min" },
] as const;

function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ length?: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const sp = await searchParams;
  const length = (["quick", "normal", "deep"] as const).find((l) => l === sp.length) ?? "normal";
  const d = await dashboard(user.id, length);
  const decision = d.decision;

  const primary = (() => {
    if (d.activeSession) return null;
    switch (decision.action) {
      case "diagnostic": return { label: "Start the placement check", body: { mode: "diagnostic" as const } };
      case "content_pending": return decision.alternative ? { label: `Start ${decision.alternative.title} anyway`, body: { mode: "recommended" as const, length, useAlternative: true } } : null;
      case "all_done": return null;
      default: return { label: decision.action === "revise" ? "Start revision" : decision.action === "practice" ? "Start practice" : "Continue learning", body: { mode: "recommended" as const, length } };
    }
  })();

  const tiles = [
    { href: "/app/arena", label: "Practice Arena", icon: Swords, hint: `${d.arena.solved} of ${d.arena.total} problems solved`, hue: HUE_CLASSES.pink },
    { href: "/app/practice", label: "Practice", icon: Dumbbell, hint: "Adaptive sets by topic or weakness", hue: HUE_CLASSES.teal },
    { href: "/app/revise", label: "Revise", icon: RotateCcw, hint: d.revisionDue ? `${d.revisionDue} skill${d.revisionDue === 1 ? "" : "s"} due` : "Nothing due right now", badge: d.revisionDue, hue: HUE_CLASSES.sky },
    { href: "/app/mistakes", label: "Mistake Book", icon: NotebookPen, hint: d.openMistakes ? `${d.openMistakes} to fix` : "All clear", badge: d.openMistakes, hue: HUE_CLASSES.hint },
    { href: "/app/playground", label: "Playground", icon: Code2, hint: "Write and run any C++", hue: HUE_CLASSES.concept },
    { href: "/app/skills", label: "Skill Map", icon: Map, hint: `${d.track.masteredSkills} of ${d.track.totalSkills} skills mastered`, hue: HUE_CLASSES.success },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">{d.track.title}{d.currentConcept ? ` · ${d.currentConcept}` : ""}</p>
          <h1 className="mt-1.5 text-[2rem] font-extrabold leading-10 tracking-[-0.03em]">{greeting()}, <span className="text-hero">{user.displayName}</span></h1>
        </div>
        <Link href="/app/achievements" className="flex items-center gap-2 rounded-full border border-clay/30 bg-clay-soft px-3.5 py-1.5 text-sm font-bold text-clay shadow-card transition-transform hover:-translate-y-0.5">
          <Trophy size={15} aria-hidden /> {d.progress.level.name} · <span className="tabular">{d.progress.xp} XP</span>
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* The next recommended action is always the most obvious thing on the page. */}
        <section aria-labelledby="next-title" className="relative overflow-hidden rounded-[var(--radius-panel)] bg-hero text-white shadow-pop animate-rise">
          <div aria-hidden className="bg-dots absolute inset-0 opacity-50" />
          <div aria-hidden className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative p-6 sm:p-8">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">{d.activeSession ? "In progress" : "Recommended next"}</span>
            <h2 id="next-title" className="mt-3 text-[1.7rem] font-extrabold leading-tight tracking-[-0.02em]">{d.activeSession ? d.activeSession.title : decision.title}</h2>
            {d.activeSession && <p className="mt-2 text-sm text-white/85">Pick up exactly where you stopped — finishing earns <span className="font-bold text-[#ffd166]">+30 XP</span> on top of every solve.</p>}
            {decision.reasons.length > 0 && decision.action !== "diagnostic" && (
              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-sm font-bold"><Lightbulb size={16} className="text-[#ffd166]" aria-hidden /> Why this?</p>
                <ul className="mt-2 space-y-1.5 text-sm text-white/85">
                  {decision.reasons.map((r) => <li key={r} className="flex gap-2"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffd166]" />{r}</li>)}
                </ul>
              </div>
            )}
            {!d.activeSession && decision.action !== "diagnostic" && d.plan.length > 0 && (
              <div className="mt-5 rounded-[0.9rem] bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold">Today&apos;s plan</p>
                  <div className="flex rounded-full bg-white/15 p-0.5 text-xs" role="group" aria-label="Session length">
                    {LENGTHS.map((l) => (
                      <Link key={l.value} href={`/app?length=${l.value}`} scroll={false} aria-current={length === l.value ? "true" : undefined} title={l.note}
                        className={clsx("rounded-full px-3 py-1 font-bold transition-colors", length === l.value ? "bg-white text-[#1f3fbf]" : "text-white/80 hover:text-white")}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <ol className="mt-3 space-y-2">
                  {d.plan.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-11 shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-center font-mono text-xs font-bold">{b.minutes}m</span>
                      <span className="text-white/90">{b.label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {d.activeSession && <ButtonLink href={`/app/session/${d.activeSession.id}`} size="lg" variant="inverse">Resume where you left off <ArrowRight size={18} aria-hidden /></ButtonLink>}
              {primary && <StartSessionButton variant="inverse" body={primary.body} label={primary.label} />}
              {decision.action === "all_done" && <ButtonLink href="/app/revise" size="lg" variant="inverse">Go to revision</ButtonLink>}
            </div>
          </div>
        </section>
        <LevelCard p={d.progress} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {d.daily && (
          <section aria-labelledby="daily" className="rounded-[var(--radius-card)] bg-hero p-[2px] shadow-card">
            <div className="flex h-full flex-wrap items-center gap-5 rounded-[calc(var(--radius-card)-2px)] bg-surface p-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-hero text-white shadow-pop"><CalendarDays size={26} aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-concept">Daily Challenge · +{d.daily.bonus} bonus XP</p>
                <h2 id="daily" className="mt-0.5 text-lg font-extrabold">{d.daily.title}</h2>
                <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
                  <span className={clsx("rounded-full px-2 py-0.5 font-bold", HUE_CLASSES[DIFFICULTY[d.daily.difficulty].hue].soft, HUE_CLASSES[DIFFICULTY[d.daily.difficulty].hue].text)}>{DIFFICULTY[d.daily.difficulty].label}</span>
                  <span className={clsx("rounded-full px-2 py-0.5 font-semibold", HUE_CLASSES[topicHue(d.daily.conceptId)].soft, HUE_CLASSES[topicHue(d.daily.conceptId)].text)}>{d.daily.conceptTitle}</span>
                </p>
              </div>
              {d.daily.solvedToday
                ? <span className="rounded-full bg-success-soft px-3 py-1.5 text-sm font-bold text-success">Solved today ✓</span>
                : <StartSessionButton size="md" body={{ mode: "problem", questionId: d.daily.id }} label="Take it on" />}
            </div>
          </section>
        )}
        <Link href="/app/leaderboard" className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-clay/25 bg-clay-soft/60 p-5 shadow-card transition-transform hover:-translate-y-0.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-clay text-white"><Medal size={24} aria-hidden /></span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Weekly leaderboard</p>
            <p className="mt-0.5 font-bold">
              {!d.board.joined ? "Join to see where you rank" : d.board.rank ? `You're #${d.board.rank} this week` : "Earn XP to get ranked"}
            </p>
            <p className="text-xs text-ink-2">
              {d.board.leader ? (d.board.leader.you ? "You're leading this week!" : `Leader: ${d.board.leader.name} · ${d.board.leader.xp} XP`) : `${d.board.participants} on the board`}
            </p>
          </div>
          <ArrowRight size={18} className="text-clay transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      <section aria-labelledby="bests">
        <h2 id="bests" className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Personal bests</h2>
        <PersonalBests p={d.progress} learningDays={d.learningDaysThisWeek} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section aria-label="Shortcuts" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map(({ href, label, icon: Icon, hint, badge, hue }) => (
            <Link key={href} href={href} className={clsx("group flex min-h-[7.5rem] flex-col gap-3 rounded-[var(--radius-card)] border bg-surface p-4 shadow-card transition-[transform,box-shadow] duration-300 ease-[var(--ease-calm)] hover:-translate-y-1 hover:shadow-pop", hue.border)}>
              <span className="flex items-center justify-between">
                <span className={clsx("grid h-11 w-11 place-items-center rounded-2xl", hue.soft, hue.text)}><Icon size={21} aria-hidden /></span>
                {badge ? <span className="rounded-full bg-hint px-2 py-0.5 text-xs font-bold text-white">{badge}</span> : null}
              </span>
              <span>
                <span className="block font-bold">{label}</span>
                <span className="block text-xs text-ink-3">{hint}</span>
              </span>
            </Link>
          ))}
        </section>
        <Card className="p-6" as="section" aria-labelledby="changes">
          <div className="flex items-center justify-between">
            <h2 id="changes" className="font-bold">Recent mastery changes</h2>
            <Link href="/app/skills" className="flex items-center gap-1 text-sm font-bold text-accent hover:underline"><Map size={15} aria-hidden /> Skill Map</Link>
          </div>
          {d.recentChanges.length ? (
            <ul className="mt-4 space-y-4">
              {d.recentChanges.map((c) => (
                <li key={c.title}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{c.title}</span>
                    <span className="font-mono text-ink-2">{pct(c.before)} → <span className="font-bold text-ink">{pct(c.after)}</span></span>
                  </div>
                  <MasteryBar value={c.after} className="mt-1.5" label={`${c.title} mastery`} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-2">{d.hasActivity ? "No changes since your last session." : "Your mastery estimates appear here after your first session."}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
