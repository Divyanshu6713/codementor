import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, TriangleAlert } from "lucide-react";
import { ExercisePanel } from "@/components/python/ExercisePanel";
import { Markdown } from "@/components/Markdown";
import { Badge, PageHeader } from "@/components/ui";
import { getPyExercise, getPyModule, getPyProject, publicExercise } from "@/content/python";
import { requirePageUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { executionStatus } from "@/server/execution/providers";
import { exerciseState, loadCode } from "@/server/python/exercises";

type Params = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getPyProject((await params).projectId);
  return { title: p ? `${p.title} · project` : "Project" };
}

export default async function ProjectPage({ params }: Params) {
  const user = await requirePageUser(["STUDENT"]);
  const p = getPyProject((await params).projectId);
  if (!p) notFound();
  const db = await getDb();
  const exec = await executionStatus("python");
  const milestones = await Promise.all(p.milestones.map(async (m) => {
    const key = `project:${p.id}/${m.id}`;
    const [st, saved] = await Promise.all([exerciseState(db, user.id, key), loadCode(db, user.id, `ex:${key}`)]);
    return { key, ref: getPyExercise(key)!, initial: { hintLevel: st.hintLevel, solutionViewed: st.solutionViewed, passed: st.passed, saved: saved?.code ?? null, bestMs: st.bestMs } };
  }));
  const done = milestones.filter((m) => m.initial.passed).length;
  return (
    <div className="space-y-8">
      <div>
        <Link href="/app/python/projects" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft size={16} aria-hidden /> All projects</Link>
        <PageHeader eyebrow={`${p.tier[0].toUpperCase()}${p.tier.slice(1)} project · ${done}/${milestones.length} milestones`} title={p.title} subtitle={p.summary} />
        <p className="text-sm text-ink-2">Uses: {p.uses.map((u, i) => <span key={u}>{i > 0 && ", "}<Link className="font-semibold text-accent hover:underline" href={`/app/python/module/${u}`}>{getPyModule(u)?.title}</Link></span>)}</p>
      </div>
      <ol className="space-y-6">
        {milestones.map((m, i) => (
          <li key={m.key} className="space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card sm:p-5">
            <div className="flex flex-wrap items-center gap-2"><Badge tone="pink">Milestone {i + 1}</Badge><Badge>Level {m.ref.ex.difficulty}</Badge>{m.initial.passed && <Badge tone="success">Passed</Badge>}</div>
            <h2 className="text-lg font-bold">{m.ref.ex.title}</h2>
            <ExercisePanel exercise={publicExercise(m.ref)} initial={m.initial} mode="project" exec={{ available: exec.available, devOnly: exec.devOnly, message: exec.message }} />
          </li>
        ))}
      </ol>
      <section className="rounded-[var(--radius-card)] border border-hint/30 bg-hint-soft/50 p-5" aria-labelledby="limits-h">
        <h2 id="limits-h" className="flex items-center gap-2 font-bold"><TriangleAlert size={16} className="text-hint" aria-hidden /> Honest limitations</h2>
        <p className="mt-1 text-sm text-ink-2">Passing every milestone means the core logic works and is tested — not that this is ready for real users. Before that, it would still need:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">{p.limitations.map((l) => <li key={l}><Markdown text={l} className="inline" codeLanguage="python" /></li>)}</ul>
      </section>
      {p.beyond?.length ? (
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card" aria-labelledby="beyond-h">
          <h2 id="beyond-h" className="font-bold">Take it further on your own computer</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-2">{p.beyond.map((b) => <li key={b}><Markdown text={b} className="inline" codeLanguage="python" /></li>)}</ol>
        </section>
      ) : null}
    </div>
  );
}
