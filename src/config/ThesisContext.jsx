import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import fabianThesis from "./fabian-thesis.js";
import { validateThesis } from "./thesis-schema.js";

const THESIS_STORAGE_KEY = "ab-thesis-config";
const TEST_MODE_KEY = "ab-test-new-user";

// eslint-disable-next-line react-refresh/only-export-components
export const isOwnerMode =
  import.meta.env.VITE_OWNER_MODE === "true" ||
  import.meta.env.VITE_OWNER_MODE === true;

const ThesisContext = createContext(null);

function loadStoredThesis() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(THESIS_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Unable to parse stored thesis config, using default.", error);
    return null;
  }
}

function persistThesis(config) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THESIS_STORAGE_KEY, JSON.stringify(config));
}

function isTestingAsNewUser() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(TEST_MODE_KEY) === "true";
}

function getInitialThesis() {
  if (isOwnerMode && !isTestingAsNewUser()) {
    const stored = loadStoredThesis();
    if (stored) {
      const validation = validateThesis(stored);
      if (validation.valid) return stored;
    }
    persistThesis(fabianThesis);
    return fabianThesis;
  }

  const stored = loadStoredThesis();
  if (!stored) return isOwnerMode ? fabianThesis : null;

  const validation = validateThesis(stored);
  if (validation.valid) return stored;

  console.warn("Stored thesis config failed validation.", validation.errors);
  return null;
}

export function ThesisProvider({ children }) {
  const [thesis, setThesis] = useState(getInitialThesis);
  const [isTestMode, setIsTestMode] = useState(isTestingAsNewUser);

  const updateThesis = useCallback((nextThesis) => {
    setThesis((current) => {
      const candidate =
        typeof nextThesis === "function" ? nextThesis(current) : nextThesis;
      const validation = validateThesis(candidate);

      if (!validation.valid) {
        console.error(
          "Rejected invalid thesis config update.",
          validation.errors,
        );
        return current;
      }

      persistThesis(candidate);
      return candidate;
    });
  }, []);

  const enterTestMode = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TEST_MODE_KEY, "true");
      window.localStorage.removeItem(THESIS_STORAGE_KEY);
    }
    setIsTestMode(true);
    setThesis(null);
  }, []);

  const exitTestMode = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TEST_MODE_KEY);
    }
    setIsTestMode(false);
    persistThesis(fabianThesis);
    setThesis(fabianThesis);
  }, []);

  const hasThesis = thesis !== null;

  const value = useMemo(
    () => ({
      thesis: thesis || fabianThesis,
      updateThesis,
      hasThesis,
      isTestMode,
      enterTestMode,
      exitTestMode,
    }),
    [thesis, updateThesis, hasThesis, isTestMode, enterTestMode, exitTestMode],
  );

  return (
    <ThesisContext.Provider value={value}>{children}</ThesisContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThesis() {
  const context = useContext(ThesisContext);
  if (!context) {
    throw new Error("useThesis must be used within a ThesisProvider");
  }
  return context;
}
