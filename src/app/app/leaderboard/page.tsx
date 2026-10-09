import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { Crown, EyeOff, Medal, Trophy } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { leaderboard } from "@/server/services/arena";
import { Card, EmptyState } from "@/components/ui";
import { LeaderboardToggle } from "@/components/app/LeaderboardToggle";

export const metadata: Metadata = { title: "Leaderboard" };

const PODIUM = [
  { cls: "bg-[linear-gradient(160deg,#ffd166,#f59e0b)]", h: "h-28", label: "1st" },
  { cls: "bg-[linear-gradient(160deg,#dbe4f3,#9fb0cc)]", h: "h-20", label: "2nd" },
  { cls: "bg-[linear-gradient(160deg,#ffb38a,#d9733c)]", h: "h-16", label: "3rd" },
];

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const period = (await searchParams).period === "all" ? "all" : "week";
  const lb = await leaderboard(user.id, period);
  const podiumOrder = [lb.top[1], lb.top[0], lb.top[2]];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[var(--radius-panel)] bg-hero p-6 text-white shadow-pop sm:p-8">
        <div aria-hidden className="bg-dots absolute inset-0 opacity-60" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80"><Trophy size={15} aria-hidden /> Leaderboard</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{period === "week" ? "This week's top learners" : "All-time top learners"}</h1>
            <p className="mt-2 max-w-lg text-white/85">Ranked by XP from real learning. Only students who chose to join appear — your name and XP, nothing else.</p>
          </div>
          <div className="flex rounded-full bg-white/15 p-1 text-sm font-bold backdrop-blur-sm" role="group" aria-label="Period">
            {(["week", "all"] as const).map((p) => (
              <Link key={p} href={`/app/leaderboard?period=${p}`} aria-current={period === p ? "true" : undefined}
                className={clsx("rounded-full px-4 py-1.5", period === p ? "bg-white text-accent-ink" : "text-white/85 hover:text-white")}>
                {p === "week" ? "This week" : "All time"}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <span className={clsx("grid h-10 w-10 place-items-center rounded-[0.75rem]", lb.joined ? "bg-success-soft text-success" : "bg-sunken text-ink-3")}>
            {lb.joined ? <Medal size={20} aria-hidden /> : <EyeOff size={20} aria-hidden />}
          </span>
          <div className="text-sm">
            <p className="font-semibold">{lb.joined ? (lb.you ? `You're #${lb.you.rank} ${period === "week" ? "this week" : "overall"} with ${lb.you.xp} XP` : "You're on the board — earn XP to get ranked") : "You're not on the leaderboard"}</p>
            <p className="text-ink-2">{lb.joined ? "Others see your display name and XP. You can leave any time." : "Join to compare XP with other students. Off by default; you can leave any time."}</p>
          </div>
        </div>
        <LeaderboardToggle joined={lb.joined} />
      </Card>

      {lb.top.length === 0 ? (
        <EmptyState title="No one is ranked yet" icon={<Trophy size={28} />}>
          {lb.participants <= 1 ? "Be the first to join — the board fills up as more students opt in and earn XP." : "No XP earned yet in this period. Solve a problem to take the top spot."}
        </EmptyState>
      ) : (
        <>
          {lb.top.length >= 3 && (
            <div className="grid grid-cols-3 items-end gap-3 sm:mx-auto sm:max-w-xl" aria-label="Top three">
              {podiumOrder.map((r) => r && (
                <div key={r.id} className="flex flex-col items-center gap-2 text-center">
                  {r.rank === 1 && <Crown size={22} className="text-[#f59e0b]" aria-hidden />}
                  <span className={clsx("grid h-12 w-12 place-items-center rounded-full text-lg font-extrabold text-white shadow-card", PODIUM[r.rank - 1].cls)}>{r.name.slice(0, 1).toUpperCase()}</span>
                  <p className="max-w-full truncate text-sm font-bold">{r.name}{r.you ? " (you)" : ""}</p>
                  <p className="text-xs font-bold text-clay tabular">{r.xp} XP</p>
                  <div className={clsx("w-full rounded-t-[0.9rem] text-sm font-extrabold text-white", PODIUM[r.rank - 1].cls, PODIUM[r.rank - 1].h)}>
                    <span className="mt-2 inline-block">{PODIUM[r.rank - 1].label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <caption className="sr-only">Rankings</caption>
              <thead className="bg-sunken/70 text-left text-xs font-semibold uppercase tracking-wider text-ink-3">
                <tr><th className="w-16 px-4 py-3">Rank</th><th className="px-2 py-3">Student</th><th className="hidden px-2 py-3 sm:table-cell">Rank title</th><th className="hidden px-2 py-3 sm:table-cell">Best streak</th><th className="px-4 py-3 text-right">XP</th></tr>
              </thead>
              <tbody>
                {lb.top.map((r) => (
                  <tr key={r.id} className={clsx("border-t border-line/70", r.you && "bg-accent-soft/60")}>
                    <td className="px-4 py-3 font-extrabold tabular">{r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : `#${r.rank}`}</td>
                    <td className="px-2 py-3 font-semibold">{r.name}{r.you && <span className="ml-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-on-accent">YOU</span>}</td>
                    <td className="hidden px-2 py-3 text-ink-2 sm:table-cell">{r.level}</td>
                    <td className="hidden px-2 py-3 text-ink-2 sm:table-cell">{r.streak} in a row</td>
                    <td className="px-4 py-3 text-right font-extrabold text-clay tabular">{r.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
      <p className="text-xs text-ink-3">{lb.participants} student{lb.participants === 1 ? "" : "s"} on the board. Weekly XP covers the last 7 days.</p>
    </div>
  );
}
