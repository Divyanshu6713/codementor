import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 42 — Command-line tools and developer tooling (specialist path). */
export const M42: PyModuleDef = {
  id: "py-tooling",
  number: 42,
  level: 5,
  title: "Command-Line Tools and Developer Tooling",
  summary: "Designing command-line tools; argparse (arguments, options, flags, sub-commands); stdin/stdout/stderr and pipes; exit codes; configuration layering (defaults, files, environment, flags); logging for tools; installable entry points; click/typer/rich overview.",
  track: "specialist",
  optionalNote: "For developers, DevOps engineers and anyone who wants their scripts to feel like real tools. Everything here runs in the sandbox except actually installing commands, which you'll do on your own computer.",
  prereqs: ["py-packaging"],
  lessons: [
    {
      id: "py-cli-argparse",
      title: "Building CLIs with argparse",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Define positional arguments, options and flags with argparse",
        "Add sub-commands for multi-action tools",
        "Use stdout, stderr and exit codes the way other tools expect",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "By convention, what should a command-line tool's exit code be when it fails?",
        options: [
          { text: "0", why: "0 means success." },
          { text: "A non-zero number (often 1, or 2 for usage errors)", why: "Correct." },
          { text: "It doesn't matter", why: "Scripts and CI rely on it to detect failure." },
        ],
        answer: 1,
        hint: "Zero means 'all good'.",
        explain: "Shells, CI systems and other programs check the exit code: 0 = success, anything else = failure.",
      },
      why: "Command-line tools are how developers automate everything: builds, deployments, data jobs, code generation. A tool with clear arguments, helpful errors, and correct exit codes can be combined with others in scripts and pipelines — one without them just causes confusion.",
      concept: [
        {
          title: "argparse basics",
          body: `\`\`\`python
parser = argparse.ArgumentParser(prog="resize", description="Resize images")
parser.add_argument("files", nargs="+", help="images to resize")       # positional, 1 or more
parser.add_argument("-w", "--width", type=int, default=800)              # option with a value
parser.add_argument("-q", "--quiet", action="store_true")                # flag
parser.add_argument("--format", choices=["jpg", "png"], default="jpg")   # restricted values
args = parser.parse_args()          # reads sys.argv[1:]; parse_args([...]) for tests
\`\`\`

argparse generates \`--help\`, converts types and reports usage errors (exit code 2).`,
        },
        {
          title: "Sub-commands, streams and exit codes",
          body: `- **Sub-commands** like \`git commit\` / \`git push\`: \`sub = parser.add_subparsers(dest="command", required=True)\`, then \`sub.add_parser("add")\`.
- **stdout** is for results (so they can be piped: \`tool | sort\`); **stderr** is for errors and progress (\`print(..., file=sys.stderr)\`).
- Read from stdin when no file is given, so the tool works in pipelines.
- **Exit codes**: \`sys.exit(0)\` success, \`1\` failure, \`2\` usage error. Raising \`SystemExit(n)\` is the same thing.`,
        },
      ],
      example: {
        title: "A word-count tool, tested by calling main(argv)",
        code: r`import argparse, io, sys

def build_parser():
    parser = argparse.ArgumentParser(prog="wc-lite", description="Count lines, words and characters")
    parser.add_argument("-l", "--lines", action="store_true", help="only count lines")
    parser.add_argument("--min-length", type=int, default=0, metavar="N", help="ignore words shorter than N")
    parser.add_argument("--top", type=int, choices=range(1, 11), help="show the N most common words")
    return parser

def main(argv, stdin):
    args = build_parser().parse_args(argv)
    text = stdin.read()
    if not text:
        print("wc-lite: no input", file=sys.stderr)
        return 1
    lines = text.splitlines()
    if args.lines:
        print(len(lines))
        return 0
    words = [w.lower().strip(".,!?") for w in text.split()]
    words = [w for w in words if len(w) >= args.min_length]
    print(f"{len(lines)} lines, {len(words)} words, {len(text)} chars")
    if args.top:
        from collections import Counter
        for word, n in Counter(words).most_common(args.top):
            print(f"  {word}: {n}")
    return 0

poem = "The rain falls.\nThe river rises,\nthe river runs to the sea.\n"
print("exit", main([], io.StringIO(poem)))
print("exit", main(["-l"], io.StringIO(poem)))
print("exit", main(["--min-length", "4", "--top", "2"], io.StringIO(poem)))
print("exit", main([], io.StringIO("")))
try:
    main(["--top", "50"], io.StringIO(poem))
except SystemExit as e:
    print("usage error, exit", e.code)`,
        output: "3 lines, 12 words, 60 chars\nexit 0\n3\nexit 0\n3 lines, 6 words, 60 chars\n  river: 2\n  rain: 1\nexit 0\nexit 1\nusage error, exit 2\n",
        lines: [
          [4, "prog sets the tool's name in help and error messages."],
          [5, "A flag: present → True, absent → False."],
          [6, "An option with a typed value and a default; metavar names it in --help."],
          [7, "choices restricts values; argparse rejects anything else."],
          [10, "main takes argv and stdin as parameters, so tests can call it directly."],
          [14, "Errors go to stderr, and a non-zero exit code signals failure."],
          [22, "Results go to stdout, so they can be piped into other tools."],
          [35, "Invalid usage: argparse prints an error to stderr and exits with code 2."],
        ],
      },
      mistakes: [
        { title: "Errors on stdout", body: "If errors are printed to stdout, the next tool in a pipe receives them as data. Use stderr." },
        { title: "Always exiting 0", body: "CI will think a failed run succeeded. Return or exit with a non-zero code on failure." },
        { title: "Reading sys.argv by hand", body: "Manual parsing misses --help, type checks and good error messages. Use argparse (or click/typer)." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import argparse
p = argparse.ArgumentParser(prog="greet")
p.add_argument("name")
p.add_argument("-n", "--times", type=int, default=1)
p.add_argument("--shout", action="store_true")
a = p.parse_args(["Asha", "--times", "2", "--shout"])
print(a.name, a.times, a.shout, type(a.times).__name__)`,
          answer: "Asha 2 True int\n",
          hint: "type=int converts the text '2'.",
          explain: "Positional name = 'Asha'; --times converted to int 2; --shout present → True.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Make --verbose a simple on/off flag.",
          code: r`import argparse
p = argparse.ArgumentParser()
p.add_argument("--verbose", action="___")
print(p.parse_args([]).verbose, p.parse_args(["--verbose"]).verbose)`,
          blanks: [["store_true"]],
          output: "False True\n",
          hint: "Store True when present.",
          explain: "`action=\"store_true\"` makes the option a boolean flag defaulting to False.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This tool reports an error but tells the shell it succeeded, so a CI pipeline carries on. Which line returns the wrong exit code?",
          code: r`import sys
def main(files):
    missing = [f for f in files if not f.endswith(".csv")]
    if missing:
        print(f"error: not CSV: {', '.join(missing)}", file=sys.stderr)
        return 0
    print(f"processed {len(files)} files")
    return 0
code = main(["a.csv", "notes.txt"])
print("exit code", code)`,
          line: 6,
          fix: r`import sys
def main(files):
    missing = [f for f in files if not f.endswith(".csv")]
    if missing:
        print(f"error: not CSV: {', '.join(missing)}", file=sys.stderr)
        return 1
    print(f"processed {len(files)} files")
    return 0
code = main(["a.csv", "notes.txt"])
print("exit code", code)`,
          output: "exit code 1\n",
          hint: "What does 0 mean to the shell?",
          explain: "Failures must return a non-zero code; 0 tells callers everything worked.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Why should progress messages like 'processing 3/10…' go to stderr?",
          options: [
            { text: "stderr is faster", why: "Not the reason." },
            { text: "So stdout contains only the results, which can be piped or redirected cleanly", why: "Correct." },
            { text: "Because stdout is for errors", why: "It's the other way round." },
          ],
          answer: 1,
          hint: "`tool > results.txt`",
          explain: "Redirecting stdout to a file or another program should capture just the data, while humans still see progress on stderr.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "A tiny todo CLI with sub-commands", difficulty: 3,
          prompt: `Build \`todo\` with argparse sub-commands: \`add TEXT... [--priority {low,normal,high}]\` (default normal), \`list [--priority P]\`, \`done ID\` (int). Each input line is one command line (split with \`shlex.split\`), until \`end\`; the todo list lives in memory between lines. Outputs: \`added #<id>\`; list lines \`#<id> [<priority>] <text>\` (or \`(nothing to do)\`); \`completed #<id>\` or \`no todo #<id>\`. For a usage error, catch SystemExit and print \`usage error (exit 2)\` (argparse's own message goes to stderr).`,
          starter: r`import argparse, shlex
`,
          tests: [
            { label: "Session", input: "add Buy milk\nadd \"Revise decorators\" --priority high\nlist\ndone 1\ndone 7\nlist --priority high\nadd Call bank --priority urgent\nlist\nend\n", output: "added #1\nadded #2\n#1 [normal] Buy milk\n#2 [high] Revise decorators\ncompleted #1\nno todo #7\n#2 [high] Revise decorators\nusage error (exit 2)\n#2 [high] Revise decorators" },
          ],
          hints: [
            "`sub = parser.add_subparsers(dest=\"command\", required=True)`.",
            "add: `add_argument(\"text\", nargs=\"+\")` and join the words.",
            "Keep todos in a dict {id: (text, priority)} and a counter.",
            "Wrap parse_args in try/except SystemExit.",
          ],
          solution: r`import argparse, shlex

parser = argparse.ArgumentParser(prog="todo")
sub = parser.add_subparsers(dest="command", required=True)
p_add = sub.add_parser("add")
p_add.add_argument("text", nargs="+")
p_add.add_argument("--priority", choices=["low", "normal", "high"], default="normal")
p_list = sub.add_parser("list")
p_list.add_argument("--priority", choices=["low", "normal", "high"])
p_done = sub.add_parser("done")
p_done.add_argument("id", type=int)

todos, next_id = {}, 1
while (line := input()) != "end":
    try:
        args = parser.parse_args(shlex.split(line))
    except SystemExit:
        print("usage error (exit 2)")
        continue
    if args.command == "add":
        todos[next_id] = (" ".join(args.text), args.priority)
        print(f"added #{next_id}")
        next_id += 1
    elif args.command == "list":
        shown = [(i, t, p) for i, (t, p) in todos.items() if args.priority in (None, p)]
        for i, t, p in shown:
            print(f"#{i} [{p}] {t}")
        if not shown:
            print("(nothing to do)")
    else:
        if todos.pop(args.id, None) is None:
            print(f"no todo #{args.id}")
        else:
            print(f"completed #{args.id}")`,
          notes: "shlex.split handles quotes the way a shell does, so \"Revise decorators\" arrives as one argument. A real version would save todos to a JSON file in the user's data folder.",
        },
        {
          id: "stretch", kind: "task", title: "Filter tool for pipelines", difficulty: 4,
          prompt: `Write \`main(argv, stdin, stdout, stderr) -> int\` for a CSV filter: \`csvfilter COLUMN OP VALUE [--select COL,COL] [--count]\` where OP is one of \`eq ne gt lt contains\` (gt/lt compare as numbers). It reads CSV from stdin, writes matching rows as CSV to stdout (header included), or just the count with \`--count\`. Unknown column → message to stderr, exit 1; a non-numeric value in a gt/lt comparison → that row is skipped and counted, with \`skipped N rows\` on stderr at the end. Input: the argument line, then CSV lines until \`end\`. Print stdout, then \`[stderr] …\` lines, then \`exit <code>\`.`,
          starter: r`import argparse, csv, io, shlex, sys
`,
          tests: [
            { label: "Filter", input: "marks gt 70 --select name,marks\nname,city,marks\nAsha,Pune,91\nRavi,Delhi,64\nMeera,Pune,n/a\nZoe,Goa,78\nend\n", output: "name,marks\nAsha,91\nZoe,78\n[stderr] skipped 1 rows\nexit 0" },
            { label: "Count", input: "city eq Pune --count\nname,city,marks\nAsha,Pune,91\nRavi,Delhi,64\nMeera,Pune,70\nend\n", output: "2\nexit 0", hidden: true },
            { label: "Bad column", input: "age gt 10\nname,city\nAsha,Pune\nend\n", output: "[stderr] csvfilter: unknown column 'age'\nexit 1", hidden: true, category: "edge" },
          ],
          hints: [
            "Use csv.DictReader(stdin) and csv.DictWriter(stdout, fieldnames=…, lineterminator=\"\\n\").",
            "A dict of OP → function: `\"gt\": lambda a, b: float(a) > float(b)`.",
            "Pass io.StringIO objects for the streams so you can print them afterwards.",
            "Return the exit code from main instead of calling sys.exit.",
          ],
          solution: r`import argparse, csv, io, shlex, sys

OPS = {
    "eq": lambda a, b: a == b,
    "ne": lambda a, b: a != b,
    "gt": lambda a, b: float(a) > float(b),
    "lt": lambda a, b: float(a) < float(b),
    "contains": lambda a, b: b.lower() in a.lower(),
}

def main(argv, stdin, stdout, stderr):
    parser = argparse.ArgumentParser(prog="csvfilter")
    parser.add_argument("column")
    parser.add_argument("op", choices=OPS)
    parser.add_argument("value")
    parser.add_argument("--select")
    parser.add_argument("--count", action="store_true")
    args = parser.parse_args(argv)
    reader = csv.DictReader(stdin)
    if args.column not in (reader.fieldnames or []):
        print(f"csvfilter: unknown column {args.column!r}", file=stderr)
        return 1
    fields = args.select.split(",") if args.select else reader.fieldnames
    matches, skipped = [], 0
    for row in reader:
        try:
            if OPS[args.op](row[args.column], args.value):
                matches.append(row)
        except ValueError:
            skipped += 1
    if args.count:
        print(len(matches), file=stdout)
    else:
        writer = csv.DictWriter(stdout, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        writer.writerows(matches)
    if skipped:
        print(f"skipped {skipped} rows", file=stderr)
    return 0

argv = shlex.split(input())
lines = []
while (line := input()) != "end":
    lines.append(line)
out, err = io.StringIO(), io.StringIO()
code = main(argv, io.StringIO("\n".join(lines) + "\n"), out, err)
print(out.getvalue(), end="")
for line in err.getvalue().splitlines():
    print("[stderr]", line)
print("exit", code)`,
          notes: "Because the streams are parameters, the tool is trivial to test — and on the command line you'd call `sys.exit(main(sys.argv[1:], sys.stdin, sys.stdout, sys.stderr))` so it works in pipes like `cat marks.csv | csvfilter marks gt 70 | sort`.",
        },
      ],
      realWorld: "pip, black, ruff, pytest and the AWS CLI are Python command-line tools; DevOps pipelines chain small tools with pipes and stop on the first non-zero exit code.",
      reteach: "A CLI is a vending machine with labelled buttons. Arguments are the buttons you press (with argparse checking you pressed valid ones), stdout is the tray where your snack comes out, stderr is the little display that says 'out of stock', and the exit code is the green or red light that tells the next machine in the line whether it worked.",
      summary: [
        "argparse: positionals, options (type, default, choices), flags (store_true), sub-commands.",
        "Results → stdout, errors/progress → stderr; read stdin to work in pipes.",
        "Exit 0 on success, non-zero on failure (2 for usage); structure as main(argv, …) for testing.",
      ],
      libraryCode: [{
        title: "The same tool with typer",
        code: `import typer

app = typer.Typer()

@app.command()
def add(text: list[str], priority: str = typer.Option("normal", help="low/normal/high")):
    """Add a todo."""
    typer.echo(f"added: {' '.join(text)} [{priority}]")

@app.command()
def done(id: int):
    """Mark a todo as done."""
    typer.echo(f"completed #{id}")

if __name__ == "__main__":
    app()          # python todo.py add Buy milk --priority high`,
        note: "`pip install typer` on your own computer. typer builds the argument parser from type hints (it uses click underneath).",
      }],
    },

    {
      id: "py-tool-config",
      title: "Configuration, logging and installable tools",
      minutes: 17,
      difficulty: 4,
      objectives: [
        "Layer configuration from defaults, files, environment variables and flags",
        "Configure logging levels and formats for a tool",
        "Make a tool installable as a command with entry points",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "A setting is defined in the config file, an environment variable AND a command-line flag. Which usually wins?",
        options: [
          { text: "The config file", why: "Files are the most general, so they rank low." },
          { text: "The command-line flag", why: "Correct: the most specific, explicit choice wins." },
          { text: "Whichever was written last to disk", why: "Precedence is a fixed rule." },
        ],
        answer: 1,
        hint: "Most specific wins.",
        explain: "Common precedence: defaults < config file < environment variables < command-line flags.",
      },
      why: "Real tools run on laptops, servers and CI with different settings. Clear configuration rules mean users always know which value is in effect, and good logging means that when something goes wrong at 3 a.m., the log explains what happened.",
      concept: [
        {
          title: "Configuration layers",
          body: `1. **Defaults** in code.
2. **Config file** (\`~/.config/tool/config.toml\` or \`tool.ini\`): \`tomllib\` (3.11+) or \`configparser\`.
3. **Environment variables** (\`TOOL_TIMEOUT=30\`) — handy in containers and CI; secrets go here, not in files committed to git.
4. **Command-line flags** for one-off overrides.

Merge in that order, validate the final values once, and offer a way to show the effective config (\`tool config show\`).`,
        },
        {
          title: "Logging for tools",
          body: `\`\`\`python
log = logging.getLogger("mytool")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s", stream=sys.stderr)
log.debug("details for -v");  log.info("progress");  log.warning("odd but OK");  log.error("failed")
\`\`\`

Map \`-v\`/\`-q\` flags to levels (DEBUG/WARNING). Libraries should only create loggers (never call basicConfig); the application configures handlers.`,
        },
        {
          title: "Installable commands",
          body: `\`\`\`toml
[project.scripts]
csvfilter = "csvfilter.cli:main"
\`\`\`

After \`pip install .\` (or \`pipx install .\` for isolated tools), typing \`csvfilter\` runs \`csvfilter.cli.main()\`; its return value becomes the exit code.`,
        },
      ],
      example: {
        title: "Merging configuration and configuring logging",
        code: r`import configparser, logging, sys, tomllib

DEFAULTS = {"timeout": 10, "retries": 3, "output": "table", "verbose": False}

FILE_TOML = """
[mytool]
timeout = 20
output = "json"
"""
ENV = {"MYTOOL_RETRIES": "5", "HOME": "/home/asha"}
CLI = {"timeout": 45, "verbose": True}

def from_env(env, prefix="MYTOOL_"):
    out = {}
    for key, value in env.items():
        if key.startswith(prefix):
            name = key[len(prefix):].lower()
            out[name] = int(value) if value.isdigit() else value
    return out

layers = [("defaults", DEFAULTS), ("file", tomllib.loads(FILE_TOML)["mytool"]), ("env", from_env(ENV)), ("cli", CLI)]
config, source = {}, {}
for name, values in layers:
    for key, value in values.items():
        config[key], source[key] = value, name
for key in sorted(config):
    print(f"{key:<8} = {config[key]!s:<6} (from {source[key]})")

ini = configparser.ConfigParser()
ini.read_string("[mytool]\ntimeout = 20\nverbose = yes\n")
print("ini:", ini.getint("mytool", "timeout"), ini.getboolean("mytool", "verbose"))

log = logging.getLogger("mytool")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(levelname)-7s %(name)s: %(message)s"))
log.addHandler(handler)
log.setLevel(logging.DEBUG if config["verbose"] else logging.INFO)
log.debug("using timeout=%s", config["timeout"])
log.info("fetched 3 records")
log.warning("retrying (%d left)", config["retries"] - 1)`,
        output: "output   = json   (from file)\nretries  = 5      (from env)\ntimeout  = 45     (from cli)\nverbose  = True   (from cli)\nini: 20 True\nDEBUG   mytool: using timeout=45\nINFO    mytool: fetched 3 records\nWARNING mytool: retrying (4 left)\n",
        lines: [
          [3, "Layer 1: defaults in code."],
          [5, "Layer 2: a config file (TOML), parsed with tomllib."],
          [10, "Layer 3: environment variables with a tool-specific prefix."],
          [11, "Layer 4: command-line flags (as argparse would produce them)."],
          [21, "Later layers override earlier ones…"],
          [24, "…and we remember where each value came from — great for 'config show'."],
          [31, "configparser reads INI files and converts types on request."],
          [37, "The -v flag (verbose) turns on DEBUG messages."],
        ],
      },
      mistakes: [
        { title: "Secrets in config files committed to git", body: "Keep tokens in environment variables or a secrets manager; commit an example file without real values." },
        { title: "No way to see the effective config", body: "When four layers interact, users need `--show-config` (with secrets masked) to debug." },
        { title: "Calling logging.basicConfig in a library", body: "It hijacks the application's logging. Libraries just use `logging.getLogger(__name__)`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`defaults = {"color": "auto", "width": 80}
file_cfg = {"width": 100}
env_cfg = {"color": "never"}
cli = {"width": 120}
merged = {**defaults, **file_cfg, **env_cfg, **cli}
print(merged)`,
          answer: "{'color': 'never', 'width': 120}\n",
          hint: "Later dicts override earlier keys.",
          explain: "width ends at 120 (cli beats file); color comes from env ('never').",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Show INFO messages and above, but not DEBUG.",
          code: r`import logging, sys
log = logging.getLogger("demo")
log.addHandler(logging.StreamHandler(sys.stdout))
log.setLevel(logging.___)
log.debug("hidden")
log.info("shown")`,
          blanks: [["INFO"]],
          output: "shown\n",
          hint: "The level named after the messages you want.",
          explain: "Setting the level to INFO filters out DEBUG messages.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "The environment variable should override the config file, but the file wins because the layers are merged in the wrong order. Which line is wrong?",
          code: r`defaults = {"timeout": 10}
file_cfg = {"timeout": 20}
env_cfg = {"timeout": 60}
config = {**defaults, **env_cfg, **file_cfg}
print(config["timeout"])`,
          line: 4,
          fix: r`defaults = {"timeout": 10}
file_cfg = {"timeout": 20}
env_cfg = {"timeout": 60}
config = {**defaults, **file_cfg, **env_cfg}
print(config["timeout"])`,
          output: "60\n",
          hint: "The last dict wins.",
          explain: "Merge from least to most specific: defaults, file, environment (then CLI).",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "What does `[project.scripts] csvfilter = \"csvfilter.cli:main\"` do when the package is installed?",
          options: [
            { text: "Creates a `csvfilter` command that runs main() from csvfilter/cli.py", why: "Correct." },
            { text: "Runs main() during installation", why: "It runs only when the command is used." },
            { text: "Adds csvfilter to requirements.txt", why: "Unrelated." },
          ],
          answer: 0,
          hint: "Entry points.",
          explain: "pip generates a small launcher script (csvfilter / csvfilter.exe) that imports the module and calls the function.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Effective config with sources", difficulty: 3,
          prompt: `Merge configuration for a tool: defaults are \`host=localhost\`, \`port=8000\`, \`debug=false\`, \`workers=2\`. Input sections, each until the next header or \`end\`: \`[file]\` with \`key = value\` lines, \`[env]\` with \`APP_KEY=value\` lines (prefix APP_, case-insensitive key), \`[cli]\` with \`--key value\` lines. Convert \`port\`/\`workers\` to int and \`debug\` to bool (true/yes/1); unknown keys print \`warning: unknown setting <key>\` (as they're read) and are ignored. Finally print each setting sorted by name as \`key=value (source)\`.`,
          starter: r`DEFAULTS = {"host": "localhost", "port": 8000, "debug": False, "workers": 2}
`,
          tests: [
            { label: "Layers", input: "[file]\nport = 9000\nworkers = 4\ncolour = blue\n[env]\nAPP_DEBUG=yes\nAPP_PORT=9100\nPATH=/usr/bin\n[cli]\n--workers 8\nend\n", output: "warning: unknown setting colour\ndebug=True (env)\nhost=localhost (default)\nport=9100 (env)\nworkers=8 (cli)" },
          ],
          hints: [
            "Track the current section from header lines.",
            "Parse each line into (key, raw) according to its section's format; ignore env vars without the APP_ prefix.",
            "A convert(key, raw) helper handles int and bool settings.",
            "Store values and their source in two dicts, starting from defaults.",
          ],
          solution: r`DEFAULTS = {"host": "localhost", "port": 8000, "debug": False, "workers": 2}

def convert(key, raw):
    if key in ("port", "workers"):
        return int(raw)
    if key == "debug":
        return raw.strip().lower() in ("true", "yes", "1")
    return raw.strip()

config = dict(DEFAULTS)
source = {k: "default" for k in DEFAULTS}
section = None
while (line := input()) != "end":
    if line.startswith("[") and line.endswith("]"):
        section = line[1:-1]
        continue
    if section == "file":
        key, _, raw = line.partition("=")
    elif section == "env":
        name, _, raw = line.partition("=")
        if not name.upper().startswith("APP_"):
            continue
        key = name[4:]
    else:
        key, _, raw = line.partition(" ")
        key = key.lstrip("-")
    key = key.strip().lower()
    if key not in DEFAULTS:
        print(f"warning: unknown setting {key}")
        continue
    config[key], source[key] = convert(key, raw), section

for key in sorted(config):
    print(f"{key}={config[key]} ({source[key]})")`,
          notes: "Showing the source of every value turns 'why is it using port 9100?!' from a mystery into a one-line answer.",
        },
        {
          id: "stretch", kind: "task", title: "Verbosity flags and log output", difficulty: 4,
          prompt: `A tool accepts \`-v\` (repeatable) and \`-q\`. Level mapping: \`-q\` → ERROR; none → WARNING; \`-v\` → INFO; \`-vv\` or more → DEBUG. Using argparse (\`action="count"\` for -v) and the logging module with a stdout handler formatted as \`%(levelname)s: %(message)s\`, process each input line of arguments (until \`end\`): print \`== <args or (none)> -> <LEVEL>\`, then log the four messages \`debug details\`, \`info progress\`, \`warning disk 85% full\`, \`error upload failed\` at their levels, so only the enabled ones appear. Reuse one logger across lines, without adding duplicate handlers.`,
          starter: r`import argparse, logging, shlex, sys
`,
          tests: [
            { label: "Levels", input: "\n-v\n-vv\n-q\nend\n", output: "== (none) -> WARNING\nWARNING: warning disk 85% full\nERROR: error upload failed\n== -v -> INFO\nINFO: info progress\nWARNING: warning disk 85% full\nERROR: error upload failed\n== -vv -> DEBUG\nDEBUG: debug details\nINFO: info progress\nWARNING: warning disk 85% full\nERROR: error upload failed\n== -q -> ERROR\nERROR: error upload failed" },
          ],
          hints: [
            "`parser.add_argument(\"-v\", \"--verbose\", action=\"count\", default=0)`.",
            "Compute the level from args, then `log.setLevel(level)`.",
            "Add the handler once, before the loop.",
            "Note: logging uses %-formatting, so write 85%% in a format string — or pass the message as a plain string.",
          ],
          solution: r`import argparse, logging, shlex, sys

parser = argparse.ArgumentParser(prog="tool")
parser.add_argument("-v", "--verbose", action="count", default=0)
parser.add_argument("-q", "--quiet", action="store_true")

log = logging.getLogger("tool")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
log.addHandler(handler)
log.propagate = False

def level_for(args):
    if args.quiet:
        return logging.ERROR
    return {0: logging.WARNING, 1: logging.INFO}.get(args.verbose, logging.DEBUG)

while (line := input()) != "end":
    args = parser.parse_args(shlex.split(line))
    level = level_for(args)
    log.setLevel(level)
    print(f"== {line or '(none)'} -> {logging.getLevelName(level)}")
    log.debug("debug details")
    log.info("info progress")
    log.warning("warning disk 85% full")
    log.error("error upload failed")`,
          notes: "`-v`, `-vv`, `-q` is a convention users already know from tools like pip and ssh. Logging the same events at the right levels means you never have to add and remove print statements again.",
        },
      ],
      realWorld: "Docker, kubectl and pip all layer config from files, environment variables and flags; twelve-factor apps take configuration from the environment; pipx installs Python CLIs in their own isolated environments.",
      reteach: "Configuration layers are like a school's rules: the national syllabus (defaults), the school handbook (config file), the class notice board (environment) and what the teacher says today (flags). When they disagree, the most specific, most recent instruction wins — and a good student can tell you which rule they're following.",
      summary: [
        "Merge config: defaults < file < environment < CLI; validate once; show sources (mask secrets).",
        "Logging: levels DEBUG < INFO < WARNING < ERROR; -v/-q map to levels; apps configure handlers, libraries don't.",
        "[project.scripts] turns a function into an installable command; install CLIs with pipx.",
      ],
      version: "tomllib: Python 3.11+",
      libraryCode: [{
        title: "Make it a real command",
        code: `# pyproject.toml
[project]
name = "csvfilter"
version = "0.1.0"
requires-python = ">=3.11"

[project.scripts]
csvfilter = "csvfilter.cli:run"

# src/csvfilter/cli.py
import sys
def run():
    sys.exit(main(sys.argv[1:], sys.stdin, sys.stdout, sys.stderr))

# terminal:
#   pipx install .
#   type marks.csv | csvfilter marks gt 70 --select name,marks`,
        note: "Run on your own computer. pipx gives each tool its own virtual environment while putting the command on your PATH.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "A CI step runs `python check.py`, which prints 'FAILED: 3 problems' and exits with code 0. What happens?",
      options: [
        { text: "CI marks the step as failed", why: "It only sees exit code 0." },
        { text: "CI treats it as a success and carries on", why: "Correct." },
        { text: "CI reads the text and decides", why: "CI relies on exit codes." },
      ],
      answer: 1,
      hint: "What does 0 mean?",
      explain: "Exit codes are the contract; failures must exit non-zero.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import shlex
print(shlex.split('add "Buy milk" --priority high'))`,
      answer: "['add', 'Buy milk', '--priority', 'high']\n",
      hint: "Quotes group words like a shell does.",
      explain: "shlex.split respects quotes: 'Buy milk' is one argument.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Count how many times -v was given.",
      code: r`import argparse
p = argparse.ArgumentParser()
p.add_argument("-v", action="___", default=0)
print(p.parse_args(["-vvv"]).v)`,
      blanks: [["count"]],
      output: "3\n",
      hint: "It counts.",
      explain: "`action=\"count\"` adds 1 each time the flag appears (-vvv = 3).",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: minigrep", difficulty: 4,
    prompt: `Build \`minigrep PATTERN FILE... [-i] [-n] [-c] [-v] [--max N]\` with argparse, searching a set of in-memory files (the sandbox's files are given in the input). Input: blocks \`FILE name\` followed by lines, then \`ARGS <command line>\` (several ARGS lines allowed), then \`end\`. For each ARGS line run \`main(argv)\` and print its output, then \`exit <code>\`.

Rules: PATTERN is a regular expression (\`-i\` ignore case); \`-v\` selects non-matching lines; \`-n\` prefixes line numbers; with several files, prefix \`name:\`; \`-c\` prints counts (\`name:count\` per file); \`--max N\` stops after N matches per file. Exit 0 if anything matched, 1 if nothing matched, 2 for errors: unknown file (\`minigrep: <name>: no such file\`, other files still searched) or an invalid regex (\`minigrep: bad pattern\`). Error messages are printed too (prefix them with \`[stderr] \`).`,
    starter: r`import argparse, re, shlex
`,
    tests: [
      { label: "Searches", input: "FILE notes.txt\nPython is fun\npython has batteries\nJava is verbose\nFILE todo.txt\nlearn Python decorators\nbuy milk\nARGS python notes.txt\nARGS -i -n python notes.txt todo.txt\nARGS -c -v python notes.txt todo.txt\nARGS -i --max 1 python notes.txt\nARGS ruby notes.txt\nARGS -i python missing.txt todo.txt\nARGS [unclosed notes.txt\nend\n", output: "python has batteries\nexit 0\nnotes.txt:1:Python is fun\nnotes.txt:2:python has batteries\ntodo.txt:1:learn Python decorators\nexit 0\nnotes.txt:2\ntodo.txt:2\nexit 0\nPython is fun\nexit 0\nexit 1\n[stderr] minigrep: missing.txt: no such file\ntodo.txt:learn Python decorators\nexit 2\n[stderr] minigrep: bad pattern\nexit 2" },
    ],
    hints: [
      "Collect FILE blocks into a dict {name: [lines]} and ARGS lines into a list.",
      "parser: pattern, files (nargs='+'), -i, -n, -c, -v (store_true), --max (type=int).",
      "Compile with re.compile(pattern, re.IGNORECASE if args.i else 0) inside try/except re.error.",
      "Track matched_any and had_error to choose the exit code (2 beats 0/1 when an error happened).",
    ],
    solution: r`import argparse, re, shlex

files, commands, current = {}, [], None
while (line := input()) != "end":
    if line.startswith("FILE "):
        current = line[5:]
        files[current] = []
    elif line.startswith("ARGS "):
        commands.append(line[5:])
    else:
        files[current].append(line)

parser = argparse.ArgumentParser(prog="minigrep")
parser.add_argument("pattern")
parser.add_argument("files", nargs="+")
parser.add_argument("-i", action="store_true", help="ignore case")
parser.add_argument("-n", action="store_true", help="show line numbers")
parser.add_argument("-c", action="store_true", help="count matching lines")
parser.add_argument("-v", action="store_true", help="select non-matching lines")
parser.add_argument("--max", type=int, default=None, metavar="N")

def main(argv):
    args = parser.parse_args(argv)
    try:
        regex = re.compile(args.pattern, re.IGNORECASE if args.i else 0)
    except re.error:
        print("[stderr] minigrep: bad pattern")
        return 2
    many = len(args.files) > 1
    matched_any, had_error = False, False
    for name in args.files:
        if name not in files:
            print(f"[stderr] minigrep: {name}: no such file")
            had_error = True
            continue
        count = 0
        for number, text in enumerate(files[name], 1):
            if args.max is not None and count >= args.max:
                break
            if bool(regex.search(text)) != args.v:
                count += 1
                if not args.c:
                    prefix = (f"{name}:" if many else "") + (f"{number}:" if args.n else "")
                    print(prefix + text)
        if args.c:
            print(f"{name}:{count}" if many else count)
        matched_any = matched_any or count > 0
    if had_error:
        return 2
    return 0 if matched_any else 1

for command in commands:
    print("exit", main(shlex.split(command)))`,
    notes: "This mirrors real grep's conventions (exit 0/1/2, name: prefixes, -c/-v/-n/-i), so it composes with other tools. To ship it: read real files with pathlib (handling encodings and binary files), stream large files line by line, write errors to sys.stderr, and add a [project.scripts] entry point.",
  },
};
