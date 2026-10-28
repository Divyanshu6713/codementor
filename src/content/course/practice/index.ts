import type { PracticeProblem } from "../types";
import { BASICS_PRACTICE } from "./basics";
import { LOGIC_LOOPS_PRACTICE } from "./logic-loops";
import { FUNCTIONS_ARRAYS_PRACTICE } from "./functions-arrays";
import { CORE_PRACTICE } from "./core";
import { DSA_PRACTICE } from "./dsa";
import { ADVANCED_PRACTICE } from "./advanced";

/** Intermediate (p2) and challenge (p3) practice problems, keyed by lesson id. */
export const PRACTICE_BY_LESSON: Record<string, PracticeProblem[]> = {
  ...BASICS_PRACTICE,
  ...LOGIC_LOOPS_PRACTICE,
  ...FUNCTIONS_ARRAYS_PRACTICE,
  ...CORE_PRACTICE,
  ...DSA_PRACTICE,
  ...ADVANCED_PRACTICE,
};
