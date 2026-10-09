/**
 * Contract tests for the two paid AI backends, run against LOCAL FAKE servers that imitate the
 * provider APIs. They check what CodeMentor sends (model, output limit, structured-output format,
 * no response storage, fallback setting) and how it handles replies, usage and errors.
 *
 * They do NOT prove the real Anthropic or OpenAI APIs work with this code — that needs a real key
 * in an isolated environment (see docs/TESTING-REPORT.md).
 */
import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { config } from "@/server/config";
import { AIUnavailableError } from "@/server/errors";

interface Seen { path: string; headers: http.IncomingHttpHeaders; body: Record<string, unknown> }
let seen: Seen[] = [];
let reply: (path: string) => { status: number; body: unknown } = () => ({ status: 500, body: {} });
let server: http.Server;

beforeAll(async () => {
  server = http.createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const text = Buffer.concat(chunks).toString("utf8");
    seen.push({ path: req.url ?? "", headers: req.headers, body: text ? JSON.parse(text) : {} });
    const r = reply(req.url ?? "");
    res.writeHead(r.status, { "content-type": "application/json" });
    res.end(JSON.stringify(r.body));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  process.env.ANTHROPIC_BASE_URL = base;
  process.env.ANTHROPIC_API_KEY = "test-key-not-real";
  process.env.OPENAI_BASE_URL = `${base}/v1`;
  process.env.OPENAI_API_KEY = "test-key-not-real";
  config.ai.openai.model = "fake-openai-model";
});
afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));
beforeEach(() => {
  seen = [];
});

const schema = z.object({ text: z.string() });
const opts = { schema, system: "SYSTEM", user: "USER", effort: "low" as const, maxTokens: 1234 };

describe("Claude backend (fake Anthropic server)", () => {
  const message = (text: string) => ({
    id: "msg_1", type: "message", role: "assistant", model: "claude-opus-5-5",
    content: [{ type: "text", text }], stop_reason: "end_turn", stop_sequence: null,
    usage: { input_tokens: 111, output_tokens: 22 },
  });

  it("sends a structured-output request with the configured model, limits and fallback", async () => {
    reply = () => ({ status: 200, body: message(JSON.stringify({ text: "What does line 3 print?" })) });
    const { claudeBackend } = await import("@/server/ai/claude");
    const r = await claudeBackend.structured(opts);
    expect(r.value.text).toBe("What does line 3 print?");
    expect(r.usage).toEqual({ model: "claude-opus-5-5", inputTokens: 111, outputTokens: 22 });
    const req = seen[0];
    expect(req.path).toMatch(/^\/v1\/messages/);
    expect(req.body).toMatchObject({ model: config.ai.anthropic.model, max_tokens: 1234, system: "SYSTEM", fallbacks: "default" });
    expect((req.body.output_config as { format: { type: string } }).format.type).toBe("json_schema");
    expect(String(req.headers["anthropic-beta"])).toContain("server-side-fallback-2026-07-01");
  });

  it("retries once on output that doesn't match the schema, then gives up", async () => {
    reply = () => ({ status: 200, body: message("not json at all") });
    const { claudeBackend } = await import("@/server/ai/claude");
    await expect(claudeBackend.structured(opts)).rejects.toBeInstanceOf(AIUnavailableError);
    expect(seen).toHaveLength(2);
  });

  it("maps a rejected key to a clear error without retrying", async () => {
    reply = () => ({ status: 401, body: { type: "error", error: { type: "authentication_error", message: "bad key" } } });
    const { claudeBackend } = await import("@/server/ai/claude");
    await expect(claudeBackend.structured(opts)).rejects.toThrow(/rejected the API key/);
    expect(seen).toHaveLength(1);
  });

  it("stops after the SDK's single retry on server errors", async () => {
    reply = () => ({ status: 500, body: { type: "error", error: { type: "api_error", message: "boom" } } });
    const { claudeBackend } = await import("@/server/ai/claude");
    await expect(claudeBackend.structured(opts)).rejects.toThrow(/isn't available/);
    expect(seen).toHaveLength(2);
  }, 30_000);
});

describe("OpenAI backend (fake Responses API server)", () => {
  const response = (text: string, status = "completed") => ({
    id: "resp_1", object: "response", created_at: 0, status, model: "fake-openai-model",
    output: [{ type: "message", id: "msg_1", status: "completed", role: "assistant", content: [{ type: "output_text", text, annotations: [] }] }],
    usage: { input_tokens: 90, input_tokens_details: { cached_tokens: 0 }, output_tokens: 30, output_tokens_details: { reasoning_tokens: 0 }, total_tokens: 120 },
    incomplete_details: status === "incomplete" ? { reason: "max_output_tokens" } : null,
    error: null, instructions: "SYSTEM", metadata: {}, parallel_tool_calls: false, temperature: null, tool_choice: "auto", tools: [], top_p: null,
  });

  it("sends a structured-output request with the configured model, no storage and an output cap", async () => {
    reply = () => ({ status: 200, body: response(JSON.stringify({ text: "Where is b declared?" })) });
    const { openaiBackend } = await import("@/server/ai/openai");
    const r = await openaiBackend.structured(opts);
    expect(r.value.text).toBe("Where is b declared?");
    expect(r.usage).toEqual({ model: "fake-openai-model", inputTokens: 90, outputTokens: 30 });
    const req = seen[0];
    expect(req.path).toBe("/v1/responses");
    expect(req.body).toMatchObject({ model: "fake-openai-model", instructions: "SYSTEM", input: "USER", max_output_tokens: 1234, store: false });
    expect((req.body.text as { format: { type: string } }).format.type).toBe("json_schema");
  });

  it("treats a truncated (incomplete) response as invalid and retries once", async () => {
    reply = () => ({ status: 200, body: response("{\"text\": \"cut", "incomplete") });
    const { openaiBackend } = await import("@/server/ai/openai");
    await expect(openaiBackend.structured(opts)).rejects.toBeInstanceOf(AIUnavailableError);
    expect(seen).toHaveLength(2);
  });

  it("maps a rejected key to a clear error without retrying", async () => {
    reply = () => ({ status: 401, body: { error: { message: "bad key", type: "invalid_request_error" } } });
    const { openaiBackend } = await import("@/server/ai/openai");
    await expect(openaiBackend.structured(opts)).rejects.toThrow(/rejected the API key/);
    expect(seen).toHaveLength(1);
  });

  it("refuses to call OpenAI with no model configured", async () => {
    const savedModel = config.ai.openai.model;
    config.ai.openai.model = null;
    try {
      const { openaiBackend } = await import("@/server/ai/openai");
      await expect(openaiBackend.structured(opts)).rejects.toThrow(/OPENAI_MODEL/);
      expect(seen).toHaveLength(0);
    } finally {
      config.ai.openai.model = savedModel;
    }
  });
});
