import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ThesisProvider } from "./config/ThesisContext.jsx";
import { ThemeProvider } from "./design-tokens";
import { validateEnv } from "./lib/env-check.js";
import "./index.css";

const envValidation = validateEnv();

if (envValidation.valid) {
  if (import.meta.env.DEV) {
    console.info("[env-check] Required environment variables are configured.");
  }
} else {
  console.error(
    "[env-check] Missing required environment variables:",
    envValidation.missing,
  );
}

if (envValidation.warnings.length > 0) {
  console.warn(
    "[env-check] Optional environment warnings:",
    envValidation.warnings,
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ThesisProvider>
        <App />
      </ThesisProvider>
    </ThemeProvider>
  </StrictMode>,
);
