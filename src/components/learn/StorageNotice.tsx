"use client";

import { useEffect, useState } from "react";
import { progressStorage } from "@/lib/guest-progress";

/** Plain-language note about where progress lives, plus warnings when storage is unavailable or was reset. */
export function StorageNotice({ className }: { className?: string }) {
  const [state, setState] = useState<{ persistent: boolean; reset: boolean } | null>(null);
  useEffect(() => {
    // Storage can only be inspected in the browser, after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ persistent: progressStorage.isPersistent(), reset: progressStorage.consumeResetNotice() });
  }, []);
  return (
    <div className={className}>
      {state?.reset && <p role="status" className="mb-1 font-medium text-hint">Saved progress in this browser couldn&apos;t be read (it was from an older version), so it was reset.</p>}
      {state && !state.persistent
        ? <p role="status" className="font-medium text-hint">This browser isn&apos;t letting CodeMentor save data (private mode or blocked site data), so progress will be lost when you close the tab.</p>
        : <p>Your progress is saved only in this browser — no account needed. It won&apos;t move to other devices and is lost if you clear your browser data.</p>}
    </div>
  );
}
