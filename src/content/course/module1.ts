import type { CourseLesson } from "./types";

const r = String.raw;

/** Module 1 — Programming foundations. Written for students who have never programmed. */
export const MODULE1_LESSONS: CourseLesson[] = [
  {
    id: "what-is-programming",
    moduleId: "foundations",
    title: "What is programming?",
    minutes: 10,
    goals: [
      "What a program is, in everyday words",
      "Why a computer needs exact, step-by-step instructions",
      "What C++ is and why we write programs in a language like it",
    ],
    intro: `A **program** is a list of instructions that a computer follows. That's it. Every app you have used — a calculator, a game, a messaging app — is a (very long) list of instructions written by people.

**Programming** means writing those instructions. In this course you'll write them in **C++**, a language used everywhere from games to operating systems, and the language most engineering colleges start with.`,
    sections: [
      {
        title: "Computers follow instructions exactly",
        body: `Imagine telling a friend how to make tea. You might say "make tea" and they'll figure out the rest. A computer can't figure out anything. It does **exactly** what the instructions say, **in the order they are written** — no more, no less.

That sounds limiting, but it's also why computers are reliable: give the same program the same input and it does the same thing every time.

So a good program is:

- **Precise** — every step is spelled out.
- **In the right order** — step 2 can depend on step 1 having happened.
- **Unambiguous** — there is only one way to read each instruction.`,
      },
      {
        title: "Why do we need a programming language?",
        body: `The computer's processor only understands **machine code** — long patterns of numbers. Writing that by hand is slow and error-prone.

A programming language like C++ sits in between: it is readable for humans, and a tool called a **compiler** translates it into machine code for the computer.

\`\`\`cpp
cout << "Boil water" << endl;
\`\`\`

Even if you've never seen C++, you can probably guess that this line **prints** the words *Boil water* on the screen. You'll learn exactly how it works in the next few lessons.`,
      },
    ],
    mistakes: [
      { title: "\"The computer knows what I meant\"", body: "It doesn't. If you write the steps in the wrong order, the computer happily does them in the wrong order. Most early bugs are instructions that say something slightly different from what you intended." },
      { title: "\"Programming is mostly maths\"", body: "Some programs use maths, but programming is mostly about **breaking a task into small, clear steps**. If you can explain how to do something step by step, you can learn to program it." },
    ],
    example: {
      title: "A program is a list of steps",
      intro: "This program prints three instructions for making tea. The computer runs the lines from top to bottom, so they appear in exactly this order.",
      code: r`#include <iostream>
using namespace std;

int main() {
    cout << "Boil water" << endl;
    cout << "Add tea leaves" << endl;
    cout << "Pour into a cup" << endl;
    return 0;
}`,
      output: "Boil water\nAdd tea leaves\nPour into a cup\n",
      notes: [
        { line: 5, text: "The first instruction runs first: it prints *Boil water*." },
        { line: 6, text: "Then the next line runs, and so on, top to bottom." },
        { line: 8, text: "`return 0;` means \"the program finished normally\". You'll see it in every program." },
      ],
    },
    quickCheck: {
      prompt: "A program has the instructions *print A*, then *print B*, then *print C*. What does the computer do?",
      options: [
        { id: "a", text: "Prints A, B, C — in that order", feedback: "Right. Instructions run in the order they are written." },
        { id: "b", text: "Prints them in whatever order is fastest", feedback: "No — the computer never reorders your instructions. Order is something you control." },
        { id: "c", text: "Prints only C, because it is the last instruction", feedback: "Every instruction runs, not just the last one." },
      ],
      correct: "a",
      explanation: "A computer follows instructions one after another, top to bottom, unless you tell it otherwise (you'll learn how later with conditions and loops).",
    },
    exercise: {
      title: "Put the steps in order",
      prompt: `The program below prints the tea steps in the **wrong order**. Rearrange the lines so it prints:

\`\`\`
Boil water
Add tea leaves
Pour into a cup
\`\`\`

Then press **Run** to see the output, and **Check** to test it.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    cout << "Pour into a cup" << endl;
    cout << "Boil water" << endl;
    cout << "Add tea leaves" << endl;
    return 0;
}`,
      tests: [
        { label: "Prints the steps in order", input: "", output: "Boil water\nAdd tea leaves\nPour into a cup", visibility: "sample", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Which step must happen first when you make tea in real life?",
        "The computer runs the `cout` lines from top to bottom. The order of the lines is the order of the output.",
        "Look at the three `cout` lines inside `main()` — only their order needs to change.",
        "Move the `\"Boil water\"` line to the top, then `\"Add tea leaves\"`, then `\"Pour into a cup\"`. Keep `return 0;` last.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    cout << "Boil water" << endl;
    cout << "Add tea leaves" << endl;
    cout << "Pour into a cup" << endl;
    return 0;
}`,
      solutionNotes: "Nothing about the lines changes — only their order. The computer prints them in the order they appear.",
    },
    explainAgain: `Think of a program as a recipe card for a very literal cook. The cook reads one line, does exactly that, then reads the next line. If the card says "pour into a cup" before "boil water", that's what the cook does — even though it makes no sense.

Programming is writing that card so carefully that a literal cook still ends up with the right result.`,
    summary: [
      "A program is a list of instructions; programming is writing them.",
      "The computer follows instructions exactly, in order.",
      "C++ is a language people can read; a compiler translates it for the computer.",
    ],
  },

  {
    id: "how-programs-work",
    moduleId: "foundations",
    title: "How programs work",
    minutes: 12,
    goals: [
      "The journey from source code to a running program",
      "What a compiler does — and what a compile error is",
      "The input → process → output pattern",
    ],
    intro: `When you press **Run** in CodeMentor, three things happen: your code is **compiled**, the result is **run**, and you see its **output**. Knowing these steps helps you understand error messages — which are the computer's way of telling you which step went wrong.`,
    sections: [
      {
        title: "Source code → compiler → program",
        body: `1. **Source code** — the C++ you type in the editor.
2. **Compiling** — the compiler reads your whole program, checks that it follows C++'s rules (its *grammar*), and translates it into a program the computer can run.
3. **Running** — the computer executes that translated program, one instruction at a time.

If the compiler finds something that breaks the rules — a missing \`;\`, a misspelled word — it **stops** and shows a **compile error**. Nothing runs until the code compiles.`,
      },
      {
        title: "Three kinds of problems",
        body: `| Problem | When | Example |
| --- | --- | --- |
| Compile error | before running | forgot a \`;\` |
| Runtime error | while running | dividing by zero |
| Wrong output | after running | printed 5 instead of 6 |

A compile error is actually the friendliest kind: the compiler tells you the **line number** and what it expected. Read the *first* error first — later errors are often caused by the first one.`,
      },
      {
        title: "Input → process → output",
        body: `Most programs follow the same pattern:

- **Input** — get some data (a number the user types, for example).
- **Process** — do something with it (add, compare, repeat…).
- **Output** — show the result.

A calculator reads two numbers (input), adds them (process) and shows the sum (output). You'll write exactly that in a few lessons.`,
      },
    ],
    mistakes: [
      { title: "Fixing the last error message first", body: "One missing `;` can cause several error messages below it. Always fix the **first** error, then run again." },
      { title: "\"It compiled, so it's correct\"", body: "Compiling only means the grammar is right. The program can still print the wrong thing. That's why exercises are checked with **test cases**." },
    ],
    example: {
      title: "Input, process, output",
      intro: "This program does a tiny calculation. There's no input yet — the numbers are written into the program — but you can see the *process* and the *output* steps.",
      code: r`#include <iostream>
using namespace std;

int main() {
    cout << "2 + 3 = " << 2 + 3 << endl;
    return 0;
}`,
      output: "2 + 3 = 5\n",
      notes: [
        { line: 5, text: "Text inside quotes is printed exactly as written. `2 + 3` (without quotes) is **calculated**, so it prints 5." },
      ],
    },
    quickCheck: {
      prompt: "Your program has a missing semicolon on line 5. When is that mistake reported?",
      code: r`cout << "Hello" << endl
return 0;`,
      options: [
        { id: "a", text: "When the program runs and reaches line 5", feedback: "A program with a syntax error never runs — it can't be compiled first." },
        { id: "b", text: "When it is compiled, before anything runs", feedback: "Right: the compiler checks the whole file first and stops with an error." },
        { id: "c", text: "Never — the compiler adds the semicolon", feedback: "The compiler reports mistakes; it doesn't guess what you meant." },
      ],
      correct: "b",
      explanation: "Source code is compiled into a program before it runs. Syntax errors stop compilation, so nothing runs at all.",
    },
    exercise: {
      title: "Fix the compile error",
      prompt: `This program should print:

\`\`\`
Programs follow instructions
\`\`\`

…but it doesn't compile. Press **Run**, read the error message (look for the line number), fix the problem, and press **Check**.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    cout << "Programs follow instructions" << endl
    return 0;
}`,
      tests: [
        { label: "Prints the sentence", input: "", output: "Programs follow instructions", visibility: "sample", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "What does the compiler say when you press Run? Which line does it point to?",
        "In C++ every statement (instruction) ends with a semicolon `;`.",
        "Look at the end of the `cout` line — compare it with the `return 0;` line below it.",
        "Add a `;` at the end of the `cout` line, after `endl`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    cout << "Programs follow instructions" << endl;
    return 0;
}`,
      solutionNotes: "The `cout` statement was missing its `;`. The compiler usually reports this on the *next* line (\"expected ';' before 'return'\"), because that's where it noticed something was wrong.",
    },
    explainAgain: `Think of the compiler as a strict proof-reader who checks your whole letter before it is posted. If there's a grammar mistake, the letter isn't sent at all — you get it back with a note saying where the problem is.

Once the letter passes the proof-reader, it is delivered (the program runs). But the proof-reader only checks grammar, not meaning: a perfectly written letter can still say the wrong thing.`,
    summary: [
      "Run = compile, then execute. Compile errors stop the program from running at all.",
      "Read the first error message first; it gives the line number.",
      "Programs usually take input, process it, and produce output.",
    ],
  },

  {
    id: "program-structure",
    moduleId: "foundations",
    title: "Structure of a C++ program",
    minutes: 12,
    goals: [
      "The parts every C++ program has",
      "What `#include`, `using namespace std;` and `int main()` are for",
      "How braces, semicolons and comments work",
    ],
    intro: `Almost every program in this course starts with the same few lines. They can look mysterious at first, so let's take them apart one by one. You don't need to memorise the details — just know what each part is for.`,
    sections: [
      {
        title: "The skeleton",
        body: `\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    // your instructions go here
    return 0;
}
\`\`\`

- \`#include <iostream>\` — brings in the tools for **input and output** (\`cin\` and \`cout\`).
- \`using namespace std;\` — lets you write \`cout\` instead of the full name \`std::cout\`.
- \`int main() { … }\` — the **main function**. When the program starts, the computer runs the instructions inside \`main\`'s braces, from top to bottom.
- \`return 0;\` — ends \`main\` and tells the system the program finished successfully.`,
      },
      {
        title: "Braces, semicolons and comments",
        body: `- **Braces** \`{ }\` group instructions together. Everything between \`main\`'s \`{\` and \`}\` belongs to \`main\`.
- **Semicolons** \`;\` end each instruction (called a *statement*), like a full stop ends a sentence.
- **Comments** start with \`//\`. The compiler ignores them; they are notes for humans.

\`\`\`cpp
cout << "Hi" << endl;   // this part is a comment
\`\`\`

Indentation (the spaces at the start of lines) doesn't change what the program does, but it makes the structure easy to see. Keep code inside braces indented.`,
      },
    ],
    mistakes: [
      { title: "Writing instructions outside main", body: "Statements like `cout << …;` must be **inside** the braces of `main()`. Outside it, the compiler doesn't know when to run them and reports an error." },
      { title: "Missing a closing brace", body: "Every `{` needs a matching `}`. If you see an error at the very end of the file (\"expected '}' at end of input\"), count your braces." },
    ],
    example: {
      title: "A complete program, part by part",
      intro: "Comments explain each part. The comments don't change what the program prints.",
      code: r`#include <iostream>      // tools for input and output
using namespace std;     // so we can write cout instead of std::cout

int main() {             // the program starts here
    // Two instructions, run top to bottom:
    cout << "Line one" << endl;
    cout << "Line two" << endl;
    return 0;            // finished successfully
}`,
      output: "Line one\nLine two\n",
      notes: [
        { line: 1, text: "Without this line, `cout` wouldn't exist and the program wouldn't compile." },
        { line: 4, text: "`main` is where every C++ program begins." },
        { line: 9, text: "The closing brace ends `main`." },
      ],
    },
    quickCheck: {
      prompt: "Where must `cout << \"Hello\" << endl;` go for it to run?",
      options: [
        { id: "a", text: "Above `#include <iostream>`", feedback: "`cout` doesn't exist yet at that point — the include line brings it in." },
        { id: "b", text: "Inside the braces of `int main()`", feedback: "Yes. Instructions inside main run when the program starts." },
        { id: "c", text: "After the closing brace of `main`", feedback: "Outside main, the compiler doesn't accept statements like this." },
      ],
      correct: "b",
      explanation: "The program starts at main and runs the statements between its braces.",
    },
    exercise: {
      title: "Write a whole program",
      prompt: `The editor only has comments. Write a complete C++ program that prints exactly:

\`\`\`
My first full program
\`\`\`

You'll need all the parts: the include line, \`using namespace std;\`, \`int main()\` with braces, a \`cout\` line and \`return 0;\`.`,
      starterCode: r`// 1. include the input/output library
// 2. using namespace std;
// 3. int main() { ... }
//    - print: My first full program
//    - return 0;
`,
      tests: [
        { label: "Prints the sentence", input: "", output: "My first full program", visibility: "sample", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Which lines did every example program in this lesson start with?",
        "A program needs `#include <iostream>`, `using namespace std;` and an `int main()` function with braces.",
        "Your `cout` statement goes inside the braces of `main`, before `return 0;`.",
        "Copy the skeleton from the lesson, then put `cout << \"My first full program\" << endl;` inside main.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    cout << "My first full program" << endl;
    return 0;
}`,
      solutionNotes: "The four parts — include, namespace line, main with braces, and a statement inside — make a complete program. Every later exercise builds on this skeleton.",
    },
    explainAgain: `Think of a C++ program like a letter:

- \`#include <iostream>\` is attaching the tools you'll need (like enclosing a stamp).
- \`int main() { … }\` is the body of the letter — the part that's actually read.
- Each \`;\` ends a sentence.
- \`return 0;\` is signing off: "done, all fine".

The reader (computer) starts at the top of main's body and reads each sentence in order.`,
    summary: [
      "Every program has `#include`, `using namespace std;` and `int main() { … return 0; }`.",
      "Statements go inside main's braces and end with `;`.",
      "`//` starts a comment that the compiler ignores.",
    ],
  },

  {
    id: "hello-world",
    moduleId: "foundations",
    title: "Hello World and printing",
    minutes: 12,
    goals: [
      "Printing text with `cout` and `<<`",
      "Starting new lines with `endl` or `\\n`",
      "Printing several things in one statement",
    ],
    intro: `"Hello, World!" is traditionally the first program anyone writes in a new language. It's simple — but it teaches the most-used tool in this course: **printing output with \`cout\`**.`,
    sections: [
      {
        title: "cout and <<",
        body: `\`cout\` (say "see-out") is the screen. The \`<<\` arrows push things **into** it:

\`\`\`cpp
cout << "Hello, World!";
\`\`\`

- Text goes inside **double quotes**: \`"like this"\`. It's printed exactly as written, spaces included.
- You can chain several \`<<\` in one statement: \`cout << "Age: " << 18;\` prints \`Age: 18\`.`,
      },
      {
        title: "New lines",
        body: `\`cout\` doesn't move to a new line on its own. Two statements without a line break print on the **same** line:

\`\`\`cpp
cout << "Hello";
cout << "World";     // prints HelloWorld
\`\`\`

To end a line, use \`endl\` or the special character \`"\\n"\`:

\`\`\`cpp
cout << "Hello" << endl;
cout << "World" << "\\n";
\`\`\`

Both work. \`"\\n"\` is a single "new line" character, written with a backslash.`,
      },
    ],
    mistakes: [
      { title: "Forgetting the quotes", body: "`cout << Hello;` makes the compiler look for something *named* Hello and fail (\"'Hello' was not declared\"). Text needs double quotes." },
      { title: "Expecting automatic new lines", body: "Each `cout` continues where the last one stopped. If your output is all on one line, add `endl` or `\"\\n\"`." },
      { title: "Extra or missing spaces", body: "Spaces inside quotes are printed exactly. `\"Name:\"` followed by `\"Riya\"` prints `Name:Riya` — add a space inside the quotes if you want one." },
    ],
    example: {
      title: "Printing several lines",
      intro: "Two ways to end a line, and chaining several pieces into one statement.",
      code: r`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "I am learning " << "C++" << "\n";
    cout << "Lessons done: " << 4 << endl;
    return 0;
}`,
      output: "Hello, World!\nI am learning C++\nLessons done: 4\n",
      notes: [
        { line: 6, text: "Three pieces chained with `<<`, then `\"\\n\"` ends the line." },
        { line: 7, text: "The number 4 isn't in quotes, so it's printed as a number." },
      ],
    },
    quickCheck: {
      prompt: "What appears on the screen?",
      code: r`cout << "A";
cout << "B" << endl;
cout << "C";`,
      options: [
        { id: "a", text: "A, B and C on three separate lines", feedback: "Only the second statement ends the line." },
        { id: "b", text: "AB on one line, then C on the next", feedback: "Right: nothing separates A and B, and endl moves C to a new line." },
        { id: "c", text: "ABC on one line", feedback: "The endl after B starts a new line before C." },
      ],
      correct: "b",
      explanation: "cout prints exactly what you give it. A new line appears only where you put endl (or \\n).",
    },
    exercise: {
      title: "Print a name card",
      prompt: `Print this card exactly — three lines, with the spaces after each colon:

\`\`\`
Name: CodeMentor
Course: C++ Basics
Status: Learning
\`\`\``,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    cout << "Name: CodeMentor" << endl;
    // print the other two lines

    return 0;
}`,
      tests: [
        { label: "Prints the card", input: "", output: "Name: CodeMentor\nCourse: C++ Basics\nStatus: Learning", visibility: "sample", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "How many lines must the output have, and how does each one end?",
        "Each line is one `cout` statement ending with `endl` (or `\"\\n\"`).",
        "Add two more `cout` lines below the first one, before `return 0;`.",
        "Copy the first line's pattern: `cout << \"Course: C++ Basics\" << endl;` then the same for Status. Check spaces and capital letters.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    cout << "Name: CodeMentor" << endl;
    cout << "Course: C++ Basics" << endl;
    cout << "Status: Learning" << endl;
    return 0;
}`,
      solutionNotes: "One `cout` per line, each ending with `endl`. The checker compares line by line, so capital letters and the space after each colon matter.",
    },
    explainAgain: `Picture \`cout\` as a conveyor belt that carries things to the screen, and \`<<\` as "put this on the belt next". The belt never jumps to a new line by itself — \`endl\` is a special item that means "start a new line now".`,
    summary: [
      "`cout << ...;` prints. Text goes in double quotes.",
      "Chain pieces with `<<`.",
      "Use `endl` or `\"\\n\"` to start a new line.",
    ],
  },

  {
    id: "input-output",
    moduleId: "variables-io",
    title: "Input and output",
    minutes: 15,
    goals: [
      "Reading numbers the user types with `cin` and `>>`",
      "Storing what you read so you can use it",
      "How input separated by spaces or new lines is read",
    ],
    intro: `So far programs always printed the same thing. Programs become useful when they react to **input**. In C++ you read input with \`cin\` (say "see-in") — the keyboard, or in CodeMentor, the **Input** box under the editor.`,
    sections: [
      {
        title: "cin and >>",
        body: `To read a value you need a place to keep it — a **variable** (the next lesson goes deeper):

\`\`\`cpp
int age;          // a box that can hold a whole number
cin >> age;       // read a number into it
cout << "You are " << age << endl;
\`\`\`

Notice the arrows point the other way: \`>>\` moves the value **from** \`cin\` **into** \`age\`.`,
      },
      {
        title: "Reading several values",
        body: `You can read more than one value in a statement:

\`\`\`cpp
int a, b;
cin >> a >> b;
\`\`\`

\`cin\` skips spaces and new lines between values, so the input \`3 4\` and the input

\`\`\`
3
4
\`\`\`

both put 3 in \`a\` and 4 in \`b\`.`,
      },
      {
        title: "Prompts and exercises",
        body: `In real programs you'd often print a prompt first ("Enter your age: "). In exercises **don't print prompts** unless asked — the checker compares your output with the expected output exactly, and an extra "Enter a number:" would make it differ.`,
      },
    ],
    mistakes: [
      { title: "Using the variable before reading into it", body: "`int a; cout << a;` prints whatever garbage was in memory. Read (or assign) first, then use." },
      { title: "Arrows the wrong way", body: "`cin << a` doesn't compile. Think of the arrows as showing where the data flows: `cin >> a` (from cin into a), `cout << a` (from a out to the screen)." },
      { title: "Printing extra text", body: "If the exercise says \"print the sum\", print only the sum. Extra words like \"The sum is\" make the check fail." },
    ],
    example: {
      title: "Read a number, use it",
      intro: "Run this with the input `7`. Try changing the input and running again.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << "You typed " << n << endl;
    cout << "Twice that is " << n * 2 << endl;
    return 0;
}`,
      input: "7\n",
      output: "You typed 7\nTwice that is 14\n",
      notes: [
        { line: 5, text: "`int n;` makes a variable that can hold a whole number." },
        { line: 6, text: "`cin >> n;` waits for a number and stores it in `n`." },
        { line: 8, text: "`n * 2` is calculated using whatever number was read." },
      ],
    },
    quickCheck: {
      prompt: "The input is `3 4`. What is printed?",
      code: r`int a, b;
cin >> a >> b;
cout << a + b;`,
      options: [
        { id: "a", text: "34", feedback: "a and b are ints, so + adds them as numbers." },
        { id: "b", text: "7", feedback: "Right: cin reads 3 into a and 4 into b, and a + b is 7." },
        { id: "c", text: "a + b", feedback: "Without quotes, a + b is an expression that gets calculated." },
      ],
      correct: "b",
      explanation: "cin >> a >> b reads two whitespace-separated numbers. a + b with ints is arithmetic, not joining text.",
    },
    exercise: {
      title: "Add two numbers",
      prompt: `Read two whole numbers and print their **sum** — just the number, nothing else.

| Input | Output |
| --- | --- |
| \`3 4\` | \`7\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    // Read two numbers, then print their sum

    return 0;
}`,
      tests: [
        { label: "3 and 4", input: "3 4\n", output: "7", visibility: "sample", category: "normal" },
        { label: "negative number", input: "10 -2\n", output: "8", visibility: "sample", category: "normal" },
        { label: "zeros", input: "0 0\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "larger numbers", input: "1000 2000\n", output: "3000", visibility: "hidden", category: "normal" },
        { label: "on separate lines", input: "5\n6\n", output: "11", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "Where will the two numbers be stored after you read them?",
        "You need two `int` variables, `cin` to read them and `cout` to print.",
        "Your code goes where the comment is, before `return 0;`.",
        "`int a, b;` then `cin >> a >> b;` then `cout << a + b;` — and no extra words in the output.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
      solutionNotes: "Declare two int variables, read both with one `cin >> a >> b;`, then print `a + b`. `cin` doesn't care whether the numbers are on one line or two.",
    },
    explainAgain: `\`cin >> x\` is like a shop counter: the program waits until someone hands over a value, then puts it in the box labelled \`x\`. \`cout << x\` is the opposite: take what's in the box and show it.

Input in CodeMentor comes from the **Input** box below the editor. The checker types the test input into your program the same way.`,
    summary: [
      "`cin >> variable;` reads a value into a variable.",
      "`cin` skips spaces and new lines between values.",
      "In exercises, print exactly what's asked — no prompts or extra words.",
    ],
  },

  {
    id: "variables",
    moduleId: "variables-io",
    title: "Variables",
    minutes: 15,
    goals: [
      "What a variable is and why programs need them",
      "Declaring, assigning and updating variables",
      "Naming rules — and why a variable must be declared before you use it",
    ],
    intro: `A **variable** is a named box that holds a value. Programs use variables to remember things: a score, a name, a running total. You've already used them with \`cin\` — now let's look at them properly.`,
    sections: [
      {
        title: "Declare, then assign",
        body: `\`\`\`cpp
int score;        // declare: make a box called score that holds whole numbers
score = 10;       // assign: put 10 in the box
int lives = 3;    // declare and assign in one line (called initialising)
\`\`\`

\`=\` in C++ means **"store the value on the right into the variable on the left"**. It is not the maths "equals".`,
      },
      {
        title: "Updating a variable",
        body: `A variable can change while the program runs — that's why it's called *variable*:

\`\`\`cpp
int score = 10;
score = score + 5;   // take the old score (10), add 5, store 15 back
cout << score;       // 15
\`\`\`

\`score = score + 5\` looks impossible as maths, but as an instruction it makes sense: compute the right side first, then store the result.

Assignment **copies** a value: after \`int a = 5; int b = a; a = 9;\`, \`b\` is still 5.`,
      },
      {
        title: "Names",
        body: `Variable names can use letters, digits and \`_\`, but can't start with a digit and can't be C++ keywords like \`int\` or \`return\`. Names are case-sensitive: \`total\` and \`Total\` are different variables.

Choose names that say what the value means — \`total\`, \`marks\`, \`age\` — not \`x1\`, \`x2\`.`,
      },
    ],
    mistakes: [
      { title: "Using a name that was never declared", body: "If you write `int a = 10; cout << b;` the compiler reports \"'b' was not declared in this scope\". It's telling you it has never seen a box called b. Check the spelling, and check that you declared the variable before this line." },
      { title: "Reading = as \"is equal to\"", body: "`a = b` copies b into a. It doesn't compare them (that's `==`, coming in Module 2), and it isn't permanent: if b changes later, a doesn't." },
      { title: "Using a variable before giving it a value", body: "`int total; total = total + 5;` starts from an unknown value. Always initialise: `int total = 0;`." },
    ],
    example: {
      title: "A variable that changes",
      intro: "Follow the value of `coins` line by line.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int coins = 5;
    cout << "Start: " << coins << endl;
    coins = coins + 3;
    cout << "After finding 3: " << coins << endl;
    coins = coins - 6;
    cout << "After spending 6: " << coins << endl;
    return 0;
}`,
      output: "Start: 5\nAfter finding 3: 8\nAfter spending 6: 2\n",
      notes: [
        { line: 5, text: "`coins` starts at 5." },
        { line: 7, text: "Right side first: 5 + 3 = 8, then 8 is stored back into `coins`." },
        { line: 9, text: "8 - 6 = 2 is stored. The old values are gone." },
      ],
    },
    quickCheck: {
      prompt: "What does this print?",
      code: r`int a = 4;
int b = a;
a = 10;
cout << b;`,
      options: [
        { id: "a", text: "4", feedback: "Right — `b = a` copied the value 4. Changing `a` later doesn't affect `b`." },
        { id: "b", text: "10", feedback: "`b` got a *copy* of a's value (4) at that moment. It isn't linked to `a` afterwards." },
        { id: "c", text: "It doesn't compile", feedback: "It compiles fine — every variable is declared before use." },
      ],
      correct: "a",
      explanation: "Assignment copies the current value. `b` keeps 4 even when `a` changes.",
    },
    exercise: {
      title: "Swap two numbers",
      prompt: `Read two whole numbers into variables \`a\` and \`b\`. **Swap** their values (so \`a\` holds what \`b\` had, and the other way round), then print:

\`\`\`
a = <value of a>
b = <value of b>
\`\`\`

| Input | Output |
| --- | --- |
| \`3 7\` | \`a = 7\` and \`b = 3\` on two lines |

Tip: you'll need a third variable to hold one value temporarily.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    // swap the values of a and b here

    cout << "a = " << a << endl;
    cout << "b = " << b << endl;
    return 0;
}`,
      tests: [
        { label: "3 and 7", input: "3 7\n", output: "a = 7\nb = 3", visibility: "sample", category: "normal" },
        { label: "same numbers", input: "5 5\n", output: "a = 5\nb = 5", visibility: "hidden", category: "edge" },
        { label: "negative and zero", input: "-4 0\n", output: "a = 0\nb = -4", visibility: "hidden", category: "normal" },
        { label: "big numbers", input: "1000000 42\n", output: "a = 42\nb = 1000000", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "If you do `a = b;` first, what happens to the value that was in `a`?",
        "Assignment overwrites. To keep a value safe while you overwrite it, copy it into another variable first.",
        "Your swap goes between the `cin` line and the first `cout` line. You need three assignments.",
        "`int temp = a;` saves a's value. Then `a = b;`. Then give b the saved value with `b = temp;`.",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    int temp = a;
    a = b;
    b = temp;

    cout << "a = " << a << endl;
    cout << "b = " << b << endl;
    return 0;
}`,
      solutionNotes: "Writing `a = b; b = a;` loses a's original value, so both end up equal. Saving it in `temp` first keeps it: temp = 3, a = 7, b = 3.",
    },
    explainAgain: `Imagine two cups, one with juice (a) and one with milk (b). You can't pour the juice into the milk cup while it's full — you need an empty third cup. Pour juice into the empty cup, milk into the juice cup, then juice from the third cup into the milk cup.

Variables work the same way: assigning to a variable throws away what was in it, so you sometimes need a temporary variable.`,
    summary: [
      "A variable is a named box: `int score = 0;`.",
      "`=` stores the right side's value into the left side; the right side is computed first.",
      "Declare a variable before using it, and give it a value before reading it.",
    ],
  },

  {
    id: "data-types",
    moduleId: "variables-io",
    title: "Data types",
    minutes: 15,
    goals: [
      "The common types: `int`, `double`, `char`, `bool` and `string`",
      "Why the type of a variable matters",
      "Why `7 / 2` is 3 for whole numbers",
    ],
    intro: `Every variable in C++ has a **type** that says what kind of value it holds. The type decides what you can store and how operations behave. Choosing the right type is one of the first decisions you make for each variable.`,
    sections: [
      {
        title: "The everyday types",
        body: `| Type | Holds | Example |
| --- | --- | --- |
| \`int\` | whole numbers | \`int marks = 87;\` |
| \`double\` | numbers with a decimal point | \`double price = 19.99;\` |
| \`char\` | a single character, in single quotes | \`char grade = 'A';\` |
| \`bool\` | \`true\` or \`false\` | \`bool passed = true;\` |
| \`string\` | text, in double quotes | \`string name = "Asha";\` |

\`string\` needs \`#include <string>\` at the top of the program.`,
      },
      {
        title: "Whole-number division",
        body: `When both numbers are \`int\`, division throws away the fractional part:

\`\`\`cpp
cout << 7 / 2;      // 3, not 3.5
cout << 7.0 / 2;    // 3.5 — one side is a double
\`\`\`

Use \`double\` whenever a value can have a fractional part: prices, averages, temperatures.

When \`cout\` prints a \`double\` with nothing after the decimal point, it leaves the point off: \`10.0\` prints as \`10\`.`,
      },
      {
        title: "Printing bool and char",
        body: `\`cout\` prints a \`bool\` as \`1\` (true) or \`0\` (false), and a \`char\` as the character itself. Single quotes are for one character (\`'A'\`), double quotes for text (\`"A"\` is a string).`,
      },
    ],
    mistakes: [
      { title: "Storing a decimal in an int", body: "`int price = 19.99;` silently keeps only 19. If a value can have decimals, use `double`." },
      { title: "Expecting 7 / 2 to be 3.5", body: "Two ints divide to an int. Make at least one side a double (`7.0 / 2`) or store values in double variables." },
      { title: "Mixing up 'A' and \"A\"", body: "`'A'` is a char (one character). `\"A\"` is a string. `char c = \"A\";` doesn't compile." },
    ],
    example: {
      title: "Different types side by side",
      intro: "Each variable is declared with the type that fits its value.",
      code: r`#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Asha";
    int marks = 87;
    double average = 7 / 2.0;
    char grade = 'A';
    bool passed = true;
    cout << name << " " << marks << " " << average << endl;
    cout << grade << " " << passed << endl;
    cout << 7 / 2 << endl;
    return 0;
}`,
      output: "Asha 87 3.5\nA 1\n3\n",
      notes: [
        { line: 8, text: "`2.0` is a double, so the division keeps the .5." },
        { line: 12, text: "`true` prints as 1." },
        { line: 13, text: "Two ints: 7 / 2 is 3." },
      ],
    },
    quickCheck: {
      prompt: "Which type should store a student's average mark, like 72.5?",
      options: [
        { id: "a", text: "int", feedback: "An int would drop the .5 and store 72." },
        { id: "b", text: "double", feedback: "Yes — double holds numbers with decimal parts." },
        { id: "c", text: "char", feedback: "A char holds one character, not a number like 72.5." },
      ],
      correct: "b",
      explanation: "Averages can have decimal parts, so they belong in a double.",
    },
    exercise: {
      title: "Price of several items",
      prompt: `Read the **price** of one item (it may have decimals, like \`19.99\`) and the **quantity** (a whole number). Print the total cost (price × quantity).

| Input | Output |
| --- | --- |
| \`2.5 4\` | \`10\` |
| \`19.99 3\` | \`59.97\` |

Choose the right type for each variable.`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    // declare price and quantity with suitable types
    // read them, then print price * quantity

    return 0;
}`,
      tests: [
        { label: "2.5 × 4", input: "2.5 4\n", output: "10", visibility: "sample", category: "normal" },
        { label: "19.99 × 3", input: "19.99 3\n", output: "59.97", visibility: "sample", category: "normal" },
        { label: "half price, one item", input: "0.5 1\n", output: "0.5", visibility: "hidden", category: "normal" },
        { label: "zero items", input: "100 0\n", output: "0", visibility: "hidden", category: "edge" },
        { label: "whole-number price", input: "7 6\n", output: "42", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "Can the price have a decimal part? Can the quantity?",
        "Use `double` for values that can have decimals and `int` for whole numbers.",
        "If you stored the price in an `int`, 2.5 became 2 — check the type of your price variable.",
        "`double price; int quantity; cin >> price >> quantity; cout << price * quantity;`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    double price;
    int quantity;
    cin >> price >> quantity;
    cout << price * quantity << endl;
    return 0;
}`,
      solutionNotes: "The price needs `double` so 2.5 isn't cut down to 2. Multiplying a double by an int gives a double; `cout` prints 10.0 as `10` and 59.97 as `59.97`.",
    },
    explainAgain: `A type is like the shape of a container. An egg tray (int) holds whole eggs only — try to put half an egg in and it won't fit, so it's dropped. A measuring jug (double) holds any amount, like 2.5 litres. A name badge (string) holds text, and a single letter tile (char) holds exactly one character.

Pick the container that matches what you want to keep.`,
    summary: [
      "`int` whole numbers, `double` decimals, `char` one character, `bool` true/false, `string` text.",
      "int / int throws away the fraction: 7 / 2 is 3.",
      "`string` needs `#include <string>`.",
    ],
  },

  {
    id: "operators",
    moduleId: "operators",
    title: "Operators",
    minutes: 15,
    goals: [
      "Arithmetic operators `+ - * / %`",
      "Which operations happen first (precedence)",
      "Shortcuts like `+=` and `++`",
    ],
    intro: `Operators are the symbols that do work on values: adding, multiplying, finding remainders. Most behave like school maths — with two important differences: integer division and the remainder operator \`%\`.`,
    sections: [
      {
        title: "Arithmetic",
        body: `| Operator | Meaning | Example | Result |
| --- | --- | --- | --- |
| \`+\` | add | \`7 + 2\` | 9 |
| \`-\` | subtract | \`7 - 2\` | 5 |
| \`*\` | multiply | \`7 * 2\` | 14 |
| \`/\` | divide | \`7 / 2\` | 3 (ints!) |
| \`%\` | remainder | \`7 % 2\` | 1 |

\`%\` (modulo) gives the **remainder** after whole-number division: 7 = 3 × 2 + **1**. It's extremely useful: \`n % 2\` tells you if n is even (0) or odd (1), and \`n % 10\` gives the last digit of n.`,
      },
      {
        title: "Order of operations",
        body: `\`*\`, \`/\` and \`%\` happen before \`+\` and \`-\`, just like in maths. Use brackets to make the order explicit:

\`\`\`cpp
cout << 2 + 3 * 4;     // 14
cout << (2 + 3) * 4;   // 20
\`\`\``,
      },
      {
        title: "Shortcuts",
        body: `\`\`\`cpp
total += 5;    // same as total = total + 5;
total -= 2;    // total = total - 2;
count++;       // count = count + 1;
count--;       // count = count - 1;
\`\`\`

You'll use \`++\` constantly once you reach loops.`,
      },
    ],
    mistakes: [
      { title: "Forgetting integer division", body: "`int avg = (a + b) / 2;` drops the .5. If you need it, use `double` and divide by `2.0`." },
      { title: "Missing brackets", body: "`a + b / 2` divides only b by 2. To average, write `(a + b) / 2`." },
      { title: "Dividing by zero", body: "Integer division or `%` by 0 crashes the program with a runtime error. Make sure the right side can't be 0." },
    ],
    example: {
      title: "Splitting a number with / and %",
      intro: "Run this with input `47`. `/ 10` drops the last digit; `% 10` keeps only the last digit.",
      code: r`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << "Tens: " << n / 10 << endl;
    cout << "Ones: " << n % 10 << endl;
    cout << "Doubled plus one: " << n * 2 + 1 << endl;
    return 0;
}`,
      input: "47\n",
      output: "Tens: 4\nOnes: 7\nDoubled plus one: 95\n",
      notes: [
        { line: 7, text: "47 / 10 = 4 (the .7 is dropped)." },
        { line: 8, text: "47 % 10 = 7, the remainder." },
        { line: 9, text: "Multiplication first: 94, then + 1." },
      ],
    },
    quickCheck: {
      prompt: "What is `17 % 5`?",
      options: [
        { id: "a", text: "3", feedback: "That's 17 / 5. `%` gives the remainder instead." },
        { id: "b", text: "2", feedback: "Yes: 17 = 3 × 5 + 2, so the remainder is 2." },
        { id: "c", text: "3.4", feedback: "With ints there are no decimals, and `%` gives a remainder." },
      ],
      correct: "b",
      explanation: "5 goes into 17 three times (15), leaving a remainder of 2.",
    },
    exercise: {
      title: "Minutes to hours",
      prompt: `Read a number of **minutes** (a whole number, 0 or more). Print how many whole hours and leftover minutes that is, in the format \`H h M min\`.

| Input | Output |
| --- | --- |
| \`125\` | \`2 h 5 min\` |
| \`59\` | \`0 h 59 min\` |`,
      starterCode: r`#include <iostream>
using namespace std;

int main() {
    int minutes;
    cin >> minutes;
    // work out hours and leftover minutes, then print them

    return 0;
}`,
      tests: [
        { label: "125 minutes", input: "125\n", output: "2 h 5 min", visibility: "sample", category: "normal" },
        { label: "59 minutes", input: "59\n", output: "0 h 59 min", visibility: "sample", category: "boundary" },
        { label: "exactly one hour", input: "60\n", output: "1 h 0 min", visibility: "hidden", category: "boundary" },
        { label: "zero", input: "0\n", output: "0 h 0 min", visibility: "hidden", category: "edge" },
        { label: "almost a day", input: "1439\n", output: "23 h 59 min", visibility: "hidden", category: "normal" },
      ],
      compare: "tokens",
      hints: [
        "How many minutes are in one hour? How would you find the hours in 125 minutes on paper?",
        "Whole-number division `/` gives the whole hours; the remainder `%` gives what's left over.",
        "Your two calculations use `minutes` and 60. Print them with the words `h` and `min` between.",
        "`int hours = minutes / 60;` and `int rest = minutes % 60;` then `cout << hours << \" h \" << rest << \" min\";`",
      ],
      solution: r`#include <iostream>
using namespace std;

int main() {
    int minutes;
    cin >> minutes;
    int hours = minutes / 60;
    int rest = minutes % 60;
    cout << hours << " h " << rest << " min" << endl;
    return 0;
}`,
      solutionNotes: "125 / 60 is 2 (whole hours) and 125 % 60 is 5 (minutes left over). This pair — `/` for \"how many whole groups\" and `%` for \"what's left\" — appears in many problems.",
    },
    explainAgain: `Think of packing 125 sweets into boxes of 60. \`125 / 60\` answers "how many **full** boxes?" (2). \`125 % 60\` answers "how many sweets are **left over**?" (5). Integer division and remainder are always a pair like that.`,
    summary: [
      "`+ - * / %` work on numbers; `*`, `/`, `%` happen before `+` and `-`.",
      "int / int drops the fraction; `%` gives the remainder.",
      "`x += 5`, `x++` are shortcuts for updating a variable.",
    ],
  },
];
