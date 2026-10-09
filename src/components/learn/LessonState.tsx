"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { progressActions, readProgress, useProgress } from "@/lib/guest-progress";

export interface GuestStatus {
  execution: { available: boolean; devOnly: boolean; message: string | null };
  tutor: { aiEnabled: boolean; provider: string; dailyLimit: number; remaining: number | null };
}

export interface HelpAnswer {
  mode: string;
  label: string;
  source: "ai" | "curated";
  text: string;
  notice: string | null;
}

interface Ctx {
  lessonId: string;
  exerciseVersion: string;
  code: string;
  setCode: (code: string) => void;
  starterCode: string;
  status: GuestStatus | null;
  statusError: string | null;
  setRemaining: (n: number | null) => void;
  /** Highest hint level opened for this lesson (0 none … 4; 5 = worked solution viewed). */
  hintLevel: number;
  noteHint: (level: number) => void;
  /** Number of failed checks in this visit — used to offer the worked solution sooner. */
  failedChecks: number;
  noteCheck: (passed: boolean) => void;
  answer: HelpAnswer | null;
  setAnswer: (a: HelpAnswer | null) => void;
}

const LessonCtx = createContext<Ctx | null>(null);

export function useLesson() {
  const c = useContext(LessonCtx);
  if (!c) throw new Error("useLesson must be used inside <LessonStateProvider>");
  return c;
}

/**
 * Per-lesson client state shared by the exercise and the help panel: the code being edited
 * (auto-saved to this browser), server capabilities, and hint progress.
 */
export function LessonStateProvider({ lessonId, exerciseVersion, starterCode, children }: { lessonId: string; exerciseVersion: string; starterCode: string; children: ReactNode }) {
  const progress = useProgress();
  const saved = progress.lessons[lessonId];
  const [code, setCodeState] = useState(starterCode);
  const [status, setStatus] = useState<GuestStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [failedChecks, setFailedChecks] = useState(0);
  const [answer, setAnswer] = useState<HelpAnswer | null>(null);
  const loadedDraft = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore the saved draft once, after hydration (the server always renders the starter code).
  useEffect(() => {
    if (loadedDraft.current) return;
    loadedDraft.current = true;
    const draft = readProgress().lessons[lessonId]?.draft;
    progressActions.visit(lessonId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the draft lives in browser storage, readable only after hydration
    if (draft) setCodeState(draft);
  }, [lessonId]);

  useEffect(() => {
    let cancelled = false;
    api<GuestStatus>("/api/guest/status", { timeoutMs: 20_000 })
      .then((s) => !cancelled && setStatus(s))
      .catch((e: Error) => !cancelled && setStatusError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const setCode = useCallback((next: string) => {
    setCodeState(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (next === starterCode) progressActions.clearDraft(lessonId);
      else progressActions.saveDraft(lessonId, next, exerciseVersion);
    }, 600);
  }, [lessonId, exerciseVersion, starterCode]);

  const value = useMemo<Ctx>(() => ({
    lessonId, exerciseVersion, code, setCode, starterCode, status, statusError,
    setRemaining: (n) => setStatus((s) => (s ? { ...s, tutor: { ...s.tutor, remaining: n } } : s)),
    hintLevel: saved?.hintLevel ?? 0,
    noteHint: (level) => progressActions.noteHint(lessonId, level),
    failedChecks,
    noteCheck: (passed) => {
      if (passed) progressActions.markPassed(lessonId);
      else setFailedChecks((n) => n + 1);
    },
    answer, setAnswer,
  }), [lessonId, exerciseVersion, code, setCode, starterCode, status, statusError, saved?.hintLevel, failedChecks, answer]);

  return <LessonCtx.Provider value={value}>{children}</LessonCtx.Provider>;
}
