import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 30 — Packaging and environments. */
export const M30: PyModuleDef = {
  id: "py-packaging",
  number: 30,
  level: 4,
  title: "Packaging and Environments",
  summary: "Virtual environments; dependency management; pip; requirements files; package versions; dependency conflicts; reproducible environments; project structure; pyproject.toml; building packages; publishing concepts; semantic versioning.",
  track: "core",
  optionalNote: "Everyone who installs packages needs virtual environments; building and publishing packages matters once you share code.",
  prereqs: ["py-modules"],
  lessons: [
    {
      id: "py-venv-deps",
      title: "Virtual environments and dependencies",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Create and use a virtual environment",
        "Install, pin and record dependencies with pip",
        "Recognise and resolve dependency conflicts",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Project A needs Django 4.2 and project B needs Django 5.1 on the same laptop. What's the clean solution?",
        options: [
          { text: "Install both globally and hope", why: "Only one version can be installed per environment." },
          { text: "A separate virtual environment for each project", why: "Correct." },
          { text: "Copy Django's source into each project", why: "Hard to maintain and update." },
        ],
        answer: 1,
        hint: "Isolation per project.",
        explain: "Each virtual environment has its own site-packages, so each project gets exactly the versions it needs.",
      },
      why: "\"It works on my machine\" usually means different package versions. Virtual environments isolate each project's packages, and pinned requirement files let anyone — a teammate, a server, CI — recreate the exact same setup.",
      concept: [
        {
          title: "Virtual environments",
          body: `\`\`\`bash
python -m venv .venv                 # create (once per project)
.venv\\Scripts\\activate               # Windows
source .venv/bin/activate            # macOS / Linux
python -m pip install requests       # installs into .venv only
deactivate
\`\`\`

- A venv is a folder with its own \`python\` and \`site-packages\`.
- Never commit \`.venv\` to git — add it to \`.gitignore\`; commit the requirements file instead.
- Inside Python, \`sys.prefix != sys.base_prefix\` tells you a venv is active.`,
        },
        {
          title: "Requirements and pinning",
          body: `\`\`\`text
requests==2.32.3        # pinned: exactly this version (reproducible)
rich>=13,<14            # range: any 13.x
python-dotenv           # unpinned: whatever is newest (risky)
\`\`\`

- \`pip freeze > requirements.txt\` records exact versions of everything installed.
- \`pip install -r requirements.txt\` recreates them.
- Tools like **pip-tools**, **Poetry** and **uv** keep a short list of direct dependencies and generate a full **lock file**.

**Version specifiers**: \`==\`, \`!=\`, \`>=\`, \`<\`, \`~=\` (compatible release: \`~=2.3\` means \`>=2.3, <3.0\`).`,
        },
        {
          title: "Dependency conflicts",
          body: `If package A needs \`urllib3<2\` and package B needs \`urllib3>=2\`, no single version satisfies both — pip reports a **conflict**. Fixes: upgrade A to a version that supports urllib3 2, pin B to an older version, or split tools into separate environments.

Supply-chain safety: install only packages you trust, double-check names (typo-squatting like \`reqeusts\`), and pin versions so an unexpected new release can't sneak in.`,
        },
      ],
      example: {
        title: "Checking a requirements file",
        code: r`import re

REQUIREMENTS = """
# web app
requests==2.32.3
flask>=3.0,<4
python-dotenv
rich ~= 13.7
numpy==1.26.4
"""

def parse(line):
    line = line.split("#")[0].strip()
    if not line:
        return None
    m = re.match(r"([A-Za-z0-9_.-]+)\s*(.*)", line)
    name, spec = m.group(1).lower(), m.group(2).replace(" ", "")
    return name, spec

pinned, ranged, loose = [], [], []
for raw in REQUIREMENTS.splitlines():
    item = parse(raw)
    if item is None:
        continue
    name, spec = item
    if spec.startswith("=="):
        pinned.append(name)
    elif spec:
        ranged.append(f"{name}{spec}")
    else:
        loose.append(name)
print("pinned:", pinned)
print("ranges:", ranged)
print("UNPINNED:", loose)`,
        output: "pinned: ['requests', 'numpy']\nranges: ['flask>=3.0,<4', 'rich~=13.7']\nUNPINNED: ['python-dotenv']\n",
        lines: [
          [3, "A requirements file: comments, exact pins, ranges and one unpinned package."],
          [13, "Ignore comments and blank lines."],
          [16, "Split the package name from its version specifier."],
          [26, "`==` means pinned exactly — reproducible installs."],
          [28, "Ranges allow compatible updates; loose names take whatever is newest."],
        ],
      },
      mistakes: [
        { title: "Installing into the global Python", body: "Global installs collide between projects and can break system tools. Always activate a venv first." },
        { title: "Committing the venv folder", body: "It's large and machine-specific. Commit requirements.txt / pyproject + lock file instead." },
        { title: "`pip` vs the wrong Python", body: "`pip` might belong to a different interpreter. `python -m pip` always installs for the python you're running." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`lines = ["requests==2.32.3", "flask>=3", "# dev tools", "pytest", ""]
deps = [l for l in lines if l and not l.startswith("#")]
print(len(deps), [d for d in deps if "==" in d])`,
          answer: "3 ['requests==2.32.3']\n",
          hint: "Blank and comment lines are dropped.",
          explain: "Three real requirements remain; only requests is pinned with ==.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "The command that records exact installed versions (just the pip sub-command).",
          code: r`command = "pip ___ > requirements.txt"
print(command)`,
          blanks: [["freeze"]],
          output: "pip freeze > requirements.txt\n",
          hint: "It 'freezes' the current state.",
          explain: "`pip freeze` lists every installed package as name==version.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "This check should flag the typo-squatted package `reqeusts`, but it compares names with different capitalisation and misses `Reqeusts`. Which line should normalise the name?",
          code: r`SUSPICIOUS = {"reqeusts", "beautifulsoup", "python-sqlite"}
deps = ["Reqeusts==2.0", "flask==3.0"]
for dep in deps:
    name = dep.split("==")[0]
    print(name, "SUSPICIOUS" if name in SUSPICIOUS else "ok")`,
          line: 4,
          fix: r`SUSPICIOUS = {"reqeusts", "beautifulsoup", "python-sqlite"}
deps = ["Reqeusts==2.0", "flask==3.0"]
for dep in deps:
    name = dep.split("==")[0].lower()
    print(name, "SUSPICIOUS" if name in SUSPICIOUS else "ok")`,
          output: "reqeusts SUSPICIOUS\nflask ok\n",
          hint: "Package names on PyPI are case-insensitive.",
          explain: "PyPI treats Reqeusts and reqeusts as the same name, so normalise with .lower() before comparing.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "`rich~=13.7` allows which versions?",
          options: [
            { text: "Only 13.7", why: "That's ==13.7." },
            { text: "13.7 and later 13.x releases, but not 14", why: "Correct: compatible release." },
            { text: "Any version ≥ 13.7, including 14 and 15", why: "That's >=13.7." },
          ],
          answer: 1,
          hint: "~= = compatible release.",
          explain: "`~=13.7` means >=13.7, ==13.* — newer minor/patch releases, no new major.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Requirements auditor", difficulty: 3,
          prompt: `Read requirement lines until \`end\` (ignore blank lines and \`#\` comments; strip inline comments). For each package print \`name: pinned\`, \`name: range\` or \`name: UNPINNED\`, in input order, with names lowercased. Report duplicates (the same name twice) as \`name: DUPLICATE\` instead. Finally print \`reproducible: True\` only if every package is pinned and there are no duplicates.`,
          starter: r`import re
`,
          tests: [
            { label: "Mixed", input: "requests==2.32.3\n# tools\nFlask>=3.0\n\nrich\nrequests==2.31.0  # old\nend\n", output: "requests: pinned\nflask: range\nrich: UNPINNED\nrequests: DUPLICATE\nreproducible: False" },
            { label: "All pinned", input: "a==1.0\nb==2.0\nend\n", output: "a: pinned\nb: pinned\nreproducible: True", hidden: true },
          ],
          hints: [
            "Strip comments with `line.split(\"#\")[0].strip()`.",
            "The name is the leading run of letters, digits, `.`, `_`, `-`.",
            "Keep a `seen` set for duplicates.",
            "reproducible = all pinned and no duplicates.",
          ],
          solution: r`import re

seen = set()
reproducible = True
while (raw := input()) != "end":
    line = raw.split("#")[0].strip()
    if not line:
        continue
    m = re.match(r"([A-Za-z0-9_.-]+)\s*(.*)", line)
    name, spec = m.group(1).lower(), m.group(2).replace(" ", "")
    if name in seen:
        print(f"{name}: DUPLICATE")
        reproducible = False
        continue
    seen.add(name)
    if spec.startswith("=="):
        print(f"{name}: pinned")
    elif spec:
        print(f"{name}: range")
        reproducible = False
    else:
        print(f"{name}: UNPINNED")
        reproducible = False
print("reproducible:", reproducible)`,
          notes: "Real tools (pip-audit, pip-tools, uv) go further: they resolve the full dependency tree and check known vulnerabilities.",
        },
        {
          id: "stretch", kind: "task", title: "Find a version conflict", difficulty: 4,
          prompt: `Each input line \`package needs dep OP version\` (OP is \`>=\` or \`<\`, versions like \`1.26\`) states a constraint, until \`end\`. Then one line lists the available versions of \`dep\` (space-separated). For each dependency mentioned, print the **highest available version satisfying all constraints** as \`dep -> version\`, or \`dep -> CONFLICT (a, b)\` naming the packages whose constraints were involved (in input order). Compare versions as tuples of ints.`,
          starter: r`def vtuple(text):
    return tuple(int(p) for p in text.split("."))
`,
          tests: [
            { label: "Satisfiable", input: "pandas needs numpy >= 1.22\nscipy needs numpy < 2.0\nend\n1.21.0 1.24.4 1.26.4 2.0.1\n", output: "numpy -> 1.26.4" },
            { label: "Conflict", input: "old-lib needs urllib3 < 2.0\nnew-sdk needs urllib3 >= 2.2\nend\n1.26.18 2.2.1\n", output: "urllib3 -> CONFLICT (old-lib, new-sdk)", hidden: true },
          ],
          hints: [
            "Parse with `pkg, _, dep, op, ver = line.split()`.",
            "Store constraints per dep: list of (pkg, op, vtuple(ver)).",
            "A version passes if for every constraint: >= means v >= bound, < means v < bound.",
            "Take max(candidates, key=vtuple) or report the conflict.",
          ],
          solution: r`def vtuple(text):
    return tuple(int(p) for p in text.split("."))

constraints = {}
while (line := input()) != "end":
    pkg, _, dep, op, ver = line.split()
    constraints.setdefault(dep, []).append((pkg, op, vtuple(ver)))
available = input().split()

def ok(version, rules):
    v = vtuple(version)
    for _, op, bound in rules:
        if op == ">=" and not v >= bound:
            return False
        if op == "<" and not v < bound:
            return False
    return True

for dep, rules in constraints.items():
    candidates = [v for v in available if ok(v, rules)]
    if candidates:
        print(f"{dep} -> {max(candidates, key=vtuple)}")
    else:
        print(f"{dep} -> CONFLICT ({', '.join(p for p, _, _ in rules)})")`,
          notes: "This is a tiny version of what pip's resolver does across hundreds of packages. Note that (1, 26, 4) < (2, 0) works because tuples compare element by element — string comparison would get '10.0' < '9.0' wrong.",
        },
      ],
      realWorld: "Every deployable Python app ships a pinned requirements or lock file; Docker images run `pip install -r requirements.txt`; security teams scan those files for vulnerable versions.",
      reteach: "A virtual environment is a separate toolbox for each job: the bike-repair box and the plumbing box don't mix spanners. The requirements file is the box's packing list with exact models written down, so anyone can pack an identical box.",
      summary: [
        "One venv per project: `python -m venv .venv`, activate, `python -m pip install …`.",
        "Pin versions (==) in requirements/lock files for reproducible installs; don't commit the venv.",
        "Conflicts happen when constraints can't all be satisfied — upgrade, pin or separate environments.",
      ],
      libraryCode: [{
        title: "Day-to-day environment commands",
        code: `python -m venv .venv
.venv\\Scripts\\activate            # Windows (PowerShell: .venv\\Scripts\\Activate.ps1)
python -m pip install requests rich
python -m pip freeze > requirements.txt
python -m pip install -r requirements.txt
# faster modern alternative:
pip install uv && uv venv && uv pip install -r requirements.txt`,
        note: "Run in a terminal on your own computer. The CodeMentor sandbox has no internet and doesn't allow pip installs, which is also why exercises stick to the standard library.",
      }],
    },

    {
      id: "py-project-structure",
      title: "Project structure, pyproject.toml and versioning",
      minutes: 16,
      difficulty: 3,
      objectives: [
        "Lay out a project with a src/ package, tests and pyproject.toml",
        "Read the key sections of pyproject.toml",
        "Apply semantic versioning to releases",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "A library goes from 2.4.1 to 3.0.0. Under semantic versioning, what does that signal?",
        options: [
          { text: "Only bug fixes", why: "That would be 2.4.2." },
          { text: "Breaking changes — code using 2.x may need updates", why: "Correct." },
          { text: "New features that are backwards compatible", why: "That would be 2.5.0." },
        ],
        answer: 1,
        hint: "MAJOR.MINOR.PATCH.",
        explain: "A major version bump announces incompatible API changes.",
      },
      why: "Once code is shared — with a team, on PyPI or on a server — it needs a standard shape: where the code lives, how it's installed, what it depends on and which version it is. pyproject.toml is the single modern file that describes all of that.",
      concept: [
        {
          title: "A standard layout",
          body: `\`\`\`text
budget-tool/
├── pyproject.toml          # metadata, dependencies, build system, tool config
├── README.md
├── src/
│   └── budget_tool/
│       ├── __init__.py     # makes it a package; often __version__
│       ├── core.py
│       └── cli.py
└── tests/
    └── test_core.py
\`\`\`

The **src layout** prevents tests from accidentally importing the un-installed folder; you test the package as users would install it (\`pip install -e .\` for development).`,
        },
        {
          title: "pyproject.toml",
          body: `\`\`\`toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "budget-tool"
version = "1.2.0"
requires-python = ">=3.10"
dependencies = ["rich>=13"]

[project.scripts]
budget = "budget_tool.cli:main"     # creates a 'budget' command

[tool.ruff]
line-length = 100
\`\`\`

Python 3.11+ can read TOML with the standard \`tomllib\` module. **Building** (\`python -m build\`) produces a **wheel** (.whl) and a source distribution; **publishing** (\`twine upload\`) sends them to PyPI.`,
        },
        {
          title: "Semantic versioning",
          body: `**MAJOR.MINOR.PATCH**

- PATCH (1.2.0 → 1.2.1): bug fixes only.
- MINOR (1.2.1 → 1.3.0): new features, backwards compatible; reset PATCH.
- MAJOR (1.3.0 → 2.0.0): breaking changes; reset MINOR and PATCH.

Versions 0.x are "anything may change". Compare versions numerically, never as strings ("1.10" > "1.9").`,
        },
      ],
      example: {
        title: "Reading pyproject.toml with tomllib",
        code: r`import tomllib

PYPROJECT = """
[project]
name = "budget-tool"
version = "1.2.0"
requires-python = ">=3.10"
dependencies = ["rich>=13", "python-dateutil==2.9.0"]

[project.scripts]
budget = "budget_tool.cli:main"

[tool.ruff]
line-length = 100
"""

config = tomllib.loads(PYPROJECT)
project = config["project"]
print(project["name"], project["version"])
print("needs Python", project["requires-python"])
for dep in project["dependencies"]:
    print(" -", dep)
for command, target in project["scripts"].items():
    module, func = target.split(":")
    print(f"command '{command}' runs {func}() in {module}")
print("ruff line length:", config["tool"]["ruff"]["line-length"])
print(sorted(["1.10.0", "1.9.2", "1.2.0"], key=lambda v: tuple(map(int, v.split(".")))))`,
        output: "budget-tool 1.2.0\nneeds Python >=3.10\n - rich>=13\n - python-dateutil==2.9.0\ncommand 'budget' runs main() in budget_tool.cli\nruff line length: 100\n['1.2.0', '1.9.2', '1.10.0']\n",
        lines: [
          [1, "tomllib (3.11+) parses TOML into ordinary dicts and lists."],
          [17, "loads parses a string; tomllib.load(f) reads a file opened in binary mode."],
          [23, "[project.scripts] maps a command name to module:function."],
          [26, "Tool settings live under [tool.<name>] in the same file."],
          [27, "Sorting by integer tuples puts 1.10.0 after 1.9.2 — string sorting wouldn't."],
        ],
      },
      mistakes: [
        { title: "Comparing versions as strings", body: "\"1.10\" < \"1.9\" as strings. Convert to integer tuples (or use packaging.version)." },
        { title: "Breaking changes in a minor release", body: "Users pinning `~=1.2` get the new minor version automatically — breaking them violates semver." },
        { title: "Opening TOML in text mode", body: "`tomllib.load` needs a binary file: `open(\"pyproject.toml\", \"rb\")`." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import tomllib
data = tomllib.loads('[project]\nname = "demo"\nversion = "0.3.1"\nkeywords = ["cli", "budget"]')
print(data["project"]["version"], len(data["project"]["keywords"]))`,
          answer: "0.3.1 2\n",
          hint: "TOML arrays become lists.",
          explain: "The version is the string '0.3.1'; keywords is a two-item list.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Sort versions numerically.",
          code: r`versions = ["2.0.0", "10.1.0", "9.9.9"]
print(sorted(versions, key=lambda v: ___(int(p) for p in v.split("."))))`,
          blanks: [["tuple"]],
          output: "['2.0.0', '9.9.9', '10.1.0']\n",
          hint: "A comparable sequence of ints.",
          explain: "Tuples of ints compare element by element, so 10 > 9 correctly.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "A MINOR bump should give 1.5.0, but this gives 1.5.3. Which line forgets to reset a part?",
          code: r`def bump(version, part):
    major, minor, patch = map(int, version.split("."))
    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.{patch}"
    return f"{major}.{minor}.{patch + 1}"
print(bump("1.4.3", "minor"))`,
          line: 6,
          fix: r`def bump(version, part):
    major, minor, patch = map(int, version.split("."))
    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"
print(bump("1.4.3", "minor"))`,
          output: "1.5.0\n",
          hint: "What happens to PATCH when MINOR increases?",
          explain: "A minor release resets the patch number to 0.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Why do many projects put their package inside a `src/` folder?",
          options: [
            { text: "Python requires it", why: "It doesn't." },
            { text: "So tests run against the installed package, not loose files in the project root", why: "Correct." },
            { text: "It makes imports faster", why: "No speed difference." },
          ],
          answer: 1,
          hint: "What can tests accidentally import?",
          explain: "With a src layout, `import budget_tool` only works once the package is installed, so packaging mistakes show up in tests.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Semantic version bumper", difficulty: 3,
          prompt: `Read a starting version, then change types until \`end\`: \`fix\` (patch), \`feature\` (minor) or \`breaking\` (major). Apply them in order and print the version after each step as \`<type> -> <version>\`. Invalid versions (not three non-negative integers) print \`invalid version\` and stop.`,
          starter: r`def bump(version, change):
    pass
`,
          tests: [
            { label: "Sequence", input: "1.4.3\nfix\nfeature\nfix\nbreaking\nend\n", output: "fix -> 1.4.4\nfeature -> 1.5.0\nfix -> 1.5.1\nbreaking -> 2.0.0" },
            { label: "Invalid", input: "1.x\nfix\nend\n", output: "invalid version", hidden: true, category: "edge" },
          ],
          hints: [
            "Split on '.', check there are 3 parts and each isdigit().",
            "breaking → (major+1).0.0; feature → major.(minor+1).0; fix → patch+1.",
            "Keep the current version in a variable and update it.",
            "Validate before reading the change lines.",
          ],
          solution: r`def bump(version, change):
    major, minor, patch = map(int, version.split("."))
    if change == "breaking":
        return f"{major + 1}.0.0"
    if change == "feature":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"

version = input().strip()
parts = version.split(".")
if len(parts) != 3 or not all(p.isdigit() for p in parts):
    print("invalid version")
else:
    while (change := input()) != "end":
        version = bump(version, change)
        print(f"{change} -> {version}")`,
          notes: "Release tools (bump-my-version, semantic-release) automate exactly this, often deciding the bump from commit messages like `feat:` and `fix:`.",
        },
        {
          id: "stretch", kind: "task", title: "pyproject checker", difficulty: 4,
          prompt: `Read a pyproject.toml from input (lines until \`END\`) and parse it with tomllib. Report problems, one per line, in this order:
- \`missing [project]\` (then stop checking)
- \`missing name\` / \`missing version\`
- \`bad version <v>\` if the version isn't MAJOR.MINOR.PATCH digits
- \`unpinned dependency <d>\` for each dependency without any of \`=<>~!\`
- \`no requires-python\`

Print \`OK\` if there are no problems. Invalid TOML prints \`invalid TOML\`.`,
          starter: r`import tomllib
`,
          tests: [
            { label: "Problems", input: "[project]\nname = \"demo\"\nversion = \"1.0\"\ndependencies = [\"rich>=13\", \"requests\"]\nEND\n", output: "bad version 1.0\nunpinned dependency requests\nno requires-python" },
            { label: "Good", input: "[project]\nname = \"ok\"\nversion = \"0.1.0\"\nrequires-python = \">=3.10\"\ndependencies = [\"rich==13.7.1\"]\nEND\n", output: "OK", hidden: true },
            { label: "Broken TOML", input: "[project\nEND\n", output: "invalid TOML", hidden: true, category: "edge" },
          ],
          hints: [
            "Collect lines, join with \\n, and call tomllib.loads inside try/except tomllib.TOMLDecodeError.",
            "Use dict.get for optional keys.",
            "A version is valid if it splits into exactly three digit-only parts.",
            "`any(ch in dep for ch in \"=<>~!\")` detects a specifier.",
          ],
          solution: r`import tomllib

lines = []
while (line := input()) != "END":
    lines.append(line)
try:
    config = tomllib.loads("\n".join(lines))
except tomllib.TOMLDecodeError:
    print("invalid TOML")
    raise SystemExit
problems = []
project = config.get("project")
if project is None:
    problems.append("missing [project]")
else:
    if "name" not in project:
        problems.append("missing name")
    version = project.get("version")
    if version is None:
        problems.append("missing version")
    else:
        parts = version.split(".")
        if len(parts) != 3 or not all(p.isdigit() for p in parts):
            problems.append(f"bad version {version}")
    for dep in project.get("dependencies", []):
        if not any(ch in dep for ch in "=<>~!"):
            problems.append(f"unpinned dependency {dep}")
    if "requires-python" not in project:
        problems.append("no requires-python")
print("\n".join(problems) if problems else "OK")`,
          notes: "Semver's three numbers are a convention, not a packaging rule (PEP 440 also allows 1.0 and 2.0rc1). Teams add checks like this to CI so releases follow their policy.",
        },
      ],
      realWorld: "Every library on PyPI has a pyproject.toml; internal company packages are published to private indexes the same way; CLI tools like black and ruff are installed through [project.scripts] entry points.",
      reteach: "pyproject.toml is a product label: name, version, ingredients (dependencies), how to assemble it (build system) and the instructions on the side (tool settings). Semantic versioning is the label's warning system: a new patch number = same product, fixed; minor = new extras; major = it works differently now, read the manual.",
      summary: [
        "Standard layout: pyproject.toml, src/<package>/, tests/; install in development with `pip install -e .`.",
        "pyproject holds metadata, dependencies, entry points and tool config; tomllib (3.11+) reads it.",
        "SemVer MAJOR.MINOR.PATCH; compare versions numerically; build wheels with `python -m build`.",
      ],
      version: "tomllib: Python 3.11+",
      libraryCode: [{
        title: "Build and publish a package",
        code: `python -m pip install build twine
python -m build                      # creates dist/*.whl and dist/*.tar.gz
python -m twine upload --repository testpypi dist/*   # practise on TestPyPI first
pip install -e .                     # editable install while developing`,
        note: "Run on your own computer with an account on (Test)PyPI. Publishing makes your code public — check that no secrets or private data are included first.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "Which file should you commit so others can recreate your environment?",
      options: [
        { text: "The .venv folder", why: "Machine-specific and huge." },
        { text: "requirements.txt or pyproject.toml plus a lock file", why: "Correct." },
        { text: "Nothing — they can guess the versions", why: "That's how 'works on my machine' bugs happen." },
      ],
      answer: 1,
      hint: "A recipe, not the cooked meal.",
      explain: "Commit the list of dependencies with versions; others build their own venv from it.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`print("1.10.0" > "1.9.0", (1, 10, 0) > (1, 9, 0))`,
      answer: "False True\n",
      hint: "Strings compare character by character.",
      explain: "As strings, '1' == '1', '.' == '.', then '1' < '9' → False. As tuples, 10 > 9 → True.",
    },
    {
      id: "e3", kind: "fill", difficulty: 2,
      prompt: "Create a virtual environment in the folder .venv.",
      code: r`cmd = "python -m ___ .venv"
print(cmd)`,
      blanks: [["venv"]],
      output: "python -m venv .venv\n",
      hint: "The built-in module's name.",
      explain: "`python -m venv .venv` creates the environment.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: release-notes generator", difficulty: 4,
    prompt: `Generate the next release from commit messages. Input: the current version, then commit lines until \`end\`. Commits use prefixes: \`feat:\` (feature), \`fix:\` (bug fix), \`docs:\`/\`chore:\` (no release), and any commit containing \`BREAKING\` is a breaking change.

Decide the bump: any breaking → major; else any feat → minor; else any fix → patch; else no release. Print:
\`\`\`
1.4.3 -> 2.0.0
Breaking:
- <message without prefix>
Features:
- ...
Fixes:
- ...
\`\`\`
Only print sections that have entries (in that order; breaking commits are listed only under Breaking). If there's nothing to release, print \`no release (N commits skipped)\`.`,
    starter: r`def next_version(version, bump):
    pass
`,
    tests: [
      { label: "Major", input: "1.4.3\nfeat: export to CSV\nfix: crash on empty file\ndocs: update README\nfeat: BREAKING drop Python 3.8\nend\n", output: "1.4.3 -> 2.0.0\nBreaking:\n- BREAKING drop Python 3.8\nFeatures:\n- export to CSV\nFixes:\n- crash on empty file" },
      { label: "Patch", input: "0.9.1\nfix: typo in output\nchore: bump deps\nend\n", output: "0.9.1 -> 0.9.2\nFixes:\n- typo in output", hidden: true },
      { label: "Nothing", input: "2.0.0\ndocs: add examples\nchore: tidy\nend\n", output: "no release (2 commits skipped)", hidden: true, category: "edge" },
    ],
    hints: [
      "Split each commit at the first ': ' into prefix and message.",
      "Check 'BREAKING' in the whole line first.",
      "Collect breaking, features and fixes lists; count others.",
      "Bump: major if breaking, minor if features, patch if fixes.",
    ],
    solution: r`def next_version(version, bump):
    major, minor, patch = map(int, version.split("."))
    if bump == "major":
        return f"{major + 1}.0.0"
    if bump == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"

version = input().strip()
breaking, features, fixes = [], [], []
skipped = 0
while (line := input()) != "end":
    prefix, _, message = line.partition(": ")
    if "BREAKING" in line:
        breaking.append(message)
    elif prefix == "feat":
        features.append(message)
    elif prefix == "fix":
        fixes.append(message)
    else:
        skipped += 1

if breaking:
    bump = "major"
elif features:
    bump = "minor"
elif fixes:
    bump = "patch"
else:
    bump = None

if bump is None:
    print(f"no release ({skipped} commits skipped)")
else:
    print(f"{version} -> {next_version(version, bump)}")
    for title, items in (("Breaking", breaking), ("Features", features), ("Fixes", fixes)):
        if items:
            print(f"{title}:")
            for item in items:
                print(f"- {item}")`,
    notes: "This mirrors Conventional Commits + semantic-release, used by many open-source projects. A real release pipeline would also tag git, build wheels, run CI and publish — with human review for major versions.",
  },
};
