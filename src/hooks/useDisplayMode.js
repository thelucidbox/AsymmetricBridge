import { useEffect, useState } from "react";

export const DISPLAY_MODE_KEY = "ab-display-mode";
export const DISPLAY_MODE_EVENT = "ab-display-mode-change";
export const DISPLAY_MODES = {
  full: "full",
  simplified: "simplified",
};

function normalizeDisplayMode(value) {
  if (value === DISPLAY_MODES.simplified) return DISPLAY_MODES.simplified;
  return DISPLAY_MODES.full;
}

export function getDisplayMode() {
  if (typeof window === "undefined") return DISPLAY_MODES.full;
  const stored = window.localStorage.getItem(DISPLAY_MODE_KEY);
  if (stored) return normalizeDisplayMode(stored);
  // Default OSS users to simplified mode (plain English view)
  // Owner mode defaults to full (expert view)
  const isOwner =
    typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_OWNER_MODE === "true" ||
      import.meta.env?.VITE_OWNER_MODE === true);
  return isOwner ? DISPLAY_MODES.full : DISPLAY_MODES.simplified;
}

export function setDisplayMode(mode) {
  if (typeof window === "undefined") return;
  const nextMode = normalizeDisplayMode(mode);
  window.localStorage.setItem(DISPLAY_MODE_KEY, nextMode);
  window.dispatchEvent(
    new CustomEvent(DISPLAY_MODE_EVENT, { detail: { mode: nextMode } }),
  );
}

export function useDisplayMode() {
  const [displayMode, setDisplayModeState] = useState(getDisplayMode);

  useEffect(() => {
    const syncDisplayMode = () => setDisplayModeState(getDisplayMode());
    const onModeEvent = (event) => {
      const modeFromEvent = event?.detail?.mode;
      setDisplayModeState(
        normalizeDisplayMode(modeFromEvent || getDisplayMode()),
      );
    };

    window.addEventListener("storage", syncDisplayMode);
    window.addEventListener(DISPLAY_MODE_EVENT, onModeEvent);

    return () => {
      window.removeEventListener("storage", syncDisplayMode);
      window.removeEventListener(DISPLAY_MODE_EVENT, onModeEvent);
    };
  }, []);

  return displayMode;
}
