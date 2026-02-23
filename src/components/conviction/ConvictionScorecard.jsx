import { useMemo, useState } from "react";
import { ALL_SIGNALS } from "../../data/dominos";
import { useTheme } from "../../design-tokens";
import { usePredictions } from "../../hooks/usePredictions";
import { useSignalStatuses } from "../../hooks/useSignalStatuses";
import { S } from "../../styles";

const TEMPLATE_OPTIONS = [
  { id: "threshold", label: "Threshold", description: "Signal X breaches Y by date Z" },
  { id: "direction", label: "Direction", description: "Metric X goes up/down by date Z" },
  { id: "range", label: "Range", description: "Metric X lands between Y and Z by date Z" },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function defaultTargetDate(days = 30) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No date";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function withAlpha(color, alpha) {
  const safeAlpha = clamp(alpha, 0, 1);
  const raw = String(color || "").trim();

  if (raw.startsWith("#")) {
    let hex = raw.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((char) => `${char}${char}`).join("");
    }
    if (hex.length !== 6) return color;
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
  }

  if (raw.startsWith("rgba(")) {
    const body = raw.slice(5, -1);
    const parts = body.split(",").map((part) => part.trim());
    if (parts.length >= 3) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${safeAlpha})`;
  }

  if (raw.startsWith("rgb(")) {
    const body = raw.slice(4, -1);
    const parts = body.split(",").map((part) => part.trim());
    if (parts.length >= 3) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${safeAlpha})`;
  }

  return color;
}

function toTargetDateISOString(dateInput) {
  const parsed = new Date(`${dateInput}T23:59:59`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function conditionLabel(prediction) {
  const condition = prediction.condition || {};
  if (prediction.type === "threshold") {
    const operator = condition.operator === "gte"
      ? ">="
      : condition.operator === "gt"
        ? ">"
        : condition.operator === "lte"
          ? "<="
          : "<";
    return `${operator} ${condition.threshold}`;
  }

  if (prediction.type === "direction") {
    const direction = condition.direction === "down" ? "down" : "up";
    const baseline = condition.baselineValue;
    if (baseline === null || baseline === undefined || baseline === "") {
      return `Direction: ${direction}`;
    }
    return `${direction} vs ${baseline}`;
  }

  return `${condition.min} to ${condition.max}`;
}

function timelineDotColor(prediction, tokens) {
  if (prediction.status !== "scored") return tokens.colors.accent;
  if (prediction.outcome === "hit") return tokens.colors.baseline;
  if (prediction.outcome === "miss") return tokens.colors.alert;
  return tokens.colors.watch;
}

function outcomeColor(outcome, tokens) {
  if (outcome === "hit") return tokens.colors.baseline;
  if (outcome === "miss") return tokens.colors.alert;
  return tokens.colors.watch;
}

function battingColor(average, tokens) {
  const percent = average * 100;
  if (percent > 60) return tokens.colors.baseline;
  if (percent >= 40) return tokens.colors.watch;
  return tokens.colors.alert;
}

function BattingRing({ battingAverage, tokens }) {
  const percent = Math.round(clamp(battingAverage, 0, 1) * 100);
  const ringColor = battingColor(battingAverage, tokens);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto" }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke={withAlpha(tokens.colors.textMuted, 0.35)}
          strokeWidth="10"
          fill="transparent"
        />
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          transform="rotate(-90 75 75)"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: "stroke-dasharray 0.35s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: tokens.variant === "observatory" ? 34 : 30,
            fontWeight: tokens.typography.weights.bold,
            letterSpacing: tokens.typography.letterSpacing.heading,
          }}
        >
          {percent}%
        </div>
        <div
          style={{
            fontSize: tokens.typography.sizes.label,
            color: tokens.colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: tokens.typography.letterSpacing.label,
            fontFamily: tokens.typography.fontMono,
          }}
        >
          batting avg
        </div>
      </div>
    </div>
  );
}

function PredictionCard({
  prediction,
  tokens,
  isActive,
  onManualScore,
  isLoading,
}) {
  const tone = isActive ? tokens.colors.accent : outcomeColor(prediction.outcome, tokens);
  const label = isActive
    ? "Pending"
    : prediction.outcome === "hit"
      ? "Hit"
      : prediction.outcome === "miss"
        ? "Miss"
        : "Partial";
  const isDue = new Date(prediction.targetDate).getTime() <= Date.now();

  return (
    <div
      className={isActive ? "ab-conviction-active" : undefined}
      style={{
        ...S.card(withAlpha(tone, 0.5)),
        marginBottom: 0,
        "--ab-active-border-low": withAlpha(tone, 0.28),
        "--ab-active-border-high": withAlpha(tone, 0.82),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: tokens.typography.sizes.body,
              fontWeight: tokens.typography.weights.semibold,
              marginBottom: 3,
            }}
          >
            {prediction.signalName || "Unknown Signal"}
          </div>
          <div
            style={{
              fontSize: tokens.typography.sizes.label,
              color: tokens.colors.textMuted,
              fontFamily: tokens.typography.fontMono,
              letterSpacing: tokens.typography.letterSpacing.mono,
              textTransform: "uppercase",
            }}
          >
            {prediction.type}
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${withAlpha(tone, 0.55)}`,
            color: tone,
            background: withAlpha(tone, 0.12),
            borderRadius: tokens.shape.badgeRadius,
            padding: tokens.spacing.badgePadding,
            fontSize: tokens.typography.sizes.badge,
            fontWeight: tokens.typography.weights.bold,
            fontFamily: tokens.typography.fontMono,
            textTransform: "uppercase",
            letterSpacing: tokens.typography.letterSpacing.badge,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 8,
          fontSize: tokens.typography.sizes.bodySmall,
          color: tokens.colors.textMuted,
        }}
      >
        <span>Condition: {conditionLabel(prediction)}</span>
        <span>Target: {formatDate(prediction.targetDate)}</span>
      </div>

      {prediction.notes && (
        <div
          style={{
            fontSize: tokens.typography.sizes.bodySmall,
            color: tokens.colors.textMuted,
            marginBottom: isActive && isDue ? 10 : 0,
            lineHeight: 1.5,
          }}
        >
          {prediction.notes}
        </div>
      )}

      {isActive && isDue && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["hit", "partial", "miss"].map((outcome) => (
            <button
              key={outcome}
              type="button"
              onClick={() => onManualScore(prediction.id, outcome)}
              disabled={isLoading}
              style={{
                border: `1px solid ${tokens.colors.borderStrong || tokens.colors.border}`,
                background: tokens.colors.surface,
                color: tokens.colors.text,
                borderRadius: tokens.shape.buttonRadius,
                padding: "6px 10px",
                fontSize: tokens.typography.sizes.label,
                fontFamily: tokens.typography.fontMono,
                letterSpacing: tokens.typography.letterSpacing.label,
                textTransform: "uppercase",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Mark {outcome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConvictionScorecard() {
  const { tokens } = useTheme();
  const { data: signalStatuses } = useSignalStatuses();
  const {
    predictions,
    activePredictions,
    scoredPredictions,
    battingAverage,
    addPrediction,
    scorePrediction,
    isLoading,
  } = usePredictions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [template, setTemplate] = useState("threshold");
  const [selectedSignalKey, setSelectedSignalKey] = useState("");
  const [targetDate, setTargetDate] = useState(defaultTargetDate());
  const [operator, setOperator] = useState("gte");
  const [threshold, setThreshold] = useState("");
  const [direction, setDirection] = useState("up");
  const [baselineValue, setBaselineValue] = useState("");
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const signalOptions = useMemo(() => {
    const byKey = new Map();
    for (const status of signalStatuses || []) {
      byKey.set(
        `${status.domino_id}|${status.signal_name}`,
        status.signal_id || status.id || null,
      );
    }

    return ALL_SIGNALS.map((signal) => {
      const key = `${signal.dominoId}|${signal.name}`;
      return {
        key,
        signalId: byKey.get(key) || null,
        signalName: signal.name,
        dominoId: signal.dominoId,
        dominoName: signal.dominoName,
      };
    });
  }, [signalStatuses]);

  const selectedSignal = useMemo(
    () => signalOptions.find((option) => option.key === selectedSignalKey) || null,
    [signalOptions, selectedSignalKey],
  );

  const inputStyle = {
    border: `1px solid ${tokens.colors.border}`,
    background: tokens.colors.surface,
    color: tokens.colors.text,
    borderRadius: tokens.shape.buttonRadius,
    padding: "9px 10px",
    fontSize: tokens.typography.sizes.bodySmall,
    width: "100%",
  };

  const buttonStyle = {
    border: `1px solid ${tokens.colors.borderStrong || tokens.colors.border}`,
    background: tokens.colors.surface,
    color: tokens.colors.text,
    borderRadius: tokens.shape.buttonRadius,
    padding: "8px 12px",
    fontSize: tokens.typography.sizes.label,
    fontFamily: tokens.typography.fontMono,
    letterSpacing: tokens.typography.letterSpacing.label,
    textTransform: "uppercase",
    cursor: "pointer",
  };

  async function handleCreatePrediction(event) {
    event.preventDefault();
    setFormError("");

    if (!selectedSignal) {
      setFormError("Choose a signal before saving.");
      return;
    }

    const targetDateIso = toTargetDateISOString(targetDate);
    if (!targetDateIso) {
      setFormError("Target date is invalid.");
      return;
    }

    const payload = {
      signalId: selectedSignal.signalId || null,
      signalName: selectedSignal.signalName,
      dominoId: selectedSignal.dominoId,
      targetDate: targetDateIso,
      notes: notes.trim() || null,
    };

    if (template === "threshold") {
      payload.operator = operator;
      payload.threshold = threshold;
    }

    if (template === "direction") {
      payload.direction = direction;
      payload.baselineValue = baselineValue;
    }

    if (template === "range") {
      payload.min = rangeMin;
      payload.max = rangeMax;
    }

    try {
      await addPrediction(template, payload);
      setThreshold("");
      setBaselineValue("");
      setRangeMin("");
      setRangeMax("");
      setNotes("");
      setTargetDate(defaultTargetDate());
      setIsFormOpen(false);
    } catch (error) {
      setFormError(error?.message || "Prediction could not be saved.");
    }
  }

  async function handleManualScore(predictionId, outcome) {
    try {
      await scorePrediction(predictionId, outcome);
    } catch {
      // Swallow inline button errors; the hook query remains source of truth.
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 62px)",
        padding: "28px 14px",
      }}
    >
      <div className="ab-content-shell" style={{ display: "grid", gap: 12 }}>
        <div style={{ ...S.card(withAlpha(tokens.colors.accent, 0.35)), marginBottom: 0 }}>
          <div style={{ ...S.label, marginBottom: 10 }}>Conviction Ledger</div>

          <BattingRing battingAverage={battingAverage} tokens={tokens} />

          <div
            style={{
              textAlign: "center",
              marginTop: 10,
              fontSize: tokens.typography.sizes.bodySmall,
              color: tokens.colors.textMuted,
            }}
          >
            {scoredPredictions.length} scored predictions across {predictions.length} total entries.
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ ...S.label, marginBottom: 6 }}>Timeline</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {predictions.length === 0 && (
                <span style={{ fontSize: tokens.typography.sizes.bodySmall, color: tokens.colors.textMuted }}>
                  No predictions yet.
                </span>
              )}
              {predictions.map((prediction) => (
                <span
                  key={`dot-${prediction.id}`}
                  title={`${prediction.signalName || "Signal"} • ${prediction.status}`}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: timelineDotColor(prediction, tokens),
                    boxShadow: `0 0 0 1px ${withAlpha(tokens.colors.borderStrong || tokens.colors.border, 0.55)}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...S.card(withAlpha(tokens.colors.watch, 0.28)), marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div>
              <div style={{ ...S.label, marginBottom: 4 }}>Predictions</div>
              <div style={{ fontSize: tokens.typography.sizes.bodySmall, color: tokens.colors.textMuted }}>
                Record a thesis call, set a date, and let outcomes compound your batting average.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen((open) => !open)}
              style={{
                ...buttonStyle,
                borderColor: withAlpha(tokens.colors.accent, 0.6),
                color: tokens.colors.accent,
                whiteSpace: "nowrap",
              }}
            >
              {isFormOpen ? "Close" : "New Prediction"}
            </button>
          </div>

          {isFormOpen && (
            <form onSubmit={handleCreatePrediction} style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={S.label}>Template</span>
                  <select
                    value={template}
                    onChange={(event) => setTemplate(event.target.value)}
                    style={inputStyle}
                  >
                    {TEMPLATE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={S.label}>Target Date</span>
                  <input
                    type="date"
                    value={targetDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setTargetDate(event.target.value)}
                    style={inputStyle}
                    required
                  />
                </label>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={S.label}>Signal</span>
                <select
                  value={selectedSignalKey}
                  onChange={(event) => setSelectedSignalKey(event.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Choose a signal</option>
                  {signalOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      Domino {option.dominoId} · {option.signalName}
                    </option>
                  ))}
                </select>
              </label>

              {template === "threshold" && (
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={S.label}>Operator</span>
                    <select value={operator} onChange={(event) => setOperator(event.target.value)} style={inputStyle}>
                      <option value="gte">&gt;=</option>
                      <option value="gt">&gt;</option>
                      <option value="lte">&lt;=</option>
                      <option value="lt">&lt;</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={S.label}>Threshold Value</span>
                    <input
                      type="number"
                      step="any"
                      value={threshold}
                      onChange={(event) => setThreshold(event.target.value)}
                      style={inputStyle}
                      required
                    />
                  </label>
                </div>
              )}

              {template === "direction" && (
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={S.label}>Direction</span>
                    <select
                      value={direction}
                      onChange={(event) => setDirection(event.target.value)}
                      style={inputStyle}
                    >
                      <option value="up">Up</option>
                      <option value="down">Down</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={S.label}>Value At Creation (optional)</span>
                    <input
                      type="number"
                      step="any"
                      value={baselineValue}
                      onChange={(event) => setBaselineValue(event.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>
              )}

              {template === "range" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={S.label}>Min Value</span>
                    <input
                      type="number"
                      step="any"
                      value={rangeMin}
                      onChange={(event) => setRangeMin(event.target.value)}
                      style={inputStyle}
                      required
                    />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={S.label}>Max Value</span>
                    <input
                      type="number"
                      step="any"
                      value={rangeMax}
                      onChange={(event) => setRangeMax(event.target.value)}
                      style={inputStyle}
                      required
                    />
                  </label>
                </div>
              )}

              <label style={{ display: "grid", gap: 6 }}>
                <span style={S.label}>Notes (optional)</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Why this call matters for your thesis"
                />
              </label>

              {formError && (
                <div style={{ fontSize: tokens.typography.sizes.bodySmall, color: tokens.colors.alert }}>
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: tokens.typography.sizes.bodySmall, color: tokens.colors.textMuted }}>
                  {TEMPLATE_OPTIONS.find((entry) => entry.id === template)?.description}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    ...buttonStyle,
                    borderColor: withAlpha(tokens.colors.baseline, 0.55),
                    color: tokens.colors.baseline,
                    opacity: isLoading ? 0.65 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  Save Prediction
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={{ ...S.card(withAlpha(tokens.colors.accent, 0.2)), marginBottom: 0 }}>
          <div style={{ ...S.label, marginBottom: 10 }}>Active ({activePredictions.length})</div>
          <div style={{ display: "grid", gap: 10 }}>
            {activePredictions.length === 0 && (
              <div style={{ fontSize: tokens.typography.sizes.bodySmall, color: tokens.colors.textMuted }}>
                No active predictions.
              </div>
            )}
            {activePredictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                tokens={tokens}
                isActive
                onManualScore={handleManualScore}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>

        <div style={{ ...S.card(withAlpha(tokens.colors.textMuted, 0.22)), marginBottom: 0 }}>
          <div style={{ ...S.label, marginBottom: 10 }}>Scored ({scoredPredictions.length})</div>
          <div style={{ display: "grid", gap: 10 }}>
            {scoredPredictions.length === 0 && (
              <div style={{ fontSize: tokens.typography.sizes.bodySmall, color: tokens.colors.textMuted }}>
                No scored predictions yet.
              </div>
            )}
            {scoredPredictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                tokens={tokens}
                isActive={false}
                onManualScore={handleManualScore}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
