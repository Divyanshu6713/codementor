import { BookOpen, CheckCircle2, Code2, Lightbulb } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/learn/SiteHeader";
import { StartButtons } from "@/components/learn/StartButtons";
import { StorageNotice } from "@/components/learn/StorageNotice";
import { COURSE_LESSONS, COURSE_MODULES, firstLessonId } from "@/content/course";

const CYCLE = ["Learn", "Understand", "Practise", "Run code", "Get feedback", "Fix mistakes", "Progress"];

export default function Landing() {
  const order = COURSE_LESSONS.map((l) => l.id);
  const titles = Object.fromEntries(COURSE_LESSONS.map((l) => [l.id, l.title]));
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">CodeMentor</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-2 sm:text-xl">
            Learn programming by understanding, practising and improving — one concept at a time.
          </p>
          <div className="mt-8">
            <StartButtons order={order} titles={titles} firstLessonId={firstLessonId} />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            <li className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-success" aria-hidden /> No sign-up</li>
            <li className="flex items-center gap-1.5"><Code2 size={16} className="text-accent" aria-hidden /> Real C++ compiler</li>
            <li className="flex items-center gap-1.5"><Lightbulb size={16} className="text-hint" aria-hidden /> Hints that teach, not answers</li>
            <li className="flex items-center gap-1.5"><BookOpen size={16} className="text-concept" aria-hidden /> Starts from zero</li>
          </ul>
          <StorageNotice className="mt-4 max-w-2xl text-xs text-ink-3" />
        </section>

        <section aria-labelledby="how" className="border-y border-line bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <h2 id="how" className="text-xl font-bold">How every lesson works</h2>
            <ol className="mt-4 flex flex-wrap gap-2">
              {CYCLE.map((s, i) => (
                <li key={s} className="rounded-full border border-line bg-bg px-3.5 py-1.5 text-sm font-medium">
                  <span className="mr-1.5 font-mono text-xs text-accent">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-3xl text-sm text-ink-2">
              Each lesson explains one idea in plain language, shows a working example, then gives you a small program to write.
              Your code is compiled and tested for real. If you&apos;re stuck, hints come one step at a time — the full solution only if you ask for it.
            </p>
          </div>
        </section>

        <section aria-labelledby="roadmap" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <h2 id="roadmap" className="text-xl font-bold">The C++ course</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            {COURSE_MODULES.map((m) => (
              <li key={m.id} className="rounded-xl border border-line bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Module {m.number}{m.lessons.length ? ` · ${m.lessons.length} lessons` : " · coming later"}</p>
                <p className="mt-1 font-semibold">{m.title}</p>
                <p className="mt-1 text-sm text-ink-2">{m.summary}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
