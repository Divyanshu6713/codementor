import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/ui";
import { PY_LESSONS } from "@/content/python";
import { PY_COMPARE } from "@/content/python/compare";
import { requirePageUser } from "@/server/auth/current";

export const metadata: Metadata = { title: "Python vs C++" };

export default async function ComparePage() {
  await requirePageUser(["STUDENT"]);
  const lessonComparisons = PY_LESSONS.filter((l) => l.cpp);
  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Compare with C++" title="Python and C++, side by side"
        subtitle="Already learning C++ here? Each pair below does the same job in both languages. Both sides are compiled or run in tests, so the outputs are real." />
      <nav aria-label="Topics" className="flex flex-wrap gap-2 text-sm">
        {PY_COMPARE.map((t) => <a key={t.id} href={`#${t.id}`} className="rounded-full border border-line bg-surface px-3 py-1 font-medium text-ink-2 shadow-card hover:text-ink">{t.title}</a>)}
      </nav>
      {PY_COMPARE.map((t) => (
        <section key={t.id} id={t.id} aria-labelledby={`${t.id}-h`} className="scroll-mt-20 space-y-3">
          <h2 id={`${t.id}-h`} className="text-xl font-bold">{t.title}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1"><CodeBlock code={t.python} language="python" label="Python" /><pre className="rounded-lg bg-sunken px-3 py-1.5 font-mono text-xs text-ink-2">{t.pyOutput.trimEnd()}</pre></div>
            <div className="space-y-1"><CodeBlock code={t.cpp} language="cpp" label="C++" /><pre className="rounded-lg bg-sunken px-3 py-1.5 font-mono text-xs text-ink-2">{t.cppOutput.trimEnd()}</pre></div>
          </div>
          <ul className="space-y-1.5">{t.points.map((p) => <li key={p} className="flex gap-2"><span className="text-accent" aria-hidden>→</span><Markdown text={p} className="text-ink-2" codeLanguage="python" /></li>)}</ul>
        </section>
      ))}
      <section aria-labelledby="in-lessons" className="space-y-2">
        <h2 id="in-lessons" className="text-xl font-bold">Comparisons inside lessons</h2>
        <ul className="grid gap-2 sm:grid-cols-2">{lessonComparisons.map((l) => <li key={l.id}><Link className="font-semibold text-accent hover:underline" href={`/app/python/learn/${l.id}#beyond`}>{l.title}</Link></li>)}</ul>
      </section>
    </div>
  );
}
