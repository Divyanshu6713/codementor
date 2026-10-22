import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth/current";
import { executionStatus } from "@/server/execution/providers";
import { mentorStatus } from "@/server/services/mentor";
import { PageHeader } from "@/components/ui";
import { Playground, type PlaygroundExample } from "@/components/app/Playground";
import { COURSE_LESSONS, COURSE_MODULES, getCourseLesson } from "@/content/course";

export const metadata: Metadata = { title: "Playground" };

/** Every lesson's worked example (each one verified against the real compiler by the content tests). */
const EXAMPLES: PlaygroundExample[] = COURSE_LESSONS.map((l) => {
  const mod = COURSE_MODULES.find((m) => m.id === l.moduleId)!;
  return { id: l.id, label: `${l.title}: ${l.example.title}`, group: `Module ${mod.number} · ${mod.title}`, code: l.example.code, input: l.example.input ?? "" };
});

export default async function PlaygroundPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const [status, mentor, sp] = await Promise.all([executionStatus(), mentorStatus(user.id), searchParams]);
  const ex = sp.example ? getCourseLesson(sp.example) : undefined;
  return (
    <div>
      <PageHeader title="Code Playground" subtitle="Write any C++ program and run it. Load a lesson example, change it, break it, fix it — and ask your mentor when something's confusing." />
      <Playground
        available={status.available} message={status.message} examples={EXAMPLES} mentor={mentor}
        initial={ex ? { code: ex.example.code, input: ex.example.input ?? "", exampleId: ex.id } : null}
      />
    </div>
  );
}
