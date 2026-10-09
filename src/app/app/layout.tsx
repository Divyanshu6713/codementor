import { redirect } from "next/navigation";
import { and, eq, lte } from "drizzle-orm";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppNav } from "@/components/app/AppNav";
import { requirePageUser } from "@/server/auth/current";
import { getDb, schema } from "@/server/db/client";
import { getProfile } from "@/server/services/students";

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
      <aside className="sticky top-0 z-20 lg:self-start border-b border-line bg-surface/95 backdrop-blur lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-5">
          <Logo href="/app" />
          <div className="lg:hidden"><ThemeToggle /></div>
        </div>
        <AppNav revisionDue={due.length} openMistakes={mistakes.length} />
        <div className="absolute bottom-4 left-5 hidden lg:block"><ThemeToggle /></div>
      </aside>
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
