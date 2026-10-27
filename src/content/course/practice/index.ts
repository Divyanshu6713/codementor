import type { PracticeProblem } from "../types";
import { BASICS_PRACTICE } from "./basics";
import { LOGIC_LOOPS_PRACTICE } from "./logic-loops";

/** Intermediate (p2) and challenge (p3) practice problems, keyed by lesson id. */
export const PRACTICE_BY_LESSON: Record<string, PracticeProblem[]> = {
  ...BASICS_PRACTICE,
  ...LOGIC_LOOPS_PRACTICE,
};
