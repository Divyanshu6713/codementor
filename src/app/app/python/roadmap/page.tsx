import type { Metadata } from "next";
import { GuidedToggle } from "@/components/python/small";
import { Roadmap, type RoadmapLevel } from "@/components/python/Roadmap";
import { StartAssessmentButton } from "@/components/python/Assessment";
import { PageHeader } from "@/components/ui";
import { PY_LESSONS } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { pyState } from "@/server/python/state";

export const metadata: Metadata = { title: "Python roadmap" };

export default async function RoadmapPage() {
  const user = await requirePageUser(["STUDENT"]);
  const s = await pyState(await getDb(), user.id);
  const levels: RoadmapLevel[] = s.levels.map((lv) => ({
    number: lv.number, title: lv.title, summary: lv.summary, modulesDone: lv.modulesDone, modulesTotal: lv.modulesTotal,
    modules: s.modules.filter((m) => m.level === lv.number).map((m) => ({
      id: m.id, number: m.number, title: m.title, summary: m.summary, track: m.track, lessonsDone: m.lessonsDone, lessonsTotal: m.lessonsTotal,
      complete: m.complete, projectPassed: m.projectPassed, examBest: m.examBest, mastery: m.mastery,
      lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, minutes: l.minutes, status: l.status, mastery: l.mastery })),
    })),
  }));
  const nextModule = s.next ? s.modules.find((m) => m.lessons.some((l) => l.id === s.next)) : null;
  return (
    <div>
      <PageHeader eyebrow="Python Mastery" title="The complete roadmap"
        subtitle={`${s.levels.length} levels · ${s.modules.length} modules · ${PY_LESSONS.length} lessons. Every lesson has explanations, a verified example, questions and coding tasks; every module ends with an assessment and a mini-project.`} />
      <div className="mb-5 rounded-xl border border-line bg-surface px-4 py-3 shadow-card"><GuidedToggle guided={s.settings.guided} /></div>
      <Roadmap levels={levels} openLevel={nextModule?.level ?? 1} />
      <section className="mt-8 space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card" aria-labelledby="checkpoints">
        <h2 id="checkpoints" className="text-lg font-bold">Cumulative assessments</h2>
        <p className="text-sm text-ink-2">Level checkpoints mix questions from every module in a level (timed, 30 minutes). The final assessment draws from the whole course (timed, 50 minutes).</p>
        <div className="flex flex-wrap gap-2">
          {s.levels.filter((lv) => lv.modulesTotal > 0).map((lv) => <StartAssessmentButton key={lv.number} kind="level" scopeId={String(lv.number)} label={`Level ${lv.number} checkpoint`} variant="secondary" />)}
          <StartAssessmentButton kind="final" scopeId="all" label="Final comprehensive assessment" />
        </div>
      </section>
    </div>
  );
}
