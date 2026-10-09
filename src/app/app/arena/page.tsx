import type { Metadata } from "next";
import { CalendarDays, Flame, Swords, Target, Zap } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { arenaProblems } from "@/server/services/arena";
import { progression } from "@/server/services/progression";
import { DIFFICULTY } from "@/lib/palette";
import { ArenaTable } from "@/components/app/ArenaTable";
import { StartSessionButton } from "@/components/app/StartSessionButton";
import { executionStatus } from "@/server/execution/providers";
import { Callout } from "@/components/ui";

export const metadata: Metadata = { title: "Practice Arena" };

export default async function ArenaPage() {
  const user = await requirePageUser(["STUDENT"]);
  const [arena, prog, exec] = await Promise.all([arenaProblems(user.id), getDb().then((db) => progression(db, user.id)), executionStatus()]);
  const solved = arena.problems.filter((p) => p.status === "solved").length;
  const daily = arena.daily;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[var(--radius-panel)] bg-hero p-6 text-white shadow-pop sm:p-8">
        <div aria-hidden className="bg-dots absolute inset-0 opacity-60" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80"><Swords size={15} aria-hidden /> Practice Arena</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Solve. Climb. Repeat.</h1>
            <p className="mt-2 max-w-lg text-white/85">Real C++ problems judged on hidden tests. Harder problems and hint-free solves earn more XP.</p>
            <dl className="mt-5 flex flex-wrap gap-3">
              {[
                { icon: Target, k: "Solved", v: `${solved} / ${arena.problems.length}` },
                { icon: Zap, k: "Solo solves", v: prog.solvedSolo },
                { icon: Flame, k: "Solo streak", v: `${prog.streak.current} (best ${prog.streak.best})` },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k} className="rounded-[0.9rem] bg-white/15 px-4 py-2.5 backdrop-blur-sm">
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/75"><Icon size={13} aria-hidden /> {k}</dt>
                  <dd className="text-lg font-extrabold tabular">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {daily && (
            <div className="rounded-[var(--radius-card)] bg-white p-5 text-ink shadow-pop">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-concept"><CalendarDays size={14} aria-hidden /> Daily Challenge</p>
              <h2 className="mt-1.5 text-xl font-extrabold">{daily.title}</h2>
              <p className="mt-1 text-sm text-ink-2">{daily.conceptTitle} · {DIFFICULTY[daily.difficulty].label} · <span className="font-bold text-clay">+{arena.dailyBonus} bonus XP</span> today</p>
              <div className="mt-4 flex items-center gap-3">
                {prog.dailySolvedToday
                  ? <p className="rounded-full bg-success-soft px-3 py-1.5 text-sm font-bold text-success">Done for today — new one tomorrow</p>
                  : <StartSessionButton size="md" body={{ mode: "problem", questionId: daily.id }} label="Take the challenge" />}
              </div>
            </div>
          )}
        </div>
      </section>
      {!exec.available && <Callout tone="hint" title="Code execution environment not configured.">Problems can be read, but submissions can&apos;t be judged right now.</Callout>}
      <ArenaTable problems={arena.problems} />
    </div>
  );
}
