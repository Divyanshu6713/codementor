import { redirect } from "next/navigation";
import { and, eq, lte } from "drizzle-orm";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppNav } from "@/components/app/AppNav";
import { requirePageUser } from "@/server/auth/current";
import { getDb, schema } from "@/server/db/client";
import { getProfile } from "@/server/services/students";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["STUDENT"]);
  const profile = await getProfile(user.id);
  if (!profile?.onboardedAt) redirect("/onboarding");
  const db = await getDb();
  const [due, mistakes] = await Promise.all([
    db.select({ id: schema.revisionItems.id }).from(schema.revisionItems).where(and(eq(schema.revisionItems.studentId, user.id), lte(schema.revisionItems.dueAt, new Date()))),
    db.select({ id: schema.mistakes.id }).from(schema.mistakes).where(and(eq(schema.mistakes.studentId, user.id), eq(schema.mistakes.status, "open"))),
  ]);
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="sticky top-0 z-20 lg:self-start border-b border-line bg-bg/90 backdrop-blur lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-5">
          <Logo href="/app" />
          <div className="lg:hidden"><ThemeToggle /></div>
        </div>
        {user.isGuest && (
          <Link href="/app/settings" className="mx-3 mb-3 hidden rounded-xl border border-dashed border-line-strong px-3 py-2 text-xs text-ink-2 hover:border-ink hover:text-ink lg:block">
            <span className="font-mono font-semibold uppercase tracking-wider text-accent">Guest</span> · progress is tied to this browser. <span className="font-semibold underline">Keep it</span>
          </Link>
        )}
        <AppNav revisionDue={due.length} openMistakes={mistakes.length} isGuest={user.isGuest} />
        <div className="hidden px-5 pb-5 pt-4 lg:block"><ThemeToggle /></div>
      </aside>
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
