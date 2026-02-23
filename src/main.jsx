import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ThesisProvider } from "./config/ThesisContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThesisProvider>
      <App />
    </ThesisProvider>
  </StrictMode>,
);
