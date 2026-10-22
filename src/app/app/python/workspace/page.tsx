import type { Metadata } from "next";
import { and, eq, like } from "drizzle-orm";
import { Workspace, type Sample } from "@/components/python/Workspace";
import { PageHeader } from "@/components/ui";
import { PY_MODULES, getPyLesson } from "@/content/python";
import { PY_REFERENCE } from "@/content/python/reference";
import { requirePageUser } from "@/server/auth/current";
import { getDb, schema } from "@/server/db/client";
import { executionStatus } from "@/server/execution/providers";

export const metadata: Metadata = { title: "Python workspace" };

export default async function WorkspacePage({ searchParams }: { searchParams: Promise<{ example?: string; ref?: string }> }) {
  const user = await requirePageUser(["STUDENT"]);
  const sp = await searchParams;
  const db = await getDb();
  const [exec, rows] = await Promise.all([
    executionStatus("python"),
    db.select().from(schema.pyCodeSaves).where(and(eq(schema.pyCodeSaves.studentId, user.id), like(schema.pyCodeSaves.key, "ws:%"))),
  ]);
  const samples: Sample[] = [
    ...PY_MODULES.flatMap((m) => m.lessons.map((l) => ({ id: `lesson:${l.id}`, label: `${l.title}: ${l.example.title}`, group: `Module ${m.number}: ${m.title}`, code: l.example.code, input: l.example.input ?? "" }))),
    ...PY_REFERENCE.map((r) => ({ id: `ref:${r.name}`, label: r.name, group: `Reference: ${r.section}`, code: r.example, input: "" })),
  ];
  const lesson = sp.example ? getPyLesson(sp.example) : null;
  const ref = sp.ref ? PY_REFERENCE.find((r) => r.name === sp.ref) : null;
  const initial = lesson
    ? { code: lesson.example.code, input: lesson.example.input ?? "", sampleId: `lesson:${lesson.id}` }
    : ref ? { code: ref.example, input: "", sampleId: `ref:${ref.name}` } : null;
  return (
    <div>
      <PageHeader eyebrow="Coding workspace" title="Python workspace" subtitle="Write and run any Python, step through it line by line, and keep up to five programs saved to your account." />
      <Workspace samples={samples} initial={initial}
        slots={rows.map((r) => ({ slot: Number(r.key.slice(3)), code: r.code, updatedAt: r.updatedAt.toISOString() }))}
        exec={{ available: exec.available, devOnly: exec.devOnly, message: exec.message, isolation: exec.isolation }} />
    </div>
  );
}
