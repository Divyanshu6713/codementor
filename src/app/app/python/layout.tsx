import { and, eq, lte } from "drizzle-orm";
import { PyNav } from "@/components/python/PyNav";
import { Heartbeat } from "@/components/python/small";
import { requirePageUser } from "@/server/auth/current";
import { getDb, schema } from "@/server/db/client";

export default async function PythonLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["STUDENT"]);
  const db = await getDb();
  const due = await db.select({ id: schema.pyReviews.lessonId }).from(schema.pyReviews)
    .where(and(eq(schema.pyReviews.studentId, user.id), lte(schema.pyReviews.dueAt, new Date())));
  return (
    <div>
      <PyNav due={due.length} />
      <Heartbeat />
      {children}
    </div>
  );
}
