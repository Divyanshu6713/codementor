/* eslint-disable @typescript-eslint/no-explicit-any -- dev-only content helper */
// Dev helper: write an exercise/project solution to a file. usage: tsx scripts/_dump.ts <moduleId|lessonId> <project|ex:id> <outfile>
import { writeFileSync } from "node:fs";
import { PY_LESSONS, PY_MODULES } from "../src/content/python";
const [id, what, out] = process.argv.slice(2);
const mod: any = (PY_MODULES as any[]).find((m) => m.id === id);
const lesson: any = (PY_LESSONS as any[]).find((l) => l.id === id);
const ex = what === "project" ? mod.project : lesson.exercises.find((e: any) => e.id === what.slice(3));
writeFileSync(out, ex.solution);
