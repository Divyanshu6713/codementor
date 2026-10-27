import type { ConceptDef, TrackDef } from "./types";

export const TRACKS: TrackDef[] = [
  { id: "cpp-foundations", title: "C++ Foundations", description: "From your first program to loops, functions, arrays and strings.", order: 1, status: "active" },
  { id: "cpp-core", title: "C++ Core", description: "2D arrays, pointers, classes, the standard library, modern C++, exceptions and safe engineering.", order: 2, status: "active" },
  { id: "problem-solving", title: "Problem Solving", description: "Breaking problems down and combining concepts into programs.", order: 3, status: "active" },
  { id: "dsa-foundations", title: "DSA Foundations", description: "Complexity, searching, sorting, recursion and core data structures.", order: 4, status: "active" },
];

/**
 * The concept dependency graph. Order inside the array is the default teaching order
 * (a valid topological order — checked by tests), and follows the course: for loops before while loops.
 */
export const CONCEPTS: ConceptDef[] = [
  {
    id: "cpp-basics", trackId: "cpp-foundations", status: "active",
    courseLessons: ["what-is-programming", "how-programs-work", "program-structure", "hello-world", "input-output"],
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
    courseLessons: ["variables", "data-types"],
    title: "Variables & data types", summary: "Storing values, assignment, int / double / char / bool / string.",
    prerequisites: [{ id: "cpp-basics", strength: "required" }],
    skills: [
      { id: "variables", title: "Variables & assignment", description: "Declaring variables and how assignment copies a value." },
      { id: "data_types", title: "Data types", description: "Choosing int, double, char, bool and string." },
    ],
  },
  {
    id: "arithmetic-ops", trackId: "cpp-foundations", status: "active",
    courseLessons: ["operators"],
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
    courseLessons: ["comparison-operators", "logical-operators"],
    title: "Comparison & logical operators", summary: "< <= > >= == != and combining conditions with && || !.",
    prerequisites: [{ id: "variables-types", strength: "required" }],
    skills: [
      { id: "relational_ops", title: "Comparison operators", description: "What < <= > >= == != evaluate to, including the edges." },
      { id: "logical_ops", title: "Logical operators", description: "&&, || and ! with true/false values." },
    ],
  },
  {
    id: "conditions", trackId: "cpp-foundations", status: "active",
    courseLessons: ["if-statements", "if-else", "else-if", "nested-conditions", "switch"],
    title: "Conditions (if / else)", summary: "Making decisions with if, else, else-if ladders and nesting.",
    prerequisites: [{ id: "comparison-ops", strength: "required" }],
    skills: [
      { id: "if_else", title: "if / else", description: "Running code only when a condition is true." },
      { id: "else_if", title: "else-if ladders", description: "Exactly one branch of a ladder runs." },
      { id: "switch_case", title: "switch", description: "Choosing a case by value, and why break matters." },
    ],
  },
  {
    id: "for-loops", trackId: "cpp-foundations", status: "active",
    courseLessons: ["why-loops", "for-loops", "break-continue", "loop-patterns"],
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
    id: "while-loops", trackId: "cpp-foundations", status: "active",
    courseLessons: ["while-loops", "do-while"],
    title: "While loops", summary: "Repeating while a condition stays true.",
    prerequisites: [{ id: "comparison-ops", strength: "required" }, { id: "arithmetic-ops", strength: "required" }, { id: "for-loops", strength: "recommended" }],
    skills: [
      { id: "while_loop", title: "while loops", description: "Condition checked before each repetition." },
      { id: "do_while", title: "do-while loops", description: "The body runs once before the condition is checked." },
    ],
  },
  {
    id: "nested-loops", trackId: "cpp-foundations", status: "active",
    courseLessons: ["nested-loops"],
    title: "Nested loops", summary: "A loop inside a loop: rows and columns, patterns.",
    prerequisites: [{ id: "for-loops", strength: "required" }],
    skills: [
      { id: "nested_intro", title: "Inner loop runs fully each time", description: "For every outer iteration the inner loop starts over." },
      { id: "nested_patterns", title: "Patterns & grids", description: "Printing rows and columns." },
    ],
  },
  {
    id: "functions", trackId: "cpp-foundations", status: "active",
    courseLessons: ["functions-intro", "parameters-return", "pass-by-reference", "scope-lifetime", "overloading-defaults"],
    title: "Functions", summary: "Declaring, calling, parameters, return values and scope.",
    prerequisites: [{ id: "conditions", strength: "required" }, { id: "for-loops", strength: "recommended" }],
    skills: [
      { id: "function_basics", title: "Defining & calling", description: "Writing a function and calling it." },
      { id: "function_params_return", title: "Parameters & return", description: "Passing values in and getting a value back." },
      { id: "pass_by_reference", title: "Pass by reference", description: "When a function can change the caller's variable (&)." },
      { id: "scope_lifetime", title: "Scope & overloading", description: "Where a variable exists; functions with the same name and different parameters." },
    ],
  },
  {
    id: "arrays", trackId: "cpp-foundations", status: "active",
    courseLessons: ["arrays-intro", "array-traversal", "array-search", "arrays-functions"],
    title: "Arrays", summary: "Storing many values, indexing from 0, traversing with loops.",
    prerequisites: [{ id: "for-loops", strength: "required" }],
    skills: [
      { id: "array_indexing", title: "Indexing", description: "The first element is at index 0; the last at size − 1." },
      { id: "array_traversal", title: "Traversal", description: "Visiting every element with a loop." },
      { id: "array_algorithms", title: "Searching & aggregating", description: "Finding a value, the maximum, a count; passing arrays to functions." },
    ],
  },
  {
    id: "strings", trackId: "cpp-foundations", status: "active",
    courseLessons: ["strings-basics", "string-problems"],
    title: "Strings", summary: "std::string, characters, length and traversal.",
    prerequisites: [{ id: "arrays", strength: "required" }],
    skills: [
      { id: "string_basics", title: "String basics", description: "Length, indexing characters, traversal." },
      { id: "string_methods", title: "String operations", description: "substr, find, concatenation, comparing, and character tricks." },
    ],
  },
  // ── C++ core, DSA and projects ──
  { id: "2d-arrays", trackId: "cpp-core", status: "active", courseLessons: ["two-d-arrays"], title: "2D arrays & matrices", summary: "Rows and columns of values.", prerequisites: [{ id: "arrays", strength: "required" }, { id: "nested-loops", strength: "required" }], 
    skills: [
      { id: "matrix_indexing", title: "Row & column indexing", description: "grid[r][c]: row first, then column; sizes and bounds." },
      { id: "matrix_traversal", title: "Matrix traversal", description: "Nested loops over rows and columns; sums, diagonals, transposes." },
    ],
  },
  { id: "pointers", trackId: "cpp-core", status: "active", courseLessons: ["pointers-basics", "pointers-arrays", "dynamic-memory"], title: "Pointers", summary: "Memory addresses, dereferencing, pointers with arrays and functions.", prerequisites: [{ id: "arrays", strength: "required" }, { id: "functions", strength: "required" }], 
    skills: [
      { id: "pointer_basics", title: "Addresses & dereferencing", description: "&x gives an address; *p reads or writes what p points to." },
      { id: "pointer_arithmetic", title: "Pointers & arrays", description: "Array names as pointers, p + 1, references vs pointers." },
      { id: "dynamic_memory", title: "Dynamic memory", description: "new / delete, leaks, dangling pointers and smart pointers." },
    ],
  },
  { id: "oop", trackId: "cpp-core", status: "active", courseLessons: ["classes-objects", "constructors-destructors", "inheritance-polymorphism"], title: "Classes & objects", summary: "Constructors, encapsulation, inheritance, polymorphism.", prerequisites: [{ id: "functions", strength: "required" }], 
    skills: [
      { id: "class_basics", title: "Classes & encapsulation", description: "Members, public/private, methods and objects." },
      { id: "constructors", title: "Constructors & destructors", description: "Initialising objects, initializer lists, when destructors run." },
      { id: "inheritance_poly", title: "Inheritance & polymorphism", description: "Base/derived classes, virtual functions, overriding." },
    ],
  },
  { id: "stl", trackId: "cpp-core", status: "active", courseLessons: ["vector-algorithms", "map-set", "stack-queue"], title: "The standard library (STL)", summary: "vector, map, set, stack, queue, algorithms, iterators.", prerequisites: [{ id: "arrays", strength: "required" }, { id: "functions", strength: "required" }], 
    skills: [
      { id: "vector_ops", title: "vector", description: "push_back, size, iteration, erase and common pitfalls." },
      { id: "map_set", title: "map & set", description: "Sorted unique keys, counting with maps, lookups." },
      { id: "stack_queue", title: "stack & queue", description: "LIFO and FIFO containers and their operations." },
      { id: "stl_algorithms", title: "Algorithms & iterators", description: "sort, find, count, reverse, accumulate and iterators." },
    ],
  },
  { id: "complexity", trackId: "dsa-foundations", status: "active", courseLessons: ["complexity"], title: "Time & space complexity", summary: "How running time grows with input size.", prerequisites: [{ id: "nested-loops", strength: "required" }, { id: "functions", strength: "required" }], 
    skills: [
      { id: "big_o", title: "Big-O notation", description: "Describing how work grows: O(1), O(log n), O(n), O(n²)." },
      { id: "loop_complexity", title: "Analysing code", description: "Counting the work done by loops, nested loops and halving." },
    ],
  },
  { id: "searching-sorting", trackId: "dsa-foundations", status: "active", courseLessons: ["array-search", "binary-search", "simple-sorts"], title: "Searching & sorting", summary: "Linear and binary search, simple sorts.", prerequisites: [{ id: "arrays", strength: "required" }, { id: "complexity", strength: "recommended" }], 
    skills: [
      { id: "binary_search", title: "Binary search", description: "Halving a sorted range; mid, low and high." },
      { id: "sorting_algos", title: "Sorting algorithms", description: "Bubble, selection and insertion sort; std::sort and comparators." },
    ],
  },
  { id: "recursion", trackId: "dsa-foundations", status: "active", courseLessons: ["recursion"], title: "Recursion", summary: "Functions that call themselves.", prerequisites: [{ id: "functions", strength: "required" }], 
    skills: [
      { id: "base_case", title: "Base case & recursive step", description: "Every recursion needs a stopping case and progress towards it." },
      { id: "recursive_trace", title: "Tracing recursion", description: "Following the call stack and return values." },
    ],
  },
  { id: "modern-cpp", trackId: "cpp-core", status: "active", courseLessons: ["auto-lambdas", "templates", "modern-features"], title: "Modern C++ & templates", summary: "auto, lambdas, templates, optional, string_view and enum class.", prerequisites: [{ id: "functions", strength: "required" }, { id: "stl", strength: "recommended" }], 
    skills: [
      { id: "auto_lambda", title: "auto & lambdas", description: "Type deduction, range-for, lambdas and captures." },
      { id: "templates", title: "Templates", description: "Generic functions and classes." },
      { id: "modern_types", title: "optional, enum class, string_view", description: "Safer modern types and when to use them." },
    ],
  },
  { id: "files-exceptions", trackId: "cpp-core", status: "active", courseLessons: ["streams-parsing", "exceptions", "debugging-testing"], title: "Streams, exceptions & debugging", summary: "File and string streams, try/catch, and finding bugs systematically.", prerequisites: [{ id: "oop", strength: "required" }], 
    skills: [
      { id: "streams", title: "Streams & parsing", description: "stringstream, getline, reading until the end of input." },
      { id: "exceptions", title: "Exceptions", description: "throw, try/catch, and which handler runs." },
      { id: "debugging", title: "Debugging & testing", description: "Reading errors, finding bugs systematically, assert." },
    ],
  },
  { id: "data-structures", trackId: "dsa-foundations", status: "active", courseLessons: ["linked-lists", "trees-bst", "hashing-heaps", "graphs-bfs-dfs"], title: "Data structures", summary: "Linked lists, binary search trees, hash tables, heaps and graphs.", prerequisites: [{ id: "pointers", strength: "required" }, { id: "recursion", strength: "required" }], 
    skills: [
      { id: "linked_lists", title: "Linked lists", description: "Nodes, next pointers, traversal and insertion." },
      { id: "trees_bst", title: "Trees & BSTs", description: "Binary trees, BST ordering and traversals." },
      { id: "hash_heap", title: "Hash tables & heaps", description: "Average O(1) lookup; priority_queue." },
      { id: "graphs", title: "Graphs", description: "Adjacency lists, BFS and DFS." },
    ],
  },
  { id: "algorithms", trackId: "dsa-foundations", status: "active", courseLessons: ["two-pointers-window", "greedy", "backtracking", "dynamic-programming", "bits-number-theory"], title: "Algorithms & problem solving", summary: "Two pointers, greedy, backtracking, dynamic programming, bits and primes.", prerequisites: [{ id: "recursion", strength: "required" }, { id: "complexity", strength: "required" }], 
    skills: [
      { id: "two_pointers", title: "Two pointers & windows", description: "Prefix sums, two pointers and sliding windows." },
      { id: "greedy", title: "Greedy", description: "Making the locally best choice — and when that's right." },
      { id: "dynamic_programming", title: "Dynamic programming", description: "Overlapping subproblems, memoisation and tables." },
      { id: "backtracking", title: "Backtracking", description: "Trying choices and undoing them." },
      { id: "bits_math", title: "Bits & number theory", description: "Bitwise operators, gcd, primes and modular arithmetic." },
    ],
  },
  { id: "advanced-cpp", trackId: "cpp-core", status: "active", courseLessons: ["raii-ownership", "move-semantics", "undefined-behaviour"], title: "Advanced C++ & safety", summary: "RAII, ownership, move semantics and avoiding undefined behaviour.", prerequisites: [{ id: "pointers", strength: "required" }, { id: "oop", strength: "required" }], 
    skills: [
      { id: "raii", title: "RAII & ownership", description: "Resources tied to object lifetime; unique_ptr and shared_ptr." },
      { id: "move_semantics", title: "Copy & move", description: "Copy vs move, the rule of three/five." },
      { id: "undefined_behaviour", title: "Undefined behaviour", description: "Out-of-bounds, uninitialised values, overflow and dangling references." },
    ],
  },
  { id: "projects", trackId: "problem-solving", status: "active", courseLessons: ["project-grade-manager", "project-bank-system", "capstone-library"], title: "Projects & capstone", summary: "Complete command-line programs that combine everything.", prerequisites: [{ id: "oop", strength: "required" }, { id: "stl", strength: "required" }], 
    skills: [
      { id: "program_design", title: "Program design", description: "Splitting a program into functions, classes and data." },
      { id: "input_handling", title: "Menus & input handling", description: "Command loops, validation and clear output." },
    ],
  },
];

/** The order the adaptive diagnostic climbs (concepts that have diagnostic questions). */
export const DIAGNOSTIC_LADDER = [
  "cpp-basics", "variables-types", "arithmetic-ops", "comparison-ops", "conditions",
  "for-loops", "nested-loops", "functions", "arrays", "strings",
] as const;
