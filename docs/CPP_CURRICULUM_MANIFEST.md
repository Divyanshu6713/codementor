# C++ curriculum manifest

> Generated from `src/content/course` by `npm run content:manifest`. Do not edit by hand —
> `tests/course-content.test.ts` fails when this file is out of date.

**127 published lessons** in 17 of 17 modules · 519 exercise tests · 254 practice problems · 0 planned topics not yet written.

Every published lesson has: goals, concept sections, common mistakes, a worked example whose output is
checked against real g++, a quick check, a coding exercise with sample and hidden tests, four
progressive hints, a reference solution (server-only), an explain-again text and a summary — plus two
graded practice problems (intermediate and challenge), each verified the same way.
Baseline standard: C++20 (the sandbox compiles with `-std=c++20`); lessons marked C++17 use nothing newer.

Status key: **published** = written and compiler-verified · **planned** = listed in the roadmap, no lesson page yet.

## Overview

| # | Module | Level | Published | Planned |
|---|---|---|---|---|
| 1 | Introduction to C++ (`foundations`) | Beginner | 7 | 0 |
| 2 | Variables, data types and input/output (`variables-io`) | Beginner | 9 | 0 |
| 3 | Operators and expressions (`operators`) | Beginner | 5 | 0 |
| 4 | Conditional statements (`logic`) | Beginner | 9 | 0 |
| 5 | Loops (`loops`) | Beginner | 9 | 0 |
| 6 | Functions and recursion (`functions`) | Beginner | 6 | 0 |
| 7 | Arrays and strings (`arrays-strings`) | Beginner | 9 | 0 |
| 8 | Pointers, references and dynamic memory (`pointers`) | Intermediate | 6 | 0 |
| 9 | Object-oriented programming (`oop`) | Intermediate | 8 | 0 |
| 10 | Modern C++ and advanced functions (`modern-cpp`) | Intermediate | 7 | 0 |
| 11 | The Standard Template Library (`stl`) | Intermediate | 8 | 0 |
| 12 | Searching and sorting (`searching-sorting`) | Intermediate | 7 | 0 |
| 13 | Data structures (`data-structures`) | Advanced | 10 | 0 |
| 14 | Algorithms and problem solving (`algorithms`) | Advanced | 8 | 0 |
| 15 | Files, exceptions and debugging (`files-exceptions`) | Advanced | 5 | 0 |
| 16 | Advanced C++ and engineering practice (`advanced-cpp`) | Advanced | 7 | 0 |
| 17 | Projects and capstone (`projects`) | Advanced | 7 | 0 |

## 1. Introduction to C++

`foundations` · Beginner — What programming is, how a program is built and run, the structure of a C++ program and your first output.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `what-is-programming` | What is programming? | 10 | C++17 | — | 1/0 | Make a sandwich · Morning routine — with a missing step | published |
| `how-programs-work` | How programs work | 12 | C++17 | — | 1/0 | Fix two compile errors · Fix three compile errors | published |
| `program-structure` | Structure of a C++ program | 12 | C++17 | — | 1/0 | Two lines from scratch · A boxed title | published |
| `hello-world` | Hello World and printing | 12 | C++17 | — | 1/0 | Quotes inside text · A file path and a table | published |
| `compiling-linking` | Source files, compiling and linking | 15 | C++17 | compiler, linker, declaration, definition, prototype | 1/3 | Declare before use · Functions that call each other | published |
| `reading-compiler-errors` | Reading compiler errors | 15 | C++17 | compiler errors, warnings, debugging | 1/2 | Arrows and braces · Errors and a warning | published |
| `portable-cpp` | Writing portable C++ | 15 | C++17 | portability, standard C++, fixed-width integers, cstdint | 2/2 | A wrapping checksum · Bytes, most significant first | published |

## 2. Variables, data types and input/output

`variables-io` · Beginner — Storing values, choosing types, reading input with cin and getline, and printing with cout.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `input-output` | Input and output | 15 | C++17 | — | 2/3 | Sum, difference, product · Greeting with next year's age | published |
| `variables` | Variables | 15 | C++17 | — | 1/3 | Rotate three values · Running total | published |
| `data-types` | Data types | 15 | C++17 | — | 2/3 | Next letter and its code · Bill with a discount | published |
| `constants-const` | Constants and const | 12 | C++17 | const, constexpr, magic numbers | 1/3 | Seconds in a span of years · Length converter | published |
| `escape-sizeof` | Escape sequences and sizeof | 12 | C++17 | escape sequences, sizeof, char codes | 1/3 | Count with sizeof · A JSON line | published |
| `getline-input` | getline and whole-line input | 15 | C++17 | getline, cin.ignore, whitespace | 1/2 | Number the lines · Longest line until END | published |
| `overflow-signed` | Integer overflow, signed and unsigned | 15 | C++17 | overflow, INT_MAX, unsigned, size_t | 2/3 | The countdown that never ends · How far can factorial go? | published |
| `floating-point` | Floating-point precision | 15 | C++17 | double, precision, epsilon, setprecision | 2/2 | Exact money in paise · Roots of a quadratic | published |
| `validating-input` | Validating input | 15 | C++17 | cin.fail, cin.clear, input validation | 1/4 | Strict integers only · Is this a real date? | published |

## 3. Operators and expressions

`operators` · Beginner — Arithmetic, assignment, increment, precedence, integer division, modulo and type conversion.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `operators` | Operators | 15 | C++17 | — | 2/3 | Digit sum of a 3-digit number · Seconds to a clock | published |
| `precedence-associativity` | Precedence and associativity | 15 | C++17 | precedence, associativity, parentheses | 1/3 | Celsius to Fahrenheit, in ints · Precedence versus left to right | published |
| `division-modulo-deep` | Integer division and modulo in depth | 15 | C++17 | integer division, modulo, negative numbers, base conversion | 2/3 | Day of the week after k days · Any base from 2 to 16 | published |
| `casting-promotion` | Type promotion and casting | 15 | C++17 | static_cast, implicit conversion, rounding, narrowing | 2/3 | Four ways to make it whole · The average letter | published |
| `predict-output` | Predict-the-output challenges | 15 | C++17 | tracing, increment, integer division, char arithmetic | 1/3 | Swap without a temporary · Digital root | published |

## 4. Conditional statements

`logic` · Beginner — Comparisons, and/or/not, if, else, else-if ladders, nesting, switch and real eligibility rules.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `comparison-operators` | Comparison operators | 12 | C++17 | — | 1/3 | Three comparisons · Same parity — even with negatives | published |
| `logical-operators` | Logical operators | 12 | C++17 | — | 2/4 | Can I ride? · Exactly one positive | published |
| `if-statements` | if statements | 12 | C++17 | — | 2/3 | Absolute value · Speeding fine | published |
| `if-else` | if-else | 12 | C++17 | — | 2/3 | The larger of two · Is it a triangle? | published |
| `else-if` | else-if ladders | 15 | C++17 | — | 2/6 | Weather words · Electricity bill slabs | published |
| `nested-conditions` | Nested conditions | 15 | C++17 | — | 2/4 | Which quadrant? · Cinema ticket | published |
| `switch` | switch statements | 12 | C++17 | — | 2/5 | A tiny calculator · Days in a month | published |
| `ternary-operator` | The ternary operator | 10 | C++17 | ternary, conditional expression | 1/3 | Clamp a value · Grade table | published |
| `eligibility-grading` | Eligibility and grading problems | 20 | C++17 | compound conditions, rule tables, validation order | 2/4 | Loan eligibility with a reason · Income tax by slabs | published |

## 5. Loops

`loops` · Beginner — for, while and do-while; nested loops, break/continue, tracing, off-by-one errors and patterns.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `why-loops` | Why loops are needed | 10 | C++17 | — | 1/0 | The 7 times table · Even numbers to 50 | published |
| `for-loops` | for loops | 20 | C++17 | — | 2/3 | Sum of squares · Multiples of 3 or 5 in a range | published |
| `while-loops` | while loops | 15 | C++17 | — | 2/3 | Collatz steps · Palindrome number | published |
| `do-while` | do-while loops | 12 | C++17 | — | 2/3 | Keep asking for a positive number · Menu loop | published |
| `nested-loops` | Nested loops | 18 | C++17 | — | 2/2 | Hollow square · Number pyramid | published |
| `break-continue` | break and continue | 12 | C++17 | — | 2/3 | Sum until a negative · Positive sum with a stop code | published |
| `infinite-loops` | Infinite loops and how to spot them | 15 | C++17 | infinite loop, loop variant, termination | 1/3 | Wrong direction · Tenths without drift | published |
| `debug-loop-missions` | Debug-the-loop missions | 20 | C++17 | debugging, off-by-one, tracing, loop invariants | 1/3 | Mission 2: digit count · Mission 3: row totals | published |
| `loop-patterns` | Number and pattern problems | 18 | C++17 | — | 1/3 | Upside-down triangle · Diamond | published |

## 6. Functions and recursion

`functions` · Beginner — Naming and reusing work, parameters and return values, references, scope, overloading and recursion.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `functions-intro` | Functions: name a job, reuse it | 15 | C++17 | function, call, void, declaration, definition | 2/2 | Triangle of any character · Frame a word | published |
| `parameters-return` | Parameters and return values | 20 | C++17 | parameter, argument, return, bool function | 1/3 | gcd and lcm · Primes in a range | published |
| `pass-by-reference` | Pass by value and by reference | 20 | C++17 | pass by value, pass by reference, reference parameter, const reference | 2/3 | Quotient and remainder at once · Normalise a time | published |
| `scope-lifetime` | Scope and lifetime | 15 | C++17 | scope, local variable, shadowing, global variable, static local | 1/2 | Fix the counter · Ticket numbers with a static counter | published |
| `overloading-defaults` | Overloading and default arguments | 15 | C++17 | function overloading, default arguments, ambiguity | 1/3 | One name, three areas · Repeat with defaults | published |
| `recursion` | Recursion and base cases | 25 | C++17 | recursion, base case, call stack, recursive case | 2/4 | Binary, recursively · Tower of Hanoi | published |

## 7. Arrays and strings

`arrays-strings` · Beginner — Many values under one name, traversal, searching, 2D grids, std::string and a first look at std::vector.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `arrays-intro` | Arrays: many values, one name | 15 | C++17 | array, index, zero-based, out of bounds | 2/2 | Second largest · Merge two sorted lists | published |
| `array-traversal` | Traversal: sum, max and counting | 20 | C++17 | traversal, accumulator, running maximum, average | 2/3 | Maximum and where it is · Longest rising run | published |
| `prefix-sums` | Prefix sums | 15 | C++17 | prefix sums, range queries, precomputation | 1/3 | Even numbers in a range · Rectangle sums in a grid | published |
| `array-search` | Searching and frequency counting | 20 | C++17 | linear search, sentinel -1, frequency array, counting | 2/2 | Count and last position · Most frequent value | published |
| `arrays-functions` | Arrays in functions, and std::vector | 20 | C++17 | array parameter, size parameter, std::vector, push_back, size() | 2/3 | Keep the evens · Remove duplicates in place | published |
| `two-d-arrays` | 2D arrays: grids and tables | 20 | C++17 | 2D array, row, column, nested loops, matrix | 1/3 | Row with the biggest sum · Spiral order | published |
| `strings-basics` | Strings: working with text | 20 | C++17 | std::string, getline, length, char, concatenation | 2/2 | Title Case · Run-length encoding | published |
| `string-problems` | String problems: palindromes and C-strings | 20 | C++17 | two pointers, palindrome, isalpha, C-style string, null terminator | 2/4 | Anagrams · Caesar cipher | published |
| `c-strings` | C-style strings and character arrays in depth | 20 | C++17 | char array, null terminator, strlen, strcmp, buffer overflow | 2/3 | Write your own strcmp · A bounded join | published |

## 8. Pointers, references and dynamic memory

`pointers` · Intermediate — Addresses, pointers, dereferencing, pointer arithmetic, new/delete, leaks, dangling pointers and smart pointers.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `pointers-basics` | Addresses and pointers | 20 | C++17 | address, pointer, dereference, nullptr, address-of operator | 1/3 | Swap through pointers · Pointer to the maximum | published |
| `references-depth` | References in depth | 15 | C++17 | reference, const reference, alias, range-for | 1/3 | Return the longer one · Row operations through references | published |
| `pointers-arrays` | Pointers, arrays and functions | 20 | C++17 | pointer arithmetic, array decay, begin/end pointers, const pointer | 2/3 | Sum a range with pointers · Count words with a char pointer | published |
| `pointer-to-pointer` | Pointers to pointers and arrays of pointers | 20 | C++17 | int**, array of pointers, dynamic 2D array, pointer to pointer | 1/3 | Sort pointers, not words · Linked list with Node** | published |
| `dynamic-memory` | Dynamic memory: new, delete and smart pointers | 25 | C++17 | stack, heap, new, delete, memory leak, dangling pointer, unique_ptr | 2/2 | Reverse on the heap · A growable array by hand | published |
| `shared-weak-ptr` | shared_ptr and weak_ptr | 20 | C++17 | shared_ptr, weak_ptr, reference counting, cycles | 1/2 | A cache that doesn't keep things alive · Observers that may leave | published |

## 9. Object-oriented programming

`oop` · Intermediate — Classes and objects, encapsulation, constructors and destructors, inheritance and polymorphism.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `classes-objects` | Classes and objects | 25 | C++17 | class, object, member function, public, private, encapsulation, struct | 1/3 | A simple bank account · A 24-hour clock class | published |
| `constructors-destructors` | Constructors and destructors | 25 | C++17 | constructor, initializer list, default constructor, destructor, object lifetime | 2/3 | Student with an initializer list · A fixed-capacity stack that cleans up | published |
| `static-members` | Static members | 15 | C++17 | static data member, static member function, factory function | 1/2 | How many are alive? · Named constructors for temperatures | published |
| `inheritance-polymorphism` | Inheritance and polymorphism | 30 | C++17 | inheritance, base class, derived class, virtual, override, abstract class, polymorphism | 1/3 | Shapes and their areas · Stacking discounts | published |
| `composition-aggregation` | Composition and aggregation | 15 | C++17 | composition, aggregation, has-a, member initialisation order | 1/3 | A course that refers to students · Fix the construction order | published |
| `operator-overloading` | Operator overloading | 20 | C++17 | operator overloading, operator<<, operator==, operator+ | 1/3 | Fractions with operators · Matrix power for Fibonacci | published |
| `friend-functions` | Friend functions | 12 | C++17 | friend, encapsulation, friend class | 1/3 | Equality and printing for a private time · An auditor class | published |
| `class-from-scratch` | Mini project: a class from scratch | 30 | C++17 | class design, invariants, polynomial | 1/3 | Multiply and differentiate · Divide by (x − a) | published |

## 10. Modern C++ and advanced functions

`modern-cpp` · Intermediate — auto, range-based for, lambdas, templates, namespaces, const correctness and newer standard features.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `auto-lambdas` | auto, range-for and lambdas | 25 | C++17 | auto, range-based for, lambda, capture, comparator, count_if | 1/3 | Sort words by length · Closest to k | published |
| `const-correctness` | const correctness in depth | 15 | C++17 | const member function, pointer to const, mutable | 1/2 | Pointer to const, const pointer · A cached statistic | published |
| `function-pointers` | Function pointers and std::function | 15 | C++17 | function pointer, std::function, callback, dispatch table | 1/3 | A pipeline of steps · Event callbacks with state | published |
| `templates` | Function and class templates | 25 | C++17 | template, typename, type deduction, class template, generic programming | 1/2 | Largest of anything · A generic min-max tracker | published |
| `variadic-templates` | Variadic templates | 15 | C++17 | parameter pack, fold expression, sizeof... | 1/2 | maxOf, the recursive way · Join anything | published |
| `modern-features` | Modern C++17 tools: optional, string_view, enum class | 25 | C++17 | std::optional, std::string_view, enum class, structured bindings, constexpr, C++20 | 1/3 | Traffic lights with enum class · Parse key=value with optional | published |
| `namespaces-headers` | Namespaces and headers | 15 | C++17 | namespace, using declaration, header file, include guard | 1/2 | Two libraries, one name · Helpers private to one file | published |

## 11. The Standard Template Library

`stl` · Intermediate — vector, pair, string, stack, queue, deque, priority_queue, set, map, unordered containers, iterators and algorithms.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `vector-algorithms` | vector, iterators and algorithms | 25 | C++17 | vector, iterator, begin/end, sort, find, count, accumulate, unique | 2/3 | Stats with algorithms · How many are at most x? | published |
| `pair-tuple` | pair and tuple | 15 | C++17 | pair, tuple, structured bindings, tie, lexicographic order | 1/2 | Closest points first · Swap with tie | published |
| `map-set` | set and map | 25 | C++17 | set, map, key-value, insert, count, find, unordered_map, ordered iteration | 1/3 | Phone book · Group anagrams | published |
| `multiset-multimap` | multiset and multimap | 15 | C++17 | multiset, multimap, equal_range, erase one | 1/3 | Several numbers per name · How many rooms? | published |
| `unordered-containers` | unordered_map and unordered_set in depth | 15 | C++17 | hash table, unordered_map, unordered_set, custom hash | 1/3 | Word counts, sorted output · Places visited on a walk | published |
| `custom-comparators` | Custom comparators | 15 | C++17 | comparator, strict weak ordering, functor, priority_queue order | 1/2 | Case-insensitive unique words · Task queue | published |
| `choosing-containers` | Choosing the right container | 20 | C++17 | container choice, deque, list, LRU cache, monotonic deque | 1/3 | Pick the container: undo/redo · LRU cache | published |
| `stack-queue` | stack, queue and priority_queue | 25 | C++17 | stack, LIFO, queue, FIFO, deque, priority_queue | 1/3 | Undo · Counting-out game | published |

## 12. Searching and sorting

`searching-sorting` · Intermediate — Time and space complexity, binary search, bubble, selection, insertion, merge and quick sort, and std::sort.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `complexity` | Time and space complexity | 25 | C++17 | Big-O, time complexity, space complexity, O(1), O(log n), O(n), O(n log n), O(n^2), constraints | 2/5 | Pairs that add up — fast · Answer many range sums | published |
| `binary-search` | Binary search | 25 | C++17 | binary search, sorted array, lower_bound, O(log n), invariant | 1/4 | Integer square root · Smallest truck capacity | published |
| `simple-sorts` | Sorting: bubble, selection, insertion and std::sort | 30 | C++17 | bubble sort, selection sort, insertion sort, stability, std::sort, comparator | 1/4 | Selection sort, pass by pass · Bubble sort with an early exit | published |
| `merge-sort` | Merge sort | 20 | C++17 | divide and conquer, merge, O(n log n), stable sort | 1/3 | Merge two sorted lists · Count inversions | published |
| `quicksort` | Quicksort | 20 | C++17 | partition, pivot, average O(n log n), worst case O(n²) | 1/3 | Partition around a value · Quickselect: the k-th smallest | published |
| `counting-sort` | Counting sort | 15 | C++17 | counting sort, frequency array, O(n + k), non-comparison sort | 1/2 | Stable sort by grade · Radix sort | published |
| `comparing-sorts` | Comparing algorithms by constraints | 15 | C++17 | constraints, operations budget, stability, std::stable_sort | 1/3 | Which complexity fits? · Median of a big list | published |

## 13. Data structures

`data-structures` · Advanced — Linked lists, stacks, queues, hash tables, trees, BSTs, heaps, tries, graphs and union-find.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `linked-lists` | Linked lists | 30 | C++17 | linked list, node, head, traversal, insertion, deletion, std::list | 1/3 | Middle of a linked list · Remove every x | published |
| `dynamic-arrays` | How vector grows (dynamic arrays) | 20 | C++17 | capacity, size, reallocation, amortised O(1), iterator invalidation | 1/2 | Doubling versus +10 · Insert in the middle | published |
| `stacks-queues-scratch` | Stacks and queues from scratch | 20 | C++17 | stack, queue, circular buffer, two-stack queue | 1/2 | Queue from two stacks · Stack with O(1) minimum | published |
| `trees-bst` | Trees and binary search trees | 30 | C++17 | tree, binary tree, binary search tree, root, leaf, height, inorder traversal | 2/3 | Minimum, maximum and search in a BST · Level by level | published |
| `tries` | Tries | 20 | C++17 | trie, prefix tree, end-of-word marker, autocomplete | 1/2 | Longest common prefix · Autocomplete | published |
| `hashing-heaps` | Hash tables and heaps | 30 | C++17 | hash table, hash function, bucket, collision, load factor, heap, priority queue, top-k | 1/3 | First word that appears once · Running median | published |
| `graphs-bfs-dfs` | Graphs: BFS and DFS | 35 | C++17 | graph, vertex, edge, adjacency list, BFS, DFS, shortest path, connected components | 1/3 | Count the islands of friends · Escape the maze | published |
| `topological-sort` | Topological sort | 20 | C++17 | directed acyclic graph, in-degree, Kahn's algorithm, cycle detection | 1/3 | Can it be built? · Minimum semesters | published |
| `disjoint-set-union` | Disjoint-set union | 20 | C++17 | union-find, path compression, union by size, connected components | 1/2 | Redundant cable · Cheapest road network (Kruskal) | published |
| `dijkstra` | Shortest paths: Dijkstra | 25 | C++17 | weighted graph, Dijkstra's algorithm, priority queue, path reconstruction | 1/3 | Show the route · Cheapest walk across a grid | published |

## 14. Algorithms and problem solving

`algorithms` · Advanced — Two pointers, sliding window, prefix sums, recursion, backtracking, greedy, divide and conquer, DP, bits and number theory.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `two-pointers-window` | Prefix sums, two pointers and sliding windows | 30 | C++17 | prefix sums, two pointers, sliding window, brute force to optimisation | 2/3 | Longest stretch without repeats · Subarrays that sum to K | published |
| `greedy` | Greedy algorithms | 25 | C++17 | greedy, activity selection, exchange argument, counterexample | 1/4 | Hand out the sweets · Fewest arrows | published |
| `backtracking` | Backtracking | 30 | C++17 | backtracking, recursion, search tree, permutations, combinations, pruning | 1/3 | All arrangements · N queens | published |
| `divide-and-conquer` | Divide and conquer | 20 | C++17 | divide and conquer, recurrence, fast exponentiation, maximum subarray | 1/3 | Modular power · Fibonacci in O(log n) | published |
| `dynamic-programming` | Dynamic programming | 35 | C++17 | dynamic programming, overlapping subproblems, memoization, tabulation, state, coin change | 2/4 | Longest common subsequence · Knapsack | published |
| `more-dp` | More DP: knapsack and longest increasing subsequence | 25 | C++17 | 0/1 knapsack, 1D DP table, LIS, patience sorting, edit distance | 1/3 | LIS for big inputs · Edit distance | published |
| `bits-number-theory` | Bit manipulation and number theory | 30 | C++17 | binary, bitwise operators, power of two, gcd, lcm, modular arithmetic, sieve of Eratosthenes | 2/3 | Fast power modulo m · Subsets with a given sum | published |
| `choosing-approach` | Choosing an approach from constraints | 20 | C++17 | problem patterns, binary search on the answer, prefix sums with hashing, bitmask brute force | 1/3 | Count subarrays with sum k · Fair split (n ≤ 20) | published |

## 15. Files, exceptions and debugging

`files-exceptions` · Advanced — File streams, exceptions, defensive programming, reading compiler warnings, debugging and basic testing.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `streams-parsing` | Streams: files, string streams and parsing | 30 | C++17 | stream, ifstream, ofstream, stringstream, getline, delimiter, stream errors, istream& | 1/2 | Shopping list totals · A tiny word counter | published |
| `paths-filesystem` | std::filesystem | 20 | C++17 | std::filesystem::path, directory iteration, path components, normalisation | 1/3 | Normalise a path · An in-memory file system | published |
| `exceptions` | Exceptions: throw, try and catch | 30 | C++17 | exception, throw, try, catch, std::exception, invalid_argument, runtime_error, out_of_range, stack unwinding | 1/3 | Parse a positive number · A custom exception for stock | published |
| `debugging-testing` | Debugging and testing your code | 25 | C++17 | compiler errors, warnings, assert, debug output, unit test, edge cases, minimal reproduction | 1/3 | Fix the average of positives · Fix the median | published |
| `debugging-ide` | Debugging with breakpoints in an IDE | 15 | C++17 | breakpoint, step over, step into, watch, call stack, conditional breakpoint | 1/3 | A trace like a watch window · Conditional breakpoint | published |

## 16. Advanced C++ and engineering practice

`advanced-cpp` · Advanced — RAII, ownership, move semantics, the rule of zero/three/five, undefined behaviour, concurrency basics and tooling.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `raii-ownership` | RAII and ownership | 30 | C++17 | RAII, ownership, unique_ptr, shared_ptr, use_count, deleted copy, scope guard | 1/2 | Who owns the resource? · Shared ownership | published |
| `move-semantics` | Copy, move and the rule of five | 35 | C++17 | copy constructor, copy assignment, move constructor, rvalue reference, std::move, rule of three, rule of five, rule of zero | 1/2 | Deep copy · Move instead of copy | published |
| `undefined-behaviour` | Undefined behaviour and writing safe code | 30 | C++17 | undefined behaviour, signed overflow, out of bounds, uninitialised variable, dangling reference, sanitizers, numeric_limits | 1/3 | Checked indexing · Overflow-safe multiplication | published |
| `concurrency-races` | Threads, mutexes and race conditions | 25 | C++17 | std::thread, data race, std::mutex, lock_guard, deadlock, atomic | 1/4 | Spot the deadlock risk · Bounded buffer (producer–consumer) | published |
| `separate-compilation` | Separate compilation and header guards | 20 | C++17 | translation unit, declaration vs definition, linker, one definition rule, header guard | 1/2 | Who includes whom? · Play the linker | published |
| `cmake-basics` | CMake fundamentals | 20 | C++17 | CMakeLists.txt, add_executable, add_library, target_link_libraries, build directory | 1/3 | Generate the compile commands · PUBLIC or PRIVATE? | published |
| `git-workflow` | A basic Git workflow | 20 | C++17 | repository, staging area, commit, branch, merge, conflict | 1/2 | Branches as labels · Three-way merge | published |

## 17. Projects and capstone

`projects` · Advanced — Guided projects that combine everything: from a calculator to a full command-line application.

| Lesson id | Title | Min | Std | Concepts | Tests (sample/hidden) | Practice | Status |
|---|---|---|---|---|---|---|---|
| `project-calculator` | Project: Calculator | 35 | C++17 | tokenising, operator precedence, recursive descent parsing, error handling | 1/3 | Add variables · Show the RPN | published |
| `project-guessing-game` | Project: Number guessing game | 30 | C++17 | pseudo-random numbers, seeds, game loop, input validation, binary search | 1/3 | The computer guesses · Bulls and cows | published |
| `project-contact-manager` | Project: Contact manager | 35 | C++17 | class design, std::map, validation, command loop, undo stack | 1/2 | Search by prefix · Undo | published |
| `project-expense-tracker` | Project: File-based expense tracker | 40 | C++17 | CSV parsing, money as integers, load / save, reports, error recovery | 1/2 | Monthly report · Budgets and alerts | published |
| `project-grade-manager` | Project: student grade manager | 45 | C++17 | project, command loop, map, sorting, functions, input validation | 1/3 | Class statistics · Report card with ranks | published |
| `project-bank-system` | Project: bank account system | 50 | C++17 | project, classes, map, exceptions, invariants, atomic operation | 1/3 | Transfers ledger · Undo the last transaction | published |
| `capstone-library` | Capstone: library management system | 60 | C++17 | capstone, design, classes, map, set, string parsing, case-insensitive search, business rules | 1/3 | Search the catalogue · Late fees | published |
