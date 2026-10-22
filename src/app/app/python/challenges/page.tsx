import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Timer } from "lucide-react";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { DIFFICULTY_NAMES, PY_EXERCISES, getPyModule, type PyDifficulty } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb, schema } from "@/server/db/client";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Python challenges" };

/** Challenge mode: the harder coding problems from across the course, timed or untimed. */
export default async function ChallengesPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const sp = await searchParams;
  const rows = await (await getDb()).select().from(schema.pyExerciseProgress).where(eq(schema.pyExerciseProgress.studentId, user.id));
  const byKey = new Map(rows.map((r) => [r.exerciseKey, r]));
  const all = PY_EXERCISES.filter((e) => !e.projectId && e.ex.kind !== "project" && (e.ex.kind === "challenge" || e.ex.difficulty >= 3));
  const level = Number(sp.level) || null;
  const list = level ? all.filter((e) => e.ex.difficulty === level) : all;
  const solved = all.filter((e) => byKey.get(e.key)?.passedAt).length;
  return (
    <div>
      <PageHeader eyebrow="Challenge mode" title="Coding challenges" subtitle={`${solved} of ${all.length} solved. Open any problem untimed, or start the clock for a timed attempt — your fastest judged pass is kept.`} />
      <nav aria-label="Filter by difficulty" className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/app/python/challenges" className={`rounded-full border px-3 py-1 font-semibold ${!level ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-ink-2"}`}>All</Link>
        {[3, 4, 5].map((d) => <Link key={d} href={`/app/python/challenges?level=${d}`} className={`rounded-full border px-3 py-1 font-semibold ${level === d ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-ink-2"}`}>Level {d}: {DIFFICULTY_NAMES[d as PyDifficulty]}</Link>)}
      </nav>
      {list.length === 0 ? <EmptyState title="No challenges at this level yet" /> : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((e) => {
            const row = byKey.get(e.key);
            const mod = e.moduleId ? getPyModule(e.moduleId) : null;
            return (
              <li key={e.key}>
                <Link href={`/app/python/challenges/${encodeURIComponent(e.key)}`} className="flex h-full flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card hover:border-accent/40">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge tone={e.ex.difficulty >= 5 ? "pink" : e.ex.difficulty >= 4 ? "clay" : "sky"}>Level {e.ex.difficulty}</Badge>
                    {e.ex.kind === "debug" && <Badge tone="hint">Debugging</Badge>}
                    {row?.passedAt && <Badge tone="success"><CheckCircle2 size={12} aria-hidden /> Solved</Badge>}
                    {row?.bestMs && <Badge tone="pink"><Timer size={12} aria-hidden /> {Math.round(row.bestMs / 1000)} s</Badge>}
                  </span>
                  <span className="font-bold">{e.title}</span>
                  {mod && <span className="text-xs text-ink-3">Module {mod.number}: {mod.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
