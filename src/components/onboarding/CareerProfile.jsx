import { useState } from "react";
import ResumeIngestion from "./ResumeIngestion";
import { useTheme } from "../../design-tokens";
import { S } from "../../styles";

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Select experience" },
  { value: "0-2", label: "0-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "10+ years" },
];

const GOAL_SUGGESTIONS = [
  "Transition to a higher-leverage role",
  "Build AI-native skills and services",
  "Develop a public portfolio of work",
  "Move from execution to strategy",
  "Create consulting or advisory offers",
];

function dedupeGoals(goals) {
  return [...new Set((goals || []).map((goal) => goal.trim()).filter(Boolean))];
}

function FieldError({ message }) {
  const { tokens } = useTheme();
  if (!message) return null;
  return (
    <div style={{ color: tokens.colors.watch, fontSize: 11, marginTop: 4 }}>
      {message}
    </div>
  );
}

export default function CareerProfile({ value, onChange, errors }) {
  const { tokens } = useTheme();
  const [goalInput, setGoalInput] = useState("");

  const updateField = (field, nextValue) => {
    onChange({ ...value, [field]: nextValue });
  };

  const addGoal = (goalText) => {
    const goal = goalText.trim();
    if (!goal) return;
    const nextGoals = dedupeGoals([...(value.goals || []), goal]);
    onChange({ ...value, goals: nextGoals });
    setGoalInput("");
  };

  const removeGoal = (goal) => {
    const nextGoals = (value.goals || []).filter(
      (currentGoal) => currentGoal !== goal,
    );
    onChange({ ...value, goals: nextGoals });
  };

  const applyResumeParse = (parsed) => {
    const mergedGoals = dedupeGoals([
      ...(value.goals || []),
      ...(parsed.goals || []),
    ]);

    onChange({
      ...value,
      currentRole: parsed.currentRole || value.currentRole,
      targetRole:
        parsed.targetRole || value.targetRole || parsed.currentRole || "",
      industry: parsed.industry || value.industry,
      experience: parsed.experience || value.experience,
      goals: mergedGoals,
    });
  };

  return (
    <div>
      <ResumeIngestion onApply={applyResumeParse} />

      <div style={S.card("rgba(42,157,143,0.2)")}>
        <div style={S.label}>About You</div>
        <div
          style={{
            fontSize: 12,
            color: tokens.colors.textMuted,
            marginBottom: 10,
            lineHeight: 1.6,
          }}
        >
          This helps connect macro signals to your specific career context.
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label htmlFor="currentRole" style={S.label}>
              Current Role
            </label>
            <input
              id="currentRole"
              value={value.currentRole}
              onChange={(event) =>
                updateField("currentRole", event.target.value)
              }
              placeholder="e.g. Enterprise Account Executive"
              style={inputStyle}
            />
            <FieldError message={errors.currentRole} />
          </div>

          <div>
            <label htmlFor="targetRole" style={S.label}>
              Target Role
            </label>
            <input
              id="targetRole"
              value={value.targetRole}
              onChange={(event) =>
                updateField("targetRole", event.target.value)
              }
              placeholder="e.g. AI Strategy Advisor"
              style={inputStyle}
            />
            <FieldError message={errors.targetRole} />
          </div>

          <div>
            <label htmlFor="industry" style={S.label}>
              Industry Focus
            </label>
            <input
              id="industry"
              value={value.industry}
              onChange={(event) => updateField("industry", event.target.value)}
              placeholder="e.g. AI consulting + macro strategy"
              style={inputStyle}
            />
            <FieldError message={errors.industry} />
          </div>

          <div>
            <label htmlFor="experience" style={S.label}>
              Years of Experience
            </label>
            <select
              id="experience"
              value={value.experience}
              onChange={(event) =>
                updateField("experience", event.target.value)
              }
              style={inputStyle}
            >
              {EXPERIENCE_OPTIONS.map((option) => (
                <option
                  key={option.value || "placeholder"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.experience} />
          </div>

          <div>
            <div style={S.label}>Career Goals</div>
            <div
              style={{
                fontSize: 11,
                color: tokens.colors.textMuted,
                marginBottom: 6,
              }}
            >
              What are you working toward?
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={goalInput}
                onChange={(event) => setGoalInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addGoal(goalInput);
                  }
                }}
                placeholder="Add a goal and press Enter"
                style={{ ...inputStyle, marginBottom: 0 }}
              />
              <button
                type="button"
                onClick={() => addGoal(goalInput)}
                style={S.tab(false, "#E9C46A")}
              >
                Add
              </button>
            </div>

            {(value.goals || []).length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                {value.goals.map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => removeGoal(goal)}
                    style={{
                      ...S.tab(true, "#2A9D8F"),
                      padding: "4px 8px",
                      fontSize: 10,
                    }}
                    title="Remove goal"
                  >
                    {goal} ×
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {GOAL_SUGGESTIONS.map((goal) => (
                <button
                  type="button"
                  key={goal}
                  onClick={() => addGoal(goal)}
                  style={S.tab(false, "#6D6875")}
                >
                  {goal}
                </button>
              ))}
            </div>

            <FieldError message={errors.goals} />
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: 8,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#E8E4DF",
  padding: "9px 10px",
  fontSize: 12,
  fontFamily: "'IBM Plex Sans', sans-serif",
  boxSizing: "border-box",
};
