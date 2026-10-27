/**
 * Python execution through the real sandbox (the OS's dev backend + harness). These run actual
 * CPython under the job object with a low-integrity token, so they only run where that backend and
 * Python 3.10+ are available.
 */
import os from "node:os";
import { beforeAll, describe, expect, it } from "vitest";
import { executeRequest } from "../worker/sandbox/runner";
import { checkPythonSource } from "../worker/sandbox/policy";
import { createDevBackend } from "../worker/sandbox/backends";
import type { SandboxBackend } from "../worker/sandbox/backends/types";
import type { PythonTrace } from "@/server/execution/protocol";

const backend: SandboxBackend | null = createDevBackend();
const win = process.platform === "win32";
const canRun = Boolean(backend?.compiler && backend?.python);

const run = (source: string, inputs: string[] = [""], extra: { files?: { name: string; content: string }[]; limits?: { timeMs?: number; memoryMb?: number }; mode?: "run" | "trace" } = {}) =>
  executeRequest(backend!, { language: "python", source, tests: inputs.map((input, i) => ({ id: `t${i}`, input })), ...extra });

describe("python source policy", () => {
  it("accepts ordinary programs and rejects bad seed files", () => {
    expect(checkPythonSource("print('hi')")).toEqual({ ok: true });
    expect(checkPythonSource("print(1)", [{ name: "../evil.py", content: "" }]).ok).toBe(false);
    expect(checkPythonSource("print(1)", [{ name: "main.py", content: "" }]).ok).toBe(false);
    expect(checkPythonSource("x = '\u0000'").ok).toBe(false);
  });
});

describe.runIf(canRun)(`python sandbox (${backend?.id} backend)`, () => {
  beforeAll(async () => {
    await backend!.init();
  }, 120_000);

  it("runs a program with input, once per test", async () => {
    const r = await run("n = int(input())\nprint(sum(range(1, n + 1)))", ["3\n", "10\n"]);
    expect(r.compile.status).toBe("success");
    expect(r.tests.map((t) => t.status)).toEqual(["ok", "ok"]);
    expect(r.tests.map((t) => t.stdout.trim())).toEqual(["6", "55"]);
  });

  it("reports a syntax error before running, without machine paths", async () => {
    const r = await run("x = 5\nif x > 3\n    print(x)");
    expect(r.compile.status).toBe("error");
    expect(r.compile.output).toMatch(/File "main\.py", line 2/);
    expect(r.compile.output).toMatch(/SyntaxError/);
    expect(r.compile.output).not.toContain(os.tmpdir());
    expect(r.tests[0].status).toBe("not_run");
  });

  it("turns an uncaught exception into a clean traceback", async () => {
    const r = await run("def f(x):\n    return 10 / x\n\nprint('before')\nprint(f(0))");
    const t = r.tests[0];
    expect(t.status).toBe("runtime_error");
    expect(t.stdout.trim()).toBe("before");
    expect(t.detail).toBe("ZeroDivisionError: division by zero");
    expect(t.stderr).toMatch(/^Traceback/);
    expect(t.stderr).toMatch(/File "main\.py", line 5/);
    expect(t.stderr).not.toMatch(/harness/);
    expect(t.stderr).not.toContain(os.tmpdir());
  });

  it("explains missing input as EOFError", async () => {
    const r = await run("a = input()\nb = input()\nprint(a, b)", ["only-one\n"]);
    expect(r.tests[0].status).toBe("runtime_error");
    expect(r.tests[0].detail).toMatch(/^EOFError/);
  });

  it("respects sys.exit codes", async () => {
    const r = await run("import sys\nprint('x')\nsys.exit(0)");
    expect(r.tests[0].status).toBe("ok");
    const r2 = await run("import sys\nsys.exit(3)");
    expect(r2.tests[0].status).toBe("runtime_error");
    expect(r2.tests[0].exitCode).toBe(3);
  });

  it("stops an infinite loop", async () => {
    const r = await run("while True:\n    pass", [""], { limits: { timeMs: 1000 } });
    expect(r.tests[0].status).toBe("time_limit");
  });

  it("stops a memory bomb", async () => {
    const r = await run("x = []\nwhile True:\n    x.append(' ' * 10_000_000)", [""], { limits: { memoryMb: 128, timeMs: 4000 } });
    expect(["memory_limit", "runtime_error"]).toContain(r.tests[0].status);
    if (r.tests[0].status === "runtime_error") expect(r.tests[0].detail).toMatch(/MemoryError/);
  });

  it("stops an output flood", async () => {
    const r = await run("while True:\n    print('spam' * 100)");
    expect(r.tests[0].status).toBe("output_limit");
  });

  it("prints Unicode and keeps set order repeatable", async () => {
    const src = "print('₹ 100 ✓')\nprint({'pear', 'apple', 'fig', 'kiwi', 'plum'})";
    const [a, b] = await Promise.all([run(src), run(src)]);
    expect(a.tests[0].stdout.split("\n")[0].trim()).toBe("₹ 100 ✓");
    expect(a.tests[0].stdout).toBe(b.tests[0].stdout);
  });

  it("can read and write files in its own folder, with seed files and helper modules", async () => {
    const src = [
      "import csv, json, helpers",
      "from pathlib import Path",
      "rows = list(csv.DictReader(open('marks.csv')))",
      "Path('out.json').write_text(json.dumps({'n': len(rows)}))",
      "print(helpers.double(json.loads(Path('out.json').read_text())['n']))",
      "import tempfile",
      "with tempfile.TemporaryFile() as f:\n    f.write(b'ok')",
      "print(sorted(p.name for p in Path('.').iterdir()))",
    ].join("\n");
    const r = await run(src, [""], { files: [{ name: "marks.csv", content: "name,mark\nA,5\nB,7\n" }, { name: "helpers.py", content: "def double(x):\n    return 2 * x\n" }] });
    expect(r.tests[0].status, r.tests[0].stderr).toBe("ok");
    expect(r.tests[0].stdout.split("\n")[0].trim()).toBe("4");
    expect(r.tests[0].stdout).toContain("'out.json'");
  });

  it("gives every test a fresh folder", async () => {
    const src = "import os\nprint(os.path.exists('note.txt'))\nopen('note.txt', 'w').write('x')";
    const r = await run(src, ["", ""]);
    expect(r.tests.map((t) => t.stdout.trim())).toEqual(["False", "False"]);
  });

  it("works with sqlite3, threads and asyncio", async () => {
    const src = [
      "import sqlite3, asyncio",
      "from concurrent.futures import ThreadPoolExecutor",
      "db = sqlite3.connect('shop.db')",
      "db.execute('create table t(x)')",
      "db.executemany('insert into t values (?)', [(1,), (2,), (3,)])",
      "print(db.execute('select sum(x) from t').fetchone()[0])",
      "with ThreadPoolExecutor(max_workers=3) as ex:\n    print(sorted(ex.map(lambda v: v * v, range(4))))",
      "async def job(n):\n    await asyncio.sleep(0.01)\n    return n",
      "async def main():\n    return await asyncio.gather(job(1), job(2))",
      "print(asyncio.run(main()))",
    ].join("\n");
    const r = await run(src);
    expect(r.tests[0].status, r.tests[0].stderr).toBe("ok");
    expect(r.tests[0].stdout.replace(/\r\n/g, "\n").trim()).toBe("6\n[0, 1, 4, 9]\n[1, 2]");
  });

  it.each([
    ["reading a system file", `print(open(r'${win ? "C:\\Windows\\win.ini" : "/etc/hosts"}').read())`],
    ["writing to the home folder", `import os\nopen(os.path.join(r'${win ? "C:\\Users" : "/tmp"}', 'cm-test.txt'), 'w').write('x')`],
    ["listing another folder", `import os\nprint(os.listdir(r'${win ? "C:\\Users" : "/etc"}'))`],
    ["os.system", "import os\nos.system('echo hi')"],
    ["subprocess", `import subprocess\nsubprocess.run(${win ? "['cmd', '/c', 'echo hi']" : "['echo', 'hi']"})`],
    ["a network connection", "import socket\nsocket.create_connection(('example.com', 80), timeout=2)"],
    ["urllib", "import urllib.request\nurllib.request.urlopen('http://example.com', timeout=2)"],
    ["a local service", "import socket\ns = socket.socket()\ns.connect(('127.0.0.1', 3410))"],
    ["opening a server port", "import socket\ns = socket.socket()\ns.bind(('0.0.0.0', 8080))"],
    ["ctypes", "import ctypes"],
    ["tkinter", "import tkinter"],
  ])("blocks %s", async (_name, src) => {
    const r = await run(src);
    expect(r.tests[0].status).toBe("runtime_error");
    expect(r.tests[0].stderr).toMatch(/isn't available in CodeMentor's sandbox|PermissionError|Access is denied/);
    expect(r.tests[0].stderr).not.toMatch(/harness/);
  });

  it("has no secrets in its environment", async () => {
    const r = await run("import os\nprint(sorted(k for k in os.environ if 'TOKEN' in k or 'SECRET' in k or 'DATABASE' in k))");
    expect(r.tests[0].stdout.trim()).toBe("[]");
  });

  it("third-party packages aren't importable (same as production)", async () => {
    const r = await run("import numpy");
    expect(r.tests[0].detail).toMatch(/ModuleNotFoundError/);
  });

  it("records a step-by-step trace with variables and output", async () => {
    const src = "total = 0\nfor i in range(1, 4):\n    total += i\nprint('total', total)";
    const r = await run(src, [""], { mode: "trace" });
    expect(r.tests[0].status, r.tests[0].stderr).toBe("ok");
    const trace = JSON.parse(r.tests[0].stdout) as PythonTrace;
    expect(trace.stdout.trim()).toBe("total 6");
    expect(trace.error).toBeNull();
    expect(trace.steps[0]).toMatchObject({ line: 1, event: "line" });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.line).toBe(4);
    expect(last.vars).toMatchObject({ total: "6", i: "3" });
    expect(trace.steps.filter((s) => s.line === 3)).toHaveLength(3);
  });

  it("traces function calls and errors", async () => {
    const src = "def half(n):\n    return n // 2\n\nprint(half(9))\nprint(1 / 0)";
    const r = await run(src, [""], { mode: "trace" });
    const trace = JSON.parse(r.tests[0].stdout) as PythonTrace;
    expect(trace.steps.some((s) => s.event === "call" && s.func === "half")).toBe(true);
    expect(trace.steps.some((s) => s.event === "return" && s.value === "4")).toBe(true);
    expect(trace.error).toMatch(/ZeroDivisionError/);
    expect(trace.stdout.trim()).toBe("4");
  });
});
