"use client";

import { useCallback, useEffect, useState } from "react";

export type ViewMode = "grid" | "list";

/**
 * Persist a "grid" | "list" view preference per category in localStorage.
 * SSR-safe: renders with `defaultView` first, then hydrates from LS after mount.
 */
export function useViewMode(
  key: string,
  defaultView: ViewMode = "grid"
): [ViewMode, (v: ViewMode) => void] {
  const [view, setViewState] = useState<ViewMode>(defaultView);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(`view:${key}`);
      if (stored === "grid" || stored === "list") {
        setViewState(stored);
      }
    } catch {
      // Ignore (private mode / disabled storage)
    }
  }, [key]);

  const setView = useCallback(
    (v: ViewMode) => {
      setViewState(v);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(`view:${key}`, v);
      } catch {
        // Ignore
      }
    },
    [key]
  );

  return [view, setView];
}
