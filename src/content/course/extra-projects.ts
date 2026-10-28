import type { CourseLesson } from "./types";
import { practice, starter, T } from "./practice/helpers";

const r = String.raw;

/** Four guided projects that open Module 17, from a calculator to a "file-based" expense tracker. */
export const EXTRA_PROJECT_LESSONS: CourseLesson[] = [
  {
    id: "project-calculator",
    moduleId: "projects",
    after: "@start",
    title: "Project: Calculator",
    minutes: 35,
    concepts: ["tokenising", "operator precedence", "recursive descent parsing", "error handling"],
    goals: [
      "Evaluate expressions like `2 * (3 + 4) - 10 / 5` with correct precedence",
      "Structure a parser as one function per precedence level",
      "Report errors (bad input, division by zero) without crashing",
    ],
    intro: `A calculator looks easy until you meet \`2 + 3 * 4\` (that's 14, not 20) and \`(2 + 3) * 4\`. In this project you'll build a real expression evaluator — the same technique compilers use to understand code.`,
    sections: [
      {
        title: "Grammar: one rule per precedence level",
        body: `\`\`\`
expression := term   { ("+" | "-") term }
term       := factor { ("*" | "/") factor }
factor     := number | "(" expression ")" | "-" factor
\`\`\`

Lower-precedence operators live higher in the grammar. Because \`term\` is evaluated *inside* \`expression\`, multiplication binds tighter than addition automatically.`,
      },
      {
        title: "Recursive descent",
        body: `Each rule becomes a function that reads from a shared position in the string:

\`\`\`cpp
long long expression() {
    long long value = term();
    while (peek() == '+' || peek() == '-') {
        char op = get();
        long long rhs = term();
        value = op == '+' ? value + rhs : value - rhs;
    }
    return value;
}
\`\`\`

The loops make operators **left-associative**: \`10 - 4 - 3\` is (10 − 4) − 3 = 3.`,
      },
      {
        title: "Errors as exceptions",
        body: `When the parser meets something unexpected (\`2 +\`, \`)\`, \`abc\`) or a division by zero, throw an exception with a message. The main loop catches it, prints the message and moves on to the next line — one bad line never stops the program.`,
      },
      {
        title: "Plan",
        body: `1. Write \`peek()\`/\`get()\` that skip spaces.
2. Write \`factor\`, \`term\`, \`expression\`.
3. After \`expression()\`, check the whole line was used.
4. Wrap each line in try/catch.`,
      },
    ],
    mistakes: [
      { title: "Evaluating left to right", body: "Ignoring precedence turns 2 + 3 * 4 into 20." },
      { title: "Not checking for leftovers", body: "\"2 3\" parses 2 and stops; without a final check it would print 2 instead of an error." },
      { title: "Right-associative subtraction", body: "Recursing `expression := term - expression` computes 10 − (4 − 3). Use a loop." },
    ],
    example: {
      title: "Precedence in action",
      intro: "A compact evaluator for + and * on single digits shows the shape.",
      code: r`#include <iostream>
#include <string>
using namespace std;

string s;
size_t pos = 0;

long long factor() { return s[pos++] - '0'; }

long long term() {
    long long v = factor();
    while (pos < s.size() && s[pos] == '*') { pos++; v *= factor(); }
    return v;
}

long long expression() {
    long long v = term();
    while (pos < s.size() && s[pos] == '+') { pos++; v += term(); }
    return v;
}

int main() {
    for (string e : {"2+3*4", "2*3+4", "1+2+3*4*5"}) {
        s = e;
        pos = 0;
        cout << e << " = " << expression() << endl;
    }
    return 0;
}`,
      output: "2+3*4 = 14\n2*3+4 = 10\n1+2+3*4*5 = 63\n",
      notes: [
        { line: 8, text: "A factor here is just one digit." },
        { line: 12, text: "term handles every * before returning to expression." },
        { line: 18, text: "expression only ever adds whole terms." },
      ],
    },
    quickCheck: {
      prompt: "In the grammar, why is `term` called from `expression` and not the other way round?",
      options: [
        { id: "a", text: "So * and / are evaluated before + and −", feedback: "Right — the deeper the rule, the tighter its operators bind." },
        { id: "b", text: "Because + is more common than *", feedback: "Frequency doesn't matter; precedence does." },
        { id: "c", text: "It makes no difference", feedback: "Swapping them would make + bind tighter than *." },
      ],
      correct: "a",
      explanation: "Rules lower in the grammar group their operands first.",
    },
    exercise: {
      title: "Build the calculator",
      prompt: `Read expressions, one per line, until the input ends (skip empty lines). They contain whole numbers, \`+ - * /\`, parentheses, unary minus and spaces. Print the value (integer division truncates toward zero), or \`error: division by zero\`, or \`error: invalid expression\`.`,
      starterCode: r`#include <iostream>
#include <string>
#include <stdexcept>
#include <cctype>
using namespace std;

string s;
size_t pos = 0;

// char peek()  — skip spaces, return the next char or '\0'
// long long expression(), term(), factor()

int main() {
    string line;
    while (getline(cin, line)) {
        if (line.find_first_not_of(' ') == string::npos) continue;
        s = line;
        pos = 0;
        // evaluate, check nothing is left over, catch errors
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "2 + 3 * 4\n(2 + 3) * 4\n2*(3+4)-10/5\n", output: "14\n20\n12", visibility: "sample", category: "normal" },
        { label: "unary and division", input: "-5 + 2\n7 / 2\n-(3 - 10)\n", output: "-3\n3\n7", visibility: "hidden", category: "normal" },
        { label: "errors", input: "1 / 0\n2 +\n(1 + 2\n3 4\n", output: "error: division by zero\nerror: invalid expression\nerror: invalid expression\nerror: invalid expression", visibility: "hidden", category: "edge" },
        { label: "nesting", input: "((3))\n10 - 4 - 3\n\n100 / 7 / 2\n", output: "3\n3\n7", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "peek(): while s[pos] is a space, pos++; return pos < size ? s[pos] : '\\0'.",
        "factor: '-' → return −factor(); '(' → expression, then require ')'; digit → read all digits; else throw invalid.",
        "term: loop on * and /; throw on division by zero before dividing.",
        "After expression(), if peek() != '\\0' the line had extra input → invalid.",
      ],
      solution: r`#include <iostream>
#include <string>
#include <stdexcept>
#include <cctype>
using namespace std;

string s;
size_t pos = 0;

char peek() {
    while (pos < s.size() && s[pos] == ' ') pos++;
    return pos < s.size() ? s[pos] : '\0';
}

long long expression();

long long factor() {
    char c = peek();
    if (c == '-') {
        pos++;
        return -factor();
    }
    if (c == '(') {
        pos++;
        long long v = expression();
        if (peek() != ')') throw runtime_error("invalid expression");
        pos++;
        return v;
    }
    if (isdigit(static_cast<unsigned char>(c))) {
        long long v = 0;
        while (pos < s.size() && isdigit(static_cast<unsigned char>(s[pos]))) v = v * 10 + (s[pos++] - '0');
        return v;
    }
    throw runtime_error("invalid expression");
}

long long term() {
    long long v = factor();
    while (peek() == '*' || peek() == '/') {
        char op = s[pos++];
        long long rhs = factor();
        if (op == '*') v *= rhs;
        else {
            if (rhs == 0) throw runtime_error("division by zero");
            v /= rhs;
        }
    }
    return v;
}

long long expression() {
    long long v = term();
    while (peek() == '+' || peek() == '-') {
        char op = s[pos++];
        long long rhs = term();
        v = op == '+' ? v + rhs : v - rhs;
    }
    return v;
}

int main() {
    string line;
    while (getline(cin, line)) {
        if (line.find_first_not_of(' ') == string::npos) continue;
        s = line;
        pos = 0;
        try {
            long long v = expression();
            if (peek() != '\0') throw runtime_error("invalid expression");
            cout << v << endl;
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Three small mutually recursive functions handle precedence, associativity and parentheses. Exceptions carry errors from deep inside the recursion straight to the main loop.",
    },
    practice: practice(
      {
        title: "Add variables",
        prompt: `Extend the calculator with variables. A line is either \`let NAME = EXPRESSION\` (store it and print \`NAME = VALUE\`) or an expression, where a factor may also be a variable name (letters only). Unknown names print \`error: unknown variable NAME\`; other errors as before.`,
        starterCode: starter("Add identifiers to factor() and handle 'let' lines", "string line;", ["iostream", "string", "map", "stdexcept", "cctype", "sstream"], "// Reuse the parser from the project and add a map<string, long long> vars"),
        tests: [
          T("sample", "let x = 5\nlet y = x * 2 + 1\ny - x\n", "x = 5\ny = 11\n6", "sample"),
          T("unknown", "z + 1\n", "error: unknown variable z", "visible", "edge"),
          T("reassign", "let x = 2\nlet x = x * x\nx\n", "x = 2\nx = 4\n4", "hidden"),
          T("errors still work", "let a = 1 / 0\na\n", "error: division by zero\nerror: unknown variable a", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "In factor: if the next char is a letter, read the whole name and look it up (throw if missing).",
          "For let lines: check line.rfind(\"let \", 0) == 0, split at '=', parse the right side.",
          "Only store the variable if evaluating succeeded.",
          "The variable name is the trimmed text between \"let\" and \"=\".",
        ],
        solution: r`#include <iostream>
#include <string>
#include <map>
#include <stdexcept>
#include <cctype>
#include <sstream>
using namespace std;

string s;
size_t pos = 0;
map<string, long long> vars;

char peek() {
    while (pos < s.size() && s[pos] == ' ') pos++;
    return pos < s.size() ? s[pos] : '\0';
}

long long expression();

long long factor() {
    char c = peek();
    if (c == '-') { pos++; return -factor(); }
    if (c == '(') {
        pos++;
        long long v = expression();
        if (peek() != ')') throw runtime_error("invalid expression");
        pos++;
        return v;
    }
    if (isdigit(static_cast<unsigned char>(c))) {
        long long v = 0;
        while (pos < s.size() && isdigit(static_cast<unsigned char>(s[pos]))) v = v * 10 + (s[pos++] - '0');
        return v;
    }
    if (isalpha(static_cast<unsigned char>(c))) {
        string name;
        while (pos < s.size() && isalpha(static_cast<unsigned char>(s[pos]))) name += s[pos++];
        auto it = vars.find(name);
        if (it == vars.end()) throw runtime_error("unknown variable " + name);
        return it->second;
    }
    throw runtime_error("invalid expression");
}

long long term() {
    long long v = factor();
    while (peek() == '*' || peek() == '/') {
        char op = s[pos++];
        long long rhs = factor();
        if (op == '*') v *= rhs;
        else {
            if (rhs == 0) throw runtime_error("division by zero");
            v /= rhs;
        }
    }
    return v;
}

long long expression() {
    long long v = term();
    while (peek() == '+' || peek() == '-') {
        char op = s[pos++];
        long long rhs = term();
        v = op == '+' ? v + rhs : v - rhs;
    }
    return v;
}

long long evaluate(const string& text) {
    s = text;
    pos = 0;
    long long v = expression();
    if (peek() != '\0') throw runtime_error("invalid expression");
    return v;
}

int main() {
    string line;
    while (getline(cin, line)) {
        if (line.find_first_not_of(' ') == string::npos) continue;
        try {
            if (line.rfind("let ", 0) == 0) {
                size_t eq = line.find('=');
                if (eq == string::npos) throw runtime_error("invalid expression");
                stringstream nameStream(line.substr(4, eq - 4));
                string name;
                nameStream >> name;
                long long v = evaluate(line.substr(eq + 1));
                vars[name] = v;
                cout << name << " = " << v << endl;
            } else {
                cout << evaluate(line) << endl;
            }
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "Variables are just another kind of factor. Because evaluation happens before the assignment, a failed `let` leaves the old value (or no value) untouched.",
      },
      {
        title: "Show the RPN",
        prompt: `Convert each expression (non-negative whole numbers, \`+ - * /\`, parentheses, spaces) to **Reverse Polish Notation** with the shunting-yard algorithm, then evaluate the RPN with a stack. Print \`RPN = VALUE\`, e.g. \`3 4 2 * + = 11\`. Print \`error: mismatched parentheses\` or \`error: division by zero\` instead when needed.`,
        starterCode: starter("Shunting-yard into a vector<string>, then evaluate with a stack", "string line;", ["iostream", "string", "vector", "stack", "cctype"]),
        tests: [
          T("sample", "3 + 4 * 2\n(1 + 2) * (3 + 4)\n", "3 4 2 * + = 11\n1 2 + 3 4 + * = 21", "sample"),
          T("left associative", "10 - 4 - 3\n", "10 4 - 3 - = 3", "visible"),
          T("errors", "(1 + 2\n1 + 2)\n8 / (4 - 4)\n", "error: mismatched parentheses\nerror: mismatched parentheses\nerror: division by zero", "hidden", "edge"),
          T("single", "42\n", "42 = 42", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Numbers go straight to the output. '(' is pushed onto the operator stack.",
          "For an operator, pop operators of greater or equal precedence (not '(') to the output, then push it.",
          "')' pops until '(' (missing '(' → mismatched); at the end, any '(' left is mismatched.",
          "Evaluate: numbers push; an operator pops b then a and pushes a op b.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <vector>
#include <stack>
#include <cctype>
using namespace std;

int prec(char op) { return op == '+' || op == '-' ? 1 : 2; }

int main() {
    string line;
    while (getline(cin, line)) {
        if (line.find_first_not_of(' ') == string::npos) continue;
        vector<string> out;
        stack<char> ops;
        bool bad = false;
        for (size_t i = 0; i < line.size() && !bad; i++) {
            char c = line[i];
            if (c == ' ') continue;
            if (isdigit(static_cast<unsigned char>(c))) {
                string num;
                while (i < line.size() && isdigit(static_cast<unsigned char>(line[i]))) num += line[i++];
                i--;
                out.push_back(num);
            } else if (c == '(') {
                ops.push(c);
            } else if (c == ')') {
                while (!ops.empty() && ops.top() != '(') { out.push_back(string(1, ops.top())); ops.pop(); }
                if (ops.empty()) bad = true;
                else ops.pop();
            } else {
                while (!ops.empty() && ops.top() != '(' && prec(ops.top()) >= prec(c)) {
                    out.push_back(string(1, ops.top()));
                    ops.pop();
                }
                ops.push(c);
            }
        }
        while (!bad && !ops.empty()) {
            if (ops.top() == '(') bad = true;
            else { out.push_back(string(1, ops.top())); ops.pop(); }
        }
        if (bad) {
            cout << "error: mismatched parentheses" << endl;
            continue;
        }
        stack<long long> st;
        bool divZero = false;
        for (const string& tok : out) {
            if (isdigit(static_cast<unsigned char>(tok[0]))) { st.push(stoll(tok)); continue; }
            long long b = st.top(); st.pop();
            long long a = st.top(); st.pop();
            char op = tok[0];
            if (op == '/' && b == 0) { divZero = true; break; }
            st.push(op == '+' ? a + b : op == '-' ? a - b : op == '*' ? a * b : a / b);
        }
        if (divZero) {
            cout << "error: division by zero" << endl;
            continue;
        }
        for (const string& tok : out) cout << tok << " ";
        cout << "= " << st.top() << endl;
    }
    return 0;
}`,
        solutionNotes: "RPN needs no parentheses or precedence rules — the order of the tokens says everything, which is why stack machines and many calculators use it.",
      },
    ),
    explainAgain: `When you see 2 + 3 × 4, you mentally group 3 × 4 first. The parser does the same by giving each level of "stickiness" its own function: factors (numbers and brackets) are stickiest, then × and ÷, then + and −. Each function asks the stickier one below it for complete pieces before combining them.`,
    summary: [
      "One parsing function per precedence level gives correct precedence and associativity.",
      "Check that the whole input was consumed.",
      "Throw exceptions for errors and catch them per line.",
    ],
  },

  {
    id: "project-guessing-game",
    moduleId: "projects",
    after: "project-calculator",
    title: "Project: Number guessing game",
    minutes: 30,
    concepts: ["pseudo-random numbers", "seeds", "game loop", "input validation", "binary search"],
    goals: [
      "Generate repeatable \"random\" numbers from a seed",
      "Write a game loop that validates input and counts attempts",
      "Turn the game around: let the computer guess with binary search",
    ],
    intro: `The classic first game: the computer picks a number from 1 to 100 and answers "higher" or "lower". Along the way you'll learn how computers make random numbers — and why the same seed gives the same game every time, which is exactly what makes it testable.`,
    sections: [
      {
        title: "Pseudo-random numbers",
        body: `Computers generate random-looking numbers with a formula. A **linear congruential generator** is the simplest:

\`\`\`cpp
unsigned long long state = seed;
long long next() {
    state = (1103515245ULL * state + 12345) % 2147483648ULL;   // mod 2^31
    return state;
}
int secret = next() % 100 + 1;   // 1..100
\`\`\`

The same seed always produces the same sequence. In real programs use \`<random>\`: \`std::mt19937 gen(seed); std::uniform_int_distribution<int> d(1, 100);\` — seeded from \`std::random_device\` when you want a different game each time.`,
      },
      {
        title: "The game loop",
        body: `\`\`\`
read a guess
  not a number or outside 1..100 → complain, don't count it
  too small → "higher"; too big → "lower"
  equal → "correct in N guesses", stop
\`\`\``,
      },
      {
        title: "Strategy",
        body: `Always guessing the middle of the remaining range halves it each time, so any number from 1 to 100 is found in at most **7** guesses (2⁷ = 128 ≥ 100). That's binary search.`,
      },
    ],
    mistakes: [
      { title: "Seeding inside the loop", body: "Re-seeding with the same value restarts the sequence, so every 'random' number is the same." },
      { title: "rand() % 100", body: "Gives 0–99, not 1–100. Add 1." },
      { title: "Crashing on letters", body: "If `cin >> n` fails, clear the error and skip the bad token, or read words and convert them yourself." },
    ],
    example: {
      title: "Same seed, same numbers",
      intro: "The generator produces the same sequence every time for a given seed.",
      code: r`#include <iostream>
using namespace std;

unsigned long long state;

long long nextRandom() {
    state = (1103515245ULL * state + 12345) % 2147483648ULL;
    return state;
}

int main() {
    for (int run = 1; run <= 2; run++) {
        state = 42;
        cout << "run " << run << ":";
        for (int i = 0; i < 4; i++) cout << " " << nextRandom() % 100 + 1;
        cout << endl;
    }
    return 0;
}`,
      output: "run 1: 28 65 54 7\nrun 2: 28 65 54 7\n",
      notes: [
        { line: 7, text: "The next state depends only on the previous one." },
        { line: 13, text: "Resetting the seed restarts the sequence." },
        { line: 15, text: "% 100 + 1 maps any number into 1..100." },
      ],
    },
    quickCheck: {
      prompt: "What's the most guesses binary search needs for a number from 1 to 100?",
      options: [
        { id: "a", text: "7", feedback: "Yes — each guess halves the range: 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1." },
        { id: "b", text: "10", feedback: "That would be enough for up to 1024 numbers." },
        { id: "c", text: "50", feedback: "That's guessing without using the hints well." },
      ],
      correct: "a",
      explanation: "⌈log₂ 100⌉ = 7.",
    },
    exercise: {
      title: "The guessing game",
      prompt: `Read a seed, and compute the secret as \`next() % 100 + 1\` with the generator above (one call). Then read guesses (words) until the player is correct or the input ends. For each: if it isn't a whole number from 1 to 100, print \`invalid guess\` (not counted); otherwise print \`higher\`, \`lower\`, or \`correct in N guesses\` (then stop). If the input ends first, print \`gave up, it was S\`.`,
      starterCode: r`#include <iostream>
#include <string>
using namespace std;

unsigned long long state;

long long nextRandom() {
    state = (1103515245ULL * state + 12345) % 2147483648ULL;
    return state;
}

int main() {
    cin >> state;
    int secret = nextRandom() % 100 + 1;
    string word;
    // the game loop

    return 0;
}`,
      tests: [
        { label: "sample", input: "42\n50\n25\n30\n28\n", output: "lower\nhigher\nlower\ncorrect in 4 guesses", visibility: "sample", category: "normal" },
        { label: "invalid input", input: "7\nseven\n0\n101\n17\n", output: "invalid guess\ninvalid guess\ninvalid guess\ncorrect in 1 guesses", visibility: "hidden", category: "edge" },
        { label: "gave up", input: "2026\n10\n90\n", output: "higher\nlower\ngave up, it was 48", visibility: "hidden", category: "edge" },
        { label: "stops after correct", input: "1\n91\n5\n", output: "correct in 1 guesses", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Read guesses with `while (cin >> word)`.",
        "A valid guess is 1–3 digits only, with value 1..100 — check every character with isdigit.",
        "Count only valid guesses.",
        "After the loop ends without a win, print the give-up line.",
      ],
      solution: r`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

unsigned long long state;

long long nextRandom() {
    state = (1103515245ULL * state + 12345) % 2147483648ULL;
    return state;
}

bool parseGuess(const string& w, int& out) {
    if (w.empty() || w.size() > 3) return false;
    for (char c : w)
        if (!isdigit(static_cast<unsigned char>(c))) return false;
    out = stoi(w);
    return out >= 1 && out <= 100;
}

int main() {
    cin >> state;
    int secret = nextRandom() % 100 + 1;
    string word;
    int guesses = 0;
    while (cin >> word) {
        int g;
        if (!parseGuess(word, g)) {
            cout << "invalid guess" << endl;
            continue;
        }
        guesses++;
        if (g < secret) cout << "higher" << endl;
        else if (g > secret) cout << "lower" << endl;
        else {
            cout << "correct in " << guesses << " guesses" << endl;
            return 0;
        }
    }
    cout << "gave up, it was " << secret << endl;
    return 0;
}`,
      solutionNotes: "Reading words instead of numbers means letters can never break cin. Validating length first keeps stoi safe from huge inputs.",
    },
    practice: practice(
      {
        title: "The computer guesses",
        prompt: `Now the player thinks of a number from 1 to 100 and the computer guesses the middle of its range (lo + hi) / 2. Print each guess as \`guess G\`, then read the reply: \`higher\`, \`lower\` or \`correct\`. On \`correct\` print \`got it in N\`. If the replies make the range empty, print \`you're cheating!\` and stop.`,
        starterCode: starter("Binary search driven by the replies", "int lo = 1, hi = 100, tries = 0;\nstring reply;", ["iostream", "string"]),
        tests: [
          T("sample", "lower\nhigher\ncorrect\n", "guess 50\nguess 25\nguess 37\ngot it in 3", "sample"),
          T("first try", "correct\n", "guess 50\ngot it in 1", "visible", "boundary"),
          T("cheating", "higher\nlower\nlower\nlower\nlower\nlower\nlower\n", "guess 50\nguess 75\nguess 62\nguess 56\nguess 53\nguess 51\nyou're cheating!", "hidden", "edge"),
          T("hundred", "higher\nhigher\nhigher\nhigher\nhigher\nhigher\ncorrect\n", "guess 50\nguess 75\nguess 88\nguess 94\nguess 97\nguess 99\nguess 100\ngot it in 7", "hidden", "boundary"),
        ],
        compare: "lines",
        hints: [
          "Loop while lo <= hi: g = (lo + hi) / 2; print it; tries++; read the reply.",
          "higher → lo = g + 1; lower → hi = g − 1.",
          "If the loop ends because lo > hi, the player cheated.",
          "Stop at correct.",
        ],
        solution: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    int lo = 1, hi = 100, tries = 0;
    string reply;
    while (lo <= hi) {
        int g = (lo + hi) / 2;
        cout << "guess " << g << endl;
        tries++;
        if (!(cin >> reply)) return 0;
        if (reply == "correct") {
            cout << "got it in " << tries << endl;
            return 0;
        }
        if (reply == "higher") lo = g + 1;
        else hi = g - 1;
    }
    cout << "you're cheating!" << endl;
    return 0;
}`,
        solutionNotes: "Each reply removes half of the remaining candidates. When the range becomes empty, no number could satisfy every reply.",
      },
      {
        title: "Bulls and cows",
        prompt: `Read a secret of 4 distinct digits, then guesses until correct or the input ends. A guess must be 4 distinct digits, otherwise print \`invalid\` (not counted). Otherwise print \`B bulls, C cows\` — bulls are right digits in the right place, cows are right digits in the wrong place. On 4 bulls print \`won in N\` instead and stop.`,
        starterCode: starter("Validate, then count bulls and cows", "string secret, guess;\ncin >> secret;", ["iostream", "string", "cctype"]),
        tests: [
          T("sample", "1234\n1243\n5678\n1234\n", "2 bulls, 2 cows\n0 bulls, 0 cows\nwon in 3", "sample"),
          T("invalid", "4071\n1123\nabcd\n123\n4071\n", "invalid\ninvalid\ninvalid\nwon in 1", "visible", "edge"),
          T("cows only", "1234\n4321\n", "0 bulls, 4 cows", "hidden"),
          T("mixed", "9305\n3095\n9350\n", "1 bulls, 3 cows\n2 bulls, 2 cows", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Valid: size 4, all digits, and no digit repeated (a bool seen[10] helps).",
          "Bulls: positions where guess[i] == secret[i].",
          "Cows: digits that appear in the secret at a different position.",
          "Because digits are distinct, cows = (digits in common) − bulls.",
        ],
        solution: r`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool valid(const string& g) {
    if (g.size() != 4) return false;
    bool seen[10] = {false};
    for (char c : g) {
        if (!isdigit(static_cast<unsigned char>(c)) || seen[c - '0']) return false;
        seen[c - '0'] = true;
    }
    return true;
}

int main() {
    string secret, guess;
    cin >> secret;
    int tries = 0;
    while (cin >> guess) {
        if (!valid(guess)) {
            cout << "invalid" << endl;
            continue;
        }
        tries++;
        int bulls = 0, common = 0;
        for (int i = 0; i < 4; i++) {
            if (guess[i] == secret[i]) bulls++;
            if (secret.find(guess[i]) != string::npos) common++;
        }
        if (bulls == 4) {
            cout << "won in " << tries << endl;
            return 0;
        }
        cout << bulls << " bulls, " << common - bulls << " cows" << endl;
    }
    return 0;
}`,
        solutionNotes: "With distinct digits, every shared digit is either a bull or a cow, so counting the shared digits once is enough.",
      },
    ),
    explainAgain: `A seeded random generator is like a very long shuffled deck that always starts in the same order for the same seed. That's useless for a casino but perfect for testing: the "random" secret for seed 42 is always 28, so we can check the game gives the right hints.`,
    summary: [
      "Pseudo-random generators are formulas: same seed, same sequence.",
      "Validate input as text so bad input can't break the loop.",
      "Halving the range finds any of 100 numbers in at most 7 guesses.",
    ],
  },

  {
    id: "project-contact-manager",
    moduleId: "projects",
    after: "project-guessing-game",
    title: "Project: Contact manager",
    minutes: 35,
    concepts: ["class design", "std::map", "validation", "command loop", "undo stack"],
    goals: [
      "Design a class that owns its data and protects its rules",
      "Process text commands with clear error messages",
      "Add search and undo on top of the basic operations",
    ],
    intro: `A contact book is a small but complete application: a data model, rules (valid phone numbers, unique names), commands and reports. You'll build it as a class, so \`main\` only deals with reading commands and printing results.`,
    sections: [
      {
        title: "The design",
        body: `\`\`\`cpp
class ContactBook {
    map<string, string> contacts;      // name → phone, kept sorted by name
public:
    bool add(const string& name, const string& phone);
    bool update(const string& name, const string& phone);
    bool erase(const string& name);
    optional<string> find(const string& name) const;
    const map<string, string>& all() const;
};
\`\`\`

The class guarantees its rules; \`main\` turns results into messages.`,
      },
      {
        title: "Validation",
        body: `A phone number here is exactly 10 digits. Check it in one helper (\`isValidPhone\`) and call it from both add and update, so the rule lives in one place.`,
      },
      {
        title: "Plan",
        body: `1. Write \`isValidPhone\`.
2. Write the class methods.
3. Write the command loop: read a command word, then its arguments.
4. Test each error path: duplicate names, bad phones, unknown names.`,
      },
    ],
    mistakes: [
      { title: "Mixing I/O into the class", body: "Printing inside the class makes it hard to reuse. Return results; let main print." },
      { title: "Duplicated validation", body: "Copy-pasted checks drift apart. One helper." },
      { title: "Using [] to look up", body: "contacts[name] inserts an empty entry for unknown names. Use find." },
    ],
    example: {
      title: "The core class in action",
      intro: "add, find and a sorted listing.",
      code: r`#include <iostream>
#include <map>
#include <optional>
#include <string>
using namespace std;

class ContactBook {
    map<string, string> contacts;
public:
    bool add(const string& name, const string& phone) {
        return contacts.insert({name, phone}).second;
    }
    optional<string> find(const string& name) const {
        auto it = contacts.find(name);
        if (it == contacts.end()) return nullopt;
        return it->second;
    }
    const map<string, string>& all() const { return contacts; }
};

int main() {
    ContactBook book;
    book.add("Ravi", "9876543210");
    book.add("Asha", "9123456780");
    cout << "added again? " << book.add("Ravi", "1111111111") << endl;
    if (auto p = book.find("Asha")) cout << "Asha: " << *p << endl;
    for (const auto& [name, phone] : book.all()) cout << name << " " << phone << endl;
    return 0;
}`,
      output: "added again? 0\nAsha: 9123456780\nAsha 9123456780\nRavi 9876543210\n",
      notes: [
        { line: 11, text: "insert refuses duplicates and tells us via .second." },
        { line: 13, text: "optional says \"maybe there's a phone\" without magic values." },
        { line: 27, text: "map keeps names sorted for free." },
      ],
    },
    quickCheck: {
      prompt: "Why does the class return bool/optional instead of printing messages?",
      options: [
        { id: "a", text: "So the same class works with any interface — console, GUI or tests", feedback: "Right — separation of logic and I/O." },
        { id: "b", text: "Printing inside classes isn't allowed", feedback: "It's allowed, just inflexible." },
        { id: "c", text: "It's faster", feedback: "Speed isn't the reason." },
      ],
      correct: "a",
      explanation: "Keeping I/O out of the model makes it reusable and testable.",
    },
    exercise: {
      title: "Build the contact manager",
      prompt: `Commands (one-word names): \`add NAME PHONE\` → \`added NAME\` / \`NAME already exists\` / \`invalid phone\`; \`update NAME PHONE\` → \`updated NAME\` / \`not found\` / \`invalid phone\`; \`delete NAME\` → \`deleted NAME\` / \`not found\`; \`find NAME\` → \`NAME PHONE\` / \`not found\`; \`list\` → every contact as \`NAME PHONE\` sorted by name, or \`(no contacts)\`; \`count\` → the number of contacts. A valid phone is exactly 10 digits; check validity before existence.`,
      starterCode: r`#include <iostream>
#include <map>
#include <optional>
#include <string>
#include <cctype>
using namespace std;

bool isValidPhone(const string& p) {
    // exactly 10 digits
    return false;
}

class ContactBook {
    map<string, string> contacts;
public:
    // add, update, erase, find, all, size
};

int main() {
    ContactBook book;
    string cmd;
    while (cin >> cmd) {
        // dispatch the commands
    }
    return 0;
}`,
      tests: [
        { label: "sample", input: "add Ravi 9876543210\nadd Asha 9123456780\nadd Ravi 1111111111\nfind Asha\nlist\ncount\n", output: "added Ravi\nadded Asha\nRavi already exists\nAsha 9123456780\nAsha 9123456780\nRavi 9876543210\n2", visibility: "sample", category: "normal" },
        { label: "validation", input: "add Zoe 12345\nadd Zoe 98765abcde\nupdate Zoe 9999999999\nlist\n", output: "invalid phone\ninvalid phone\nnot found\n(no contacts)", visibility: "hidden", category: "edge" },
        { label: "update and delete", input: "add Meera 9000000001\nupdate Meera 9000000002\nupdate Meera 12\nfind Meera\ndelete Meera\ndelete Meera\ncount\n", output: "added Meera\nupdated Meera\ninvalid phone\nMeera 9000000002\ndeleted Meera\nnot found\n0", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "isValidPhone: size 10 and every char passes isdigit.",
        "add: insert(...).second tells you whether it was new.",
        "update/erase: find first; return false if missing.",
        "In main, check isValidPhone before calling add/update so invalid phones are reported first.",
      ],
      solution: r`#include <iostream>
#include <map>
#include <optional>
#include <string>
#include <cctype>
using namespace std;

bool isValidPhone(const string& p) {
    if (p.size() != 10) return false;
    for (char c : p)
        if (!isdigit(static_cast<unsigned char>(c))) return false;
    return true;
}

class ContactBook {
    map<string, string> contacts;
public:
    bool add(const string& name, const string& phone) { return contacts.insert({name, phone}).second; }
    bool update(const string& name, const string& phone) {
        auto it = contacts.find(name);
        if (it == contacts.end()) return false;
        it->second = phone;
        return true;
    }
    bool erase(const string& name) { return contacts.erase(name) > 0; }
    optional<string> find(const string& name) const {
        auto it = contacts.find(name);
        if (it == contacts.end()) return nullopt;
        return it->second;
    }
    const map<string, string>& all() const { return contacts; }
    size_t size() const { return contacts.size(); }
};

int main() {
    ContactBook book;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "add" || cmd == "update") {
            string name, phone;
            cin >> name >> phone;
            if (!isValidPhone(phone)) cout << "invalid phone" << endl;
            else if (cmd == "add") cout << (book.add(name, phone) ? "added " + name : name + " already exists") << endl;
            else cout << (book.update(name, phone) ? "updated " + name : string("not found")) << endl;
        } else if (cmd == "delete") {
            string name;
            cin >> name;
            cout << (book.erase(name) ? "deleted " + name : string("not found")) << endl;
        } else if (cmd == "find") {
            string name;
            cin >> name;
            if (auto p = book.find(name)) cout << name << " " << *p << endl;
            else cout << "not found" << endl;
        } else if (cmd == "list") {
            if (book.all().empty()) cout << "(no contacts)" << endl;
            for (const auto& [name, phone] : book.all()) cout << name << " " << phone << endl;
        } else if (cmd == "count") {
            cout << book.size() << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "The class enforces uniqueness; main enforces the phone format and turns results into messages. Each rule lives in exactly one place.",
    },
    practice: practice(
      {
        title: "Search by prefix",
        prompt: `Commands: \`add NAME PHONE\` (no validation; duplicates ignored) and \`search PREFIX\` — print the names starting with PREFIX, **ignoring case**, sorted case-insensitively (ties by original spelling), space-separated, or \`no matches\`.`,
        starterCode: starter("Lowercase both sides to compare; sort the matches case-insensitively", "map<string, string> contacts;\nstring cmd;", ["iostream", "map", "string", "vector", "algorithm", "cctype"]),
        tests: [
          T("sample", "add Ravi 1\nadd rahul 2\nadd Asha 3\nsearch ra\n", "rahul Ravi", "sample"),
          T("none", "add Asha 1\nsearch z\n", "no matches", "visible", "edge"),
          T("empty prefix", "add b 1\nadd A 2\nsearch \"\"\n", "no matches", "hidden", "edge"),
          T("case", "add ZOE 1\nadd zoey 2\nsearch ZO\n", "ZOE zoey", "hidden"),
        ],
        compare: "lines",
        hints: [
          "Write lower(s) using tolower on each character.",
          "A name matches if lower(name) starts with lower(prefix): rfind(prefix, 0) == 0.",
          "Sort matches with a comparator on (lower(a), a).",
          "Join with spaces.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>
using namespace std;

string lower(string s) {
    for (char& c : s) c = static_cast<char>(tolower(static_cast<unsigned char>(c)));
    return s;
}

int main() {
    map<string, string> contacts;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "add") {
            string name, phone;
            cin >> name >> phone;
            contacts.insert({name, phone});
        } else if (cmd == "search") {
            string prefix;
            cin >> prefix;
            string lp = lower(prefix);
            vector<string> found;
            for (const auto& [name, phone] : contacts)
                if (lower(name).rfind(lp, 0) == 0) found.push_back(name);
            sort(found.begin(), found.end(), [](const string& a, const string& b) {
                string la = lower(a), lb = lower(b);
                return la != lb ? la < lb : a < b;
            });
            if (found.empty()) cout << "no matches";
            for (size_t i = 0; i < found.size(); i++) cout << (i ? " " : "") << found[i];
            cout << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "Comparing lowercase copies gives case-insensitive matching while the original spelling is still displayed. (The literal `\"\"` in the test is a two-character word — no name starts with a quote.)",
      },
      {
        title: "Undo",
        prompt: `Commands: \`add NAME PHONE\` (\`added NAME\` / \`exists\`), \`delete NAME\` (\`deleted NAME\` / \`not found\`), \`undo\` (reverse the most recent **successful** add or delete: print \`undid add NAME\` or \`undid delete NAME\`, or \`nothing to undo\`), \`list\` (sorted \`NAME PHONE\` lines, or \`(empty)\`).`,
        starterCode: starter("Push each successful action (with what's needed to reverse it) onto a stack", "map<string, string> book;\nstring cmd;", ["iostream", "map", "stack", "string", "tuple"]),
        tests: [
          T("sample", "add Asha 1\nadd Ravi 2\ndelete Asha\nlist\nundo\nlist\nundo\nlist\n", "added Asha\nadded Ravi\ndeleted Asha\nRavi 2\nundid delete Asha\nAsha 1\nRavi 2\nundid add Ravi\nAsha 1", "sample"),
          T("nothing", "undo\ndelete X\nundo\n", "nothing to undo\nnot found\nnothing to undo", "visible", "edge"),
          T("failed ops aren't undone", "add A 1\nadd A 2\nundo\nlist\n", "added A\nexists\nundid add A\n(empty)", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Store (kind, name, phone) for each successful action.",
          "Undo of add: erase the name. Undo of delete: re-insert the saved phone.",
          "Failed actions don't push anything.",
          "Pop the stack after undoing.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <stack>
#include <string>
#include <tuple>
using namespace std;

int main() {
    map<string, string> book;
    stack<tuple<string, string, string>> history;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "add") {
            string name, phone;
            cin >> name >> phone;
            if (book.insert({name, phone}).second) {
                history.push({"add", name, phone});
                cout << "added " << name << endl;
            } else {
                cout << "exists" << endl;
            }
        } else if (cmd == "delete") {
            string name;
            cin >> name;
            auto it = book.find(name);
            if (it == book.end()) {
                cout << "not found" << endl;
            } else {
                history.push({"delete", name, it->second});
                book.erase(it);
                cout << "deleted " << name << endl;
            }
        } else if (cmd == "undo") {
            if (history.empty()) {
                cout << "nothing to undo" << endl;
                continue;
            }
            auto [kind, name, phone] = history.top();
            history.pop();
            if (kind == "add") book.erase(name);
            else book[name] = phone;
            cout << "undid " << kind << " " << name << endl;
        } else if (cmd == "list") {
            if (book.empty()) cout << "(empty)" << endl;
            for (const auto& [name, phone] : book) cout << name << " " << phone << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "Each history entry stores exactly what's needed to reverse it — for a delete, the phone number that would otherwise be lost. This is the command pattern behind every editor's undo.",
      },
    ),
    explainAgain: `The class is the filing cabinet with rules on the door: no two folders with the same name, phone numbers must look right. main is the receptionist who reads requests, asks the cabinet, and tells the visitor what happened.`,
    summary: [
      "Keep data and rules in a class; keep I/O in main.",
      "Validate in one helper; use find, not [], to look things up.",
      "An undo stack stores enough information to reverse each successful action.",
    ],
  },

  {
    id: "project-expense-tracker",
    moduleId: "projects",
    after: "project-contact-manager",
    title: "Project: File-based expense tracker",
    minutes: 40,
    concepts: ["CSV parsing", "money as integers", "load / save", "reports", "error recovery"],
    goals: [
      "Load records from a CSV file, skipping bad lines with a report",
      "Store money as whole paise to avoid floating-point errors",
      "Answer questions and save the data back in the same format",
    ],
    intro: `Most real programs load data, change it and save it. On your computer you'd use \`std::ifstream\`/\`std::ofstream\`; CodeMentor's sandbox has no files, so the "file" arrives on standard input and \`save\` prints it. The parsing, validation and saving logic is exactly what you'd write for a real file.`,
    sections: [
      {
        title: "The file format",
        body: `\`\`\`
FILE 3
2026-01-05,food,120.50
2026-01-09,travel,40
2026-02-01,food,abc
\`\`\`

A header with the number of lines, then \`date,category,amount\`. On a real machine:

\`\`\`cpp
std::ifstream in("expenses.csv");
std::string line;
while (std::getline(in, line)) { /* parse */ }
\`\`\``,
      },
      {
        title: "Money is not a double",
        body: `0.1 + 0.2 isn't exactly 0.3 in floating point. Store amounts as **whole paise** (\`long long\`): "120.50" → 12050. Parse the text yourself: digits, optionally a dot and one or two more digits. Print with \`p / 100\`, a dot and \`p % 100\` padded to two digits.`,
      },
      {
        title: "Robust loading",
        body: `Real files contain mistakes. Don't crash and don't silently ignore them: skip the bad line and say which one (\`skipped line 3\`), then carry on. Users can fix line 3; they can't fix "something went wrong".`,
      },
    ],
    mistakes: [
      { title: "Using double for money", body: "Rounding errors accumulate; totals end up off by a paisa. Use integers." },
      { title: "Stopping at the first bad line", body: "Report it and keep loading the rest." },
      { title: "Saving in a different format", body: "Whatever you save must load again. Test the round trip." },
    ],
    example: {
      title: "Parsing money safely",
      intro: "Text to paise and back, with validation.",
      code: r`#include <iostream>
#include <iomanip>
#include <optional>
#include <sstream>
#include <string>
using namespace std;

optional<long long> parseMoney(const string& s) {
    size_t dot = s.find('.');
    string whole = s.substr(0, dot), frac = dot == string::npos ? "" : s.substr(dot + 1);
    if (whole.empty() || whole.size() > 12 || frac.size() > 2) return nullopt;
    for (char c : whole + frac) if (c < '0' || c > '9') return nullopt;
    while (frac.size() < 2) frac += '0';
    return stoll(whole) * 100 + stoll(frac);
}

string formatMoney(long long p) {
    ostringstream out;
    out << p / 100 << "." << setw(2) << setfill('0') << p % 100;
    return out.str();
}

int main() {
    for (string s : {"120.50", "40", "0.5", "abc", "1.234"}) {
        auto p = parseMoney(s);
        cout << s << " -> " << (p ? formatMoney(*p) : "invalid") << endl;
    }
    return 0;
}`,
      output: "120.50 -> 120.50\n40 -> 40.00\n0.5 -> 0.50\nabc -> invalid\n1.234 -> invalid\n",
      notes: [
        { line: 11, text: "At most two decimal places; a whole part is required." },
        { line: 13, text: "\"5\" after the dot means 50 paise, so pad on the right." },
        { line: 19, text: "setw(2) + setfill('0') prints 5 paise as \"05\"." },
      ],
    },
    quickCheck: {
      prompt: "Why store ₹120.50 as 12050 instead of 120.5?",
      options: [
        { id: "a", text: "Integers add exactly; doubles can't represent most decimal fractions exactly", feedback: "Right — totals of many doubles drift." },
        { id: "b", text: "Integers use less memory", feedback: "long long and double are both 8 bytes." },
        { id: "c", text: "Doubles can't be printed with 2 decimals", feedback: "They can; they just aren't exact." },
      ],
      correct: "a",
      explanation: "Money needs exact arithmetic, so use the smallest unit as an integer.",
    },
    exercise: {
      title: "Build the expense tracker",
      prompt: `Input starts with \`FILE n\` and n CSV lines \`YYYY-MM-DD,category,amount\`. Load them, printing \`skipped line K\` (1-based) for any line without exactly three fields, a date that isn't 10 characters, or an invalid amount. Then process commands until the input ends: \`add DATE CATEGORY AMOUNT\` (\`added\` or \`invalid amount\`), \`total CATEGORY\` (\`CATEGORY: X.XX\`), \`month YYYY-MM\` (\`YYYY-MM: X.XX\`), \`save\` (print \`FILE n\` and every expense as CSV, sorted by date — stable for equal dates — with amounts formatted to 2 decimals).`,
      starterCode: r`#include <algorithm>
#include <iomanip>
#include <iostream>
#include <optional>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

struct Expense {
    string date, category;
    long long paise;
};

// optional<long long> parseMoney(const string& s)
// string formatMoney(long long p)
// optional<Expense> parseLine(const string& line)

int main() {
    string tag;
    int n;
    cin >> tag >> n;
    cin.ignore();
    vector<Expense> expenses;
    // load n lines, then process commands

    return 0;
}`,
      tests: [
        { label: "sample", input: "FILE 3\n2026-01-05,food,120.50\n2026-01-09,travel,40\n2026-02-01,food,abc\ntotal food\nadd 2026-01-02 food 30.25\ntotal food\nmonth 2026-01\nsave\n", output: "skipped line 3\nfood: 120.50\nadded\nfood: 150.75\n2026-01: 190.75\nFILE 3\n2026-01-02,food,30.25\n2026-01-05,food,120.50\n2026-01-09,travel,40.00", visibility: "sample", category: "normal" },
        { label: "bad lines", input: "FILE 3\n2026-03-01,books\n26-3-1,books,5\n2026-03-02,books,5.5\ntotal books\ntotal toys\n", output: "skipped line 1\nskipped line 2\nbooks: 5.50\ntoys: 0.00", visibility: "hidden", category: "edge" },
        { label: "empty file", input: "FILE 0\nadd 2026-05-05 rent 1.2.3\nadd 2026-05-05 rent 15000\nmonth 2026-05\nsave\n", output: "invalid amount\nadded\n2026-05: 15000.00\nFILE 1\n2026-05-05,rent,15000.00", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "parseLine: split on ',' with getline(ss, field, ','); require exactly 3 fields.",
        "Reuse parseMoney/formatMoney from the example.",
        "month: a date belongs to a month when date.substr(0, 7) == month.",
        "save: stable_sort by date, then print FILE and each line.",
      ],
      solution: r`#include <algorithm>
#include <iomanip>
#include <iostream>
#include <optional>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

struct Expense {
    string date, category;
    long long paise;
};

optional<long long> parseMoney(const string& s) {
    size_t dot = s.find('.');
    string whole = s.substr(0, dot), frac = dot == string::npos ? "" : s.substr(dot + 1);
    if (whole.empty() || whole.size() > 12 || frac.size() > 2) return nullopt;
    for (char c : whole + frac)
        if (c < '0' || c > '9') return nullopt;
    while (frac.size() < 2) frac += '0';
    return stoll(whole) * 100 + stoll(frac);
}

string formatMoney(long long p) {
    ostringstream out;
    out << p / 100 << "." << setw(2) << setfill('0') << p % 100;
    return out.str();
}

optional<Expense> parseLine(const string& line) {
    vector<string> fields;
    stringstream ss(line);
    string field;
    while (getline(ss, field, ',')) fields.push_back(field);
    if (fields.size() != 3 || fields[0].size() != 10) return nullopt;
    auto money = parseMoney(fields[2]);
    if (!money) return nullopt;
    return Expense{fields[0], fields[1], *money};
}

int main() {
    string tag;
    int n;
    cin >> tag >> n;
    cin.ignore();
    vector<Expense> expenses;
    for (int i = 1; i <= n; i++) {
        string line;
        getline(cin, line);
        if (auto e = parseLine(line)) expenses.push_back(*e);
        else cout << "skipped line " << i << endl;
    }
    string cmd;
    while (cin >> cmd) {
        if (cmd == "add") {
            string date, category, amount;
            cin >> date >> category >> amount;
            auto money = parseMoney(amount);
            if (!money || date.size() != 10) {
                cout << "invalid amount" << endl;
                continue;
            }
            expenses.push_back({date, category, *money});
            cout << "added" << endl;
        } else if (cmd == "total") {
            string category;
            cin >> category;
            long long sum = 0;
            for (const auto& e : expenses) if (e.category == category) sum += e.paise;
            cout << category << ": " << formatMoney(sum) << endl;
        } else if (cmd == "month") {
            string month;
            cin >> month;
            long long sum = 0;
            for (const auto& e : expenses) if (e.date.substr(0, 7) == month) sum += e.paise;
            cout << month << ": " << formatMoney(sum) << endl;
        } else if (cmd == "save") {
            stable_sort(expenses.begin(), expenses.end(),
                        [](const Expense& a, const Expense& b) { return a.date < b.date; });
            cout << "FILE " << expenses.size() << endl;
            for (const auto& e : expenses)
                cout << e.date << "," << e.category << "," << formatMoney(e.paise) << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "ISO dates (YYYY-MM-DD) sort correctly as plain strings, and their first 7 characters are the month. Saved output loads back without changes — the round-trip test every file format should pass.",
    },
    practice: practice(
      {
        title: "Monthly report",
        prompt: `Read \`FILE n\` and n valid lines \`YYYY-MM-DD,category,amount\` (amounts in whole rupees). For each month in order, print \`MONTH total TOTAL top CATEGORY\`, where the top category has the largest total that month (alphabetically first on ties).`,
        starterCode: starter("map<month, map<category, long long>>", "string tag;\nint n;\ncin >> tag >> n;\ncin.ignore();", ["iostream", "map", "sstream", "string"]),
        tests: [
          T("sample", "FILE 4\n2026-01-05,food,120\n2026-01-09,travel,300\n2026-01-20,food,250\n2026-02-01,books,90\n", "2026-01 total 670 top food\n2026-02 total 90 top books", "sample"),
          T("tie", "FILE 2\n2026-03-01,b,50\n2026-03-02,a,50\n", "2026-03 total 100 top a", "visible", "edge"),
          T("empty", "FILE 0\n", "", "hidden", "edge"),
        ],
        compare: "lines",
        hints: [
          "Split each line on commas.",
          "byMonth[date.substr(0, 7)][category] += amount.",
          "For each month: sum all categories and find the max (strict > keeps the alphabetically first on ties).",
          "map iterates months and categories in sorted order.",
        ],
        solution: r`#include <iostream>
#include <map>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string tag;
    int n;
    cin >> tag >> n;
    cin.ignore();
    map<string, map<string, long long>> byMonth;
    for (int i = 0; i < n; i++) {
        string line, date, category, amount;
        getline(cin, line);
        stringstream ss(line);
        getline(ss, date, ',');
        getline(ss, category, ',');
        getline(ss, amount, ',');
        byMonth[date.substr(0, 7)][category] += stoll(amount);
    }
    for (const auto& [month, cats] : byMonth) {
        long long total = 0, best = -1;
        string top;
        for (const auto& [cat, sum] : cats) {
            total += sum;
            if (sum > best) { best = sum; top = cat; }
        }
        cout << month << " total " << total << " top " << top << endl;
    }
    return 0;
}`,
        solutionNotes: "Nested maps group the data two ways at once and keep both levels sorted, which makes the report a pair of loops.",
      },
      {
        title: "Budgets and alerts",
        prompt: `Commands: \`budget CATEGORY AMOUNT\` (set or change a monthly budget in whole rupees; print \`budget set\`), \`add DATE CATEGORY AMOUNT\` (record it, then print \`ok\`, or — if that month's total for the category now exceeds its budget — \`warning: CATEGORY over budget by X in MONTH\`), \`left CATEGORY MONTH\` (budget minus spending, or \`no budget\`).`,
        starterCode: starter("map budgets; map<(category, month), spent>", "map<string, long long> budgets;\nmap<pair<string, string>, long long> spent;\nstring cmd;", ["iostream", "map", "string", "utility"]),
        tests: [
          T("sample", "budget food 500\nadd 2026-01-03 food 300\nadd 2026-01-10 food 250\nleft food 2026-01\nadd 2026-02-01 food 100\n", "budget set\nok\nwarning: food over budget by 50 in 2026-01\n-50\nok", "sample"),
          T("no budget", "add 2026-01-01 toys 999\nleft toys 2026-01\n", "ok\nno budget", "visible", "edge"),
          T("exactly the budget", "budget rent 1000\nadd 2026-04-01 rent 1000\nleft rent 2026-04\n", "budget set\nok\n0", "hidden", "boundary"),
          T("budget raised", "budget fun 100\nadd 2026-06-01 fun 150\nbudget fun 200\nadd 2026-06-02 fun 10\n", "budget set\nwarning: fun over budget by 50 in 2026-06\nbudget set\nok", "hidden"),
        ],
        compare: "lines",
        hints: [
          "The month is date.substr(0, 7).",
          "spent[{category, month}] += amount.",
          "Warn only if a budget exists and spent > budget.",
          "left: budget − spent (which may be negative).",
        ],
        solution: r`#include <iostream>
#include <map>
#include <string>
#include <utility>
using namespace std;

int main() {
    map<string, long long> budgets;
    map<pair<string, string>, long long> spent;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "budget") {
            string category;
            long long amount;
            cin >> category >> amount;
            budgets[category] = amount;
            cout << "budget set" << endl;
        } else if (cmd == "add") {
            string date, category;
            long long amount;
            cin >> date >> category >> amount;
            string month = date.substr(0, 7);
            long long& total = spent[{category, month}];
            total += amount;
            auto it = budgets.find(category);
            if (it != budgets.end() && total > it->second)
                cout << "warning: " << category << " over budget by " << total - it->second << " in " << month << endl;
            else
                cout << "ok" << endl;
        } else if (cmd == "left") {
            string category, month;
            cin >> category >> month;
            auto it = budgets.find(category);
            if (it == budgets.end()) cout << "no budget" << endl;
            else cout << it->second - spent[{category, month}] << endl;
        }
    }
    return 0;
}`,
        solutionNotes: "A pair key (category, month) keeps every month's spending separate, so a new month starts fresh against the same budget.",
      },
    ),
    explainAgain: `The tracker is a notebook you load from a drawer (the file), write in during the day (commands), and put back (save). Smudged lines are noted and skipped rather than throwing the whole notebook away, and money is counted in paise so the sums are always exact.`,
    summary: [
      "Load line by line; skip and report bad lines instead of crashing.",
      "Store money as integer paise; format only when printing.",
      "Save in exactly the format you load, and test the round trip.",
    ],
  },
];
