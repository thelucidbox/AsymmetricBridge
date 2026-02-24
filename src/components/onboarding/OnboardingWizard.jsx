import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThesis, isOwnerMode } from "../../config/ThesisContext";
import fabianThesis from "../../config/fabian-thesis";
import { validateThesis } from "../../config/thesis-schema";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../design-tokens";
import { S } from "../../styles";
import APIKeySetup from "./APIKeySetup";
import CareerProfile from "./CareerProfile";
import ResearchDiscovery from "./ResearchDiscovery";
import ThesisSetup from "./ThesisSetup";

const FRED_KEY_STORAGE = "ab-fred-api-key";
const TWELVE_DATA_KEY_STORAGE = "ab-twelve-data-api-key";

const STEPS = [
  { key: "welcome", label: "Welcome", estimate: null },
  { key: "career", label: "About You", estimate: "About 60 seconds" },
  { key: "thesis", label: "Your Thesis", estimate: "About 90 seconds" },
  { key: "api", label: "Data Sources", estimate: "About 30 seconds" },
  { key: "complete", label: "Review", estimate: null },
];

const DOMINO_PREVIEWS = [
  {
    name: "SaaS Compression",
    color: "#E63946",
    summary: "Software pricing power collapses as AI replaces enterprise tools",
  },
  {
    name: "White-Collar Displacement",
    color: "#F4A261",
    summary: "Knowledge-worker roles shrink as automation scales",
  },
  {
    name: "Friction Collapse",
    color: "#2A9D8F",
    summary: "Middlemen and platforms lose pricing power to direct AI",
  },
  {
    name: "Ghost GDP",
    color: "#264653",
    summary: "GDP looks fine but fewer people share in the growth",
  },
  {
    name: "Financial Contagion",
    color: "#9B2226",
    summary: "Stress spreads from one sector into credit and housing markets",
  },
  {
    name: "Policy Response",
    color: "#6D6875",
    summary: "Governments react with regulation, stimulus, or restructuring",
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createBlankDraft(template) {
  const cloned = clone(template);
  return {
    ...cloned,
    meta: {
      name: "My Thesis",
      author: "",
      version: cloned.meta.version,
    },
    careerProfile: {
      currentRole: "",
      targetRole: "",
      industry: "",
      experience: "",
      goals: [],
    },
    sources: cloned.sources,
    portfolio: { legs: [] },
  };
}

function readStorageValue(key) {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(key) || "";
}

function normalizeGoals(goals) {
  return [...new Set((goals || []).map((goal) => goal.trim()).filter(Boolean))];
}

async function seedSignalStatuses(userId, dominos) {
  if (!supabase || !dominos?.length) return;

  const rows = dominos.flatMap((domino) =>
    domino.signals.map((signal) => ({
      user_id: userId,
      domino_id: domino.id,
      signal_name: signal.name,
      status: "green",
      is_override: false,
      updated_by: "seed",
    })),
  );

  const { error } = await supabase
    .from("signal_statuses")
    .upsert(rows, { onConflict: "user_id,domino_id,signal_name" });

  if (error) {
    console.warn("Unable to seed signal statuses:", error.message);
  }
}

export default function OnboardingWizard() {
  const { tokens } = useTheme();
  const navigate = useNavigate();
  const { updateThesis, isTestMode, exitTestMode } = useThesis();
  const { userId } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [draftThesis, setDraftThesis] = useState(() =>
    isOwnerMode && !isTestMode
      ? clone(fabianThesis)
      : createBlankDraft(fabianThesis),
  );
  const [enabledDominoIds, setEnabledDominoIds] = useState(() =>
    fabianThesis.dominos.map((domino) => domino.id),
  );
  const [apiKeys, setApiKeys] = useState(() => ({
    fredKey: readStorageValue(FRED_KEY_STORAGE),
    twelveDataKey: readStorageValue(TWELVE_DATA_KEY_STORAGE),
  }));
  const [stepErrors, setStepErrors] = useState({
    career: {},
    thesis: "",
    submit: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const activeDominos = useMemo(
    () =>
      draftThesis.dominos.filter((domino) =>
        enabledDominoIds.includes(domino.id),
      ),
    [draftThesis.dominos, enabledDominoIds],
  );

  const toggleDomino = (dominoId) => {
    setEnabledDominoIds((current) => {
      if (current.includes(dominoId))
        return current.filter((id) => id !== dominoId);
      return [...current, dominoId].sort((a, b) => a - b);
    });
  };

  const validateCareerStep = () => {
    const errors = {};
    const profile = draftThesis.careerProfile;

    if (!profile.currentRole.trim())
      errors.currentRole = "Current role is required.";
    if (!profile.targetRole.trim())
      errors.targetRole = "Target role is required.";
    if (!profile.industry.trim()) errors.industry = "Industry is required.";
    if (!profile.experience.trim())
      errors.experience = "Experience level is required.";

    const goals = normalizeGoals(profile.goals);
    if (goals.length === 0) errors.goals = "Add at least one goal.";

    setStepErrors((current) => ({ ...current, career: errors }));
    return Object.keys(errors).length === 0;
  };

  const validateThesisStep = () => {
    if (activeDominos.length === 0) {
      setStepErrors((current) => ({
        ...current,
        thesis: "Enable at least one domino to define a thesis.",
      }));
      return false;
    }

    const missingDominoName = activeDominos.find(
      (domino) => !domino.name.trim(),
    );
    if (missingDominoName) {
      setStepErrors((current) => ({
        ...current,
        thesis: `Domino ${missingDominoName.id} needs a name.`,
      }));
      return false;
    }

    const missingThreshold = activeDominos.find((domino) =>
      domino.signals.some((signal) => !signal.threshold.trim()),
    );

    if (missingThreshold) {
      setStepErrors((current) => ({
        ...current,
        thesis: `Every signal in active dominos needs a threshold value.`,
      }));
      return false;
    }

    setStepErrors((current) => ({ ...current, thesis: "" }));
    return true;
  };

  const goNext = () => {
    if (currentStep === 1 && !validateCareerStep()) return;
    if (currentStep === 2 && !validateThesisStep()) return;

    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleQuickStart = () => {
    setCurrentStep(STEPS.length - 1);
  };

  const handleComplete = () => {
    if (isSaving) return;

    const normalizedCareer = {
      ...draftThesis.careerProfile,
      currentRole: draftThesis.careerProfile.currentRole.trim(),
      targetRole: draftThesis.careerProfile.targetRole.trim(),
      industry: draftThesis.careerProfile.industry.trim(),
      experience: draftThesis.careerProfile.experience.trim(),
      goals: normalizeGoals(draftThesis.careerProfile.goals),
    };

    const normalizedDominos = draftThesis.dominos
      .filter((domino) => enabledDominoIds.includes(domino.id))
      .map((domino) => {
        const normalizedSignals = domino.signals.map((signal) => ({
          ...signal,
          threshold: signal.threshold.trim(),
        }));

        return {
          ...domino,
          name: domino.name.trim(),
          description: domino.description.trim(),
          signals: normalizedSignals,
          thresholds: normalizedSignals.reduce((acc, signal) => {
            acc[signal.name] = signal.threshold;
            return acc;
          }, {}),
        };
      });

    const candidate = {
      ...draftThesis,
      meta: {
        ...draftThesis.meta,
        author:
          draftThesis.meta.author || normalizedCareer.currentRole || "User",
      },
      dominos: normalizedDominos,
      careerProfile: normalizedCareer,
    };

    const validation = validateThesis(candidate);
    if (!validation.valid) {
      setStepErrors((current) => ({
        ...current,
        submit: `Config validation failed: ${validation.errors.slice(0, 3).join(" | ")}`,
      }));
      return;
    }

    setIsSaving(true);
    setStepErrors((current) => ({ ...current, submit: "" }));

    updateThesis(candidate);
    seedSignalStatuses(userId, candidate.dominos);
    navigate("/", { replace: true });
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <WelcomeStep
          onQuickStart={handleQuickStart}
          onCustomSetup={() => setCurrentStep(1)}
          isTestMode={isTestMode}
          onExitTestMode={() => {
            exitTestMode();
            navigate("/", { replace: true });
          }}
        />
      );
    }

    if (currentStep === 1) {
      return (
        <CareerProfile
          value={draftThesis.careerProfile}
          onChange={(careerProfile) =>
            setDraftThesis((current) => ({ ...current, careerProfile }))
          }
          errors={stepErrors.career}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <ThesisSetup
          thesis={draftThesis}
          enabledDominoIds={enabledDominoIds}
          onToggleDomino={toggleDomino}
          onUpdateThesis={setDraftThesis}
          errors={{ thesis: stepErrors.thesis }}
        />
      );
    }

    if (currentStep === 3) {
      return <APIKeySetup value={apiKeys} onChange={setApiKeys} />;
    }

    return (
      <CompleteStep
        draftThesis={draftThesis}
        activeDominos={activeDominos}
        apiKeys={apiKeys}
        submitError={stepErrors.submit}
      />
    );
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const stepInfo = STEPS[currentStep];

  return (
    <div style={{ minHeight: "100vh", padding: "28px 14px" }}>
      <div className="ab-content-shell">
        <div style={{ ...S.card("rgba(255,255,255,0.1)"), marginBottom: 14 }}>
          <div style={S.label}>Asymmetric Bridge</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: "-0.3px",
            }}
          >
            Set Up Your Dashboard
          </div>
          <div
            style={{
              fontSize: 12,
              color: tokens.colors.textSecondary,
              lineHeight: 1.6,
            }}
          >
            Your setup is saved in your browser. Nothing is sent to any server.
          </div>

          {currentStep > 0 && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: tokens.colors.textSoft,
              }}
            >
              Step {currentStep} of {STEPS.length - 1}
              {stepInfo.estimate && ` · ${stepInfo.estimate}`}
            </div>
          )}

          <div
            style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {STEPS.map((step, index) => (
              <button
                key={step.key}
                type="button"
                onClick={() => {
                  if (index <= currentStep) setCurrentStep(index);
                }}
                style={{
                  ...S.tab(index === currentStep, "#E9C46A"),
                  opacity: index <= currentStep ? 1 : 0.4,
                }}
              >
                {index + 1}. {step.label}
              </button>
            ))}
          </div>
        </div>

        {renderStepContent()}

        {currentStep > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
            }}
          >
            <button
              type="button"
              onClick={goBack}
              disabled={isSaving}
              style={S.tab(true, "#6D6875")}
            >
              Back
            </button>

            {!isLastStep && (
              <button
                type="button"
                onClick={goNext}
                style={S.tab(true, "#2A9D8F")}
              >
                Continue
              </button>
            )}

            {isLastStep && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSaving}
                style={{
                  ...S.tab(true, "#2A9D8F"),
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Finish & Open Dashboard"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WelcomeStep({
  onQuickStart,
  onCustomSetup,
  isTestMode,
  onExitTestMode,
}) {
  const { tokens } = useTheme();
  return (
    <div>
      {isTestMode && isOwnerMode && (
        <div style={{ ...S.card("rgba(233,196,106,0.25)"), marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Testing as new user
              </div>
              <div style={{ fontSize: 11, color: tokens.colors.textMuted }}>
                You are seeing the open source onboarding experience.
              </div>
            </div>
            <button
              type="button"
              onClick={onExitTestMode}
              style={S.tab(true, "#E9C46A")}
            >
              Return to my dashboard
            </button>
          </div>
        </div>
      )}

      <div style={S.card("rgba(42,157,143,0.15)")}>
        <div style={S.label}>What is Asymmetric Bridge?</div>
        <div
          style={{
            display: "grid",
            gap: 14,
            fontSize: 13,
            color: tokens.colors.textSecondary,
            lineHeight: 1.7,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: tokens.colors.text,
              lineHeight: 1.5,
            }}
          >
            Asymmetric Bridge tracks economic disruption signals and connects
            them to your career positioning. It monitors a chain of 6
            cause-and-effect disruption forces — when one falls, it puts
            pressure on the next.
          </div>
          <div>
            Built for professionals navigating career transitions in an
            AI-disrupted economy. Whether you are in enterprise sales,
            engineering, consulting, or creative work — these macro forces
            affect your positioning.
          </div>
        </div>
      </div>

      <div style={{ ...S.card("rgba(230,57,70,0.1)"), marginTop: 14 }}>
        <div style={S.label}>The 6-Domino Cascade</div>
        <div
          style={{
            fontSize: 12,
            color: tokens.colors.textMuted,
            marginBottom: 12,
            lineHeight: 1.6,
          }}
        >
          Each domino is a disruption force. When one tips, it pressures the
          next. This is the chain you will track.
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {DOMINO_PREVIEWS.map((domino, index) => (
            <div
              key={domino.name}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: `${domino.color}0D`,
                border: `1px solid ${domino.color}22`,
              }}
            >
              <div
                style={{
                  minWidth: 22,
                  height: 22,
                  borderRadius: 6,
                  background: `${domino.color}25`,
                  color: domino.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: domino.color,
                    marginBottom: 2,
                  }}
                >
                  {domino.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: tokens.colors.textMuted,
                    lineHeight: 1.5,
                  }}
                >
                  {domino.summary}
                </div>
              </div>
              {index < DOMINO_PREVIEWS.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    right: -6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: tokens.colors.borderStrong,
                    fontSize: 14,
                    display: "none",
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...S.card("rgba(255,255,255,0.06)"), marginTop: 14 }}>
        <div style={S.label}>Where the research comes from</div>
        <div
          style={{
            fontSize: 12,
            color: tokens.colors.textMuted,
            lineHeight: 1.7,
          }}
        >
          Built on macro research from{" "}
          <strong style={{ color: "#E8E4DF" }}>Citrini Research</strong> (bear
          case for SaaS),{" "}
          <strong style={{ color: "#E8E4DF" }}>Leopold Aschenbrenner</strong>{" "}
          (AI capability trajectory),{" "}
          <strong style={{ color: "#E8E4DF" }}>Michael Bloch</strong> (bull
          rebuttal), and{" "}
          <strong style={{ color: "#E8E4DF" }}>Arya Deniz</strong> (trade
          dynamics). These are not predictions — they are a structured way to
          track disruption signals.
        </div>
      </div>

      <div style={{ ...S.card("rgba(233,196,106,0.12)"), marginTop: 14 }}>
        <div style={S.label}>What you get</div>
        <div
          style={{
            display: "grid",
            gap: 6,
            fontSize: 12,
            color: tokens.colors.textSecondary,
            lineHeight: 1.6,
          }}
        >
          <div>
            A personalized dashboard tracking macro disruption signals tied to
            your career.
          </div>
          <div>
            Live data from FRED, Twelve Data, and CoinGecko (or sample data if
            you skip API keys).
          </div>
          <div>
            Signal status tracking, portfolio alignment scoring, and conviction
            ledger.
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}
      >
        <button
          type="button"
          onClick={onQuickStart}
          style={{
            ...S.tab(true, "#2A9D8F"),
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Quick Start — 2 minutes
        </button>
        <button
          type="button"
          onClick={onCustomSetup}
          style={{
            ...S.tab(false, "#E9C46A"),
            padding: "12px 20px",
            fontSize: 14,
          }}
        >
          Custom Setup — 5 minutes
        </button>
      </div>
    </div>
  );
}

function CompleteStep({ draftThesis, activeDominos, apiKeys, submitError }) {
  const { tokens } = useTheme();
  return (
    <div>
      <div style={S.card("rgba(42,157,143,0.2)")}>
        <div style={S.label}>Review Before Save</div>

        <div style={{ display: "grid", gap: 10, fontSize: 12 }}>
          <div style={S.card("rgba(255,255,255,0.08)")}>
            <div style={S.label}>About You</div>
            <div style={{ marginBottom: 5 }}>
              <strong>Current Role:</strong>{" "}
              {draftThesis.careerProfile.currentRole || "Not set"}
            </div>
            <div style={{ marginBottom: 5 }}>
              <strong>Target Role:</strong>{" "}
              {draftThesis.careerProfile.targetRole || "Not set"}
            </div>
            <div style={{ marginBottom: 5 }}>
              <strong>Industry:</strong>{" "}
              {draftThesis.careerProfile.industry || "Not set"}
            </div>
            <div>
              <strong>Goals:</strong>{" "}
              {(draftThesis.careerProfile.goals || []).length}
            </div>
          </div>

          <div style={S.card("rgba(255,255,255,0.08)")}>
            <div style={S.label}>Your Thesis</div>
            <div style={{ marginBottom: 5 }}>
              <strong>Active dominos:</strong> {activeDominos.length} /{" "}
              {draftThesis.dominos.length}
            </div>
            <div>
              <strong>Cascade:</strong>{" "}
              {activeDominos.map((domino) => domino.name).join(" → ") || "None"}
            </div>
          </div>

          <div style={S.card("rgba(255,255,255,0.08)")}>
            <div style={S.label}>Data Sources</div>
            <div style={{ marginBottom: 5 }}>
              <strong>FRED:</strong>{" "}
              {apiKeys.fredKey ? "Configured" : "Using sample data"}
            </div>
            <div>
              <strong>Twelve Data:</strong>{" "}
              {apiKeys.twelveDataKey ? "Configured" : "Using sample data"}
            </div>
          </div>
        </div>

        {submitError && (
          <div
            style={{ marginTop: 10, color: tokens.colors.watch, fontSize: 11 }}
          >
            {submitError}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <ResearchDiscovery
          careerProfile={draftThesis.careerProfile}
          dominos={activeDominos}
        />
      </div>
    </div>
  );
}
