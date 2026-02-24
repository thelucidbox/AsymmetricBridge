import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import defaultThesis from "./default-thesis.js";
import { validateThesis } from "./thesis-schema.js";

const THESIS_STORAGE_KEY = "ab-thesis-config";

const blankThesis = {
  meta: {
    name: "My Thesis",
    version: "1.0.0",
  },
  dominos: [
    {
      id: 1,
      name: "Domino 1",
      color: "#888888",
      icon: "◉",
      description: "Configure your first domino",
      signals: [
        {
          name: "Signal 1",
          source: "Add your source",
          frequency: "Add frequency",
          currentStatus: "green",
          baseline: "Set baseline",
          threshold: "Set threshold",
          notes: "Add notes",
          dataPoints: [],
        },
      ],
      thresholds: {
        "Signal 1": "Set threshold",
      },
    },
  ],
  sources: [
    {
      title: "Add your first source",
      author: "Author",
      date: "Date",
      url: "https://example.com",
      type: "Research",
      color: "#888888",
    },
  ],
  portfolio: {
    legs: [],
  },
  careerProfile: {
    goals: [],
  },
};

export { defaultThesis };

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
  if (!stored) return null;

  const validation = validateThesis(stored);
  if (validation.valid) return stored;

  console.warn("Stored thesis config failed validation.", validation.errors);
  return null;
}

export function ThesisProvider({ children }) {
  const [thesis, setThesis] = useState(getInitialThesis);

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

  const hasThesis = thesis !== null;

  const value = useMemo(
    () => ({
      thesis: thesis || blankThesis,
      updateThesis,
      hasThesis,
    }),
    [thesis, updateThesis, hasThesis],
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
