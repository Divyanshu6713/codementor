import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { CalendarClock, CheckCircle2, Lightbulb, Sparkles, Target, Trophy } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { getDb, schema } from "@/server/db/client";
import { buildReport, type SessionReport } from "@/server/services/reports";
import { Badge, ButtonLink, Card, MasteryBar, pct } from "@/components/ui";
import { StartSessionButton } from "@/components/app/StartSessionButton";

export const metadata: Metadata = { title: "Session report" };

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await getDb();
  const s = await db.query.learningSessions.findFirst({ where: eq(schema.learningSessions.id, id) });
  if (!s || s.studentId !== user.id) notFound();
  if (s.status === "active") redirect(`/app/session/${id}`);
  const r = (s.report as SessionReport | null) ?? (await buildReport(db, user.id, id));

  const stats = [
    { label: "Time", value: `${r.minutes} min` },
    { label: "Questions", value: r.questions },
    { label: "Correct", value: r.correct },
    { label: "On your own", value: r.independent, note: "no hints" },
    { label: "Accuracy", value: r.accuracy === null ? "—" : `${Math.round(r.accuracy * 100)}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Badge tone="success"><CheckCircle2 size={13} aria-hidden /> {r.kind === "diagnostic" ? "Placement check complete" : "Session complete"}</Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{r.concept?.title ?? r.title}</h1>
      </div>

      {r.xp && r.kind !== "diagnostic" && (
        <section aria-label="XP and level" className="flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-clay/25 bg-clay-soft/60 px-5 py-4">
          <p className="text-3xl font-extrabold text-clay tabular">+{r.xp.earned} XP</p>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{r.xp.level.name} · {r.xp.total} XP total</p>
            <p className="text-ink-2">{r.xp.level.next ? `${r.xp.level.toNext} XP to ${r.xp.level.next}` : "Top rank reached"}</p>
          </div>
          {r.personalBest && <Badge tone="clay"><Trophy size={13} aria-hidden /> New best: {r.personalBest.streak} solo in a row (was {r.personalBest.previous})</Badge>}
        </section>
      )}

      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-line sm:grid-cols-5" as="section" aria-label="Session numbers">
        {stats.map((x) => (
          <div key={x.label} className="bg-surface p-4">
            <p className="text-xs text-ink-3">{x.label}</p>
            <p className="mt-0.5 text-2xl font-bold">{x.value}</p>
            {x.note && <p className="text-xs text-ink-3">{x.note}</p>}
          </div>
        ))}
      </Card>

      {r.diagnostic && (
        <Card className="p-6" as="section" aria-labelledby="diag">
          <h2 id="diag" className="font-semibold">What the check found</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {r.diagnostic.filter((c) => c.status !== "unknown").map((c) => (
              <li key={c.conceptId} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                <span className="font-medium">{c.title}</span>
                <Badge tone={c.status === "pass" ? "success" : c.status === "partial" ? "accent" : c.status === "inferred" ? "neutral" : "hint"}>
                  {c.status === "pass" ? `solid (${c.correct}/${c.asked})` : c.status === "partial" ? `partly (${c.correct}/${c.asked})` : c.status === "inferred" ? "likely known" : `to learn (${c.correct}/${c.asked})`}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Topics that weren&apos;t asked about stay “not assessed” — we don&apos;t guess.</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {r.conceptMastery && (
          <Card className="p-6" as="section" aria-labelledby="mastery">
            <h2 id="mastery" className="flex items-center gap-2 font-semibold"><Target size={17} aria-hidden /> Concept mastery</h2>
            <p className="mt-3 font-mono text-3xl font-bold">{pct(r.conceptMastery.after)}</p>
            <p className="text-sm text-ink-2">was {pct(r.conceptMastery.before)} · {r.conceptConfidence ?? "Low"} confidence</p>
            <MasteryBar value={r.conceptMastery.after} className="mt-3" label="Concept mastery" />
            <p className="mt-3 text-xs text-ink-3">Confidence = how much evidence we have. It grows with varied questions over time.</p>
          </Card>
        )}
        <Card className="space-y-4 p-6" as="section" aria-label="Strengths and practice">
          {r.strong.length > 0 && <div><p className="text-sm font-semibold text-success">Strong areas</p><p className="mt-1 text-sm text-ink-2">{r.strong.join(", ")}</p></div>}
          {r.needsPractice.length > 0 && <div><p className="text-sm font-semibold text-hint">Needs practice</p><p className="mt-1 text-sm text-ink-2">{r.needsPractice.join(", ")}</p></div>}
          {r.importantMistake && (
            <div className="rounded-xl bg-hint-soft p-3 text-sm">
              <p className="flex items-center gap-1.5 font-semibold text-hint"><Lightbulb size={15} aria-hidden /> Important mistake: {r.importantMistake.title}</p>
              <p className="mt-1 text-ink-2">{r.importantMistake.explanation} <span className="text-ink-3">(seen {r.importantMistake.count}× this session)</span></p>
            </div>
          )}
          {r.resolvedMisconceptions.length > 0 && <p className="text-sm text-success">Fixed this session: {r.resolvedMisconceptions.join(", ")}</p>}
          {!r.strong.length && !r.needsPractice.length && !r.importantMistake && <p className="text-sm text-ink-2">Not enough answers in this session to say more.</p>}
        </Card>
      </div>

      {(r.revision.length > 0 || r.achievements.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {r.revision.length > 0 && (
            <Card className="p-6" as="section" aria-labelledby="rev">
              <h2 id="rev" className="flex items-center gap-2 font-semibold"><CalendarClock size={17} aria-hidden /> Revision scheduled</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {r.revision.slice(0, 6).map((x) => <li key={x.skill} className="flex justify-between"><span>{x.skill}</span><span className="text-ink-3">{fmtDate(x.dueAt)}</span></li>)}
              </ul>
            </Card>
          )}
          {r.achievements.length > 0 && (
            <Card className="p-6" as="section" aria-labelledby="ach">
              <h2 id="ach" className="flex items-center gap-2 font-semibold"><Trophy size={17} aria-hidden /> New achievements</h2>
              <ul className="mt-3 space-y-2 text-sm">{r.achievements.map((a) => a && <li key={a.code}><span className="font-semibold">{a.title}</span> — <span className="text-ink-2">{a.description}</span></li>)}</ul>
            </Card>
          )}
        </div>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6" as="section" aria-labelledby="next">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-3"><Sparkles size={15} aria-hidden /> Recommended next</p>
          <h2 id="next" className="mt-1 text-xl font-bold">{r.next.title}</h2>
          {r.next.reasons[0] && <p className="mt-1 text-sm text-ink-2">{r.next.reasons[0]}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {r.next.action !== "all_done" && r.next.action !== "content_pending" && <StartSessionButton body={{ mode: "recommended" }} label="Continue learning" />}
          {r.next.action === "content_pending" && r.next.alternative && <StartSessionButton body={{ mode: "recommended", useAlternative: true }} label={`Start ${r.next.alternative.title}`} />}
          <ButtonLink href={r.kind === "diagnostic" ? "/app/skills" : "/app"} variant="secondary" size="lg">{r.kind === "diagnostic" ? "See my Skill Map" : "Back to home"}</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
