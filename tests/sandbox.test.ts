/**
 * Execution safety tests (§68). These compile and run real C++ through the sandbox backend, so they
 * only run where a backend is available: windows-job on Windows, local on macOS/Linux (g++ needed).
 * The docker backend has its own suite (sandbox-docker.test.ts).
 */
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { executeRequest } from "../worker/sandbox/runner";
import { checkSource } from "../worker/sandbox/policy";
import { createDevBackend } from "../worker/sandbox/backends";
import type { SandboxBackend } from "../worker/sandbox/backends/types";

const backend: SandboxBackend | null = createDevBackend();
const canRun = Boolean(backend?.compiler);

const prog = (body: string, headers = ["iostream"]) => `${headers.map((h) => `#include <${h}>`).join("\n")}
using namespace std;
int main() {
${body}
    return 0;
}`;

const run = (source: string, inputs: string[] = [""], limits?: { timeMs?: number; memoryMb?: number }) =>
  executeRequest(backend!, { language: "cpp", source, tests: inputs.map((input, i) => ({ id: `t${i}`, input })), limits });

describe("source policy", () => {
  it.each([
    ["quoted include", '#include "secret.txt"\nint main(){}'],
    ["#embed", "#embed \"C:/Windows/win.ini\"\nint main(){}"],
    ["disallowed header", "#include <fstream>\nint main(){}"],
    ["#define", "#define X 1\nint main(){}"],
    ["digraph directive", "%:include <fstream>\nint main(){}"],
    ["line splice", "#incl\\\nude <fstream>\nint main(){}"],
    ["system()", prog('system("calc");', ["cstdlib"])],
    ["fopen", prog('fopen("x","w");', ["cstdio"])],
    ["inline asm", prog('__asm__("nop");')],
    ["extern C", 'extern "C" int puts(const char*);\nint main(){}'],
    ["getenv", prog('getenv("SANDBOX_TOKEN");', ["cstdlib"])],
  ])("rejects %s", (_name, src) => {
    expect(checkSource(src).ok).toBe(false);
  });

  it("allows normal programs, and banned words inside strings or comments", () => {
    const src = prog('    // we never call system() here\n    cout << "fopen and system are just words";');
    expect(checkSource(src)).toEqual({ ok: true });
  });

  it("allows <memory> for smart pointers (taught in the course), still not file streams", () => {
    expect(checkSource(prog("    auto p = make_unique<int>(5);\n    cout << *p;", ["memory"]))).toEqual({ ok: true });
    expect(checkSource(prog("    ofstream f;", ["memory"])).ok).toBe(false);
  });

  it("allows exceptions, optional, string_view and assert, but still refuses <fstream> and <thread>", () => {
    expect(checkSource(prog("    try { throw runtime_error(\"x\"); } catch (const exception& e) { cout << e.what(); }", ["iostream", "stdexcept"])).ok).toBe(true);
    expect(checkSource(prog("    optional<int> o; string_view v = \"hi\"; assert(true);", ["optional", "string_view", "cassert"])).ok).toBe(true);
    expect(checkSource("#include <fstream>\nint main(){}").ok).toBe(false);
    expect(checkSource("#include <thread>\nint main(){}").ok).toBe(false);
  });
});

describe.runIf(canRun)(`sandbox execution (${backend?.id} backend)`, () => {
  beforeAll(async () => {
    await backend!.init();
  }, 120_000);

  it("compiles and runs a valid program with input", async () => {
    const r = await run(prog("    int n; cin >> n; for (int i = 1; i <= n; i++) cout << i << ' ';"), ["3\n", "1\n"]);
    expect(r.compile.status).toBe("success");
    expect(r.tests.map((t) => t.status)).toEqual(["ok", "ok"]);
    expect(r.tests[0].stdout.trim()).toBe("1 2 3");
    expect(r.tests[1].stdout.trim()).toBe("1");
  });

  it("reports compiler errors without leaking the scratch path", async () => {
    const r = await run(prog("    int x = 5\n    cout << x;"));
    expect(r.compile.status).toBe("error");
    expect(r.compile.output).toMatch(/main\.cpp:\d+:\d+: error/);
    expect(r.compile.output).not.toContain(os.tmpdir());
    expect(r.tests[0].status).toBe("not_run");
  });

  it("stops an infinite loop", async () => {
    const r = await run(prog("    volatile long long x = 0; for (;;) x++;"), [""], { timeMs: 1000 });
    expect(r.tests[0].status).toBe("time_limit");
  });

  it("stops a program that waits forever for input it never gets", async () => {
    const r = await run(prog("    int a, b; cin >> a >> b; while (a != b) {}"), ["1\n"], { timeMs: 1000 });
    expect(["time_limit", "ok"]).toContain(r.tests[0].status);
  });

  it("stops a huge memory allocation", async () => {
    const r = await run(prog("    vector<char*> v; for (;;) { char* p = new char[16 << 20]; for (int i = 0; i < (16 << 20); i += 4096) p[i] = 1; v.push_back(p); }", ["iostream", "vector"]), [""], { memoryMb: 128 });
    expect(["memory_limit", "runtime_error"]).toContain(r.tests[0].status);
  });

  it("cuts off massive output", async () => {
    const r = await run(prog('    for (;;) cout << "spam spam spam spam spam\\n";'), [""], { timeMs: 3000 });
    expect(r.tests[0].status).toBe("output_limit");
    expect(r.tests[0].stdout.length).toBeLessThanOrEqual(64 * 1024);
  });

  it("reports runtime errors (division by zero / bad memory access)", async () => {
    const r = await run(prog("    int z; cin >> z; int* p = nullptr; if (z == 0) cout << 10 / z; else cout << *p;"), ["0\n", "1\n"]);
    expect(r.tests.map((t) => t.status)).toEqual(["runtime_error", "runtime_error"]);
    expect(r.tests[0].detail).toBeTruthy();
  });

  it("handles malformed input without crashing the worker", async () => {
    const r = await run(prog("    int n; cin >> n; cout << n * 2;"), ["not a number\n", ""]);
    expect(r.compile.status).toBe("success");
    expect(r.tests.every((t) => t.status === "ok")).toBe(true);
  });

  it("cannot write files outside the sandbox even if the policy were bypassed", async (ctx) => {
    if (!backend!.contained) ctx.skip(); // e.g. Linux as a normal user without namespaces
    // Exercise the OS layer directly: compile a program that writes to the user's profile folder.
    const target = path.join(os.homedir(), `cmk-probe-${process.pid}.txt`).replace(/\\/g, "/");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cmk-test-"));
    fs.writeFileSync(path.join(dir, "main.cpp"), `#include <cstdio>\nint main(){ FILE* f = std::fopen("${target}", "w"); std::printf(f ? "WROTE" : "BLOCKED"); return 0; }`);
    try {
      expect((await backend!.compile(dir)).ok).toBe(true);
      const r = await backend!.run(dir, "", { timeMs: 2000, memoryMb: 128, maxOutputBytes: 1024, maxStderrBytes: 1024 }, "fs");
      expect(r.stdout).toBe("BLOCKED");
      expect(fs.existsSync(target)).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.rmSync(target, { force: true });
    }
  });

  it("cannot start other processes even if the policy were bypassed (fork / shell escape)", async (ctx) => {
    if (!backend!.contained) ctx.skip();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cmk-test-"));
    const shell = process.platform === "win32" ? "cmd /c echo pwned" : "echo pwned";
    fs.writeFileSync(path.join(dir, "main.cpp"), `#include <cstdlib>\n#include <cstdio>\nint main(){ int r = std::system("${shell}"); std::printf("r=%d", r); return 0; }`);
    try {
      expect((await backend!.compile(dir)).ok).toBe(true);
      const r = await backend!.run(dir, "", { timeMs: 2000, memoryMb: 128, maxOutputBytes: 1024, maxStderrBytes: 1024 }, "proc");
      expect(r.stdout).not.toContain("pwned");
      if (backend!.id === "windows-job") expect(r.processLimitHit).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses policy violations before compiling", async () => {
    const r = await run(prog('    system("calc");', ["cstdlib"]));
    expect(r.compile.status).toBe("rejected");
    expect(r.compile.output).toMatch(/system/);
  });
});
