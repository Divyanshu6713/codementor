import type { Purpose } from "../types";

/** Used in lessons, practice sets and spaced revision. */
export const LPR: Purpose[] = ["lesson", "practice", "revision"];
/** Practice, assessments and revision (not used as lesson checkpoints). */
export const PAR: Purpose[] = ["practice", "assessment", "revision"];

/** A starter program for write_code questions: optional input lines, then a TODO comment. */
export function starter(comment: string, setup = "", headers: string[] = ["iostream"]): string {
  const includes = headers.map((h) => `#include <${h}>`).join("\n");
  const body = setup ? `${setup.replace(/^/gm, "    ")}\n` : "";
  return `${includes}
using namespace std;

int main() {
${body}    // ${comment}

    return 0;
}`;
}
