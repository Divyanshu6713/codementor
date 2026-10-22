import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge, PageHeader, inputClass } from "@/components/ui";
import { COURSE_LESSONS, COURSE_MODULES } from "@/content/course";
import { PY_LESSONS, pyModuleOf } from "@/content/python";
import { PY_REFERENCE } from "@/content/python/reference";
import { requirePageUser } from "@/server/auth/current";

export const metadata: Metadata = { title: "Search lessons" };

interface Doc { kind: "C++ lesson" | "Python lesson" | "Python reference"; title: string; where: string; href: string; title_l: string; body: string }

const DOCS: Doc[] = [
  ...COURSE_LESSONS.map((l) => ({
    kind: "C++ lesson" as const, title: l.title, where: `C++ · Module ${COURSE_MODULES.find((m) => m.id === l.moduleId)?.number}: ${COURSE_MODULES.find((m) => m.id === l.moduleId)?.title}`,
    href: `/app/learn/${l.id}`, title_l: l.title.toLowerCase(),
    body: [l.intro, ...l.goals, ...l.sections.map((s) => `${s.title} ${s.body}`), ...l.summary].join(" ").toLowerCase(),
  })),
  ...PY_LESSONS.map((l) => ({
    kind: "Python lesson" as const, title: l.title, where: `Python · Module ${pyModuleOf(l.id)?.number}: ${pyModuleOf(l.id)?.title}`,
    href: `/app/python/learn/${l.id}`, title_l: l.title.toLowerCase(),
    body: [l.why, ...l.objectives, ...l.concept.map((s) => `${s.title} ${s.body}`), ...l.summary, l.example.code].join(" ").toLowerCase(),
  })),
  ...PY_REFERENCE.map((r) => ({
    kind: "Python reference" as const, title: r.name, where: `Quick reference · ${r.section}`, href: `/app/python/reference`,
    title_l: r.name.toLowerCase(), body: `${r.summary} ${r.example}`.toLowerCase(),
  })),
];

function search(q: string) {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  return DOCS.map((d) => {
    let score = 0;
    for (const w of words) {
      if (d.title_l.includes(w)) score += 10;
      const hits = d.body.split(w).length - 1;
      if (!hits && !d.title_l.includes(w)) return { d, score: 0 };
      score += Math.min(hits, 5);
    }
    return { d, score };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 40);
}

/** Full-text search across both paths (C++ and Python) and the Python quick reference. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePageUser(["STUDENT"]);
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const results = search(q);
  return (
    <div>
      <PageHeader title="Search lessons" subtitle="Search every C++ and Python lesson and the Python quick reference." />
      <form action="/app/search" role="search" className="relative mb-6 max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input type="search" name="q" defaultValue={q} placeholder="e.g. loops, dictionary, f-string, recursion" aria-label="Search lessons" className={`${inputClass} pl-9`} />
      </form>
      {q && <p className="mb-3 text-sm text-ink-3">{results.length ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : `Nothing found for “${q}”.`}</p>}
      <ul className="space-y-2">
        {results.map(({ d }) => (
          <li key={d.href + d.title}>
            <Link href={d.href} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-card hover:border-accent/40">
              <Badge tone={d.kind === "C++ lesson" ? "sky" : d.kind === "Python lesson" ? "accent" : "teal"}>{d.kind}</Badge>
              <span className="font-semibold">{d.title}</span>
              <span className="w-full text-xs text-ink-3 sm:ml-auto sm:w-auto">{d.where}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
