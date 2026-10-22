import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ExercisePanel } from "@/components/python/ExercisePanel";
import { Badge, PageHeader } from "@/components/ui";
import { getPyExercise, getPyModule, publicExercise } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { executionStatus } from "@/server/execution/providers";
import { exerciseState, loadCode } from "@/server/python/exercises";

export const metadata: Metadata = { title: "Python challenge" };

export default async function ChallengePage({ params }: { params: Promise<{ key: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const key = decodeURIComponent((await params).key);
  const ref = getPyExercise(key);
  if (!ref) notFound();
  const db = await getDb();
  const [st, saved, exec] = await Promise.all([exerciseState(db, user.id, key), loadCode(db, user.id, `ex:${key}`), executionStatus("python")]);
  const mod = ref.moduleId ? getPyModule(ref.moduleId) : null;
  return (
    <div>
      <Link href="/app/python/challenges" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft size={16} aria-hidden /> All challenges</Link>
      <PageHeader eyebrow={mod ? `Module ${mod.number}: ${mod.title}` : "Challenge"} title={ref.title} />
      <div className="mb-4 flex flex-wrap gap-2"><Badge>Level {ref.ex.difficulty}</Badge>{ref.lessonId && <Link href={`/app/python/learn/${ref.lessonId}`} className="text-sm font-semibold text-accent hover:underline">From the lesson →</Link>}</div>
      <ExercisePanel exercise={publicExercise(ref)} mode="challenge" timed
        initial={{ hintLevel: st.hintLevel, solutionViewed: st.solutionViewed, passed: st.passed, saved: saved?.code ?? null, bestMs: st.bestMs }}
        exec={{ available: exec.available, devOnly: exec.devOnly, message: exec.message }} />
    </div>
  );
}
