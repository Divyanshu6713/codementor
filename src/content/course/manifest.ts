/**
 * Renders docs/CPP_CURRICULUM_MANIFEST.md from the course catalogue. The catalogue in this folder
 * is the only source of truth; the manifest is generated (`npm run content:manifest`) and a test
 * fails when the committed file is out of date, so the two can't drift.
 */
import { COURSE_LESSONS, COURSE_MODULES, LEVEL_LABEL } from "./index";

export function renderManifest(): string {
  const written = COURSE_MODULES.filter((m) => m.lessons.length);
  const planned = COURSE_MODULES.reduce((n, m) => n + (m.planned?.length ?? 0), 0);
  const tests = COURSE_LESSONS.reduce((n, l) => n + l.exercise.tests.length, 0);
  const practice = COURSE_LESSONS.reduce((n, l) => n + (l.practice?.length ?? 0), 0);
  const out: string[] = [
    "# C++ curriculum manifest",
    "",
    "> Generated from `src/content/course` by `npm run content:manifest`. Do not edit by hand —",
    "> `tests/course-content.test.ts` fails when this file is out of date.",
    "",
    `**${COURSE_LESSONS.length} published lessons** in ${written.length} of ${COURSE_MODULES.length} modules · ${tests} exercise tests · ${practice} practice problems · ${planned} planned topics not yet written.`,
    "",
    "Every published lesson has: goals, concept sections, common mistakes, a worked example whose output is",
    "checked against real g++, a quick check, a coding exercise with sample and hidden tests, four",
    "progressive hints, a reference solution (server-only), an explain-again text and a summary — plus two",
    "graded practice problems (intermediate and challenge), each verified the same way.",
    "Baseline standard: C++17 (the sandbox compiles with `-std=c++17`).",
    "",
    "Status key: **published** = written and compiler-verified · **planned** = listed in the roadmap, no lesson page yet.",
    "",
    "## Overview",
    "",
    "| # | Module | Level | Published | Planned |",
    "|---|---|---|---|---|",
    ...COURSE_MODULES.map((m) => `| ${m.number} | ${m.title} (\`${m.id}\`) | ${LEVEL_LABEL[m.level]} | ${m.lessons.length} | ${m.planned?.length ?? 0} |`),
    "",
  ];
  for (const m of COURSE_MODULES) {
    out.push(`## ${m.number}. ${m.title}`, "", `\`${m.id}\` · ${LEVEL_LABEL[m.level]} — ${m.summary}`, "");
    if (m.lessons.length) {
      out.push("| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |", "|---|---|---|---|---|---|---|---|");
      for (const id of m.lessons) {
        const l = COURSE_LESSONS.find((x) => x.id === id)!;
        const sample = l.exercise.tests.filter((t) => t.visibility === "sample").length;
        const hidden = l.exercise.tests.length - sample;
        out.push(`| \`${l.id}\` | ${l.title} | ${l.minutes} | ${l.standard ?? "C++17"} | ${(l.concepts ?? []).join(", ") || "—"} | ${sample}/${hidden} | ${(l.practice ?? []).map((p) => p.title).join(" · ") || "—"} | published |`);
      }
      out.push("");
    }
    if (m.planned?.length) {
      out.push(m.lessons.length ? "Still to write in this module:" : "Planned topics (no lesson pages yet):", "");
      for (const p of m.planned) out.push(`- ${p} — planned`);
      out.push("");
    }
  }
  return out.join("\n");
}
