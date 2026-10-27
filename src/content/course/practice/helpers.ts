import type { TestCaseDef } from "../../types";
import type { PracticeProblem } from "../types";

type ProblemDef = Omit<PracticeProblem, "id" | "level" | "compare"> & { compare?: "tokens" | "lines" };

/** The two practice problems of a lesson: intermediate (p2) and challenge (p3). */
export function practice(intermediate: ProblemDef, challenge: ProblemDef): PracticeProblem[] {
  return [
    { compare: "tokens", ...intermediate, id: "p2", level: "intermediate" },
    { compare: "tokens", ...challenge, id: "p3", level: "challenge" },
  ];
}

/** A test case. Defaults to a hidden, normal case. */
export function T(label: string, input: string, output: string, visibility: TestCaseDef["visibility"] = "hidden", category: TestCaseDef["category"] = "normal"): TestCaseDef {
  return { label, input, output, visibility, category };
}

/** A starter program: headers, optional setup lines inside main, then a TODO comment. */
export function starter(todo: string, setup = "", headers: string[] = ["iostream"], beforeMain = ""): string {
  const includes = headers.map((h) => `#include <${h}>`).join("\n");
  const body = setup ? `${setup.replace(/^/gm, "    ")}\n` : "";
  return `${includes}
using namespace std;
${beforeMain ? `\n${beforeMain}\n` : ""}
int main() {
${body}    // ${todo}

    return 0;
}`;
}
