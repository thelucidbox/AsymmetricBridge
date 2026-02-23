import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThesis } from "../../config/ThesisContext";
import fabianThesis from "../../config/fabian-thesis";
import { validateThesis } from "../../config/thesis-schema";
import { S } from "../../styles";
import APIKeySetup from "./APIKeySetup";
import CareerProfile from "./CareerProfile";
import ThesisSetup from "./ThesisSetup";

const FRED_KEY_STORAGE = "ab-fred-api-key";
const TWELVE_DATA_KEY_STORAGE = "ab-twelve-data-api-key";

const STEPS = [
  { key: "welcome", label: "Welcome" },
  { key: "career", label: "Career Profile" },
  { key: "thesis", label: "Thesis Setup" },
  { key: "api", label: "API Key Setup" },
  { key: "complete", label: "Complete" },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStorageValue(key) {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(key) || "";
}

function normalizeGoals(goals) {
  return [...new Set((goals || []).map((goal) => goal.trim()).filter(Boolean))];
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { updateThesis } = useThesis();

  const [currentStep, setCurrentStep] = useState(0);
  const [draftThesis, setDraftThesis] = useState(() => clone(fabianThesis));
  const [enabledDominoIds, setEnabledDominoIds] = useState(() =>
    fabianThesis.dominos.map((domino) => domino.id),
  );
  const [apiKeys, setApiKeys] = useState(() => ({
    fredKey: readStorageValue(FRED_KEY_STORAGE),
    twelveDataKey: readStorageValue(TWELVE_DATA_KEY_STORAGE),
  }));
  const [stepErrors, setStepErrors] = useState({ career: {}, thesis: "", submit: "" });
  const [isSaving, setIsSaving] = useState(false);

  const activeDominos = useMemo(
    () => draftThesis.dominos.filter((domino) => enabledDominoIds.includes(domino.id)),
    [draftThesis.dominos, enabledDominoIds],
  );

  const toggleDomino = (dominoId) => {
    setEnabledDominoIds((current) => {
      if (current.includes(dominoId)) return current.filter((id) => id !== dominoId);
      return [...current, dominoId].sort((a, b) => a - b);
    });
  };

  const validateCareerStep = () => {
    const errors = {};
    const profile = draftThesis.careerProfile;

    if (!profile.currentRole.trim()) errors.currentRole = "Current role is required.";
    if (!profile.targetRole.trim()) errors.targetRole = "Target role is required.";
    if (!profile.industry.trim()) errors.industry = "Industry is required.";
    if (!profile.experience.trim()) errors.experience = "Experience band is required.";

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

    const missingDominoName = activeDominos.find((domino) => !domino.name.trim());
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
    navigate("/", { replace: true });
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return <WelcomeStep />;
    }

    if (currentStep === 1) {
      return (
        <CareerProfile
          value={draftThesis.careerProfile}
          onChange={(careerProfile) => setDraftThesis((current) => ({ ...current, careerProfile }))}
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

  return (
    <div style={{ minHeight: "100vh", padding: "28px 14px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ ...S.card("rgba(255,255,255,0.1)"), marginBottom: 14 }}>
          <div style={S.label}>Asymmetric Bridge OSS Onboarding</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.3px" }}>
            Build your thesis profile
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            This wizard creates your local thesis config and saves it via `useThesis().updateThesis()` when complete.
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STEPS.map((step, index) => (
              <button
                key={step.key}
                type="button"
                onClick={() => {
                  if (index <= currentStep) setCurrentStep(index);
                }}
                style={S.tab(index === currentStep, "#E9C46A")}
              >
                {index + 1}. {step.label}
              </button>
            ))}
          </div>
        </div>

        {renderStepContent()}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0 || isSaving}
            style={{
              ...S.tab(currentStep > 0, "#6D6875"),
              opacity: currentStep > 0 ? 1 : 0.5,
              cursor: currentStep > 0 ? "pointer" : "not-allowed",
            }}
          >
            Back
          </button>

          {!isLastStep && (
            <button type="button" onClick={goNext} style={S.tab(true, "#2A9D8F")}>
              Continue
            </button>
          )}

          {isLastStep && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isSaving}
              style={{ ...S.tab(true, "#2A9D8F"), opacity: isSaving ? 0.6 : 1 }}
            >
              {isSaving ? "Saving..." : "Finish & Open Dashboard"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div style={S.card("rgba(42,157,143,0.2)")}>
      <div style={S.label}>Welcome</div>
      <div style={{ display: "grid", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
        <div>
          You will define your career profile, customize the 6-domino macro thesis template, and optionally set API keys for live data.
        </div>
        <div>
          Your config is local-first: data is saved in browser storage at the end of onboarding and loaded through the thesis context.
        </div>
      </div>
    </div>
  );
}

function CompleteStep({ draftThesis, activeDominos, apiKeys, submitError }) {
  return (
    <div style={S.card("rgba(42,157,143,0.2)")}>
      <div style={S.label}>Review Before Save</div>

      <div style={{ display: "grid", gap: 10, fontSize: 12 }}>
        <div style={S.card("rgba(255,255,255,0.08)")}>
          <div style={S.label}>Career Summary</div>
          <div style={{ marginBottom: 5 }}>
            <strong>Current:</strong> {draftThesis.careerProfile.currentRole || "Not set"}
          </div>
          <div style={{ marginBottom: 5 }}>
            <strong>Target:</strong> {draftThesis.careerProfile.targetRole || "Not set"}
          </div>
          <div style={{ marginBottom: 5 }}>
            <strong>Industry:</strong> {draftThesis.careerProfile.industry || "Not set"}
          </div>
          <div>
            <strong>Goals:</strong> {(draftThesis.careerProfile.goals || []).length}
          </div>
        </div>

        <div style={S.card("rgba(255,255,255,0.08)")}>
          <div style={S.label}>Thesis Summary</div>
          <div style={{ marginBottom: 5 }}>
            <strong>Active dominos:</strong> {activeDominos.length} / {draftThesis.dominos.length}
          </div>
          <div>
            <strong>Cascade:</strong> {activeDominos.map((domino) => domino.name).join(" → ") || "None"}
          </div>
        </div>

        <div style={S.card("rgba(255,255,255,0.08)")}>
          <div style={S.label}>API Keys</div>
          <div style={{ marginBottom: 5 }}>
            <strong>FRED:</strong> {apiKeys.fredKey ? "Configured" : "Not configured"}
          </div>
          <div>
            <strong>Twelve Data:</strong> {apiKeys.twelveDataKey ? "Configured" : "Not configured"}
          </div>
        </div>
      </div>

      {submitError && <div style={{ marginTop: 10, color: "#F4A261", fontSize: 11 }}>{submitError}</div>}
    </div>
  );
}
