import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";
import CommandCenter from "./components/CommandCenter";
import DigestView from "./components/digests/DigestView";
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";
import PerformanceView from "./components/performance-lab/PerformanceView";
import ConvictionScorecard from "./components/conviction/ConvictionScorecard";
import GlossaryPage from "./components/GlossaryPage";
import { useThesis } from "./config/ThesisContext";
import { useAuth } from "./lib/AuthContext";
import { useTheme } from "./design-tokens";
import { S } from "./styles";

const queryClient = new QueryClient();

function PlaceholderView({ name }) {
  const { tokens } = useTheme();

  return (
    <div
      style={{
        minHeight: "calc(100vh - 62px)",
        padding: "28px 14px",
      }}
    >
      <div className="ab-content-shell">
        <div
          style={{
            ...S.card("rgba(255,255,255,0.1)"),
            padding:
              tokens.variant === "observatory" ? "22px 24px" : "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: tokens.typography.sizes.label,
              color: tokens.colors.textMuted,
              textTransform: "uppercase",
              letterSpacing: tokens.typography.letterSpacing.label,
              fontFamily: tokens.typography.fontMono,
              marginBottom: 8,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize:
                tokens.variant === "observatory"
                  ? tokens.typography.sizes.h1
                  : 24,
              fontWeight: tokens.typography.weights.bold,
              letterSpacing:
                tokens.variant === "observatory"
                  ? tokens.typography.letterSpacing.heading
                  : "-0.4px",
              marginBottom: 8,
            }}
          >
            Coming Soon
          </div>
          <div
            style={{
              fontSize: tokens.typography.sizes.body,
              color: tokens.colors.textMuted,
            }}
          >
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
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AuthLoading({ tokens }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: tokens.colors.bg,
      }}
    >
      <div
        style={{
          fontSize: tokens.typography.sizes.label,
          fontFamily: tokens.typography.fontMono,
          color: tokens.colors.textMuted,
          letterSpacing: tokens.typography.letterSpacing.mono,
          textTransform: "uppercase",
        }}
      >
        Loading...
      </div>
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const { tokens } = useTheme();
  const { user, loading, requireAuth } = useAuth();
  const { hasThesis, isTestMode } = useThesis();
  const isOnboardingRoute = location.pathname === "/onboarding";

  if (loading) return <AuthLoading tokens={tokens} />;

  if (requireAuth && !user) return <AuthPage />;

  const needsOnboarding = !hasThesis || isTestMode;

  if (needsOnboarding && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.colors.bg,
        color: tokens.colors.text,
        fontFamily: tokens.typography.fontSans,
      }}
    >
      {!isOnboardingRoute && <Navigation />}

      <main id="main-content">
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
            path="/onboarding"
            element={
              <ErrorBoundary>
                <OnboardingWizard />
              </ErrorBoundary>
            }
          />
          <Route
            path="/performance"
            element={
              <ErrorBoundary>
                <PerformanceView />
              </ErrorBoundary>
            }
          />
          <Route
            path="/conviction"
            element={
              <ErrorBoundary>
                <ConvictionScorecard />
              </ErrorBoundary>
            }
          />
          <Route
            path="/digests"
            element={
              <ErrorBoundary>
                <DigestView />
              </ErrorBoundary>
            }
          />
          <Route
            path="/glossary"
            element={
              <ErrorBoundary>
                <GlossaryPage />
              </ErrorBoundary>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
