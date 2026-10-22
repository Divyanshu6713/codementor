import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui";
import { PY_MODULES, PY_PROJECTS } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { pyState } from "@/server/python/state";
import { eq } from "drizzle-orm";
import { schema } from "@/server/db/client";

export const metadata: Metadata = { title: "Python projects" };

const TIERS = [
  { id: "beginner", title: "Beginner", note: "Levels 1–2: input, decisions, loops, collections and functions." },
  { id: "intermediate", title: "Intermediate", note: "Files, data, databases, APIs and clean structure." },
  { id: "advanced", title: "Advanced", note: "Authentication, async, testing and production-style design — core logic judged here, the full stack built on your computer." },
  { id: "capstone", title: "Capstone", note: "Your own project, planned and built step by step." },
] as const;

/** Project mode: guided portfolio projects whose milestones are judged in the sandbox, plus every module's mini-project. */
export default async function ProjectsPage() {
  const user = await requirePageUser(["STUDENT"]);
  const db = await getDb();
  const [s, rows] = await Promise.all([pyState(db, user.id), db.select().from(schema.pyExerciseProgress).where(eq(schema.pyExerciseProgress.studentId, user.id))]);
  const passed = new Set(rows.filter((r) => r.passedAt).map((r) => r.exerciseKey));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Project mode" title="Build real projects"
        subtitle="Each portfolio project is split into milestones; every milestone is checked by tests in the sandbox. Projects are honest about their limits — passing them doesn't make an app production-ready, and each one lists what's still missing." />
      {TIERS.map((t) => {
        const list = PY_PROJECTS.filter((p) => p.tier === t.id);
        if (!list.length) return null;
        return (
          <section key={t.id} aria-labelledby={`tier-${t.id}`} className="space-y-3">
            <div><h2 id={`tier-${t.id}`} className="text-xl font-bold">{t.title}</h2><p className="text-sm text-ink-2">{t.note}</p></div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {list.map((p) => {
                const done = p.milestones.filter((m) => passed.has(`project:${p.id}/${m.id}`)).length;
                return (
                  <li key={p.id}>
                    <Link href={`/app/python/projects/${p.id}`} className="flex h-full flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card hover:border-accent/40">
                      <span className="flex items-center gap-2 font-bold">{p.title}{done === p.milestones.length && <CheckCircle2 size={16} className="text-success" aria-label="complete" />}</span>
                      <span className="text-sm text-ink-2">{p.summary}</span>
                      <span className="mt-auto text-xs text-ink-3">{done}/{p.milestones.length} milestones</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-sunken"><span className="block h-full rounded-full bg-pink" style={{ width: `${(done / p.milestones.length) * 100}%` }} /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <section aria-labelledby="mini-h" className="space-y-3">
        <h2 id="mini-h" className="text-xl font-bold">Module mini-projects <Badge>{s.projects.modulePassed}/{PY_MODULES.length} passed</Badge></h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PY_MODULES.map((m) => (
            <li key={m.id}><Link href={`/app/python/module/${m.id}#proj-h`} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm hover:border-accent/40">
              {passed.has(`${m.id}/${m.project.id}`) ? <CheckCircle2 size={15} className="shrink-0 text-success" aria-label="passed" /> : <span className="w-[15px] shrink-0 font-mono text-xs text-ink-3">{m.number}</span>}
              <span className="min-w-0 flex-1">{m.project.title.replace(/^Mini-project:\s*/i, "")}</span>
            </Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
