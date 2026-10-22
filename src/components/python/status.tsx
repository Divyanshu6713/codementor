import { CheckCircle2, Circle, CircleDot, Lock } from "lucide-react";

/** One icon per lesson status (completed / in progress / available / locked). */
export const STATUS_ICON = {
  completed: <CheckCircle2 size={16} className="shrink-0 text-success" aria-label="completed" />,
  in_progress: <CircleDot size={16} className="shrink-0 text-accent" aria-label="in progress" />,
  available: <Circle size={16} className="shrink-0 text-ink-3" aria-label="available" />,
  locked: <Lock size={15} className="shrink-0 text-ink-3" aria-label="locked" />,
};
