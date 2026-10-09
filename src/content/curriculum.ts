import type { ConceptDef, TrackDef } from "./types";

export const TRACKS: TrackDef[] = [
  { id: "cpp-foundations", title: "C++ Foundations", description: "From your first program to loops, functions, arrays and strings.", order: 1, status: "active" },
  { id: "cpp-core", title: "C++ Core", description: "2D arrays, pointers, classes and the standard library.", order: 2, status: "planned" },
  { id: "problem-solving", title: "Problem Solving", description: "Breaking problems down and combining concepts into programs.", order: 3, status: "planned" },
  { id: "dsa-foundations", title: "DSA Foundations", description: "Complexity, searching, sorting, recursion and core data structures.", order: 4, status: "planned" },
];

/**
 * The concept dependency graph. Order inside the array is the default teaching order
 * (a valid topological order — checked by tests).
 */
export const CONCEPTS: ConceptDef[] = [
  {
    id: "cpp-basics", trackId: "cpp-foundations", status: "active",
    title: "Program basics", summary: "Program structure, main(), printing with cout and reading with cin.",
    prerequisites: [],
    skills: [
      { id: "program_structure", title: "Program structure", description: "#include, main(), statements end with ;" },
      { id: "output_cout", title: "Printing with cout", description: "Printing text, numbers, spaces and new lines." },
      { id: "input_cin", title: "Reading with cin", description: "Reading numbers into variables." },
    ],
  },
  {
    id: "variables-types", trackId: "cpp-foundations", status: "active",
    title: "Variables & data types", summary: "Storing values, assignment, int / double / char / bool / string.",
    prerequisites: [{ id: "cpp-basics", strength: "required" }],
    skills: [
      { id: "variables", title: "Variables & assignment", description: "Declaring variables and how assignment copies a value." },
      { id: "data_types", title: "Data types", description: "Choosing int, double, char, bool and string." },
    ],
  },
  {
    id: "arithmetic-ops", trackId: "cpp-foundations", status: "active",
    title: "Arithmetic operators", summary: "+ - * / %, integer division, ++ and --, and +=.",
    prerequisites: [{ id: "variables-types", strength: "required" }],
    skills: [
      { id: "arithmetic_ops", title: "Arithmetic & precedence", description: "+ - * / % and the order they're applied." },
      { id: "integer_division", title: "Integer division & %", description: "7 / 2 is 3 for ints; % gives the remainder." },
      { id: "increment_ops", title: "Increment & compound assignment", description: "i++, i--, +=, -=." },
    ],
  },
  {
    id: "comparison-ops", trackId: "cpp-foundations", status: "active",
    title: "Comparison & logical operators", summary: "< <= > >= == != and combining conditions with && || !.",
    prerequisites: [{ id: "variables-types", strength: "required" }],
    skills: [
      { id: "relational_ops", title: "Comparison operators", description: "What < <= > >= == != evaluate to, including the edges." },
      { id: "logical_ops", title: "Logical operators", description: "&&, || and ! with true/false values." },
    ],
  },
  {
    id: "conditions", trackId: "cpp-foundations", status: "active",
    title: "Conditions (if / else)", summary: "Making decisions with if, else, else-if ladders and nesting.",
    prerequisites: [{ id: "comparison-ops", strength: "required" }],
    skills: [
      { id: "if_else", title: "if / else", description: "Running code only when a condition is true." },
      { id: "else_if", title: "else-if ladders", description: "Exactly one branch of a ladder runs." },
    ],
  },
  {
    id: "while-loops", trackId: "cpp-foundations", status: "active",
    title: "While loops", summary: "Repeating while a condition stays true.",
    prerequisites: [{ id: "comparison-ops", strength: "required" }, { id: "arithmetic-ops", strength: "required" }],
    skills: [
      { id: "while_loop", title: "while loops", description: "Condition checked before each repetition." },
    ],
  },
  {
    id: "for-loops", trackId: "cpp-foundations", status: "active",
    title: "For loops", summary: "Counting loops: start, keep-going condition, update — and getting the boundaries right.",
    prerequisites: [
      { id: "comparison-ops", strength: "required" },
      { id: "arithmetic-ops", strength: "required" },
      { id: "conditions", strength: "recommended" },
    ],
    skills: [
      { id: "loop_purpose", title: "Why loops", description: "Repeating work without copying code; what one iteration is." },
      { id: "loop_init", title: "Initialization", description: "Where the counter starts." },
      { id: "loop_condition", title: "Loop condition", description: "The loop keeps going while the condition is true." },
      { id: "loop_update", title: "Update step", description: "i++, i--, i += 2 — and what happens without one." },
      { id: "loop_tracing", title: "Tracing a loop", description: "Following the values step by step; counting iterations." },
      { id: "loop_boundaries", title: "Boundaries (< vs <=)", description: "First and last values; avoiding off-by-one." },
      { id: "loop_counting_down", title: "Counting down", description: "Loops that start high and decrease." },
      { id: "loop_accumulation", title: "Accumulating", description: "Building a sum, count or product inside a loop." },
    ],
  },
  {
    id: "nested-loops", trackId: "cpp-foundations", status: "active",
    title: "Nested loops", summary: "A loop inside a loop: rows and columns, patterns.",
    prerequisites: [{ id: "for-loops", strength: "required" }],
    skills: [
      { id: "nested_intro", title: "Inner loop runs fully each time", description: "For every outer iteration the inner loop starts over." },
      { id: "nested_patterns", title: "Patterns & grids", description: "Printing rows and columns." },
    ],
  },
  {
    id: "functions", trackId: "cpp-foundations", status: "active",
    title: "Functions", summary: "Declaring, calling, parameters, return values and scope.",
    prerequisites: [{ id: "conditions", strength: "required" }, { id: "for-loops", strength: "recommended" }],
    skills: [
      { id: "function_basics", title: "Defining & calling", description: "Writing a function and calling it." },
      { id: "function_params_return", title: "Parameters & return", description: "Passing values in and getting a value back." },
    ],
  },
  {
    id: "arrays", trackId: "cpp-foundations", status: "active",
    title: "Arrays", summary: "Storing many values, indexing from 0, traversing with loops.",
    prerequisites: [{ id: "for-loops", strength: "required" }],
    skills: [
      { id: "array_indexing", title: "Indexing", description: "The first element is at index 0; the last at size − 1." },
      { id: "array_traversal", title: "Traversal", description: "Visiting every element with a loop." },
    ],
  },
  {
    id: "strings", trackId: "cpp-foundations", status: "active",
    title: "Strings", summary: "std::string, characters, length and traversal.",
    prerequisites: [{ id: "arrays", strength: "required" }],
    skills: [
      { id: "string_basics", title: "String basics", description: "Length, indexing characters, traversal." },
    ],
  },
  // ── Planned (no content yet; shown as "coming later" in the map) ──
  { id: "2d-arrays", trackId: "cpp-core", status: "planned", title: "2D arrays & matrices", summary: "Rows and columns of values.", prerequisites: [{ id: "arrays", strength: "required" }, { id: "nested-loops", strength: "required" }], skills: [] },
  { id: "pointers", trackId: "cpp-core", status: "planned", title: "Pointers", summary: "Memory addresses, dereferencing, pointers with arrays and functions.", prerequisites: [{ id: "arrays", strength: "required" }, { id: "functions", strength: "required" }], skills: [] },
  { id: "oop", trackId: "cpp-core", status: "planned", title: "Classes & objects", summary: "Constructors, encapsulation, inheritance, polymorphism.", prerequisites: [{ id: "functions", strength: "required" }], skills: [] },
  { id: "stl", trackId: "cpp-core", status: "planned", title: "The standard library (STL)", summary: "vector, map, set, stack, queue, algorithms, iterators.", prerequisites: [{ id: "arrays", strength: "required" }, { id: "functions", strength: "required" }], skills: [] },
  { id: "complexity", trackId: "dsa-foundations", status: "planned", title: "Time & space complexity", summary: "How running time grows with input size.", prerequisites: [{ id: "nested-loops", strength: "required" }, { id: "functions", strength: "required" }], skills: [] },
  { id: "searching-sorting", trackId: "dsa-foundations", status: "planned", title: "Searching & sorting", summary: "Linear and binary search, simple sorts.", prerequisites: [{ id: "arrays", strength: "required" }, { id: "complexity", strength: "recommended" }], skills: [] },
  { id: "recursion", trackId: "dsa-foundations", status: "planned", title: "Recursion", summary: "Functions that call themselves.", prerequisites: [{ id: "functions", strength: "required" }], skills: [] },
];

/** The order the adaptive diagnostic climbs (concepts that have diagnostic questions). */
export const DIAGNOSTIC_LADDER = [
  "cpp-basics", "variables-types", "arithmetic-ops", "comparison-ops", "conditions",
  "for-loops", "nested-loops", "functions", "arrays", "strings",
] as const;
