/**
 * Guest progress, stored only in this browser (localStorage). No account, nothing sent to the
 * server. It can disappear if browser data is cleared and does not move between devices — the UI
 * says so plainly.
 *
 * The stored object is versioned. Unknown or corrupt data is reset rather than half-trusted, and
 * entries for lessons that no longer exist are dropped. A saved draft remembers which version of
 * its exercise it was written for, so the lesson can say when the exercise has changed since.
 *
 * Shape is deliberately close to what a future optional account would sync, so adding
 * cross-device sync later means uploading this object, not redesigning it.
 */
import { useSyncExternalStore } from "react";

export const PROGRESS_KEY = "cm-progress";
export const PROGRESS_SCHEMA = 1;
const MAX_DRAFT_CHARS = 64 * 1024;
const MAX_RECENT = 6;

export interface LessonProgress {
  visitedAt?: number;
  /** The exercise passed every test (decided by the server's judge). */
  passedAt?: number;
  /** The lesson was finished (exercise passed). */
  completedAt?: number;
  draft?: string;
  draftVersion?: string;
  draftAt?: number;
  /** Highest curated hint level opened (1–4); 5 means the worked solution was viewed. */
  hintLevel?: number;
}

export interface GuestProgress {
  v: typeof PROGRESS_SCHEMA;
  currentLessonId: string | null;
  lessons: Record<string, LessonProgress>;
  /** Lesson ids of recently practised exercises, newest first. */
  recent: string[];
  updatedAt: number;
}

const empty = (): GuestProgress => ({ v: PROGRESS_SCHEMA, currentLessonId: null, lessons: {}, recent: [], updatedAt: 0 });

// ── Storage access (every call guarded: private mode, disabled storage, quota) ──
let memoryFallback: string | null = null;
let persistent = true;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(PROGRESS_KEY);
  } catch {
    persistent = false;
    return memoryFallback;
  }
}

function writeRaw(value: string): boolean {
  try {
    window.localStorage.setItem(PROGRESS_KEY, value);
    persistent = true;
    return true;
  } catch {
    memoryFallback = value;
    persistent = false;
    return false;
  }
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const optNum = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : undefined);

/** Validates stored data field by field; anything unrecognisable is dropped, never trusted. */
export function parseProgress(raw: string | null): { progress: GuestProgress; reset: boolean } {
  if (!raw) return { progress: empty(), reset: false };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { progress: empty(), reset: true };
  }
  if (!isObj(data) || data.v !== PROGRESS_SCHEMA || !isObj(data.lessons)) return { progress: empty(), reset: true };
  const lessons: Record<string, LessonProgress> = {};
  for (const [id, value] of Object.entries(data.lessons)) {
    if (!/^[a-z0-9-]{1,60}$/.test(id) || !isObj(value)) continue;
    lessons[id] = {
      visitedAt: optNum(value.visitedAt), passedAt: optNum(value.passedAt), completedAt: optNum(value.completedAt),
      draft: typeof value.draft === "string" ? value.draft.slice(0, MAX_DRAFT_CHARS) : undefined,
      draftVersion: typeof value.draftVersion === "string" ? value.draftVersion.slice(0, 40) : undefined,
      draftAt: optNum(value.draftAt),
      hintLevel: optNum(value.hintLevel),
    };
  }
  return {
    reset: false,
    progress: {
      v: PROGRESS_SCHEMA,
      currentLessonId: typeof data.currentLessonId === "string" && lessons[data.currentLessonId] ? data.currentLessonId : null,
      lessons,
      recent: Array.isArray(data.recent) ? data.recent.filter((x): x is string => typeof x === "string" && x in lessons).slice(0, MAX_RECENT) : [],
      updatedAt: optNum(data.updatedAt) ?? 0,
    },
  };
}

// ── Store with a stable snapshot for useSyncExternalStore ──
let snapshot: GuestProgress | null = null;
let wasReset = false;
const listeners = new Set<() => void>();

function load(): GuestProgress {
  if (snapshot) return snapshot;
  const { progress, reset } = parseProgress(readRaw());
  snapshot = progress;
  wasReset = reset;
  return snapshot;
}

function emit() {
  for (const l of listeners) l();
}

function commit(next: GuestProgress) {
  next.updatedAt = Date.now();
  let json = JSON.stringify(next);
  if (!writeRaw(json)) {
    // Probably over quota: drop the oldest drafts and try once more.
    const withDrafts = Object.entries(next.lessons).filter(([, p]) => p.draft).sort((a, b) => (a[1].draftAt ?? 0) - (b[1].draftAt ?? 0));
    for (const [, p] of withDrafts.slice(0, Math.ceil(withDrafts.length / 2))) delete p.draft;
    json = JSON.stringify(next);
    writeRaw(json);
  }
  snapshot = next;
  emit();
}

function update(fn: (p: GuestProgress) => void) {
  const next: GuestProgress = structuredClone(load());
  fn(next);
  commit(next);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PROGRESS_KEY || e.key === null) {
      snapshot = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const serverSnapshot = empty();

/** Current progress outside React (client only). */
export const readProgress = (): GuestProgress => load();

/** Progress in a React component. Renders the empty state on the server and before hydration. */
export function useProgress(): GuestProgress {
  return useSyncExternalStore(subscribe, load, () => serverSnapshot);
}

export const progressStorage = {
  /** False when the browser refuses storage (private mode, blocked site data). */
  isPersistent: () => (load(), persistent),
  /** True once if saved data was unreadable or from an unknown version and had to be reset. */
  consumeResetNotice: () => {
    load();
    const r = wasReset;
    wasReset = false;
    return r;
  },
};

export const progressActions = {
  visit(lessonId: string) {
    update((p) => {
      p.currentLessonId = lessonId;
      p.lessons[lessonId] = { ...p.lessons[lessonId], visitedAt: Date.now() };
    });
  },
  saveDraft(lessonId: string, draft: string, version: string) {
    if (draft.length > MAX_DRAFT_CHARS) return;
    update((p) => {
      p.lessons[lessonId] = { ...p.lessons[lessonId], draft, draftVersion: version, draftAt: Date.now() };
      p.recent = [lessonId, ...p.recent.filter((x) => x !== lessonId)].slice(0, MAX_RECENT);
    });
  },
  clearDraft(lessonId: string) {
    update((p) => {
      const lp = { ...p.lessons[lessonId] };
      delete lp.draft;
      delete lp.draftVersion;
      delete lp.draftAt;
      p.lessons[lessonId] = lp;
    });
  },
  markPassed(lessonId: string) {
    update((p) => {
      const now = Date.now();
      p.lessons[lessonId] = { ...p.lessons[lessonId], passedAt: p.lessons[lessonId]?.passedAt ?? now, completedAt: p.lessons[lessonId]?.completedAt ?? now };
      p.recent = [lessonId, ...p.recent.filter((x) => x !== lessonId)].slice(0, MAX_RECENT);
    });
  },
  noteHint(lessonId: string, level: number) {
    update((p) => {
      p.lessons[lessonId] = { ...p.lessons[lessonId], hintLevel: Math.max(level, p.lessons[lessonId]?.hintLevel ?? 0) };
    });
  },
  /** Drops lessons that no longer exist in the course. */
  prune(validIds: string[]) {
    const valid = new Set(validIds);
    const cur = load();
    if (Object.keys(cur.lessons).every((id) => valid.has(id))) return;
    update((p) => {
      for (const id of Object.keys(p.lessons)) if (!valid.has(id)) delete p.lessons[id];
      p.recent = p.recent.filter((id) => valid.has(id));
      if (p.currentLessonId && !valid.has(p.currentLessonId)) p.currentLessonId = null;
    });
  },
  resetAll() {
    commit(empty());
  },
};

/** The lesson to continue with: the first not-completed lesson at or after the current one. */
export function recommendedLesson(order: string[], p: GuestProgress): string {
  const start = p.currentLessonId ? Math.max(0, order.indexOf(p.currentLessonId)) : 0;
  for (let i = start; i < order.length; i++) if (!p.lessons[order[i]]?.completedAt) return order[i];
  for (let i = 0; i < start; i++) if (!p.lessons[order[i]]?.completedAt) return order[i];
  return p.currentLessonId ?? order[0];
}

export function hasProgress(p: GuestProgress) {
  return Object.keys(p.lessons).length > 0;
}
