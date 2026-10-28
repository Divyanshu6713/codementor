"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export interface MentorStatus {
  aiEnabled: boolean;
  provider: string;
  dailyLimit: number;
  remaining: number | null;
}

export interface ExecStatus {
  available: boolean;
  devOnly: boolean;
  message: string | null;
}

export interface HelpAnswer {
  mode: string;
  label: string;
  source: "ai" | "curated";
  text: string;
  notice: string | null;
}

export interface PassReward {
  firstPass: boolean;
  xp: number;
  moduleCompleted: { title: string; xp: number } | null;
  achievements: { code: string; title: string }[];
  revisionScheduled?: { concept: string; skills: number } | null;
}

interface Ctx {
  lessonId: string;
  code: string;
  setCode: (code: string) => void;
  starterCode: string;
  execution: ExecStatus;
  mentor: MentorStatus;
  setRemaining: (n: number | null) => void;
  /** Highest hint level opened for this lesson (0 none … 4). */
  hintLevel: number;
  noteHint: (level: number) => void;
  solutionViewed: boolean;
  noteSolution: () => void;
  passed: boolean;
  /** Failed checks in this visit — used to offer the worked solution sooner. */
  failedChecks: number;
  noteCheck: (passed: boolean, reward: PassReward | null) => void;
  reward: PassReward | null;
  answer: HelpAnswer | null;
  setAnswer: (a: HelpAnswer | null) => void;
}

const LessonCtx = createContext<Ctx | null>(null);

export function useLesson() {
  const c = useContext(LessonCtx);
  if (!c) throw new Error("useLesson must be used inside <LessonStateProvider>");
  return c;
}

/** Drafts are a per-browser convenience only (progress and XP live on the server). */
const draftKey = (userId: string, lessonId: string) => `cm-draft:${userId}:${lessonId}`;
function readDraft(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeDraft(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else if (value.length <= 64 * 1024) window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the draft just isn't kept */
  }
}

/**
 * Per-lesson client state shared by the exercise and the mentor panel: the code being edited,
 * server capabilities, hint progress and the reward for a first pass.
 */
export function LessonStateProvider(props: {
  userId: string;
  lessonId: string;
  starterCode: string;
  initial: { hintLevel: number; solutionViewed: boolean; passed: boolean };
  execution: ExecStatus;
  mentor: MentorStatus;
  children: ReactNode;
}) {
  const { userId, lessonId, starterCode, initial } = props;
  const router = useRouter();
  const key = draftKey(userId, lessonId);
  const [code, setCodeState] = useState(starterCode);
  const [mentor, setMentor] = useState(props.mentor);
  const [hintLevel, setHintLevel] = useState(initial.hintLevel);
  const [solutionViewed, setSolutionViewed] = useState(initial.solutionViewed);
  const [passed, setPassed] = useState(initial.passed);
  const [failedChecks, setFailedChecks] = useState(0);
  const [reward, setReward] = useState<PassReward | null>(null);
  const [answer, setAnswer] = useState<HelpAnswer | null>(null);
  const restored = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore the saved draft once, after hydration (the server always renders the starter code).
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const draft = readDraft(key);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the draft lives in browser storage, readable only after hydration
    if (draft) setCodeState(draft);
  }, [key]);

  const setCode = useCallback((next: string) => {
    setCodeState(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => writeDraft(key, next === starterCode ? null : next), 500);
  }, [key, starterCode]);

  const value = useMemo<Ctx>(() => ({
    lessonId, code, setCode, starterCode, execution: props.execution, mentor,
    setRemaining: (n) => setMentor((m) => ({ ...m, remaining: n })),
    hintLevel, noteHint: (level) => setHintLevel((h) => Math.max(h, level)),
    solutionViewed, noteSolution: () => setSolutionViewed(true),
    passed, failedChecks,
    noteCheck: (ok, r) => {
      if (!ok) {
        setFailedChecks((n) => n + 1);
        return;
      }
      setPassed(true);
      if (r?.firstPass) {
        setReward(r);
        router.refresh(); // XP / level in the app chrome
      }
    },
    reward, answer, setAnswer,
  }), [lessonId, code, setCode, starterCode, props.execution, mentor, hintLevel, solutionViewed, passed, failedChecks, reward, answer, router]);

  return <LessonCtx.Provider value={value}>{props.children}</LessonCtx.Provider>;
}
