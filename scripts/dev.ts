/**
 * `npm run dev`: starts the sandbox worker AND the web app together, so the code runner can't be
 * forgotten. If a worker is already answering on its port, it's reused. Stopping this process
 * stops both. (`npm run dev:web` starts only the web app.)
 */
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (fs.existsSync(p)) process.loadEnvFile(p);
}

const workerUrl = (process.env.SANDBOX_URL || "http://127.0.0.1:3410").replace(/\/$/, "");
const children: ChildProcess[] = [];

function run(name: string, color: number, command: string) {
  const child = spawn(command, { shell: true, stdio: ["ignore", "pipe", "pipe"], env: process.env });
  const tag = `\x1b[${color}m[${name}]\x1b[0m `;
  const pipe = (stream: NodeJS.ReadableStream, out: NodeJS.WriteStream) => {
    let buf = "";
    stream.on("data", (chunk: Buffer) => {
      buf += chunk.toString();
      const lines = buf.split(/\r?\n/);
      buf = lines.pop() ?? "";
      for (const line of lines) out.write(tag + line + "\n");
    });
  };
  pipe(child.stdout!, process.stdout);
  pipe(child.stderr!, process.stderr);
  children.push(child);
  return child;
}

async function workerAlive() {
  try {
    const res = await fetch(`${workerUrl}/health`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  if (process.env.EXECUTION_PROVIDER === "sandbox-worker") {
    if (await workerAlive()) {
      console.log(`[dev] Sandbox worker already running at ${workerUrl} — reusing it.`);
    } else {
      const worker = run("sandbox", 36, "npx tsx worker/sandbox/server.ts");
      worker.on("exit", (code) => {
        if (code) console.error(`[dev] The sandbox worker stopped (exit ${code}). Code won't run until it's fixed — see the [sandbox] lines above.`);
      });
    }
  } else {
    console.log("[dev] EXECUTION_PROVIDER isn't sandbox-worker — not starting the local code runner. Run `npm run setup` to enable it.");
  }
  const web = run("web", 35, "npx next dev --port 3400");
  web.on("exit", (code) => shutdown(code ?? 0));
}

function shutdown(code: number) {
  for (const c of children) {
    if (c.exitCode === null && c.pid) {
      // On Windows a shell child needs its whole process tree killed.
      if (process.platform === "win32") spawn("taskkill", ["/pid", String(c.pid), "/T", "/F"], { stdio: "ignore" });
      else c.kill("SIGTERM");
    }
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
main().catch((err) => {
  console.error(err);
  shutdown(1);
});
