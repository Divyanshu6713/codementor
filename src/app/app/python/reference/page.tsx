import type { Metadata } from "next";
import { ReferenceSearch } from "@/components/python/ReferenceSearch";
import { PageHeader } from "@/components/ui";
import { getPyLesson } from "@/content/python";
import { PY_REFERENCE, REF_SECTIONS } from "@/content/python/reference";
import { requirePageUser } from "@/server/auth/current";

export const metadata: Metadata = { title: "Python quick reference" };

export default async function ReferencePage() {
  await requirePageUser(["STUDENT"]);
  const entries = PY_REFERENCE.map((e) => ({ ...e, lessonTitle: e.lesson ? getPyLesson(e.lesson)?.title ?? null : null }));
  return (
    <div>
      <PageHeader eyebrow="Quick reference" title="Python at a glance"
        subtitle="Syntax, built-in functions, the standard library and common patterns. Every example is a complete program that has been run in the sandbox — the outputs shown are real." />
      <ReferenceSearch entries={entries} sections={REF_SECTIONS} />
    </div>
  );
}
