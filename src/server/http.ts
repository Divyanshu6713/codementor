import { z } from "zod";
import { AuthError, type SessionUser } from "@/server/auth/auth";
import { requireApiUser } from "@/server/auth/current";
import { config } from "@/server/config";
import { isAppError, AppError, RateLimitError } from "@/server/errors";
import { logger } from "@/server/logger";
import type { Role } from "@/server/db/schema";

export function jsonError(status: number, code: string, message: string, details?: unknown) {
  return Response.json({ error: { code, message, details } }, { status });
}

export function toErrorResponse(err: unknown): Response {
  if (err instanceof AuthError) return jsonError(err.status, err.status === 403 ? "forbidden" : "unauthorized", err.message);
  if (isAppError(err)) return jsonError(err.status, err.code, err.message);
  if (err instanceof z.ZodError) return jsonError(400, "invalid_input", "Some of the details you sent are not valid.", z.flattenError(err));
  logger.error("api.unexpected_error", { err });
  return jsonError(500, "internal", "Something went wrong on our side. Please try again.");
}

/** Same-origin check for state-changing requests (defence in depth on top of SameSite cookies). */
function assertSameOrigin(req: Request) {
  if (req.method === "GET" || req.method === "HEAD") return;
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser clients; the session cookie is still required
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new AppError("Cross-site requests aren't allowed.", 403, "forbidden");
  } catch (err) {
    if (isAppError(err)) throw err;
    throw new AppError("Cross-site requests aren't allowed.", 403, "forbidden");
  }
}

/** Wraps an authenticated route handler: resolves the user (and role) and maps errors to JSON. */
export function withUser<Ctx>(handler: (req: Request, user: SessionUser, ctx: Ctx) => Promise<Response>, roles?: Role[]) {
  return async (req: Request, ctx: Ctx) => {
    try {
      assertSameOrigin(req);
      const user = await requireApiUser(roles);
      return await handler(req, user, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

export const withStudent = <Ctx>(handler: (req: Request, user: SessionUser, ctx: Ctx) => Promise<Response>) => withUser(handler, ["STUDENT"]);

/** Reads and validates a JSON body, refusing anything larger than `maxBytes`. */
export async function readJson<T extends z.ZodType>(req: Request, schema: T, maxBytes = 256 * 1024): Promise<z.infer<T>> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new AppError("That request is too large.", 413, "too_large");
  let text: string;
  try {
    text = await req.text();
  } catch {
    throw new AppError("Request body must be JSON.");
  }
  if (Buffer.byteLength(text, "utf8") > maxBytes) throw new AppError("That request is too large.", 413, "too_large");
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new AppError("Request body must be JSON.");
  }
  return schema.parse(body);
}

// ── Rate limiting (in-memory token buckets, per process) ──
// Fine for a single Node instance; swap for Redis when scaling out.
const buckets: Map<string, { tokens: number; updated: number }> =
  ((globalThis as Record<string, unknown>).__cmkBuckets as Map<string, { tokens: number; updated: number }>) ??
  ((globalThis as Record<string, unknown>).__cmkBuckets = new Map());

export function rateLimit(key: string, capacity: number, refillPerMinute: number) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: capacity, updated: now };
  bucket.tokens = Math.min(capacity, bucket.tokens + ((now - bucket.updated) / 60_000) * refillPerMinute);
  bucket.updated = now;
  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    throw new RateLimitError();
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
}

/**
 * The client's network address — only when a trusted proxy sets it (TRUST_PROXY=true, or Vercel,
 * which overwrites X-Forwarded-For). Otherwise the header could be forged, so we return null and
 * callers skip address-based limits rather than trust it.
 */
export function trustedClientIp(req: Request): string | null {
  if (!config.trustProxy) return null;
  return req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

/** Address for coarse rate-limit buckets ("untrusted" groups everyone when no proxy vouches for it). */
export function clientIp(req: Request) {
  return trustedClientIp(req) ?? "untrusted";
}

/** Wraps a public (no sign-in) route handler: same-origin check for mutations and JSON errors. */
export function withPublic<Ctx>(handler: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx) => {
    try {
      assertSameOrigin(req);
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

export const uuidParam = z.string().uuid();
