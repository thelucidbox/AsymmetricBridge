import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import observatoryTokens from "./observatory";
import sharedTokens from "./shared";
import terminalTokens from "./terminal";

const STORAGE_KEY = "ab-theme-variant";
const VARIANTS = {
  terminal: terminalTokens,
  observatory: observatoryTokens,
};

function resolveVariant(value) {
  return value === "observatory" ? "observatory" : "terminal";
}

function safeReadStoredVariant() {
  if (typeof window === "undefined") return "terminal";
  try {
    return resolveVariant(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return "terminal";
  }
}

function safePersistVariant(variant) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, variant);
  } catch {
    // Ignore storage write failures (private mode, blocked storage, etc.)
  }
}

function buildTokens(variant) {
  const resolved = resolveVariant(variant);
  const base = VARIANTS[resolved] || terminalTokens;

  return {
    ...base,
    variant: resolved,
    breakpoints: sharedTokens.breakpoints,
    zIndex: sharedTokens.zIndex,
    statusSemantics: sharedTokens.statusSemantics,
    shared: sharedTokens,
  };
}

function applyTokensToRoot(tokens) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.setAttribute("data-ab-theme", tokens.variant);
  root.style.setProperty("--ab-color-bg", tokens.colors.bg);
  root.style.setProperty("--ab-color-text", tokens.colors.text);
  root.style.setProperty("--ab-color-text-muted", tokens.colors.textMuted);
  root.style.setProperty("--ab-color-surface", tokens.colors.surface);
  root.style.setProperty("--ab-color-border", tokens.colors.border);
  root.style.setProperty("--ab-font-sans", tokens.typography.fontSans);
  root.style.setProperty("--ab-font-mono", tokens.typography.fontMono);
  root.style.setProperty("--ab-motion-default", tokens.motion.default);
  root.style.setProperty(
    "--ab-content-max-width",
    `${tokens.spacing.contentMaxWidth}px`,
  );

  root.style.setProperty(
    "--ab-breakpoint-mobile",
    `${sharedTokens.breakpoints.mobile}px`,
  );
  root.style.setProperty(
    "--ab-breakpoint-tablet",
    `${sharedTokens.breakpoints.tablet}px`,
  );
  root.style.setProperty(
    "--ab-breakpoint-desktop",
    `${sharedTokens.breakpoints.desktop}px`,
  );
  root.style.setProperty(
    "--ab-breakpoint-wide",
    `${sharedTokens.breakpoints.wide}px`,
  );
}

const initialVariant = safeReadStoredVariant();
let activeTokens = buildTokens(initialVariant);

applyTokensToRoot(activeTokens);

const ThemeContext = createContext({
  variant: activeTokens.variant,
  tokens: activeTokens,
  setVariant: () => {},
  toggleVariant: () => {},
});

export function getThemeTokens() {
  return activeTokens;
}

export function ThemeProvider({ children }) {
  const [variant, setVariantState] = useState(activeTokens.variant);

  const tokens = useMemo(() => buildTokens(variant), [variant]);

  useEffect(() => {
    activeTokens = tokens;
    applyTokensToRoot(tokens);
    safePersistVariant(tokens.variant);
  }, [tokens]);

  const setVariant = useCallback((nextVariant) => {
    setVariantState(resolveVariant(nextVariant));
  }, []);

  const toggleVariant = useCallback(() => {
    setVariantState((current) =>
      current === "terminal" ? "observatory" : "terminal",
    );
  }, []);

  const value = useMemo(
    () => ({
      variant: tokens.variant,
      tokens,
      setVariant,
      toggleVariant,
    }),
    [tokens, setVariant, toggleVariant],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}

function toggleButtonStyle(tokens, isActive, accentColor) {
  return {
    fontSize: tokens.typography.sizes.label,
    fontFamily: tokens.typography.fontMono,
    fontWeight: isActive
      ? tokens.typography.weights.bold
      : tokens.typography.weights.medium,
    color: isActive ? tokens.colors.text : tokens.colors.textMuted,
    background: isActive ? `${accentColor}20` : "transparent",
    border: `${tokens.shape.borderWidth}px solid ${isActive ? `${accentColor}55` : tokens.colors.border}`,
    borderRadius: tokens.shape.buttonRadius,
    padding: "6px 10px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: tokens.typography.letterSpacing.label,
    transition: tokens.motion.default,
    lineHeight: 1,
  };
}

export function ThemeToggle() {
  const { tokens, variant, setVariant } = useTheme();

  return createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 6 } },
    createElement(
      "span",
      {
        style: {
          fontSize: tokens.typography.sizes.label,
          color: tokens.colors.textMuted,
          fontFamily: tokens.typography.fontMono,
          letterSpacing: tokens.typography.letterSpacing.mono,
          textTransform: "uppercase",
        },
      },
      "Theme",
    ),
    createElement(
      "button",
      {
        type: "button",
        onClick: () => setVariant("terminal"),
        style: toggleButtonStyle(
          tokens,
          variant === "terminal",
          terminalTokens.colors.baseline,
        ),
        "aria-pressed": variant === "terminal",
      },
      "Terminal",
    ),
    createElement(
      "button",
      {
        type: "button",
        onClick: () => setVariant("observatory"),
        style: toggleButtonStyle(
          tokens,
          variant === "observatory",
          observatoryTokens.colors.accent,
        ),
        "aria-pressed": variant === "observatory",
      },
      "Observatory",
    ),
  );
}

export { STORAGE_KEY as THEME_STORAGE_KEY };
