import type { Metadata } from "next";
import { CalendarCheck, Clock, Sparkles, TriangleAlert } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { parentOverview } from "@/server/services/parents";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, EmptyState, MasteryBar, PageHeader, pct } from "@/components/ui";
import { LinkChildForm, LogoutButton } from "@/components/app/SimpleForms";
import { AccountSecurity, ChildResetLinkButton } from "@/components/auth/AccountSecurity";
import { hasRecoveryCode } from "@/server/auth/recovery";

export const metadata: Metadata = { title: "Mentor dashboard" };

export default async function ParentPage() {
  const user = await requirePageUser(["PARENT"]);
  const [kids, hasCode] = await Promise.all([parentOverview(user.id), hasRecoveryCode(user.id)]);
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 sm:px-8">
        <Logo href="/parent" />
        <div className="flex items-center gap-1"><ThemeToggle /><LogoutButton /></div>
      </header>
      <main id="main" className="mx-auto max-w-4xl px-4 py-8">
        <PageHeader title={`Hello, ${user.displayName}`} subtitle="A plain-language view of how your student is learning — for parents, teachers and mentors. You see progress and areas to support, not their code or private tutor chats." />
        <div className="space-y-6">
          {kids.length === 0 && (
            <EmptyState title="No linked learner yet">
              Ask the student to open <span className="font-semibold">Settings → Parent access</span> and create a link code, then enter it below.
            </EmptyState>
          )}
          {kids.map((k) => (
            <Card key={k.studentId} className="space-y-5 p-6" as="section" aria-labelledby={`kid-${k.studentId}`}>
              <h2 id={`kid-${k.studentId}`} className="text-xl font-bold">{k.name}</h2>
              {!k.hasActivity ? (
                <p className="text-ink-2">{k.name} hasn&apos;t completed any learning yet. This page fills in after their first session.</p>
              ) : (
                <>
                  {k.headline && <p className="rounded-xl bg-accent-soft px-4 py-3 text-ink">{k.headline}</p>}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-line p-3"><p className="flex items-center gap-1.5 text-xs text-ink-3"><Clock size={13} aria-hidden /> Learning time (7 days)</p><p className="mt-1 text-xl font-bold">{k.week.minutes} min</p></div>
                    <div className="rounded-xl border border-line p-3"><p className="text-xs text-ink-3">Sessions completed (7 days)</p><p className="mt-1 text-xl font-bold">{k.week.sessions}</p></div>
                    <div className="rounded-xl border border-line p-3"><p className="flex items-center gap-1.5 text-xs text-ink-3"><CalendarCheck size={13} aria-hidden /> Days with learning</p><p className="mt-1 text-xl font-bold">{k.week.learningDays} / 7</p></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><p className="text-sm font-semibold text-success">Doing well with</p><p className="mt-1 text-sm text-ink-2">{k.strengths.join(", ") || "Not enough practice yet to say."}</p></div>
                    <div><p className="text-sm font-semibold text-hint">Still practising</p><p className="mt-1 text-sm text-ink-2">{k.toPractise.join(", ") || "Nothing stands out right now."}</p></div>
                    <div><p className="text-sm font-semibold">Topics mastered</p><p className="mt-1 text-sm text-ink-2">{k.conceptsLearned.join(", ") || "None fully mastered yet — that takes several sessions."}</p></div>
                    <div><p className="text-sm font-semibold">Currently learning</p><p className="mt-1 text-sm text-ink-2">{k.practising.join(", ") || "—"}</p></div>
                  </div>
                  {k.mistakes.length > 0 && (
                    <div className="rounded-xl bg-hint-soft p-4 text-sm">
                      <p className="flex items-center gap-1.5 font-semibold text-hint"><TriangleAlert size={15} aria-hidden /> Recurring misunderstandings</p>
                      <ul className="mt-1 text-ink-2">{k.mistakes.map((m) => <li key={m.title}>{m.title} (seen {m.times}×)</li>)}</ul>
                    </div>
                  )}
                  {k.weekly.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold">This week&apos;s progress</p>
                      <ul className="mt-2 space-y-2">
                        {k.weekly.map((w) => (
                          <li key={w.concept} className="text-sm">
                            <div className="flex justify-between"><span>{w.concept}</span><span className="font-mono text-ink-2">{w.from === null ? "" : `${pct(w.from)} → `}{pct(w.to)}</span></div>
                            <MasteryBar value={w.to} className="mt-1" label={`${w.concept} progress`} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-ink-2">Revision: {k.revision.reviewedThisWeek} review{k.revision.reviewedThisWeek === 1 ? "" : "s"} done this week{k.revision.overdue ? `, ${k.revision.overdue} waiting` : ""}.</p>
                  {k.support && <p className="flex gap-2 rounded-xl border border-concept/30 bg-concept-soft px-4 py-3 text-sm text-ink"><Sparkles size={16} className="mt-0.5 shrink-0 text-concept" aria-hidden /> {k.support}</p>}
                </>
              )}
              <div className="border-t border-line pt-4"><ChildResetLinkButton studentId={k.studentId} name={k.name} /></div>
            </Card>
          ))}
          <Card className="p-6" as="section" aria-labelledby="link">
            <h2 id="link" className="mb-3 font-semibold">Link a student</h2>
            <LinkChildForm />
          </Card>
          <AccountSecurity hasRecoveryCode={hasCode} />
        </div>
      </main>
    </div>
  );
}
