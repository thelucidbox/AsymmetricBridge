import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CommandCenter from "./components/CommandCenter";
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import { S } from "./styles";

const queryClient = new QueryClient();

function PlaceholderView({ name }) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 62px)",
        padding: "28px 14px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ ...S.card("rgba(255,255,255,0.1)"), padding: "18px 20px" }}>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "'IBM Plex Mono', monospace",
              marginBottom: 8,
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 8 }}>
            Coming Soon
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            This view is scaffolded and ready for feature work.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div
          style={{
            minHeight: "100vh",
            background: "#0D0D0F",
            color: "#E8E4DF",
            fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
          }}
        >
          <Navigation />
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <CommandCenter />
                </ErrorBoundary>
              }
            />
            <Route
              path="/performance"
              element={
                <ErrorBoundary>
                  <PlaceholderView name="Performance Lab" />
                </ErrorBoundary>
              }
            />
            <Route
              path="/conviction"
              element={
                <ErrorBoundary>
                  <PlaceholderView name="Conviction Ledger" />
                </ErrorBoundary>
              }
            />
            <Route
              path="/digests"
              element={
                <ErrorBoundary>
                  <PlaceholderView name="Signal Digests" />
                </ErrorBoundary>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
