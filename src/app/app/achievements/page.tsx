import type { Metadata } from "next";
import clsx from "clsx";
import { Check, Lock, Trophy } from "lucide-react";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { achievementsFor } from "@/server/services/students";
import { LEVELS, XP_RULES, progression } from "@/server/services/progression";
import { Card, PageHeader } from "@/components/ui";
import { LevelCard } from "@/components/app/Progress";

export const metadata: Metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const user = await requirePageUser(["STUDENT"]);
  const [list, prog] = await Promise.all([achievementsFor(user.id), getDb().then((db) => progression(db, user.id))]);
  const earned = list.filter((a) => a.earnedAt).length;
  return (
    <div className="space-y-8">
      <PageHeader title="Achievements & rank" subtitle="Compete with yourself. XP and badges come only from real learning — solving (more for harder and hint-free), fixing mistakes, clearing misunderstandings and finishing lessons. Wrong answers never cost XP." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <LevelCard p={prog} />
        <Card className="p-5" as="section" aria-labelledby="ladder">
          <h2 id="ladder" className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Rank ladder</h2>
          <ol className="mt-3 space-y-2">
            {LEVELS.map((l, i) => {
              const reached = prog.xp >= l.xp;
              const current = i === prog.level.index;
              return (
                <li key={l.name} className={clsx("flex items-center gap-3 rounded-[0.75rem] border px-3 py-2.5 text-sm", current ? "border-clay/40 bg-clay-soft/60" : "border-line")} aria-current={current ? "step" : undefined}>
                  <span className={clsx("grid h-7 w-7 place-items-center rounded-full text-xs font-bold", reached ? "bg-clay text-on-accent" : "bg-sunken text-ink-3")}>{reached ? <Check size={14} aria-hidden /> : i + 1}</span>
                  <span className={clsx("flex-1 font-semibold", !reached && "text-ink-2")}>{l.name}</span>
                  <span className="font-mono text-xs text-ink-3">{l.xp.toLocaleString()} XP</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs text-ink-3">A solve is worth {XP_RULES.base(1)}–{XP_RULES.base(5)} XP by difficulty, scaled down when you used hints or retries.</p>
        </Card>
      </div>

      <section aria-labelledby="badges">
        <h2 id="badges" className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Badges · {earned} of {list.length}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <Card as="li" key={a.code} className={clsx("flex gap-3 p-4", !a.earnedAt && "opacity-70")}>
              <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.75rem]", a.earnedAt ? "bg-clay-soft text-clay" : "bg-sunken text-ink-3")}>
                {a.earnedAt ? <Trophy size={20} aria-hidden /> : <Lock size={18} aria-hidden />}
              </span>
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-ink-2">{a.description}</p>
                <p className="mt-1 text-xs text-ink-3">{a.earnedAt ? `Earned ${new Date(a.earnedAt).toLocaleDateString()}` : "Not yet"}</p>
              </div>
            </Card>
          ))}
        </ul>
      </section>
    </div>
  );
}
