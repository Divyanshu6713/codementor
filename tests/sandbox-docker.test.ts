/**
 * Production sandbox checks — run these ON THE LINUX EXECUTION HOST before enabling public code
 * execution:   SANDBOX_DOCKER_RUNTIME=runsc npx vitest run tests/sandbox-docker.test.ts
 *
 * Skipped automatically where Docker isn't available (e.g. the Windows development machine), so a
 * green run elsewhere proves nothing about Docker isolation — check the output says these ran.
 * Several tests bypass the source policy on purpose to prove the container itself contains the program.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { createDockerBackend } from "../worker/sandbox/backends/docker";
import { executeRequest } from "../worker/sandbox/runner";

function dockerAvailable() {
  try {
    execFileSync("docker", ["version", "--format", "{{.Server.Version}}"], { stdio: "pipe", timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

const enabled = process.platform !== "win32" && dockerAvailable();
const limits = { timeMs: 2000, memoryMb: 128, maxOutputBytes: 64 * 1024, maxStderrBytes: 8 * 1024 };

describe.runIf(enabled)("docker sandbox backend (production isolation)", () => {
  const backend = createDockerBackend();
  beforeAll(async () => backend.init(), 300_000);

  /** Compiles and runs raw source WITHOUT the source policy, to test the OS layer alone. */
  async function rawRun(source: string, input = "") {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cmk-dock-"));
    try {
      fs.writeFileSync(path.join(dir, "main.cpp"), source);
      const c = await backend.compile(dir);
      expect(c.ok, c.output).toBe(true);
      return await backend.run(dir, input, limits, "raw");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  it("compiles and runs a normal program", async () => {
    const r = await executeRequest(backend, { language: "cpp", source: "#include <iostream>\nint main(){int n; std::cin>>n; std::cout<<n*2;}", tests: [{ id: "a", input: "21" }] });
    expect(r.compile.status).toBe("success");
    expect(r.tests[0]).toMatchObject({ status: "ok", stdout: "42" });
  }, 120_000);

  it("stops infinite loops", async () => {
    const r = await rawRun("int main(){ volatile long x=0; for(;;) x++; }");
    expect(r.status).toBe("time_limit");
  }, 120_000);

  it("stops runaway memory", async () => {
    const r = await rawRun("#include <vector>\nint main(){ std::vector<char*> v; for(;;){ char* p = new char[1<<24]; for(int i=0;i<(1<<24);i+=4096) p[i]=1; v.push_back(p);} }");
    expect(["memory_limit", "runtime_error"]).toContain(r.status);
  }, 120_000);

  it("contains a fork bomb", async () => {
    const r = await rawRun("#include <unistd.h>\nint main(){ for(;;) fork(); }");
    expect(["time_limit", "runtime_error", "ok"]).toContain(r.status);
    // The host must still be able to start containers afterwards.
    const after = await rawRun("#include <cstdio>\nint main(){ std::printf(\"alive\"); }");
    expect(after.stdout).toBe("alive");
  }, 180_000);

  it("has no network access", async () => {
    const r = await rawRun(`#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <cstdio>
#include <unistd.h>
int main(){ int s = socket(AF_INET, SOCK_STREAM, 0); sockaddr_in a{}; a.sin_family = AF_INET; a.sin_port = htons(53);
  inet_pton(AF_INET, "1.1.1.1", &a.sin_addr); int c = connect(s, (sockaddr*)&a, sizeof a); std::printf(c == 0 ? "CONNECTED" : "BLOCKED"); }`);
    expect(r.stdout).toBe("BLOCKED");
  }, 120_000);

  it("cannot write outside the sandbox and sees no secrets", async () => {
    const r = await rawRun(`#include <cstdio>
#include <cstdlib>
int main(){ FILE* f = std::fopen("/box/evil.txt", "w"); FILE* g = std::fopen("/etc/evil", "w");
  const char* t = std::getenv("SANDBOX_TOKEN"); std::printf("%s %s %s", f ? "W1" : "R1", g ? "W2" : "R2", t ? "TOKEN" : "NOTOKEN"); }`);
    expect(r.stdout).toBe("R1 R2 NOTOKEN");
  }, 120_000);

  it("cuts off huge output", async () => {
    const r = await rawRun("#include <cstdio>\nint main(){ for(;;) std::puts(\"spam spam spam spam\"); }");
    expect(r.status).toBe("output_limit");
  }, 120_000);
});

describe("docker sandbox availability", () => {
  it("reports whether the production sandbox tests ran", () => {
    // Visible in the test list so a skipped Docker suite is never mistaken for a pass.
    expect(typeof enabled).toBe("boolean");
  });
});
