import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BookOpenCheck, CalendarClock, CalendarDays, CheckCircle2, Code2, FileCode2, Lightbulb, Medal,
  MessagesSquare, NotebookPen, ShieldCheck, Sparkles, Swords, Terminal, Trophy, Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ButtonLink } from "@/components/ui";
import { CodeBlock } from "@/components/CodeBlock";
import { BoundaryExplorer } from "@/components/lesson/Visuals";
import { DryRun } from "@/components/lesson/DryRun";
import { getTrace } from "@/content/traces";
import { COURSE_LESSONS, COURSE_MODULES } from "@/content/course";
import { PY_LESSONS, PY_LEVELS, PY_MODULES, PY_QUESTIONS } from "@/content/python";
import { ARENA_PROBLEM_IDS } from "@/content/problems";
import { getCurrentUser, homeFor } from "@/server/auth/current";
import { GuestStart } from "@/components/auth/GuestStart";

/** The Python roadmap has 48 modules; the page always shows how many are actually live. */
const PY_PLANNED_MODULES = 48;

const LOOP = [
  ["Assess", "A short adaptive check finds what you already know."],
  ["Teach", "One idea at a time, in plain language, with a worked example."],
  ["Check", "Predict the output, fill the gap, spot the bug — instantly graded."],
  ["Practise", "Real code, run in a sandbox and judged by tests."],
  ["Find the mistake", "Wrong answers are named as misconceptions, not just marked red."],
  ["Re-teach", "Struggling? The same idea, explained a different way."],
  ["Revise", "Skills come back after 1, 3, 7, 14 days — before you forget."],
  ["Master", "Mastery comes from your recent answers, never from clicking “next”."],
] as const;

const HERO_CODE = `xp = 0
for lesson in ["loops", "lists", "functions"]:
    xp += 25
    print(f"done {lesson:<10} +25 XP")
print("total:", xp)`;
const HERO_OUTPUT = ["done loops      +25 XP", "done lists      +25 XP", "done functions  +25 XP", "total: 75"];

const FAQ = [
  { q: "Who is CodeMentor for?", a: "Class 11–12 and college students learning to program — whether it's your first language, your board/semester exam, or the base for DSA, competitive programming and placement interviews. The placement check finds your level, so you never repeat what you already know." },
  { q: "Do I need to sign up?", a: "No. Press Start learning and you're in — a guest account is created for you with no email or password. Your XP, progress and achievements are saved to it. Add a username and password any time (in Settings) to keep them for good and sign in from other devices." },
  { q: "C++ or Python — which should I pick?", a: "Both live in the same app with one profile and one XP total. C++ is great for school syllabuses and competitive programming; Python is great for scripting, data, AI and fast prototyping. The Compare page shows the same idea side by side in both languages." },
  { q: "Is it just a chatbot?", a: "No. A deterministic learning engine decides what to teach, checks answers and tracks mastery. A real compiler and a sandboxed Python runner with a test judge decide whether code is correct. The AI mentor (when it's switched on) explains, hints and asks guiding questions inside those rules — and everything works without it." },
  { q: "Does it give away answers?", a: "Not straight away. When you're stuck you get hints in steps — a question to think about, then the concept, then where to look, then a structure to fill in. The full solution unlocks only after that, and it counts as “not solved yet”." },
  { q: "What's available today?", a: `C++: ${COURSE_LESSONS.length} step-by-step lessons (foundations, decisions and loops), the adaptive placement check, the Practice Arena with a daily challenge, and a free playground. Python: ${PY_MODULES.length} of ${PY_PLANNED_MODULES} roadmap modules (${PY_LESSONS.length} lessons) with practice, revision, assessments, challenges, interview practice and a workspace. Anything not built yet is clearly marked in the app.` },
  { q: "What data do you collect?", a: "Only what helps teaching: your answers and progress, plus a username and display name if you choose to create one. No email required, no ads, no public profile. You can download or delete your data anytime from Settings." },
  { q: "Is there a leaderboard?", a: "You compete with yourself first: XP for real learning, levels from Beginner to Master, personal bests and this week vs last week. The weekly leaderboard is opt-in and off by default." },
  { q: "Can a parent or mentor follow along?", a: "Yes. You can create a one-time link code for a parent, teacher or mentor, who then sees a plain-language summary — time spent, strengths, what needs practice. They don't see your code or tutor chats." },
];

export default async function Landing() {
  const user = await getCurrentUser();
  const trace = getTrace("sum-1-to-5")!;
  const home = user ? homeFor(user.role) : null;
  const cppLive = COURSE_MODULES.filter((m) => m.lessons.length > 0);
  const cppPlanned = COURSE_MODULES.filter((m) => m.lessons.length === 0);
  const topics = [...cppLive.map((m) => `C++ · ${m.title}`), ...PY_MODULES.map((m) => m.title)];
  const stats = [
    { n: COURSE_LESSONS.length, label: "C++ lessons", note: "each with a compiler-checked exercise" },
    { n: PY_MODULES.length, label: "Python modules live", note: `of a ${PY_PLANNED_MODULES}-module roadmap` },
    { n: PY_LESSONS.length, label: "Python lessons", note: "every example run on real Python" },
    { n: PY_QUESTIONS.length, label: "practice questions", note: "predict · fill · find the bug · MCQ" },
    { n: ARENA_PROBLEM_IDS.length, label: "arena problems", note: "hidden tests, real judge" },
  ];

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Announcement */}
      <div className="panel-night border-b border-line">
        <a href="#paths" className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold sm:text-sm">
          <span className="rounded-full bg-brand px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-on-brand">New</span>
          Python Mastery is here — {PY_MODULES.length} modules live, from your first print() to async, testing and APIs
          <ArrowRight size={14} aria-hidden />
        </a>
      </div>

      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <nav aria-label="Site" className="hidden items-center gap-1 rounded-full border border-line bg-surface/70 p-1 md:flex">
            {[["#paths", "Paths"], ["#features", "Features"], ["#how", "How it works"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full px-4 py-1.5 text-sm font-semibold text-ink-2 transition-colors hover:bg-ink hover:text-bg">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {home ? <ButtonLink href={home} size="sm" variant="brand">Open app <ArrowUpRight size={15} aria-hidden /></ButtonLink> : <>
              <Link href="/login" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-ink-2 hover:text-ink sm:block">Sign in</Link>
              <ButtonLink href="/start" size="sm" variant="brand">Start free</ButtonLink>
            </>}
          </div>
        </div>
      </header>

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative">
          <div aria-hidden className="bg-grid pointer-events-none absolute inset-0" />
          <div aria-hidden className="glow-brand pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem]" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-20">
            <div className="animate-rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/70 px-3 py-1 font-mono text-xs font-semibold text-ink-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden />
                {"// the coding club for class 11–12 & college"}
              </p>
              <h1 className="mt-6 text-[clamp(2.6rem,7.2vw,5.75rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em]">
                Learn C++ <span className="text-outline">&amp;</span> Python.
                <span className="mt-2 block">Build like you <span className="hl">mean it.</span></span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2">
                Not another video course. You write real code from minute one — checked by a real compiler and a sandboxed judge —
                with hints instead of answers, an arena to compete in, and revision that remembers what you&apos;re about to forget.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {home
                  ? <ButtonLink href={home} size="lg" variant="brand">Continue learning <ArrowRight size={18} aria-hidden /></ButtonLink>
                  : <GuestStart label="Start learning" tone="brand" />}
                <ButtonLink href="#paths" size="lg" variant="secondary">Explore the paths</ButtonLink>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2">
                {["Free", "No sign-up — one click", "Real compiler & sandbox"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} className="text-accent" aria-hidden />{t}</li>
                ))}
              </ul>
            </div>

            {/* Terminal card */}
            <div className="relative animate-rise [animation-delay:120ms]">
              <div className="overflow-hidden rounded-[var(--radius-panel)] border border-line-strong bg-code-bg shadow-pop">
                <div className="flex items-center gap-2 border-b border-code-line px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden /><span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden /><span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden />
                  <span className="ml-2 font-mono text-xs text-code-dim">streak.py</span>
                  <span className="ml-auto rounded-full bg-brand px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-on-brand">python</span>
                </div>
                <CodeBlock code={HERO_CODE} language="python" className="!rounded-none !border-0" />
                <div className="border-t border-code-line px-4 py-3 font-mono text-[13px] leading-6">
                  <p className="text-code-dim">$ python streak.py</p>
                  {HERO_OUTPUT.map((l) => <p key={l} className="whitespace-pre text-code-ink">{l}</p>)}
                </div>
              </div>
              <div aria-hidden className="absolute -left-3 -top-6 hidden rotate-[-5deg] rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold shadow-pop sm:block">
                <span className="text-accent">+25 XP</span> · solved without hints
              </div>
              <div aria-hidden className="absolute -bottom-5 right-4 rotate-[4deg] rounded-xl bg-brand px-3 py-2 font-mono text-xs font-bold text-on-brand shadow-pop">
                exit 0 · ran in the sandbox
              </div>
            </div>
          </div>
        </section>

        {/* ── Marquee of real topics ───────────────────────────────────────── */}
        <section aria-label="Topics you can learn" className="-rotate-1 border-y-2 border-ink bg-brand py-4 text-on-brand">
          <div className="marquee" tabIndex={0}>
            {[0, 1].map((copy) => (
              <ul key={copy} className="marquee-track" aria-hidden={copy === 1 || undefined}>
                {topics.map((t) => (
                  <li key={t} className="flex shrink-0 items-center gap-10 font-display text-xl font-bold uppercase tracking-[-0.02em] sm:text-2xl">
                    {t}<Sparkles size={20} aria-hidden />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        {/* ── Numbers straight from the catalogue ──────────────────────────── */}
        <section aria-label="What's inside today" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line md:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-bg p-5 sm:p-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-5xl font-bold tracking-[-0.05em] tabular sm:text-6xl">{s.n}</span>
                  <span className="mt-2 block font-semibold">{s.label}</span>
                  <span className="mt-0.5 block text-sm text-ink-3">{s.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Paths ────────────────────────────────────────────────────────── */}
        <section id="paths" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6">
          <SectionHead kicker="01 / paths" title={<>Pick a path. <span className="text-ink-3">Switch anytime.</span></>}>
            One profile, one XP total, two languages. Every lesson ends in code that a real judge checks.
          </SectionHead>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* C++ */}
            <article className="panel-night group relative flex flex-col overflow-hidden rounded-[var(--radius-panel)] p-7 sm:p-9">
              <div aria-hidden className="glow-brand pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-70" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-brand">Path · C++</p>
                  <h3 className="mt-3 text-4xl font-bold sm:text-5xl">C++ Mastery</h3>
                </div>
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand font-display text-xl font-bold text-on-brand">C++</span>
              </div>
              <p className="relative mt-4 max-w-md opacity-80">From “what is a program?” to pointers, OOP, the STL, data structures, algorithms and a capstone project — for board exams, semester labs, DSA and placements.</p>
              <ol className="relative mt-6 space-y-2">
                {cppLive.map((m) => (
                  <li key={m.id} className="flex items-baseline gap-3 border-t border-[var(--panel-line)] pt-2">
                    <span className="font-mono text-xs text-brand">M{String(m.number).padStart(2, "0")}</span>
                    <span className="font-semibold">{m.title}</span>
                    <span className="ml-auto shrink-0 font-mono text-xs opacity-70">{m.lessons.length} lesson{m.lessons.length === 1 ? "" : "s"}</span>
                  </li>
                ))}
                {cppPlanned.length > 0 && (
                  <li className="flex items-baseline gap-3 border-t border-[var(--panel-line)] pt-2 opacity-60">
                    <span className="font-mono text-xs">next</span>
                    <span>{cppPlanned.map((m) => m.title).join(" · ")}</span>
                    <span className="ml-auto shrink-0 font-mono text-xs">being written</span>
                  </li>
                )}
              </ol>
              <div className="relative mt-auto flex flex-wrap items-center gap-4 pt-8">
                {home ? <ButtonLink href="/app/learn" size="lg" variant="brand">Open C++ <ArrowRight size={18} aria-hidden /></ButtonLink>
                  : <GuestStart label="Start C++" tone="brand" />}
                <span className="font-mono text-sm opacity-70">{COURSE_LESSONS.length} lessons · placement check · arena</span>
              </div>
            </article>

            {/* Python */}
            <article className="relative flex flex-col overflow-hidden rounded-[var(--radius-panel)] bg-hero p-7 text-white sm:p-9">
              <div aria-hidden className="bg-dots absolute inset-0 opacity-40" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Path · Python <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-[10px] text-on-brand">new</span></p>
                  <h3 className="mt-3 text-4xl font-bold sm:text-5xl">Python Mastery</h3>
                </div>
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white font-display text-xl font-bold text-[#4f46e5]">Py</span>
              </div>
              <p className="relative mt-4 max-w-md text-white/85">Seven levels, beginner to professional: core language, OOP, testing, async, databases, APIs, security and optional career tracks.</p>
              <ol className="relative mt-6 space-y-2">
                {PY_LEVELS.map((lv) => {
                  const live = PY_MODULES.filter((m) => m.level === lv.number).length;
                  return (
                    <li key={lv.number} className="flex items-baseline gap-3 border-t border-white/20 pt-2">
                      <span className="font-mono text-xs text-white/70">L{lv.number}</span>
                      <span className="font-semibold">{lv.title}</span>
                      <span className="ml-auto shrink-0 font-mono text-xs text-white/70">{live ? `${live} modules` : "in progress"}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="relative mt-auto flex flex-wrap items-center gap-4 pt-8">
                {home ? <ButtonLink href="/app/python" size="lg" variant="inverse">Open Python <ArrowRight size={18} aria-hidden /></ButtonLink>
                  : <GuestStart label="Start Python" tone="secondary" path="python" />}
                <span className="font-mono text-sm text-white/80">{PY_MODULES.length}/{PY_PLANNED_MODULES} modules live · {PY_LESSONS.length} lessons</span>
              </div>
            </article>
          </div>
        </section>

        {/* ── Features bento ───────────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-24 border-y border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
            <SectionHead kicker="02 / features" title={<>Not your average <span className="hl">course.</span></>}>
              Everything a good mentor does — explain, check, push, remind — built into the app. Try the widgets below; they&apos;re the real ones.
            </SectionHead>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6">
              <Tile className="md:col-span-4" icon={Code2} title="Real code, really checked" kicker="Judge, not vibes">
                <p className="text-ink-2">Code runs in an isolated sandbox against visible and hidden tests. The judge decides what&apos;s correct — never the AI. Step through any example line by line:</p>
                <div className="mt-4"><DryRun code={trace.code} steps={trace.steps} /></div>
              </Tile>
              <Tile className="md:col-span-2" icon={Lightbulb} title="Hints, not answers" kicker="5-step ladder">
                <ol className="mt-1 space-y-2">
                  {["What is the condition before the loop runs?", "This is about the keep-going rule.", "Look at the middle of the for header.", "1 > 5 is false — the body never runs.", "for (int i = 1; i ___ n; i++)"].map((h, i) => (
                    <li key={i} className={`rounded-xl border px-3 py-2 text-sm ${i === 0 ? "border-ink bg-brand text-on-brand" : "border-line bg-bg"}`}>
                      <span className="font-mono text-xs font-bold">{String(i + 1).padStart(2, "0")} </span><span className={i === 4 ? "font-mono" : ""}>{h}</span>
                    </li>
                  ))}
                </ol>
              </Tile>
              <Tile className="md:col-span-3" icon={Sparkles} title="Play with the idea" kicker="Live lesson widget">
                <BoundaryExplorer />
              </Tile>
              <Tile className="md:col-span-3" icon={NotebookPen} title="Mistakes become lessons" kicker="Mistake book">
                <CodeBlock code={"for (int i = 1; i > n; i++)"} numbered={false} />
                <p className="mt-3 text-sm"><span className="font-semibold">What happened:</span> <span className="text-ink-2">for n = 5 nothing printed — the condition is false before the first pass.</span></p>
                <p className="mt-2 text-sm"><span className="font-semibold">Misconception:</span> <span className="text-ink-2">a loop condition is a “keep going while…” rule, not “stop when…”.</span></p>
              </Tile>
              {[
                { icon: Terminal, t: "Playground & workspace", d: "Write and run any C++ or Python, with friendly explanations when it breaks." },
                { icon: Swords, t: "Practice arena", d: "Problems with hidden tests, difficulty levels and acceptance rates." },
                { icon: CalendarDays, t: "Daily challenge", d: "One problem a day for everyone, bonus XP before midnight." },
                { icon: CalendarClock, t: "Spaced revision", d: "Shaky skills return after 1, 3, 7 and 14 days — before they fade." },
                { icon: MessagesSquare, t: "Interview mode", d: "Timed mock rounds: technical questions plus a coding problem." },
                { icon: FileCode2, t: "Compare C++ & Python", d: "The same idea in both languages, side by side, both outputs verified." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="group rounded-[var(--radius-card)] border border-line bg-bg p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-ink md:col-span-2">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-sunken text-accent transition-transform duration-300 group-hover:-rotate-6"><Icon size={20} aria-hidden /></span>
                  <h3 className="mt-4 text-lg font-bold">{t}</h3>
                  <p className="mt-1 text-sm text-ink-2">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6">
          <SectionHead kicker="03 / the loop" title={<>Eight steps. <span className="text-ink-3">On repeat.</span></>}>
            Every session follows the same learning loop. The app keeps asking: what do you understand, what do you only <em>think</em> you understand, and what comes next?
          </SectionHead>
          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOOP.map(([title, text], i) => (
              <li key={title} className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-6">
                <span aria-hidden className="text-outline pointer-events-none absolute -right-2 -top-4 font-display text-8xl font-bold opacity-60">{String(i + 1).padStart(2, "0")}</span>
                <p className="relative font-mono text-xs font-semibold text-accent">step {i + 1}</p>
                <h3 className="relative mt-2 text-xl font-bold">{title}</h3>
                <p className="relative mt-2 text-sm text-ink-2">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Compete with yourself ────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="panel-night relative grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[var(--radius-panel)] p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr]">
            <div aria-hidden className="glow-brand pointer-events-none absolute -bottom-40 -left-40 h-96 w-96" />
            <div className="relative">
              <Trophy className="text-brand" size={30} aria-hidden />
              <h2 className="mt-4 text-4xl font-bold sm:text-5xl">Compete with yourself.</h2>
              <p className="mt-4 max-w-lg opacity-80">XP for what actually builds skill: harder problems and hint-free solves earn more; fixing an old mistake earns a bonus. Wrong answers never cost XP. The weekly leaderboard is opt-in.</p>
            </div>
            <ol className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
              {["Beginner", "Explorer", "Builder", "Problem Solver", "Algorithmist", "Master"].map((l, i) => (
                <li key={l} className={`rounded-2xl border px-4 py-4 ${i === 5 ? "border-brand bg-brand text-on-brand" : "border-[var(--panel-line)] bg-white/5"}`}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">Level {i + 1}</p>
                  <p className="mt-1 font-display text-lg font-bold">{l}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Trust ────────────────────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-24 sm:px-6 md:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Safe by design", d: "Minimal data, no ads, no public profiles; code runs in an isolated sandbox." },
            { icon: BookOpenCheck, t: "Honest numbers", d: "Every score comes from your answers. Untested topics say “not assessed”." },
            { icon: Medal, t: "Healthy competition", d: "Levels and personal bests for real learning — no guilt-trip streaks." },
            { icon: Users, t: "Share with a mentor", d: "A one-time code gives a parent or teacher a plain-language weekly summary." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-5">
              <Icon className="text-accent" size={22} aria-hidden />
              <p className="mt-3 font-display text-lg font-bold">{t}</p>
              <p className="mt-1 text-sm text-ink-2">{d}</p>
            </div>
          ))}
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" className="mx-auto grid max-w-7xl scroll-mt-24 grid-cols-1 gap-10 px-4 pb-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead kicker="04 / faq" title="Questions? Fair.">
            Straight answers about what&apos;s here, what isn&apos;t yet, and what happens to your data.
          </SectionHead>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold marker:hidden">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-strong text-ink-2 transition-transform duration-300 group-open:rotate-45 group-open:border-ink group-open:bg-brand group-open:text-on-brand" aria-hidden>+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="relative overflow-hidden rounded-[var(--radius-panel)] border-2 border-ink bg-brand px-6 py-14 text-on-brand sm:px-14 sm:py-20">
            <p className="font-mono text-sm font-semibold">{"while (!confident) { learn(); practise(); }"}</p>
            <h2 className="mt-4 max-w-3xl text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold uppercase leading-[0.95]">Your first program is five minutes away.</h2>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={home ?? "/start"} className="inline-flex h-13 items-center gap-2 rounded-full bg-[#0e0e10] px-7 font-semibold text-white transition-transform hover:-translate-y-0.5">
                {home ? "Continue learning" : "Start learning — free"} <ArrowRight size={18} aria-hidden />
              </Link>
              <span className="text-sm font-semibold">No email. No card. No video lectures to sit through.</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-ink-3 sm:px-6">
          <Logo />
          <p>An independent, early-version project for students learning to code.</p>
          <nav aria-label="Footer" className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/login" className="hover:text-ink">Sign in</Link>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
        </div>
        <p aria-hidden className="text-outline select-none overflow-hidden whitespace-nowrap px-2 text-center font-display text-[clamp(3.5rem,15vw,13rem)] font-bold leading-[0.8] tracking-[-0.06em]">codementor_</p>
      </footer>
    </div>
  );
}

function SectionHead({ kicker, title, children }: { kicker: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{kicker}</p>
      <h2 className="mt-3 text-[clamp(2.1rem,4.6vw,3.75rem)] font-bold leading-[1] tracking-[-0.045em]">{title}</h2>
      {children && <p className="mt-4 text-lg text-ink-2">{children}</p>}
    </div>
  );
}

function Tile({ icon: Icon, title, kicker, className, children }: { icon: typeof Code2; title: string; kicker: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`min-w-0 rounded-[var(--radius-card)] border border-line bg-bg p-4 sm:p-6 ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-on-brand"><Icon size={20} aria-hidden /></span>
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">{kicker}</p>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
