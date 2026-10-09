/**
 * Colour identity for topics and difficulty, shared by every page so a topic always looks the same.
 * Values are token names from globals.css (each has a matching "-soft" token).
 */
export type Hue = "accent" | "concept" | "clay" | "success" | "pink" | "teal" | "sky" | "hint";

const TOPIC_HUES: Record<string, Hue> = {
  "cpp-basics": "sky",
  "variables-types": "teal",
  "arithmetic-ops": "concept",
  "comparison-ops": "pink",
  conditions: "hint",
  "while-loops": "clay",
  "for-loops": "accent",
  "nested-loops": "concept",
  functions: "success",
  arrays: "clay",
  strings: "pink",
};

export function topicHue(conceptId: string): Hue {
  return TOPIC_HUES[conceptId] ?? "sky";
}

/** Tailwind classes per hue (written out in full so Tailwind can see them). */
export const HUE_CLASSES: Record<Hue, { text: string; bg: string; soft: string; border: string; ring: string }> = {
  accent: { text: "text-accent", bg: "bg-accent", soft: "bg-accent-soft", border: "border-accent/30", ring: "ring-accent/30" },
  concept: { text: "text-concept", bg: "bg-concept", soft: "bg-concept-soft", border: "border-concept/30", ring: "ring-concept/30" },
  clay: { text: "text-clay", bg: "bg-clay", soft: "bg-clay-soft", border: "border-clay/30", ring: "ring-clay/30" },
  success: { text: "text-success", bg: "bg-success", soft: "bg-success-soft", border: "border-success/30", ring: "ring-success/30" },
  pink: { text: "text-pink", bg: "bg-pink", soft: "bg-pink-soft", border: "border-pink/30", ring: "ring-pink/30" },
  teal: { text: "text-teal", bg: "bg-teal", soft: "bg-teal-soft", border: "border-teal/30", ring: "ring-teal/30" },
  sky: { text: "text-sky", bg: "bg-sky", soft: "bg-sky-soft", border: "border-sky/30", ring: "ring-sky/30" },
  hint: { text: "text-hint", bg: "bg-hint", soft: "bg-hint-soft", border: "border-hint/30", ring: "ring-hint/30" },
};

/** Difficulty 1..5 → label and colour (green → teal → blue → orange → pink). */
export const DIFFICULTY: Record<number, { label: string; short: string; hue: Hue }> = {
  1: { label: "Easy", short: "Easy", hue: "success" },
  2: { label: "Medium-easy", short: "Med-easy", hue: "teal" },
  3: { label: "Medium", short: "Medium", hue: "sky" },
  4: { label: "Medium-hard", short: "Med-hard", hue: "clay" },
  5: { label: "Challenge", short: "Challenge", hue: "pink" },
};
