import type { CourseLesson } from "./types";

const r = String.raw;

/**
 * Module 17 — Guided projects and capstone. Each lesson walks through building a complete
 * command-line program; the exercise is the whole program, judged on a scripted session.
 */
export const PROJECT_LESSONS: CourseLesson[] = [
  {
    id: "project-grade-manager",
    moduleId: "projects",
    title: "Project: student grade manager",
    minutes: 45,
    concepts: ["project", "command loop", "map", "sorting", "functions", "input validation"],
    goals: [
      "Turning a plain-language specification into a program plan",
      "The command-loop pattern: read a command, dispatch, respond",
      "Combining a map, sorting with a lambda, formatting and validation in one program",
    ],
    intro: `Time to build something whole. Most real command-line tools share one shape: **read a command, check it, do it, print a response, repeat**. In this project you'll build a grade manager that a teacher could actually use — and practise the habit that matters most in projects: plan before you type.`,
    sections: [
      {
        title: "Step 1 — Read the spec and plan the data",
        body: `Commands to support:

- \`add NAME MARK\` → \`added NAME\`, or \`invalid mark\` (outside 0–100), or \`already exists\`
- \`remove NAME\` → \`removed NAME\` or \`not found\`
- \`avg\` → \`average X.XX\` (2 decimals) or \`no students\`
- \`top K\` → up to K lines \`NAME MARK\`, highest mark first, ties alphabetical; \`no students\` if empty
- \`report\` → \`A:a B:b C:c D:d F:f\` with A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, otherwise F

Data: names map to marks, names are unique → \`map<string, int>\`.`,
      },
      {
        title: "Step 2 — One function per command",
        body: `Keep \`main\` as a thin dispatcher and give each command its own function (\`addStudent\`, \`removeStudent\`, \`printAverage\`, \`printTop\`, \`printReport\`). Small functions are easier to test and to fix: when \`top\` misbehaves, you know exactly where to look.

Validate **before** changing anything: check the mark range and duplicates first, then insert.`,
      },
      {
        title: "Step 3 — Test the edges, then extend",
        body: `Before calling it done, try: commands on an empty class, ties in \`top\`, \`top\` with K larger than the class, marks exactly 0, 40, 60, 75, 90 and 100.

Extensions once it passes: an \`update NAME MARK\` command, a per-grade name list, or saving the class to a file in your own environment (Module 15).`,
      },
    ],
    mistakes: [
      { title: "Doing everything in main", body: "A 150-line `main` is hard to debug. One function per command keeps each piece small and testable." },
      { title: "Grade boundaries", body: "Check from the top down (`>= 90`, then `>= 75`, …) so each mark lands in exactly one grade — and mind `>=` versus `>`." },
      { title: "Integer averages", body: "`total / count` with ints drops the fraction. Use `(double)total / count` and `fixed << setprecision(2)`." },
    ],
    example: {
      title: "The command-loop pattern",
      intro: "A tiny shop inventory with the same structure as the project: read, dispatch, respond.",
      code: r`#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> stock;
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string cmd;
        cin >> cmd;
        if (cmd == "add") {
            string item;
            int qty;
            cin >> item >> qty;
            stock[item] += qty;
            cout << "added " << qty << " " << item << endl;
        } else if (cmd == "sell") {
            string item;
            int qty;
            cin >> item >> qty;
            auto it = stock.find(item);
            if (it == stock.end() || it->second < qty) {
                cout << "not enough " << item << endl;
            } else {
                it->second -= qty;
                cout << "sold " << qty << " " << item << endl;
            }
        } else if (cmd == "stock") {
            for (const auto& [name, count] : stock) {
                cout << name << " " << count << endl;
            }
        } else {
            cout << "unknown command " << cmd << endl;
        }
    }
    return 0;
}`,
      input: "5\nadd pen 10\nadd book 3\nsell pen 4\nsell book 5\nstock\n",
      output: "added 10 pen\nadded 3 book\nsold 4 pen\nnot enough book\nbook 3\npen 6\n",
      notes: [
        { line: 12, text: "Read the command word first; its arguments depend on which command it is." },
        { line: 24, text: "Validate before changing state: unknown item or too few in stock." },
        { line: 35, text: "Always answer unknown commands instead of silently ignoring them." },
      ],
    },
    quickCheck: {
      prompt: "With A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, which grade does a mark of 75 get?",
      options: [
        { id: "a", text: "B", feedback: "Right: 75 ≥ 75, and the B check comes before C." },
        { id: "b", text: "C", feedback: "75 meets the B threshold, which is checked first." },
        { id: "c", text: "Both B and C", feedback: "An if / else-if ladder gives exactly one grade." },
      ],
      correct: "a",
      explanation: "Checking from the highest threshold down with `else if` puts each mark in exactly one band.",
    },
    exercise: {
      title: "Build the grade manager",
      prompt: `Implement the grade manager described in the lesson. Input: \`q\`, then \`q\` commands (\`add\`, \`remove\`, \`avg\`, \`top\`, \`report\`). Print exactly the responses from the specification.`,
      starterCode: r`#include <algorithm>
#include <iomanip>
#include <iostream>
#include <map>
#include <string>
#include <utility>
#include <vector>
using namespace std;

map<string, int> marks;

// Write one function per command, then call them from main.

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string cmd;
        cin >> cmd;
        // add NAME MARK | remove NAME | avg | top K | report
    }
    return 0;
}`,
      tests: [
        { label: "a short session", input: "8\nadd asha 92\nadd ravi 67\nadd dev 92\nadd ravi 50\nadd meena 101\ntop 2\navg\nreport\n", output: "added asha\nadded ravi\nadded dev\nalready exists\ninvalid mark\nasha 92\ndev 92\naverage 83.67\nA:2 B:0 C:1 D:0 F:0", visibility: "sample", category: "normal" },
        { label: "empty class", input: "4\navg\ntop 3\nremove x\nreport\n", output: "no students\nno students\nnot found\nA:0 B:0 C:0 D:0 F:0", visibility: "hidden", category: "edge" },
        { label: "remove and top larger than class", input: "7\nadd a 40\nadd b 39\nadd c 75\nadd d 89\nremove a\ntop 5\nreport\n", output: "added a\nadded b\nadded c\nadded d\nremoved a\nd 89\nc 75\nb 39\nA:0 B:2 C:0 D:0 F:1", visibility: "hidden", category: "boundary" },
        { label: "extreme marks", input: "5\nadd x 0\nadd y 100\nadd z 60\navg\nreport\n", output: "added x\nadded y\nadded z\naverage 53.33\nA:1 B:0 C:1 D:0 F:1", visibility: "hidden", category: "boundary" },
      ],
      compare: "lines",
      hints: [
        "List the five commands and, for each, what it reads and every possible response. Which ones change the map?",
        "Only `add` and `remove` change state. `add` must check the range and duplicates (`marks.count(name)`) before inserting.",
        "For `top`, copy the map into a `vector<pair<string, int>>`, sort with a lambda (mark descending, name ascending), and print the first `min(K, size)`.",
        "For `report`, loop over the map with an if / else-if ladder from 90 down to 40, counting into five variables. For `avg`, use `fixed << setprecision(2)` on `(double)total / marks.size()`.",
      ],
      solution: r`#include <algorithm>
#include <iomanip>
#include <iostream>
#include <map>
#include <string>
#include <utility>
#include <vector>
using namespace std;

map<string, int> marks;

void addStudent(const string& name, int mark) {
    if (mark < 0 || mark > 100) {
        cout << "invalid mark" << endl;
    } else if (marks.count(name)) {
        cout << "already exists" << endl;
    } else {
        marks[name] = mark;
        cout << "added " << name << endl;
    }
}

void removeStudent(const string& name) {
    if (marks.erase(name)) {
        cout << "removed " << name << endl;
    } else {
        cout << "not found" << endl;
    }
}

void printAverage() {
    if (marks.empty()) {
        cout << "no students" << endl;
        return;
    }
    long long total = 0;
    for (const auto& [name, mark] : marks) {
        total += mark;
    }
    cout << "average " << fixed << setprecision(2) << (double)total / marks.size() << endl;
}

void printTop(int k) {
    if (marks.empty()) {
        cout << "no students" << endl;
        return;
    }
    vector<pair<string, int>> list(marks.begin(), marks.end());
    sort(list.begin(), list.end(), [](const pair<string, int>& a, const pair<string, int>& b) {
        if (a.second != b.second) {
            return a.second > b.second;
        }
        return a.first < b.first;
    });
    int shown = min(k, (int)list.size());
    for (int i = 0; i < shown; i++) {
        cout << list[i].first << " " << list[i].second << endl;
    }
}

void printReport() {
    int a = 0, b = 0, c = 0, d = 0, f = 0;
    for (const auto& [name, mark] : marks) {
        if (mark >= 90) {
            a++;
        } else if (mark >= 75) {
            b++;
        } else if (mark >= 60) {
            c++;
        } else if (mark >= 40) {
            d++;
        } else {
            f++;
        }
    }
    cout << "A:" << a << " B:" << b << " C:" << c << " D:" << d << " F:" << f << endl;
}

int main() {
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string cmd;
        cin >> cmd;
        if (cmd == "add") {
            string name;
            int mark;
            cin >> name >> mark;
            addStudent(name, mark);
        } else if (cmd == "remove") {
            string name;
            cin >> name;
            removeStudent(name);
        } else if (cmd == "avg") {
            printAverage();
        } else if (cmd == "top") {
            int k;
            cin >> k;
            printTop(k);
        } else if (cmd == "report") {
            printReport();
        }
    }
    return 0;
}`,
      solutionNotes: "`main` only reads arguments and dispatches; every rule lives in a named function. `marks.erase(name)` returns how many entries it removed, which doubles as the \"found\" check. The map keeps names unique and sorted, so only `top` needs its own ordering.",
    },
    explainAgain: `A command-line program is a restaurant counter. The cashier (\`main\`) takes each order, checks it's on the menu, and passes it to the right station (a function). Each station does one job well. Planning the menu (the spec) before opening the restaurant saves a lot of confused orders.`,
    summary: [
      "Plan first: list commands, inputs, outputs and the data structure before coding.",
      "Command loop: read the command, dispatch to one function per command, validate before changing state.",
      "Test the edges (empty data, ties, boundaries) before adding features.",
    ],
  },

  {
    id: "project-bank-system",
    moduleId: "projects",
    title: "Project: bank account system",
    minutes: 50,
    concepts: ["project", "classes", "map", "exceptions", "invariants", "atomic operation"],
    goals: [
      "Designing classes that protect their own rules (invariants)",
      "Reporting errors with exceptions from deep inside the program to one handler",
      "Making multi-step operations all-or-nothing (a transfer never half-happens)",
    ],
    intro: `This project combines OOP and exceptions in the kind of program where correctness really matters: money. Accounts must never go negative, unknown accounts must be rejected, and a transfer must either fully happen or not happen at all.`,
    sections: [
      {
        title: "Step 1 — The specification",
        body: `Account ids are whole numbers. Commands:

- \`open ID NAME\` → \`opened ID\`
- \`deposit ID AMOUNT\`, \`withdraw ID AMOUNT\`, \`transfer FROM TO AMOUNT\` → \`ok\`
- \`show ID\` → \`ID NAME BALANCE\`
- \`summary\` → every account as \`ID NAME BALANCE\` in id order, then \`total T\`

Every failure prints \`error: MESSAGE\` with one of: \`account exists\`, \`no such account\`, \`amount must be positive\`, \`insufficient funds\`, \`same account\`. Check in this order: accounts exist (from, then to) → same account → amount positive → funds.`,
      },
      {
        title: "Step 2 — Classes and exceptions",
        body: `An \`Account\` class guards the balance (its \`deposit\`/\`withdraw\` throw on bad amounts). A \`Bank\` class owns a \`map<int, Account>\` and has a \`find(id)\` helper that throws \`no such account\` — so no command can forget to check.

\`main\` wraps each command in **one** \`try\`/\`catch\` and prints \`error: \` + \`e.what()\`. Errors are raised where they're detected and reported in one place.`,
      },
      {
        title: "Step 3 — All-or-nothing transfers",
        body: `A transfer is two changes. If the withdrawal succeeded and the deposit then failed, money would vanish. Do **all checks first** (both accounts exist, different, positive amount, enough funds) and only then change both balances. Because nothing is modified before the last check, a thrown exception leaves every account exactly as it was.`,
      },
    ],
    mistakes: [
      { title: "Half-finished operations", body: "Withdrawing from the source before checking the destination exists loses money when the destination is missing. Validate everything, then mutate." },
      { title: "Using m[id] to look up", body: "`accounts[id]` silently creates an empty account for an unknown id. Use `find` (or `count`) and throw when it's missing." },
      { title: "Catching in every function", body: "Catching and printing deep inside the program scatters error handling. Throw where the problem is found; catch once in `main`." },
    ],
    example: {
      title: "Throw where it's detected, catch in one place",
      intro: "A lookup helper that throws, and a transfer that validates fully before changing anything.",
      code: r`#include <iostream>
#include <map>
#include <stdexcept>
#include <string>
using namespace std;

struct Account {
    string owner;
    long long balance = 0;
};

map<int, Account> accounts;

Account& get(int id) {
    auto it = accounts.find(id);
    if (it == accounts.end()) {
        throw runtime_error("no such account");
    }
    return it->second;
}

void transfer(int from, int to, long long amount) {
    Account& a = get(from);
    Account& b = get(to);
    if (amount > a.balance) {
        throw runtime_error("insufficient funds");
    }
    a.balance -= amount;
    b.balance += amount;
}

int main() {
    accounts[1] = {"asha", 100};
    accounts[2] = {"ravi", 0};
    int requests[3][3] = {{1, 2, 30}, {1, 3, 10}, {2, 1, 500}};
    for (auto& req : requests) {
        try {
            transfer(req[0], req[1], req[2]);
            cout << "ok" << endl;
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    cout << accounts[1].owner << " " << accounts[1].balance << endl;
    cout << accounts[2].owner << " " << accounts[2].balance << endl;
    return 0;
}`,
      output: "ok\nerror: no such account\nerror: insufficient funds\nasha 70\nravi 30\n",
      notes: [
        { line: 14, text: "One lookup helper: every caller gets the \"no such account\" check for free." },
        { line: 25, text: "All checks happen before either balance changes." },
        { line: 40, text: "One handler reports every kind of error the same way." },
      ],
    },
    quickCheck: {
      prompt: "A transfer withdraws from the source, then looks up the destination, which doesn't exist and throws. What went wrong?",
      options: [
        { id: "a", text: "Nothing — the exception is caught", feedback: "Catching it doesn't put the money back." },
        { id: "b", text: "The source lost money that never arrived anywhere", feedback: "Right: validate both accounts (and funds) before changing either balance." },
        { id: "c", text: "The program crashes", feedback: "It doesn't crash — it silently corrupts the data, which is worse." },
      ],
      correct: "b",
      explanation: "Multi-step updates must be all-or-nothing: check everything first, then apply every change.",
    },
    exercise: {
      title: "Build the bank system",
      prompt: `Implement the bank described in the lesson. Input: \`q\`, then \`q\` commands. Print \`opened ID\`, \`ok\`, \`ID NAME BALANCE\`, the summary, or \`error: MESSAGE\` exactly as specified, checking errors in the stated order.`,
      starterCode: r`#include <iostream>
#include <map>
#include <stdexcept>
#include <string>
using namespace std;

class Account {
    string owner;
    long long balance = 0;
public:
    Account(string name) : owner(name) {}
    // deposit / withdraw that throw on bad amounts, plus getters
};

class Bank {
    map<int, Account> accounts;
public:
    // open, find (throws "no such account"), deposit, withdraw, transfer, show, summary
};

int main() {
    Bank bank;
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string cmd;
        cin >> cmd;
        // read the arguments for cmd, call the bank, print the response;
        // catch exceptions and print "error: " + message
    }
    return 0;
}`,
      tests: [
        { label: "a working day", input: "9\nopen 1 asha\nopen 2 ravi\nopen 1 dev\ndeposit 1 500\nwithdraw 2 10\ntransfer 1 2 200\ntransfer 2 3 50\nshow 2\nsummary\n", output: "opened 1\nopened 2\nerror: account exists\nok\nerror: insufficient funds\nok\nerror: no such account\n2 ravi 200\n1 asha 300\n2 ravi 200\ntotal 500", visibility: "sample", category: "normal" },
        { label: "error order", input: "5\ndeposit 9 10\nopen 5 meena\ndeposit 5 0\ntransfer 5 5 1\nsummary\n", output: "error: no such account\nopened 5\nerror: amount must be positive\nerror: same account\n5 meena 0\ntotal 0", visibility: "hidden", category: "edge" },
        { label: "exact balances", input: "6\nopen 3 a\nopen 1 b\ndeposit 3 100\ntransfer 3 1 100\nwithdraw 1 100\nsummary\n", output: "opened 3\nopened 1\nok\nok\nok\n1 b 0\n3 a 0\ntotal 0", visibility: "hidden", category: "boundary" },
        { label: "no accounts", input: "1\nsummary\n", output: "total 0", visibility: "hidden", category: "edge" },
      ],
      compare: "lines",
      hints: [
        "Which class should enforce \"amount must be positive\" and \"insufficient funds\", and which should enforce \"no such account\"?",
        "`Account` guards its balance; `Bank` guards which accounts exist. A `Bank::find(id)` that throws makes every command safe.",
        "Transfer order: `Account& a = find(from); Account& b = find(to);` then same-account, amount and funds checks — and only then change both balances.",
        "In `main`, put the whole dispatch inside `try { … } catch (const exception& e) { cout << \"error: \" << e.what() << endl; }`. Use `accounts.emplace(id, Account(name))` (Account has no default constructor) and `map::find` for lookups.",
      ],
      solution: r`#include <iostream>
#include <map>
#include <stdexcept>
#include <string>
using namespace std;

class Account {
    string owner;
    long long balance = 0;
public:
    Account(string name) : owner(name) {}
    const string& getOwner() const { return owner; }
    long long getBalance() const { return balance; }
    static void requirePositive(long long amount) {
        if (amount <= 0) {
            throw invalid_argument("amount must be positive");
        }
    }
    void deposit(long long amount) {
        requirePositive(amount);
        balance += amount;
    }
    void withdraw(long long amount) {
        requirePositive(amount);
        if (amount > balance) {
            throw runtime_error("insufficient funds");
        }
        balance -= amount;
    }
};

class Bank {
    map<int, Account> accounts;
public:
    Account& find(int id) {
        auto it = accounts.find(id);
        if (it == accounts.end()) {
            throw runtime_error("no such account");
        }
        return it->second;
    }
    void open(int id, const string& name) {
        if (accounts.count(id)) {
            throw runtime_error("account exists");
        }
        accounts.emplace(id, Account(name));
    }
    void transfer(int from, int to, long long amount) {
        Account& a = find(from);
        Account& b = find(to);
        if (from == to) {
            throw runtime_error("same account");
        }
        Account::requirePositive(amount);
        if (amount > a.getBalance()) {
            throw runtime_error("insufficient funds");
        }
        a.withdraw(amount);
        b.deposit(amount);
    }
    void show(int id) {
        Account& a = find(id);
        cout << id << " " << a.getOwner() << " " << a.getBalance() << endl;
    }
    void summary() const {
        long long total = 0;
        for (const auto& [id, a] : accounts) {
            cout << id << " " << a.getOwner() << " " << a.getBalance() << endl;
            total += a.getBalance();
        }
        cout << "total " << total << endl;
    }
};

int main() {
    Bank bank;
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string cmd;
        cin >> cmd;
        try {
            if (cmd == "open") {
                int id;
                string name;
                cin >> id >> name;
                bank.open(id, name);
                cout << "opened " << id << endl;
            } else if (cmd == "deposit" || cmd == "withdraw") {
                int id;
                long long amount;
                cin >> id >> amount;
                Account& a = bank.find(id);
                if (cmd == "deposit") {
                    a.deposit(amount);
                } else {
                    a.withdraw(amount);
                }
                cout << "ok" << endl;
            } else if (cmd == "transfer") {
                int from, to;
                long long amount;
                cin >> from >> to >> amount;
                bank.transfer(from, to, amount);
                cout << "ok" << endl;
            } else if (cmd == "show") {
                int id;
                cin >> id;
                bank.show(id);
            } else if (cmd == "summary") {
                bank.summary();
            }
        } catch (const exception& e) {
            cout << "error: " << e.what() << endl;
        }
    }
    return 0;
}`,
      solutionNotes: "Arguments are read *before* anything can throw, so a failed command never leaves unread input behind to confuse the next one. Every rule lives in exactly one place (`requirePositive`, `find`, `withdraw`), and `transfer` finishes all its checks before touching a balance.",
    },
    explainAgain: `A bank teller follows a checklist before moving money: is the customer real, is the destination real, is the amount sensible, is there enough? Only when every box is ticked does any money move. If any check fails, the teller says why — and nothing in the ledger has changed.`,
    summary: [
      "Classes enforce their own invariants; a lookup helper that throws keeps every command safe.",
      "Throw where an error is detected; catch and report once, in `main`.",
      "Multi-step changes must validate everything first so they're all-or-nothing.",
    ],
  },

  {
    id: "capstone-library",
    moduleId: "projects",
    title: "Capstone: library management system",
    minutes: 60,
    concepts: ["capstone", "design", "classes", "map", "set", "string parsing", "case-insensitive search", "business rules"],
    goals: [
      "Designing a complete program from a specification with several interacting rules",
      "Parsing commands whose last argument is free text (titles with spaces)",
      "Keeping two views of the data consistent (books and what each member holds)",
    ],
    intro: `The capstone brings together almost everything: classes, maps and sets, string parsing, searching, sorting by key and careful business rules. You'll build the core of a library system — the kind of program that gets assigned as a semester project — and it has to behave exactly to spec.`,
    sections: [
      {
        title: "The specification",
        body: `Each command is on its own line:

- \`add ID TITLE…\` → \`added ID\` (the title is the rest of the line) or \`error: duplicate id\`
- \`borrow ID MEMBER\` → \`ok\`, or \`error: no such book\`, \`error: already borrowed\`, \`error: limit reached\` (a member may hold at most **2** books) — checked in that order
- \`return ID\` → \`ok\`, or \`error: no such book\`, \`error: not borrowed\`
- \`search WORD\` → every book whose title contains WORD, **ignoring case**, as \`ID TITLE\` in id order; or \`no matches\`
- \`available\` → every book not on loan as \`ID TITLE\` in id order; or \`none\`
- \`member NAME\` → \`NAME: id id …\` (ids held, ascending) or \`NAME: none\``,
      },
      {
        title: "Design",
        body: `- \`struct Book { string title; string borrower; }\` — an empty borrower means available.
- \`map<int, Book> books\` keeps books in id order for \`search\` and \`available\`.
- \`map<string, set<int>> loans\` answers \`member\` and the 2-book limit instantly. Update **both** maps on borrow and return — they must always agree.
- Read each command with \`getline\`, then parse it with an \`istringstream\`; for \`add\`, \`getline(in >> ws, title)\` takes the rest of the line.`,
      },
      {
        title: "Working method",
        body: `Build it in slices and test each one before moving on: \`add\` + \`available\` first, then \`borrow\`/\`return\` with all their errors, then \`member\`, then \`search\`. Write down the error order from the spec and follow it exactly — the judge checks the first applicable error.

When it passes, extend it in your own environment: due dates, fines, saving and loading the catalogue from a file.`,
      },
    ],
    mistakes: [
      { title: "Two data structures out of sync", body: "Updating `books` on return but forgetting `loans` makes `member` and the borrowing limit wrong. Change both in the same function." },
      { title: "Losing the title's spaces", body: "`in >> title` reads one word. Use `getline(in >> ws, title)` to take the rest of the line." },
      { title: "Case-sensitive search", body: "\"code\" should match \"Clean Code\". Lower-case both the title and the word before `find`." },
    ],
    example: {
      title: "Free-text arguments and case-insensitive search",
      intro: "Parsing `add ID TITLE…` lines and searching titles regardless of case.",
      code: r`#include <cctype>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

string lower(string s) {
    for (char& c : s) {
        c = (char)tolower((unsigned char)c);
    }
    return s;
}

int main() {
    vector<string> lines = {"add 3 The C++ Programming Language", "add 1 Clean Code"};
    map<int, string> titles;
    for (const string& line : lines) {
        istringstream in(line);
        string cmd;
        int id;
        in >> cmd >> id;
        string title;
        getline(in >> ws, title);
        titles[id] = title;
    }
    for (const auto& [id, t] : titles) {
        cout << id << " [" << t << "]" << endl;
    }
    string word = "CODE";
    for (const auto& [id, t] : titles) {
        if (lower(t).find(lower(word)) != string::npos) {
            cout << "match: " << id << endl;
        }
    }
    return 0;
}`,
      output: "1 [Clean Code]\n3 [The C++ Programming Language]\nmatch: 1\n",
      notes: [
        { line: 25, text: "`ws` skips the space after the id; `getline` takes everything else, spaces included." },
        { line: 28, text: "A `map` iterates in key order, so books come out sorted by id." },
        { line: 33, text: "Compare lower-cased copies: \"CODE\" matches \"Clean Code\"." },
      ],
    },
    quickCheck: {
      prompt: "A member holds 2 books and asks to borrow a book that is already on loan. With the spec's error order, what is printed?",
      options: [
        { id: "a", text: "error: limit reached", feedback: "The spec checks \"already borrowed\" before the limit." },
        { id: "b", text: "error: already borrowed", feedback: "Right: errors are checked in the stated order — no such book, already borrowed, limit reached." },
        { id: "c", text: "Both errors", feedback: "Each command prints exactly one response: the first rule that fails." },
      ],
      correct: "b",
      explanation: "When several rules fail, the specification's order decides which one is reported.",
    },
    exercise: {
      title: "Build the library system",
      prompt: `Implement the library system from the specification. Input: \`q\` on the first line, then \`q\` command lines. Print exactly one response per command (several lines for \`search\` and \`available\`).`,
      starterCode: r`#include <cctype>
#include <iostream>
#include <map>
#include <set>
#include <sstream>
#include <string>
using namespace std;

struct Book {
    string title;
    string borrower;  // empty = available
};

map<int, Book> books;
map<string, set<int>> loans;

int main() {
    int q;
    cin >> q;
    cin.ignore();
    for (int i = 0; i < q; i++) {
        string line;
        getline(cin, line);
        istringstream in(line);
        string cmd;
        in >> cmd;
        // add | borrow | return | search | available | member
    }
    return 0;
}`,
      tests: [
        { label: "catalogue, loans and limit", input: "10\nadd 3 The C++ Programming Language\nadd 1 Clean Code\nadd 2 Introduction to Algorithms\nadd 1 Duplicate\nborrow 1 asha\nborrow 2 asha\nborrow 3 asha\nsearch code\navailable\nmember asha\n", output: "added 3\nadded 1\nadded 2\nerror: duplicate id\nok\nok\nerror: limit reached\n1 Clean Code\n3 The C++ Programming Language\nasha: 1 2", visibility: "sample", category: "normal" },
        { label: "error order", input: "7\nborrow 5 ravi\nreturn 5\nadd 5 Data Structures\nreturn 5\nborrow 5 ravi\nborrow 5 meena\nmember meena\n", output: "error: no such book\nerror: no such book\nadded 5\nerror: not borrowed\nok\nerror: already borrowed\nmeena: none", visibility: "hidden", category: "edge" },
        { label: "case-insensitive search, nothing available", input: "7\nadd 10 Graph Theory\nadd 4 graphs and trees\nsearch GRAPH\nsearch python\nborrow 10 a\nborrow 4 b\navailable\n", output: "added 10\nadded 4\n4 graphs and trees\n10 Graph Theory\nno matches\nok\nok\nnone", visibility: "hidden", category: "boundary" },
        { label: "return frees the book", input: "5\nadd 1 A\nborrow 1 x\nreturn 1\nmember x\navailable\n", output: "added 1\nok\nok\nx: none\n1 A", visibility: "hidden", category: "normal" },
      ],
      compare: "lines",
      hints: [
        "Sketch the two maps for the sample after each command. Which commands change which map?",
        "`add` changes `books`; `borrow` and `return` change **both** `books[id].borrower` and `loans[member]`; the rest only read.",
        "borrow: `auto it = books.find(id)` → no such book; `!it->second.borrower.empty()` → already borrowed; `loans[m].size() >= 2` → limit reached; otherwise set the borrower and `loans[m].insert(id)`.",
        "return: look up the book, check it has a borrower, then `loans[borrower].erase(id)` and clear the borrower. For search, compare lower-cased copies with `find(...) != string::npos`.",
      ],
      solution: r`#include <cctype>
#include <iostream>
#include <map>
#include <set>
#include <sstream>
#include <string>
using namespace std;

struct Book {
    string title;
    string borrower;  // empty = available
};

map<int, Book> books;
map<string, set<int>> loans;

string lower(string s) {
    for (char& c : s) {
        c = (char)tolower((unsigned char)c);
    }
    return s;
}

void addBook(int id, const string& title) {
    if (books.count(id)) {
        cout << "error: duplicate id" << endl;
        return;
    }
    books[id] = Book{title, ""};
    cout << "added " << id << endl;
}

void borrowBook(int id, const string& member) {
    auto it = books.find(id);
    if (it == books.end()) {
        cout << "error: no such book" << endl;
    } else if (!it->second.borrower.empty()) {
        cout << "error: already borrowed" << endl;
    } else if (loans[member].size() >= 2) {
        cout << "error: limit reached" << endl;
    } else {
        it->second.borrower = member;
        loans[member].insert(id);
        cout << "ok" << endl;
    }
}

void returnBook(int id) {
    auto it = books.find(id);
    if (it == books.end()) {
        cout << "error: no such book" << endl;
    } else if (it->second.borrower.empty()) {
        cout << "error: not borrowed" << endl;
    } else {
        loans[it->second.borrower].erase(id);
        it->second.borrower.clear();
        cout << "ok" << endl;
    }
}

void search(const string& word) {
    bool any = false;
    string w = lower(word);
    for (const auto& [id, b] : books) {
        if (lower(b.title).find(w) != string::npos) {
            cout << id << " " << b.title << endl;
            any = true;
        }
    }
    if (!any) {
        cout << "no matches" << endl;
    }
}

void available() {
    bool any = false;
    for (const auto& [id, b] : books) {
        if (b.borrower.empty()) {
            cout << id << " " << b.title << endl;
            any = true;
        }
    }
    if (!any) {
        cout << "none" << endl;
    }
}

void member(const string& name) {
    auto it = loans.find(name);
    if (it == loans.end() || it->second.empty()) {
        cout << name << ": none" << endl;
        return;
    }
    cout << name << ":";
    for (int id : it->second) {
        cout << " " << id;
    }
    cout << endl;
}

int main() {
    int q;
    cin >> q;
    cin.ignore();
    for (int i = 0; i < q; i++) {
        string line;
        getline(cin, line);
        istringstream in(line);
        string cmd;
        in >> cmd;
        if (cmd == "add") {
            int id;
            string title;
            in >> id;
            getline(in >> ws, title);
            addBook(id, title);
        } else if (cmd == "borrow") {
            int id;
            string m;
            in >> id >> m;
            borrowBook(id, m);
        } else if (cmd == "return") {
            int id;
            in >> id;
            returnBook(id);
        } else if (cmd == "search") {
            string word;
            in >> word;
            search(word);
        } else if (cmd == "available") {
            available();
        } else if (cmd == "member") {
            string name;
            in >> name;
            member(name);
        }
    }
    return 0;
}`,
      solutionNotes: "`books` (by id) serves search and availability in sorted order; `loans` (by member, as a `set`) serves the limit and the member listing in sorted order. `borrowBook` and `returnBook` are the only functions that change loans, and each updates both maps together, so the two views can't drift apart.",
    },
    explainAgain: `Think of a real library desk. The catalogue (a card per book, in shelf-number order) says who has each book; the members' file (a card per member) lists what they hold. Every loan or return updates both cards at the same time. The desk rules — book must exist, must be on the shelf, member may hold two — are checked in a fixed order, and the first rule that fails is the answer you give.`,
    summary: [
      "Turn the specification into data structures first: `map<int, Book>` and `map<string, set<int>>`.",
      "Parse each line with `istringstream`; `getline(in >> ws, …)` takes free text with spaces.",
      "Keep related data consistent by changing it in one place, and follow the spec's error order exactly.",
    ],
  },
];
