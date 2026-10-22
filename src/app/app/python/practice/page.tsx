import type { Metadata } from "next";
import { PracticeRunner, type ScopeOption } from "@/components/python/PracticeRunner";
import { StartAssessmentButton } from "@/components/python/Assessment";
import { PageHeader } from "@/components/ui";
import { PY_LESSONS, PY_LEVELS, PY_MODULES, getPyLesson, getPyModule } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { pyState } from "@/server/python/state";

export const metadata: Metadata = { title: "Python practice" };

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ lesson?: string; module?: string; mode?: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const sp = await searchParams;
  const s = await pyState(await getDb(), user.id);
  const active = s.lessons.filter((l) => l.status !== "locked" && l.status !== "available");
  const options: ScopeOption[] = [
    { value: "mixed:", label: "Mixed: everything I've studied", group: "Smart sets" },
    { value: "weak:", label: `My weak topics${s.weak.length ? ` (${s.weak.length})` : ""}`, group: "Smart sets" },
    ...PY_LEVELS.filter((lv) => PY_MODULES.some((m) => m.level === lv.number)).map((lv) => ({ value: `level:${lv.number}`, label: `Level ${lv.number}: ${lv.title}`, group: "By level" })),
    ...PY_MODULES.map((m) => ({ value: `module:${m.id}`, label: `Module ${m.number}: ${m.title}`, group: "By module" })),
    ...(active.length ? active : PY_LESSONS.slice(0, 5)).map((l) => ({ value: `lesson:${l.id}`, label: l.title, group: "By lesson" })),
  ];
  const initial = sp.lesson && getPyLesson(sp.lesson) ? `lesson:${sp.lesson}` : sp.module && getPyModule(sp.module) ? `module:${sp.module}` : sp.mode === "weak" ? "weak:" : active.length ? "mixed:" : `module:${PY_MODULES[0].id}`;
  if (!options.some((o) => o.value === initial)) options.push({ value: initial, label: getPyLesson(initial.slice(7))?.title ?? initial, group: "By lesson" });
  return (
    <div>
      <PageHeader eyebrow="Practice mode" title="Practise Python" subtitle="Questions without the solution on screen. Answer first; use a hint if you need one. Difficulty adapts to how you're doing." />
      <PracticeRunner options={options} initial={initial} />
      <section className="mt-10 space-y-2 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
        <h2 className="font-bold">Mixed-topic test</h2>
        <p className="text-sm text-ink-2">Ten questions across the topics you&apos;ve studied, graded together at the end — a good check before a module assessment.</p>
        <StartAssessmentButton kind="mixed" scopeId="all" label="Start a mixed-topic test" variant="secondary" />
      </section>
    </div>
  );
}
