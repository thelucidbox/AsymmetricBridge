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

function getInitialThesis() {
  const stored = loadStoredThesis();
  if (!stored) return fabianThesis;

  const validation = validateThesis(stored);
  if (validation.valid) return stored;

  console.warn(
    "Stored thesis config failed validation, using default.",
    validation.errors,
  );
  return fabianThesis;
}

export function ThesisProvider({ children }) {
  const [thesis, setThesis] = useState(getInitialThesis);
  const [isLoaded] = useState(true);

  const updateThesis = useCallback((nextThesis) => {
    setThesis((current) => {
      const candidate =
        typeof nextThesis === "function" ? nextThesis(current) : nextThesis;
      const validation = validateThesis(candidate);

      if (!validation.valid) {
        console.error("Rejected invalid thesis config update.", validation.errors);
        return current;
      }

      persistThesis(candidate);
      return candidate;
    });
  }, []);

  const value = useMemo(
    () => ({
      thesis,
      updateThesis,
      isLoaded,
    }),
    [thesis, updateThesis, isLoaded],
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
