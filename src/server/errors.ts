const APP_ERROR = Symbol.for("codementor.AppError");

/** Errors that are safe to show to the user. Anything else becomes a generic 500. */
export class AppError extends Error {
  readonly [APP_ERROR] = true;
  constructor(
    message: string,
    readonly status = 400,
    readonly code = "bad_request",
  ) {
    super(message);
  }
}

/**
 * Brand check instead of `instanceof`: in dev, hot reload can leave an older copy of this module
 * alive (e.g. inside a cached singleton), and `instanceof` fails across copies.
 */
export function isAppError(err: unknown): err is AppError {
  return typeof err === "object" && err !== null && (err as Record<symbol, unknown>)[APP_ERROR] === true;
}

/** Also used when a record exists but belongs to someone else, so ownership is not leaked. */
export class NotFoundError extends AppError {
  constructor(what = "That item") {
    super(`${what} was not found.`, 404, "not_found");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have access to that.") {
    super(message, 403, "forbidden");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "You're going a bit fast. Please wait a moment and try again.") {
    super(message, 429, "rate_limited");
  }
}

/** Raised by the AI layer when a provider fails or returns output that never validates. */
export class AIUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 502, "ai_unavailable");
  }
}
