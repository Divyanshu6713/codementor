/** Small fetch wrapper for client components: JSON in/out, readable errors, offline detection. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) {
    super(message);
  }
}

export async function api<T>(url: string, opts: { method?: string; body?: unknown; timeoutMs?: number } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? (opts.body === undefined ? "GET" : "POST"),
      headers: opts.body === undefined ? undefined : { "content-type": "application/json" },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: "no-store",
      signal: AbortSignal.timeout(opts.timeoutMs ?? 90_000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ApiError("This is taking much longer than usual — your connection may be slow. Please try again.", 0, "timeout");
    }
    throw new ApiError(typeof navigator !== "undefined" && !navigator.onLine ? "You seem to be offline. Check your connection and try again." : "Couldn't reach CodeMentor. Please try again.", 0, "network");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data as { error?: { message?: string; code?: string } } | null)?.error;
    throw new ApiError(err?.message ?? "Something went wrong. Please try again.", res.status, err?.code ?? "error");
  }
  return data as T;
}
