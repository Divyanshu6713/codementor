import type { QuestionDef } from "../types";
import { LPR, PAR, starter } from "./helpers";

/**
 * Practice banks for the first part of the path: program basics, variables, operators, conditions,
 * while loops and nested loops. Predict-output answers and coding references are checked with g++
 * by tests/question-bank.test.ts.
 */
export const FOUNDATION_QUESTIONS: QuestionDef[] = [
  // ── Program basics ────────────────────────────────────────────────────────
  {
    id: "pb-semicolon", type: "identify_error", conceptId: "cpp-basics", difficulty: 1,
    skills: [{ id: "program_structure" }], purposes: LPR,
    prompt: "This program doesn't compile. What's wrong?",
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hi"
    return 0;
}`,
    options: [
      { id: "a", text: "Line 5 is missing a semicolon at the end" },
      { id: "b", text: "`return 0;` isn't allowed in main", feedback: "return 0; is the normal way to end main." },
      { id: "c", text: "\"Hi\" should use single quotes", feedback: "Text (strings) uses double quotes; single quotes are for one character." },
      { id: "d", text: "main needs to be called `Main`", feedback: "C++ is case-sensitive: it must be exactly `main`." },
    ],
    correct: "a",
    hints: [
      "Every statement in C++ has to end with the same character. Which one?",
      "Statements end with `;`.",
      "Look at the `cout` line.",
      "The compiler reads `cout << \"Hi\" return 0;` as one statement because the first one never ended.",
      "Add the missing `;` after `\"Hi\"`.",
    ],
    explanation: "Each statement ends with a semicolon. Without it after `cout << \"Hi\"`, the compiler runs into `return` and reports an error.",
  },
  {
    id: "pb-endl", type: "predict_output", conceptId: "cpp-basics", difficulty: 1,
    skills: [{ id: "output_cout" }], purposes: LPR,
    prompt: "What does this print?",
    code: `cout << "A" << endl;
cout << "B" << "C" << endl;`,
    options: [
      { id: "a", text: "A\nBC" },
      { id: "b", text: "ABC", feedback: "`endl` starts a new line after A." },
      { id: "c", text: "A\nB\nC", feedback: "There's no new line between B and C." },
      { id: "d", text: "A B C" },
    ],
    correct: "a",
    hints: [
      "What does `endl` do?",
      "`endl` ends the current line.",
      "After A comes a new line. Is there one between B and C?",
      "Pieces joined with `<<` are printed right next to each other.",
      "Line 1: A. Line 2: B and C together.",
    ],
    explanation: "`endl` moves to a new line. B and C are printed next to each other on the second line.",
  },
  {
    id: "pb-spaces", type: "predict_output", conceptId: "cpp-basics", difficulty: 2,
    skills: [{ id: "output_cout" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a = 4, b = 7;
cout << a << b << " " << a + b;`,
    options: [
      { id: "a", text: "47 11" },
      { id: "b", text: "4 7 11", feedback: "cout adds no spaces on its own — only the \" \" you print." },
      { id: "c", text: "47 47", feedback: "`a + b` is calculated first: 4 + 7." },
      { id: "d", text: "a b a + b", feedback: "Without quotes, a and b are variables, so their values are printed." },
    ],
    correct: "a",
    hints: [
      "Does `cout` put spaces between values by itself?",
      "Only text you print, like `\" \"`, adds a space.",
      "a then b are printed with nothing between them.",
      "`a + b` is an expression — it's worked out before printing.",
      "4 and 7 side by side, a space, then the sum.",
    ],
    explanation: "4 and 7 are printed next to each other (47), then a space, then 4 + 7 = 11.",
  },
  {
    id: "pb-cin-two", type: "predict_output", conceptId: "cpp-basics", difficulty: 2,
    skills: [{ id: "input_cin" }], purposes: LPR,
    prompt: "The user types `3 5` and presses Enter. What does this print?",
    code: `int x, y;
istringstream cin("3 5");  // stands in for the keyboard
cin >> x >> y;
cout << y - x;`,
    options: [
      { id: "a", text: "2" },
      { id: "b", text: "-2", feedback: "x is read first (3), then y (5). y - x = 5 - 3." },
      { id: "c", text: "35" },
      { id: "d", text: "8" },
    ],
    correct: "a",
    hints: [
      "Which variable gets the first number?",
      "`cin >> x >> y` fills x first, then y.",
      "x = 3, y = 5.",
      "Now compute y - x.",
      "5 - 3 = ?",
    ],
    explanation: "`cin >> x >> y` reads 3 into x and 5 into y, so `y - x` is 2. (The `istringstream` line just pretends to be the keyboard so the example can run.)",
  },
  {
    id: "pb-order", type: "reorder", conceptId: "cpp-basics", difficulty: 1,
    skills: [{ id: "program_structure" }], purposes: LPR,
    prompt: "Put the lines in order to make a complete program that prints Hello.",
    lines: ["#include <iostream>", "using namespace std;", "int main() {", "    cout << \"Hello\";", "    return 0;", "}"],
    hints: [
      "What has to come before you can use cout?",
      "#include goes at the very top, then the using line.",
      "Everything the program does goes inside main's braces.",
      "`return 0;` is the last statement inside main.",
      "include → using → main { → cout → return → }",
    ],
    explanation: "Includes come first, then `using namespace std;`, then main with its statements in order, ending with `return 0;` and the closing brace.",
  },
  {
    id: "pb-cin-arrow", type: "identify_error", conceptId: "cpp-basics", difficulty: 2,
    skills: [{ id: "input_cin" }], purposes: LPR,
    prompt: "This is meant to read the user's age. What's wrong?",
    code: `int age;
cin << age;
cout << "You are " << age;`,
    options: [
      { id: "a", text: "cin uses `>>` (arrows point into the variable), not `<<`" },
      { id: "b", text: "age must be declared after cin", feedback: "A variable has to be declared before it's used." },
      { id: "c", text: "You can't print text and a number in one cout", feedback: "You can chain as many pieces as you like with <<." },
      { id: "d", text: "Nothing — it's correct" },
    ],
    correct: "a",
    hints: [
      "Which way does data flow when reading input?",
      "The arrows show direction: input flows *into* the variable.",
      "Compare with cout, which sends data *out*.",
      "cin uses `>>`, cout uses `<<`.",
      "Change line 2 to `cin >> age;`.",
    ],
    explanation: "Input flows from cin into the variable, so it's `cin >> age;`. `<<` is for output.",
  },
  {
    id: "pb-blank-cout", type: "complete_code", conceptId: "cpp-basics", difficulty: 1,
    skills: [{ id: "output_cout" }], purposes: LPR,
    prompt: "Fill in the blank so the program prints the value of `n` followed by a new line.",
    code: `int n = 5;
____ << n << endl;`,
    accepted: ["cout", "std::cout"],
    wrongAnswers: [{ answer: "cin", feedback: "cin reads input; printing uses cout." }, { answer: "print", feedback: "C++ prints with cout, not print." }],
    hints: [
      "Which object sends output to the screen?",
      "It's the \"c-out\" stream.",
      "It's used with `<<`.",
      "cin is for input, cout for output.",
      "c _ _ _",
    ],
    explanation: "`cout << n << endl;` prints n and then a new line.",
  },
  {
    id: "pb-main-return", type: "mcq", conceptId: "cpp-basics", difficulty: 2,
    skills: [{ id: "program_structure" }], purposes: LPR,
    prompt: "What does `return 0;` at the end of `main` mean?",
    options: [
      { id: "a", text: "The program finished successfully" },
      { id: "b", text: "Print 0 on the screen", feedback: "return sends a value back to whoever ran the program; it prints nothing." },
      { id: "c", text: "Restart the program from the top", feedback: "return ends main — it doesn't loop." },
      { id: "d", text: "Delete all the variables", feedback: "Variables do disappear when main ends, but that's not what the 0 means." },
    ],
    correct: "a",
    hints: [
      "Who receives the value that main returns?",
      "The operating system (or whatever started the program) gets it.",
      "By convention one particular value means \"all good\".",
      "Any other number usually signals an error.",
      "0 means success.",
    ],
    explanation: "main's return value goes to the operating system. 0 means the program ended normally.",
  },
  {
    id: "pb-code-greet", type: "write_code", conceptId: "cpp-basics", difficulty: 2,
    skills: [{ id: "input_cin" }, { id: "output_cout" }], purposes: PAR,
    prompt: "Read two whole numbers `a` and `b`. Print their sum, then on the next line their product.",
    starterCode: starter("Read a and b, print a + b on one line and a * b on the next"),
    tests: [
      { label: "3 and 4", input: "3 4\n", output: "7\n12", visibility: "sample", category: "normal" },
      { label: "0 and 9", input: "0 9\n", output: "9\n0", visibility: "visible", category: "edge" },
      { label: "negative", input: "-2 5\n", output: "3\n-10", visibility: "hidden", category: "edge" },
      { label: "larger", input: "120 30\n", output: "150\n3600", visibility: "hidden", category: "normal" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    cout << a * b << endl;
    return 0;
}`,
    solutionWalkthrough: "Declare two ints, read both with one `cin >> a >> b;`, then print the sum and the product on separate lines.",
    detectors: [],
    hints: [
      "How many values do you need to read, and into what?",
      "Declare `int a, b;` and read them with `cin >>`.",
      "Then two `cout` statements, each ending with `endl`.",
      "Sum is `a + b`, product is `a * b`.",
      "int a, b;\ncin >> a >> b;\ncout << ___ << endl;\ncout << ___ << endl;",
    ],
    explanation: "Read a and b, then print a + b and a * b on separate lines.",
  },

  // ── Variables & data types ────────────────────────────────────────────────
  {
    id: "vt-copy", type: "predict_output", conceptId: "variables-types", difficulty: 1,
    skills: [{ id: "variables" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a = 5;
int b = a;
a = 9;
cout << a << " " << b;`,
    options: [
      { id: "a", text: "9 5" },
      { id: "b", text: "9 9", feedback: "`b = a` copies the value 5 at that moment. Changing a later doesn't change b." },
      { id: "c", text: "5 5" },
      { id: "d", text: "5 9" },
    ],
    correct: "a",
    hints: [
      "What is stored in b right after `int b = a;`?",
      "Assignment copies a value — it doesn't link the variables.",
      "b got 5. Then a changed.",
      "Changing a afterwards has no effect on b.",
      "a is 9, b is still 5.",
    ],
    explanation: "`b = a` copies 5 into b. When a later becomes 9, b keeps its own copy: 9 5.",
  },
  {
    id: "vt-swap", type: "predict_output", conceptId: "variables-types", difficulty: 2,
    skills: [{ id: "variables" }], purposes: LPR,
    prompt: "This tries to swap x and y. What does it print?",
    code: `int x = 1, y = 2;
x = y;
y = x;
cout << x << " " << y;`,
    options: [
      { id: "a", text: "2 2" },
      { id: "b", text: "2 1", feedback: "After `x = y`, the original 1 is gone — so y = x copies 2 back." },
      { id: "c", text: "1 2" },
      { id: "d", text: "1 1" },
    ],
    correct: "a",
    hints: [
      "Trace one line at a time and write down both values.",
      "After `x = y;` what is x?",
      "Where did the old value of x (1) go?",
      "It was overwritten — so `y = x` copies 2.",
      "A real swap needs a temporary variable.",
    ],
    explanation: "`x = y` makes x 2 and loses the 1. `y = x` then copies 2 into y. Swapping needs a third variable: `int t = x; x = y; y = t;`.",
  },
  {
    id: "vt-int-double", type: "predict_output", conceptId: "variables-types", difficulty: 2,
    skills: [{ id: "data_types" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int n = 7.9;
double d = 7;
cout << n << " " << d / 2;`,
    options: [
      { id: "a", text: "7 3.5" },
      { id: "b", text: "8 3.5", feedback: "Storing 7.9 in an int drops the fraction — it doesn't round." },
      { id: "c", text: "7.9 3.5", feedback: "An int can't hold 7.9." },
      { id: "d", text: "7 3", feedback: "d is a double, so d / 2 keeps the fraction." },
    ],
    correct: "a",
    hints: [
      "What happens to 7.9 when it's stored in an int?",
      "Converting to int cuts off (truncates) the fractional part.",
      "d is a double holding 7.0.",
      "Dividing a double by 2 keeps the decimal part.",
      "n = 7, d / 2 = 3.5.",
    ],
    explanation: "Storing 7.9 in an int truncates it to 7. d is a double, so d / 2 is 3.5.",
  },
  {
    id: "vt-char", type: "predict_output", conceptId: "variables-types", difficulty: 3,
    skills: [{ id: "data_types" }], purposes: LPR,
    prompt: "What does this print?",
    code: `char c = 'A';
c = c + 2;
cout << c;`,
    options: [
      { id: "a", text: "C" },
      { id: "b", text: "A2", feedback: "c + 2 is arithmetic on the character's code, not joining text." },
      { id: "c", text: "67", feedback: "The result is stored back in a char, so it prints as a letter." },
      { id: "d", text: "B" },
    ],
    correct: "a",
    hints: [
      "Characters are stored as numbers (codes).",
      "Letters A, B, C… have consecutive codes.",
      "Two steps after A is…?",
      "Because c is a char, cout prints the letter, not the number.",
      "A → B → C.",
    ],
    explanation: "A char holds a character code. 'A' + 2 is the code of 'C', and printing a char shows the letter.",
  },
  {
    id: "vt-bool", type: "mcq", conceptId: "variables-types", difficulty: 1,
    skills: [{ id: "data_types" }], purposes: LPR,
    prompt: "Which type is the best fit for storing whether a light is on?",
    options: [
      { id: "a", text: "bool" },
      { id: "b", text: "int", feedback: "It would work, but bool says exactly what you mean: true or false." },
      { id: "c", text: "string", feedback: "Storing \"on\" as text makes comparisons error-prone." },
      { id: "d", text: "double" },
    ],
    correct: "a",
    hints: [
      "How many possible values does \"on or off\" have?",
      "Two values: yes or no.",
      "C++ has a type made for exactly two values.",
      "Its values are `true` and `false`.",
      "b _ _ l",
    ],
    explanation: "`bool` holds `true` or `false` — exactly an on/off state.",
  },
  {
    id: "vt-uninit", type: "identify_error", conceptId: "variables-types", difficulty: 3,
    skills: [{ id: "variables" }], purposes: LPR,
    prompt: "This sometimes prints a strange total. Why?",
    code: `int total;
total = total + 10;
cout << total;`,
    options: [
      { id: "a", text: "total was never given a starting value, so it holds garbage" },
      { id: "b", text: "You can't add to a variable in its own assignment", feedback: "`total = total + 10` is fine once total has a value." },
      { id: "c", text: "10 must be written as 10.0", feedback: "10 is a perfectly good int." },
      { id: "d", text: "cout can't print an int", feedback: "cout prints ints without any problem." },
    ],
    correct: "a",
    hints: [
      "What is total's value on line 1?",
      "A local int that isn't initialised doesn't start at 0.",
      "Line 2 reads total before anything was stored in it.",
      "Reading an uninitialised variable is undefined behaviour.",
      "Write `int total = 0;`.",
    ],
    explanation: "A local variable without an initial value holds whatever was in memory. Initialise it: `int total = 0;`.",
  },
  {
    id: "vt-blank-string", type: "complete_code", conceptId: "variables-types", difficulty: 2,
    skills: [{ id: "data_types" }], purposes: LPR,
    prompt: "Fill in the type so `name` can hold a whole word like \"Priya\".",
    code: `____ name = "Priya";
cout << name;`,
    accepted: ["string", "std::string", "auto"],
    wrongAnswers: [{ answer: "char", feedback: "A char holds one character, not a word." }, { answer: "int", feedback: "int holds whole numbers, not text." }],
    hints: [
      "Is \"Priya\" one character or many?",
      "Text is a sequence of characters.",
      "C++ has a library type for text.",
      "It comes from `<string>`.",
      "s _ _ _ _ _",
    ],
    explanation: "`string name = \"Priya\";` — a string holds any amount of text.",
  },
  {
    id: "vt-code-convert", type: "write_code", conceptId: "variables-types", difficulty: 2,
    skills: [{ id: "data_types" }, { id: "variables", weight: 0.5 }], purposes: PAR,
    prompt: "Read a temperature in Celsius (it may have a decimal point). Print it in Fahrenheit using `F = C * 9 / 5 + 32`.",
    starterCode: starter("Read the Celsius temperature and print Fahrenheit"),
    tests: [
      { label: "100 °C", input: "100\n", output: "212", visibility: "sample", category: "normal" },
      { label: "0 °C", input: "0\n", output: "32", visibility: "visible", category: "boundary" },
      { label: "decimal input", input: "36.6\n", output: "97.88", visibility: "hidden", category: "normal" },
      { label: "negative", input: "-40\n", output: "-40", visibility: "hidden", category: "edge" },
      { label: "needs a fraction", input: "1\n", output: "33.8", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    double c;
    cin >> c;
    cout << c * 9 / 5 + 32 << endl;
    return 0;
}`,
    solutionWalkthrough: "Use a double so decimals are kept both when reading and when dividing by 5. With an int, 1 °C would wrongly print 33.",
    detectors: [],
    hints: [
      "Can the input have a decimal point? Which type can hold that?",
      "Use `double`, not `int`.",
      "Read it with cin, then compute the formula.",
      "With doubles, `9 / 5` part is safe because c * 9 is a double first.",
      "double c;\ncin >> c;\ncout << ___ << endl;",
    ],
    explanation: "Read a double and print `c * 9 / 5 + 32`.",
  },

  // ── Arithmetic operators ──────────────────────────────────────────────────
  {
    id: "ar-intdiv", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 1,
    skills: [{ id: "integer_division" }], purposes: LPR,
    prompt: "What does this print?",
    code: `cout << 17 / 5 << " " << 17 % 5;`,
    options: [
      { id: "a", text: "3 2" },
      { id: "b", text: "3.4 2", feedback: "Both 17 and 5 are ints, so / gives a whole number." },
      { id: "c", text: "3 3.4" },
      { id: "d", text: "2 3", feedback: "/ gives the quotient, % the remainder." },
    ],
    correct: "a",
    hints: [
      "Both numbers are ints. What does int / int give?",
      "Integer division drops the fraction.",
      "How many whole 5s fit in 17? What's left over?",
      "`%` is the remainder.",
      "17 = 5 × 3 + 2.",
    ],
    explanation: "17 / 5 is 3 (fraction dropped) and 17 % 5 is the remainder, 2.",
  },
  {
    id: "ar-precedence", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 2,
    skills: [{ id: "arithmetic_ops" }], purposes: LPR,
    prompt: "What does this print?",
    code: `cout << 2 + 3 * 4 << " " << (2 + 3) * 4;`,
    options: [
      { id: "a", text: "14 20" },
      { id: "b", text: "20 20", feedback: "* happens before + unless parentheses say otherwise." },
      { id: "c", text: "14 14" },
      { id: "d", text: "20 14" },
    ],
    correct: "a",
    hints: [
      "Which happens first, + or *?",
      "Multiplication and division come before addition and subtraction.",
      "2 + 12 = ?",
      "Parentheses force the addition to happen first.",
      "5 * 4 = ?",
    ],
    explanation: "Without parentheses 3 * 4 is done first: 2 + 12 = 14. With them: 5 * 4 = 20.",
  },
  {
    id: "ar-average", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 3,
    skills: [{ id: "integer_division" }, { id: "arithmetic_ops", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a = 7, b = 8;
double avg = (a + b) / 2;
cout << avg;`,
    options: [
      { id: "a", text: "7" },
      { id: "b", text: "7.5", feedback: "(a + b) / 2 is int / int, so it's 7 *before* being stored in the double." },
      { id: "c", text: "8" },
      { id: "d", text: "15" },
    ],
    correct: "a",
    hints: [
      "What type is `(a + b)`? What type is `2`?",
      "The division happens before the result is stored.",
      "int / int → int: 15 / 2 = 7.",
      "Storing 7 in a double doesn't bring the .5 back.",
      "Fix: `(a + b) / 2.0`.",
    ],
    explanation: "`(a + b) / 2` is integer division (15 / 2 = 7) and only then stored in avg. Use `2.0` to get 7.5.",
  },
  {
    id: "ar-increment", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 2,
    skills: [{ id: "increment_ops" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int x = 5;
x += 3;
x *= 2;
x--;
cout << x;`,
    options: [
      { id: "a", text: "15" },
      { id: "b", text: "16", feedback: "Don't forget the x-- at the end." },
      { id: "c", text: "12" },
      { id: "d", text: "10" },
    ],
    correct: "a",
    hints: [
      "Trace x line by line.",
      "`x += 3` means x = x + 3.",
      "`x *= 2` means x = x * 2.",
      "`x--` subtracts 1.",
      "5 → 8 → 16 → 15.",
    ],
    explanation: "5 + 3 = 8, 8 × 2 = 16, 16 − 1 = 15.",
  },
  {
    id: "ar-mod-even", type: "complete_code", conceptId: "arithmetic-ops", difficulty: 2,
    skills: [{ id: "integer_division" }], purposes: LPR,
    prompt: "Fill in the condition that is true when `n` is even.",
    code: `if (____) {
    cout << "even";
}`,
    accepted: ["n % 2 == 0", "n%2==0", "n % 2 != 1", "!(n % 2)", "0 == n % 2"],
    wrongAnswers: [
      { answer: "n / 2 == 0", feedback: "n / 2 is the quotient. You want the remainder: n % 2." },
      { answer: "n % 2 == 1", feedback: "That's true for odd numbers." },
      { answer: "n % 2 = 0", feedback: "A single = assigns. Compare with ==." },
    ],
    hints: [
      "What's special about dividing an even number by 2?",
      "There's nothing left over.",
      "Which operator gives the remainder?",
      "`%` gives the remainder; compare it with 0.",
      "n % 2 == ___",
    ],
    explanation: "A number is even when dividing by 2 leaves no remainder: `n % 2 == 0`.",
  },
  {
    id: "ar-digits", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 3,
    skills: [{ id: "integer_division" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int n = 482;
cout << n % 10 << " " << n / 10 % 10 << " " << n / 100;`,
    options: [
      { id: "a", text: "2 8 4" },
      { id: "b", text: "4 8 2", feedback: "% 10 gives the *last* digit." },
      { id: "c", text: "2 48 4" },
      { id: "d", text: "2 8 4.82" },
    ],
    correct: "a",
    hints: [
      "What is 482 % 10?",
      "% 10 gives the last digit.",
      "482 / 10 is 48 (integer division). What's 48 % 10?",
      "482 / 100 drops the last two digits.",
      "Ones, tens, hundreds.",
    ],
    explanation: "482 % 10 = 2 (ones), 482 / 10 = 48 and 48 % 10 = 8 (tens), 482 / 100 = 4 (hundreds).",
  },
  {
    id: "ar-post-pre", type: "predict_output", conceptId: "arithmetic-ops", difficulty: 4,
    skills: [{ id: "increment_ops" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int i = 3;
int a = i++;
int b = ++i;
cout << a << " " << b << " " << i;`,
    options: [
      { id: "a", text: "3 5 5" },
      { id: "b", text: "4 5 5", feedback: "i++ gives the *old* value (3), then increments." },
      { id: "c", text: "3 4 4" },
      { id: "d", text: "4 4 5" },
    ],
    correct: "a",
    hints: [
      "`i++` and `++i` both add 1 — what's different?",
      "Postfix `i++` hands back the value *before* adding.",
      "Prefix `++i` adds first, then hands back the new value.",
      "a gets 3 (i becomes 4). Then i becomes 5 and b gets 5.",
      "a = 3, b = 5, i = 5.",
    ],
    explanation: "`i++` returns 3 and makes i 4. `++i` makes i 5 and returns 5.",
  },
  {
    id: "ar-double-div", type: "mcq", conceptId: "arithmetic-ops", difficulty: 2,
    skills: [{ id: "integer_division" }, { id: "arithmetic_ops", weight: 0.5 }], purposes: LPR,
    prompt: "Which expression gives 2.5?",
    options: [
      { id: "a", text: "5.0 / 2" },
      { id: "b", text: "5 / 2", feedback: "int / int is integer division: 2." },
      { id: "c", text: "5 % 2", feedback: "% is the remainder: 1." },
      { id: "d", text: "(double)(5 / 2)", feedback: "5 / 2 is already 2 before the conversion." },
    ],
    correct: "a",
    hints: [
      "When does division keep the fraction?",
      "At least one side must be a floating-point number.",
      "Watch where the conversion happens.",
      "Converting *after* integer division is too late.",
      "Look for a decimal point in the numbers.",
    ],
    explanation: "`5.0 / 2` divides a double, giving 2.5. Converting after `5 / 2` is too late — it's already 2.",
  },
  {
    id: "ar-code-minutes", type: "write_code", conceptId: "arithmetic-ops", difficulty: 2,
    skills: [{ id: "integer_division" }, { id: "arithmetic_ops" }], purposes: PAR,
    prompt: "Read a number of minutes. Print it as hours and minutes in the form `H h M min` — e.g. 135 → `2 h 15 min`.",
    starterCode: starter("Read the minutes and print hours and leftover minutes"),
    tests: [
      { label: "135", input: "135\n", output: "2 h 15 min", visibility: "sample", category: "normal" },
      { label: "60", input: "60\n", output: "1 h 0 min", visibility: "visible", category: "boundary" },
      { label: "59", input: "59\n", output: "0 h 59 min", visibility: "hidden", category: "boundary" },
      { label: "0", input: "0\n", output: "0 h 0 min", visibility: "hidden", category: "edge" },
      { label: "1000", input: "1000\n", output: "16 h 40 min", visibility: "hidden", category: "normal" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int m;
    cin >> m;
    cout << m / 60 << " h " << m % 60 << " min" << endl;
    return 0;
}`,
    solutionWalkthrough: "Whole hours are `m / 60` (integer division) and the minutes left over are `m % 60`.",
    detectors: [],
    hints: [
      "How many minutes are in an hour?",
      "How many whole hours fit in m minutes?",
      "Integer division gives whole hours; the remainder gives what's left.",
      "Hours: m / 60. Minutes: m % 60.",
      "cout << m / 60 << \" h \" << ___ << \" min\";",
    ],
    explanation: "Hours = m / 60, minutes = m % 60.",
  },

  // ── Comparison & logical operators (extra practice) ───────────────────────
  {
    id: "cmp-or", type: "predict_output", conceptId: "comparison-ops", difficulty: 2,
    skills: [{ id: "logical_ops" }], purposes: LPR,
    prompt: "What does this print? (true prints as 1, false as 0.)",
    code: `int t = 35;
cout << (t < 0 || t > 30) << (t > 0 && t < 30) << !(t == 35);`,
    options: [
      { id: "a", text: "100" },
      { id: "b", text: "110", feedback: "35 < 30 is false, so the && is false." },
      { id: "c", text: "101", feedback: "t == 35 is true, so !(…) is false." },
      { id: "d", text: "000" },
    ],
    correct: "a",
    hints: [
      "Evaluate each bracket on its own.",
      "|| is true if either side is true.",
      "&& needs both sides true.",
      "! flips true to false.",
      "true, false, false → 1 0 0.",
    ],
    explanation: "35 > 30 makes the || true (1). 35 < 30 is false, so the && is 0. t == 35 is true, so ! makes it 0.",
  },
  {
    id: "cmp-range-bug", type: "identify_error", conceptId: "comparison-ops", difficulty: 3,
    skills: [{ id: "relational_ops" }, { id: "logical_ops" }], purposes: LPR,
    prompt: "This should print \"in range\" only for 1 to 10, but it prints it for every number. Why?",
    code: `int x;
cin >> x;
if (1 <= x <= 10) {
    cout << "in range";
}`,
    options: [
      { id: "a", text: "`1 <= x <= 10` compares (1 <= x), which is 0 or 1, with 10 — always true. Use `1 <= x && x <= 10`." },
      { id: "b", text: "It should use < instead of <=", feedback: "The bounds aren't the issue — chaining comparisons is." },
      { id: "c", text: "x needs to be a double", feedback: "The type of x isn't the problem." },
      { id: "d", text: "It works correctly" },
    ],
    correct: "a",
    hints: [
      "C++ evaluates `a <= b <= c` left to right. What's the result of the first part?",
      "`1 <= x` is a bool: 0 or 1.",
      "Then that 0 or 1 is compared with 10.",
      "0 <= 10 and 1 <= 10 are both true.",
      "Join two comparisons with &&.",
    ],
    explanation: "C++ doesn't chain comparisons like maths does. `(1 <= x) <= 10` is always true. Write `1 <= x && x <= 10`.",
  },
  {
    id: "cmp-not", type: "mcq", conceptId: "comparison-ops", difficulty: 3,
    skills: [{ id: "logical_ops" }], purposes: LPR,
    prompt: "Which condition means the same as `!(age >= 18 && member)`?",
    options: [
      { id: "a", text: "age < 18 || !member" },
      { id: "b", text: "age < 18 && !member", feedback: "Negating && turns it into ||." },
      { id: "c", text: "age <= 18 || !member", feedback: "The opposite of >= 18 is < 18, not <= 18." },
      { id: "d", text: "!age >= 18 && !member" },
    ],
    correct: "a",
    hints: [
      "When is `A && B` false?",
      "When at least one of A or B is false.",
      "\"At least one\" is ||.",
      "The opposite of `age >= 18` is `age < 18`.",
      "Flip each part and swap && for ||.",
    ],
    explanation: "By De Morgan's law, `!(A && B)` is `!A || !B`: `age < 18 || !member`.",
  },

  // ── Conditions ────────────────────────────────────────────────────────────
  {
    id: "cd-ladder", type: "predict_output", conceptId: "conditions", difficulty: 2,
    skills: [{ id: "else_if" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int marks = 85;
if (marks >= 50) cout << "pass ";
else if (marks >= 80) cout << "merit ";
else cout << "fail ";`,
    options: [
      { id: "a", text: "pass" },
      { id: "b", text: "merit", feedback: "The first true branch wins; later ones are skipped." },
      { id: "c", text: "pass merit", feedback: "In an else-if ladder, only one branch runs." },
      { id: "d", text: "fail" },
    ],
    correct: "a",
    hints: [
      "How many branches of an if / else-if / else can run?",
      "Exactly one — the first whose condition is true.",
      "Is 85 >= 50?",
      "Once that branch runs, the rest are skipped.",
      "So the order of the checks matters.",
    ],
    explanation: "85 >= 50 is true, so \"pass\" prints and the rest of the ladder is skipped. Check the stricter condition (>= 80) first.",
  },
  {
    id: "cd-separate-ifs", type: "predict_output", conceptId: "conditions", difficulty: 2,
    skills: [{ id: "if_else" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int n = 12;
if (n % 2 == 0) cout << "even ";
if (n % 3 == 0) cout << "three ";
if (n > 20) cout << "big ";`,
    options: [
      { id: "a", text: "even three" },
      { id: "b", text: "even", feedback: "These are separate ifs, not an else-if ladder — each one is checked." },
      { id: "c", text: "even three big" },
      { id: "d", text: "three" },
    ],
    correct: "a",
    hints: [
      "Are these three separate ifs or one ladder?",
      "Separate ifs are each checked independently.",
      "Is 12 even? Divisible by 3? Greater than 20?",
      "Print each word whose condition is true.",
      "Yes, yes, no.",
    ],
    explanation: "Each if is independent: 12 is even and divisible by 3, but not > 20.",
  },
  {
    id: "cd-semicolon", type: "identify_error", conceptId: "conditions", difficulty: 3,
    skills: [{ id: "if_else" }], purposes: LPR,
    prompt: "This always prints \"Adult\", even for age 10. Why?",
    code: `int age = 10;
if (age >= 18);
{
    cout << "Adult";
}`,
    options: [
      { id: "a", text: "The `;` right after the if ends it — the block below always runs" },
      { id: "b", text: "It should be `age > 18`", feedback: "That would still print — the problem is the semicolon." },
      { id: "c", text: "The braces must be on the same line as the if", feedback: "Brace placement doesn't matter in C++." },
      { id: "d", text: "age must be read with cin" },
    ],
    correct: "a",
    hints: [
      "Look very closely at the end of line 2.",
      "A lone `;` is an empty statement.",
      "The if controls only that empty statement.",
      "The braces after it are an ordinary block that always runs.",
      "Delete the semicolon after the condition.",
    ],
    explanation: "`if (age >= 18);` controls an empty statement. The block below isn't part of the if, so it always runs.",
  },
  {
    id: "cd-switch-break", type: "predict_output", conceptId: "conditions", difficulty: 3,
    skills: [{ id: "switch_case" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int day = 2;
switch (day) {
    case 1: cout << "Mon ";
    case 2: cout << "Tue ";
    case 3: cout << "Wed ";
        break;
    default: cout << "Other ";
}`,
    options: [
      { id: "a", text: "Tue Wed" },
      { id: "b", text: "Tue", feedback: "Without `break`, execution falls through into the next case." },
      { id: "c", text: "Mon Tue Wed" },
      { id: "d", text: "Tue Wed Other" },
    ],
    correct: "a",
    hints: [
      "Which case does day = 2 jump to?",
      "What does `break` do — and is there one after case 2?",
      "Without break, the next case's statements run too.",
      "It stops at the first break.",
      "Starts at case 2, runs into case 3, stops at break.",
    ],
    explanation: "switch jumps to case 2, prints Tue, falls through to case 3 (no break), prints Wed, then hits break.",
  },
  {
    id: "cd-switch-blank", type: "complete_code", conceptId: "conditions", difficulty: 2,
    skills: [{ id: "switch_case" }], purposes: LPR,
    prompt: "Fill in the blank so choosing 1 prints only \"Start\".",
    code: `int choice = 1;
switch (choice) {
    case 1:
        cout << "Start";
        ____;
    case 2:
        cout << "Stop";
}`,
    accepted: ["break"],
    wrongAnswers: [{ answer: "continue", feedback: "continue is for loops. switch cases end with break." }, { answer: "return", feedback: "return would leave the whole function, not just the switch." }],
    hints: [
      "What happens after \"Start\" is printed if nothing stops it?",
      "It falls through into case 2.",
      "Which keyword leaves a switch?",
      "The same keyword also leaves loops.",
      "b _ _ _ _",
    ],
    explanation: "`break;` leaves the switch so case 2 doesn't run.",
  },
  {
    id: "cd-nested", type: "predict_output", conceptId: "conditions", difficulty: 3,
    skills: [{ id: "if_else" }, { id: "else_if", weight: 0.5 }], purposes: LPR,
    prompt: "What does this print?",
    code: `int a = 5, b = 9;
if (a > 3) {
    if (b < 5) cout << "X";
    else cout << "Y";
} else {
    cout << "Z";
}`,
    options: [
      { id: "a", text: "Y" },
      { id: "b", text: "Z", feedback: "a > 3 is true, so the outer else doesn't run." },
      { id: "c", text: "X" },
      { id: "d", text: "YZ" },
    ],
    correct: "a",
    hints: [
      "Start with the outer condition.",
      "Is 5 > 3?",
      "Now check the inner condition: is 9 < 5?",
      "The inner else runs when that's false.",
      "Outer true, inner false.",
    ],
    explanation: "a > 3 is true, so we go inside. b < 5 is false, so the inner else prints Y.",
  },
  {
    id: "cd-max3", type: "mcq", conceptId: "conditions", difficulty: 3,
    skills: [{ id: "else_if" }], purposes: LPR,
    prompt: "Which code correctly prints the largest of a, b and c?",
    options: [
      { id: "a", text: "if (a >= b && a >= c) cout << a; else if (b >= c) cout << b; else cout << c;" },
      { id: "b", text: "if (a > b) cout << a; else if (b > c) cout << b; else cout << c;", feedback: "a > b doesn't mean a is the largest — c might be bigger." },
      { id: "c", text: "if (a > b && a > c) cout << a; if (b > c) cout << b; else cout << c;", feedback: "Two separate ifs can print two numbers." },
      { id: "d", text: "if (a > b > c) cout << a; else cout << c;" },
    ],
    correct: "a",
    hints: [
      "To print a, what must a be compared with?",
      "a must be at least as big as *both* b and c.",
      "If a isn't the largest, only b and c are left to compare.",
      "Ties: use >= so equal values still print something.",
      "One ladder, three branches.",
    ],
    explanation: "a is printed only if it beats both others; otherwise the larger of b and c wins. Using >= handles ties.",
  },
  {
    id: "cd-blank-grade", type: "complete_code", conceptId: "conditions", difficulty: 2,
    skills: [{ id: "if_else" }], purposes: LPR,
    prompt: "Fill in the keyword so exactly one of the two messages prints.",
    code: `if (marks >= 40) {
    cout << "pass";
} ____ {
    cout << "fail";
}`,
    accepted: ["else"],
    wrongAnswers: [{ answer: "if", feedback: "An `if` needs a condition. You want the \"otherwise\" branch." }, { answer: "else if", feedback: "else if needs a condition; plain else catches everything else." }],
    hints: [
      "What's the word for \"otherwise\"?",
      "It runs when the if's condition is false.",
      "It has no condition of its own.",
      "It must come right after the if's closing brace.",
      "e _ _ _",
    ],
    explanation: "`else` runs when the condition is false, so exactly one message prints.",
  },
  {
    id: "cd-code-leap", type: "write_code", conceptId: "conditions", difficulty: 3,
    skills: [{ id: "else_if" }, { id: "if_else" }], purposes: PAR,
    prompt: "Read a year. Print `leap` if it is a leap year, otherwise `common`. A year is a leap year if it's divisible by 4 — except years divisible by 100, which are leap years only when also divisible by 400.",
    starterCode: starter("Read the year and print leap or common"),
    tests: [
      { label: "2024", input: "2024\n", output: "leap", visibility: "sample", category: "normal" },
      { label: "2023", input: "2023\n", output: "common", visibility: "sample", category: "normal" },
      { label: "1900", input: "1900\n", output: "common", visibility: "hidden", category: "edge" },
      { label: "2000", input: "2000\n", output: "leap", visibility: "hidden", category: "edge" },
      { label: "2100", input: "2100\n", output: "common", visibility: "hidden", category: "edge" },
      { label: "4", input: "4\n", output: "leap", visibility: "hidden", category: "boundary" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int y;
    cin >> y;
    if (y % 400 == 0) cout << "leap";
    else if (y % 100 == 0) cout << "common";
    else if (y % 4 == 0) cout << "leap";
    else cout << "common";
    cout << endl;
    return 0;
}`,
    solutionWalkthrough: "Check the most specific rule first: divisible by 400 → leap; else divisible by 100 → common; else divisible by 4 → leap; else common.",
    detectors: [],
    hints: [
      "There are three rules. Which one is the most specific?",
      "Check divisibility with %.",
      "An else-if ladder lets the first matching rule decide.",
      "Order: 400, then 100, then 4.",
      "if (y % 400 == 0) …\nelse if (y % 100 == 0) …\nelse if (y % 4 == 0) …\nelse …",
    ],
    explanation: "Check 400, then 100, then 4, in an else-if ladder.",
  },

  // ── While loops ───────────────────────────────────────────────────────────
  {
    id: "wl-trace", type: "predict_output", conceptId: "while-loops", difficulty: 2,
    skills: [{ id: "while_loop" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int n = 1;
while (n < 20) {
    cout << n << " ";
    n *= 3;
}`,
    options: [
      { id: "a", text: "1 3 9" },
      { id: "b", text: "1 3 9 27", feedback: "27 isn't printed: the condition 27 < 20 is checked before the body." },
      { id: "c", text: "3 9 27" },
      { id: "d", text: "1 3 6 9 12 15 18" },
    ],
    correct: "a",
    hints: [
      "Write down n before each check.",
      "n goes 1, 3, 9, 27…",
      "When is the condition checked — before or after printing?",
      "Before each repetition: 27 < 20 is false, so the loop stops.",
      "Print only values that passed the check.",
    ],
    explanation: "n = 1, 3, 9 pass `n < 20` and are printed. n becomes 27, the check fails and the loop ends.",
  },
  {
    id: "wl-digits", type: "predict_output", conceptId: "while-loops", difficulty: 3,
    skills: [{ id: "while_loop" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int n = 5047, count = 0;
while (n > 0) {
    n /= 10;
    count++;
}
cout << count;`,
    options: [
      { id: "a", text: "4" },
      { id: "b", text: "3", feedback: "Count each division: 504, 50, 5, 0." },
      { id: "c", text: "5047" },
      { id: "d", text: "16", feedback: "count goes up by 1 each time, not by the digit." },
    ],
    correct: "a",
    hints: [
      "What does `n /= 10` do to 5047?",
      "It removes the last digit.",
      "How many times can you remove a digit before n is 0?",
      "5047 → 504 → 50 → 5 → 0.",
      "Count the arrows.",
    ],
    explanation: "Each `n /= 10` removes one digit: 4 divisions until n is 0, so count is 4 — the number of digits.",
  },
  {
    id: "wl-infinite", type: "identify_error", conceptId: "while-loops", difficulty: 2,
    skills: [{ id: "while_loop" }], purposes: LPR,
    prompt: "This never stops. Why?",
    code: `int i = 0;
while (i < 5) {
    cout << i << " ";
}`,
    options: [
      { id: "a", text: "i never changes, so `i < 5` is always true" },
      { id: "b", text: "It should be `i <= 5`", feedback: "That would still loop forever — i never changes." },
      { id: "c", text: "while loops can't print", feedback: "Any statement can go in a loop body." },
      { id: "d", text: "i must start at 1" },
    ],
    correct: "a",
    hints: [
      "What would make `i < 5` become false?",
      "Something inside the loop has to move i towards 5.",
      "Is there any line that changes i?",
      "No update means the condition never changes.",
      "Add `i++;` inside the loop.",
    ],
    explanation: "Nothing inside the loop changes i, so the condition stays true forever. Add `i++;`.",
  },
  {
    id: "wl-dowhile", type: "predict_output", conceptId: "while-loops", difficulty: 2,
    skills: [{ id: "do_while" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int k = 10;
do {
    cout << k << " ";
    k++;
} while (k < 5);`,
    options: [
      { id: "a", text: "10" },
      { id: "b", text: "Nothing", feedback: "A do-while always runs its body at least once." },
      { id: "c", text: "10 11 12 13 14" },
      { id: "d", text: "5 6 7 8 9" },
    ],
    correct: "a",
    hints: [
      "When does a do-while check its condition?",
      "After the body.",
      "So the body runs once before any check.",
      "Then 11 < 5 is false.",
      "One value is printed.",
    ],
    explanation: "do-while runs the body first (prints 10), then checks `11 < 5`, which is false.",
  },
  {
    id: "wl-sentinel", type: "complete_code", conceptId: "while-loops", difficulty: 3,
    skills: [{ id: "while_loop" }], purposes: LPR,
    prompt: "Numbers are read until the user types 0. Fill in the loop condition.",
    code: `int x, sum = 0;
cin >> x;
while (____) {
    sum += x;
    cin >> x;
}`,
    accepted: ["x != 0", "x!=0", "x", "0 != x"],
    wrongAnswers: [{ answer: "x == 0", feedback: "That would stop straight away for every real number." }, { answer: "x > 0", feedback: "Negative numbers should still be added — only 0 stops." }],
    hints: [
      "When should the loop keep going?",
      "As long as the number isn't the stop value.",
      "The stop value is 0.",
      "\"is not equal\" is `!=`.",
      "x != ___",
    ],
    explanation: "Keep adding while `x != 0`; reading 0 ends the loop.",
  },
  {
    id: "wl-dowhile-mcq", type: "mcq", conceptId: "while-loops", difficulty: 2,
    skills: [{ id: "do_while" }], purposes: LPR,
    prompt: "When is a do-while loop a better fit than a while loop?",
    options: [
      { id: "a", text: "When the body must run at least once, like showing a menu before checking the choice" },
      { id: "b", text: "When you know exactly how many times to repeat", feedback: "That's usually a for loop." },
      { id: "c", text: "When the loop might not need to run at all", feedback: "That's exactly when a plain while is better." },
      { id: "d", text: "do-while is always faster" },
    ],
    correct: "a",
    hints: [
      "What's the one difference between while and do-while?",
      "Where is the condition checked?",
      "do-while checks after the body.",
      "So the body always runs at least once.",
      "Think of \"ask, then check the answer\".",
    ],
    explanation: "do-while checks after the body, so it fits tasks that must happen once before checking — like reading input and validating it.",
  },
  {
    id: "wl-code-reverse", type: "write_code", conceptId: "while-loops", difficulty: 3,
    skills: [{ id: "while_loop" }], purposes: PAR,
    prompt: "Read a positive whole number and print its digits in reverse order with no spaces — e.g. 1230 → `0321`.",
    starterCode: starter("Read n and print its digits from last to first"),
    tests: [
      { label: "1230", input: "1230\n", output: "0321", visibility: "sample", category: "normal" },
      { label: "7", input: "7\n", output: "7", visibility: "visible", category: "boundary" },
      { label: "123456", input: "123456\n", output: "654321", visibility: "hidden", category: "normal" },
      { label: "1000", input: "1000\n", output: "0001", visibility: "hidden", category: "edge" },
      { label: "90", input: "90\n", output: "09", visibility: "hidden", category: "edge" },
    ],
    compare: "tokens",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    while (n > 0) {
        cout << n % 10;
        n /= 10;
    }
    cout << endl;
    return 0;
}`,
    solutionWalkthrough: "While n > 0: print the last digit (n % 10), then drop it (n /= 10). Printing digit by digit keeps trailing zeros like 0321.",
    detectors: [],
    hints: [
      "How do you get the last digit of a number?",
      "% 10 gives it; / 10 removes it.",
      "Repeat until nothing is left — a while loop.",
      "Print each digit straight away (don't build a new number, or the zeros disappear).",
      "while (n > 0) {\n    cout << n % 10;\n    n /= 10;\n}",
    ],
    explanation: "Repeatedly print n % 10 and divide n by 10 until it is 0.",
  },

  // ── Nested loops (extra practice) ─────────────────────────────────────────
  {
    id: "nl-count", type: "predict_output", conceptId: "nested-loops", difficulty: 2,
    skills: [{ id: "nested_intro" }], purposes: LPR,
    prompt: "What does this print?",
    code: `int count = 0;
for (int i = 0; i < 4; i++)
    for (int j = 0; j < 3; j++)
        count++;
cout << count;`,
    options: [
      { id: "a", text: "12" },
      { id: "b", text: "7", feedback: "The inner loop runs fully for *every* outer iteration: 4 × 3." },
      { id: "c", text: "3" },
      { id: "d", text: "4" },
    ],
    correct: "a",
    hints: [
      "How many times does the inner loop run each time it starts?",
      "How many times does it start?",
      "The inner loop restarts for every outer iteration.",
      "Total = outer count × inner count.",
      "4 × 3.",
    ],
    explanation: "The inner loop runs 3 times for each of the 4 outer iterations: 12.",
  },
  {
    id: "nl-triangle", type: "predict_output", conceptId: "nested-loops", difficulty: 3,
    skills: [{ id: "nested_patterns" }], purposes: LPR,
    prompt: "What does this print?",
    code: `for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= i; j++)
        cout << j;
    cout << endl;
}`,
    options: [
      { id: "a", text: "1\n12\n123" },
      { id: "b", text: "1\n22\n333", feedback: "It prints j, not i." },
      { id: "c", text: "123\n123\n123", feedback: "The inner loop stops at i, which grows each row." },
      { id: "d", text: "123\n12\n1" },
    ],
    correct: "a",
    hints: [
      "How many numbers are printed on row i?",
      "The inner loop runs while j <= i.",
      "What is printed — i or j?",
      "Each row counts up from 1 to the row number.",
      "Row 1: 1. Row 2: 1 2. Row 3: 1 2 3.",
    ],
    explanation: "Row i prints j = 1..i, so the rows are 1, 12, 123.",
  },
  {
    id: "nl-pairs", type: "predict_output", conceptId: "nested-loops", difficulty: 4,
    skills: [{ id: "nested_intro" }], purposes: LPR,
    prompt: "What does this print?",
    code: `for (int i = 0; i < 3; i++)
    for (int j = i + 1; j < 3; j++)
        cout << i << j << " ";`,
    options: [
      { id: "a", text: "01 02 12" },
      { id: "b", text: "00 01 02 11 12 22", feedback: "j starts at i + 1, so pairs like 00 are skipped." },
      { id: "c", text: "01 02 10 12 20 21" },
      { id: "d", text: "01 12" },
    ],
    correct: "a",
    hints: [
      "Where does j start for each i?",
      "j starts just after i.",
      "For i = 0: j = 1, 2. For i = 1: j = 2. For i = 2: none.",
      "This lists each pair once.",
      "Write i then j for each pair.",
    ],
    explanation: "Starting j at i + 1 lists each unordered pair once: 01, 02, 12.",
  },
  {
    id: "nl-blank", type: "complete_code", conceptId: "nested-loops", difficulty: 3,
    skills: [{ id: "nested_patterns" }], purposes: LPR,
    prompt: "Fill in the inner loop's condition so row i prints exactly i stars.",
    code: `for (int i = 1; i <= 4; i++) {
    for (int j = 1; ____; j++)
        cout << "*";
    cout << endl;
}`,
    accepted: ["j <= i", "j<=i", "j < i + 1", "i >= j"],
    wrongAnswers: [{ answer: "j <= 4", feedback: "That prints 4 stars on every row." }, { answer: "j < i", feedback: "One short: row i would get i − 1 stars." }],
    hints: [
      "How many stars on row 3?",
      "The inner loop should run i times.",
      "j starts at 1. When should it stop?",
      "Include j == i.",
      "j <= ___",
    ],
    explanation: "With j from 1 while `j <= i`, row i prints i stars.",
  },
  {
    id: "nl-code-grid", type: "write_code", conceptId: "nested-loops", difficulty: 3,
    skills: [{ id: "nested_patterns" }, { id: "nested_intro" }], purposes: PAR,
    prompt: "Read `n`. Print an n × n multiplication grid: row i, column j holds i × j. Separate numbers in a row with single spaces.",
    starterCode: starter("Read n and print the n x n multiplication grid", "int n;\ncin >> n;"),
    tests: [
      { label: "n = 3", input: "3\n", output: "1 2 3\n2 4 6\n3 6 9", visibility: "sample", category: "normal" },
      { label: "n = 1", input: "1\n", output: "1", visibility: "visible", category: "boundary" },
      { label: "n = 4", input: "4\n", output: "1 2 3 4\n2 4 6 8\n3 6 9 12\n4 8 12 16", visibility: "hidden", category: "normal" },
      { label: "n = 2", input: "2\n", output: "1 2\n2 4", visibility: "hidden", category: "boundary" },
    ],
    compare: "lines",
    referenceSolution: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (j > 1) cout << " ";
            cout << i * j;
        }
        cout << endl;
    }
    return 0;
}`,
    solutionWalkthrough: "The outer loop picks the row i, the inner loop the column j. Print a space before every number except the first in a row, then end the row with endl.",
    detectors: [],
    hints: [
      "One loop for rows, one for columns — which is inside?",
      "Columns go inside rows.",
      "The value at row i, column j is i * j.",
      "End each row with a new line *after* the inner loop.",
      "for (int i = 1; i <= n; i++) {\n    for (int j = 1; j <= n; j++) { … }\n    cout << endl;\n}",
    ],
    explanation: "Outer loop over rows, inner over columns, print i * j, new line after each row.",
  },
];
