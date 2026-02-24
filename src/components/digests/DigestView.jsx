import { useMemo, useState } from "react";
import { useTheme } from "../../design-tokens";
import { useDigests } from "../../hooks/useDigests";
import { S } from "../../styles";

const PERIOD_OPTIONS = [
  { days: 7, label: "Last 7 days" },
  { days: 14, label: "Last 14 days" },
  { days: 30, label: "Last 30 days" },
];

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return DATE_FORMATTER.format(date);
}

function formatDateTime(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return DATETIME_FORMATTER.format(date);
}

function threatColor(level, tokens) {
  if (level === "CRISIS" || level === "CRITICAL") return tokens.colors.alert;
  if (level === "ELEVATED" || level === "WATCH") return tokens.colors.watch;
  return tokens.colors.baseline;
}

function formatPeriodText(digest) {
  return `${formatDate(digest.periodStart)} to ${formatDate(digest.periodEnd)}`;
}

export default function DigestView() {
  const { tokens } = useTheme();
  const {
    digests,
    latestDigest,
    generateDigest,
    isGenerating,
    exportMarkdown,
  } = useDigests();

  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const historyDigests = useMemo(() => digests.slice(1), [digests]);

  const selectStyle = {
    minWidth: 150,
    padding: "9px 11px",
    fontSize: tokens.typography.sizes.body,
    color: tokens.colors.text,
    background: tokens.colors.surface,
    border: `${tokens.shape.borderWidth}px solid ${tokens.colors.border}`,
    borderRadius: tokens.shape.buttonRadius,
    cursor: "pointer",
  };

  const actionButtonStyle = (accent, disabled = false) => ({
    padding: "9px 12px",
    borderRadius: tokens.shape.buttonRadius,
    border: `${tokens.shape.borderWidth}px solid ${disabled ? tokens.colors.border : `${accent}55`}`,
    background: disabled ? tokens.colors.surface : `${accent}18`,
    color: disabled ? tokens.colors.textMuted : accent,
    fontSize: tokens.typography.sizes.body,
    fontWeight:
      tokens.typography.weights.semibold || tokens.typography.weights.bold,
    cursor: disabled ? "not-allowed" : "pointer",
  });

  const handleGenerate = async () => {
    setFeedback(null);
    try {
      const digest = await generateDigest(selectedPeriod);
      setExpandedHistoryId(digest?.id || null);
      setFeedback({
        type: "success",
        text: `Generated ${selectedPeriod}-day digest.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error?.message || "Failed to generate digest.",
      });
    }
  };

  const handleCopy = async () => {
    if (!latestDigest) return;
    setFeedback(null);
    try {
      await exportMarkdown(latestDigest, "copy");
      setFeedback({
        type: "success",
        text: "Markdown copied to clipboard.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error?.message || "Unable to copy markdown.",
      });
    }
  };

  const handleDownload = async () => {
    if (!latestDigest) return;
    setFeedback(null);
    try {
      await exportMarkdown(latestDigest, "download");
      setFeedback({
        type: "success",
        text: "Digest markdown download started.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error?.message || "Unable to download markdown.",
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 62px)",
        padding: "28px 14px",
      }}
    >
      <div className="ab-content-shell" style={{ display: "grid", gap: 12 }}>
        <div style={{ ...S.card(tokens.colors.border), marginBottom: 0 }}>
          <div style={{ ...S.label, marginBottom: 8 }}>Signal Digests</div>
          <div
            style={{
              fontSize:
                tokens.variant === "observatory"
                  ? tokens.typography.sizes.h2
                  : 20,
              fontWeight: tokens.typography.weights.bold,
              marginBottom: 8,
            }}
          >
            Signal Digest Engine
          </div>
          <div
            style={{
              fontSize: tokens.typography.sizes.body,
              color: tokens.colors.textMuted,
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            Generate on-demand intelligence briefs summarizing status shifts,
            thesis alignment, and action items.
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <select
              value={selectedPeriod}
              onChange={(event) =>
                setSelectedPeriod(Number(event.target.value))
              }
              style={selectStyle}
              aria-label="Digest period"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.days} value={option.days}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={actionButtonStyle(tokens.colors.accent, isGenerating)}
            >
              {isGenerating ? "Generating..." : "Generate Digest"}
            </button>

            <button
              onClick={handleCopy}
              disabled={!latestDigest}
              style={actionButtonStyle(tokens.colors.watch, !latestDigest)}
            >
              Copy Markdown
            </button>

            <button
              onClick={handleDownload}
              disabled={!latestDigest}
              style={actionButtonStyle(tokens.colors.baseline, !latestDigest)}
            >
              Download .md
            </button>
          </div>

          {feedback && (
            <div
              style={{
                marginTop: 10,
                fontSize:
                  tokens.typography.sizes.bodySmall ||
                  tokens.typography.sizes.body,
                color:
                  feedback.type === "error"
                    ? tokens.colors.alert
                    : tokens.colors.baseline,
              }}
            >
              {feedback.text}
            </div>
          )}
        </div>

        <div style={S.card(tokens.colors.border)}>
          <div style={{ ...S.label, marginBottom: 8 }}>Latest Digest</div>
          {!latestDigest && (
            <div
              style={{
                fontSize: tokens.typography.sizes.body,
                color: tokens.colors.textMuted,
              }}
            >
              No digests generated yet.
            </div>
          )}

          {latestDigest && (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: tokens.typography.sizes.label,
                    fontFamily: tokens.typography.fontMono,
                    letterSpacing: tokens.typography.letterSpacing.mono,
                    color: tokens.colors.textMuted,
                  }}
                >
                  {formatPeriodText(latestDigest)}
                </span>
                <span
                  style={{
                    fontSize: tokens.typography.sizes.label,
                    fontFamily: tokens.typography.fontMono,
                    letterSpacing: tokens.typography.letterSpacing.mono,
                    color: threatColor(latestDigest.threatLevel, tokens),
                    border: `${tokens.shape.borderWidth}px solid ${threatColor(latestDigest.threatLevel, tokens)}55`,
                    borderRadius: tokens.shape.buttonRadius,
                    padding: "3px 7px",
                  }}
                >
                  {latestDigest.threatLevel}
                </span>
                <span
                  style={{
                    fontSize: tokens.typography.sizes.label,
                    color: tokens.colors.textMuted,
                    fontFamily: tokens.typography.fontMono,
                  }}
                >
                  Generated {formatDateTime(latestDigest.generatedAt)}
                </span>
              </div>

              <div
                style={{
                  borderTop: `${tokens.shape.borderWidth}px solid ${tokens.colors.border}`,
                  paddingTop: 12,
                  color: tokens.colors.text,
                  fontSize: tokens.typography.sizes.body,
                }}
                dangerouslySetInnerHTML={{ __html: latestDigest.contentHtml }}
              />
            </>
          )}
        </div>

        <div style={S.card(tokens.colors.border)}>
          <div style={{ ...S.label, marginBottom: 8 }}>History</div>
          {!historyDigests.length && (
            <div
              style={{
                fontSize: tokens.typography.sizes.body,
                color: tokens.colors.textMuted,
              }}
            >
              No previous digests yet.
            </div>
          )}

          {historyDigests.length > 0 && (
            <div style={{ display: "grid", gap: 8 }}>
              {historyDigests.map((digest) => {
                const isExpanded = expandedHistoryId === digest.id;
                const color = threatColor(digest.threatLevel, tokens);

                return (
                  <div
                    key={digest.id}
                    style={{
                      border: `${tokens.shape.borderWidth}px solid ${tokens.colors.border}`,
                      borderRadius: tokens.shape.buttonRadius,
                      background: tokens.colors.surface,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() =>
                        setExpandedHistoryId(isExpanded ? null : digest.id)
                      }
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        color: tokens.colors.text,
                        padding: "10px 12px",
                        cursor: "pointer",
                        display: "grid",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: tokens.typography.sizes.body,
                          fontWeight:
                            tokens.typography.weights.semibold ||
                            tokens.typography.weights.bold,
                        }}
                      >
                        {formatPeriodText(digest)}
                      </div>
                      <div
                        style={{
                          fontSize: tokens.typography.sizes.label,
                          color: tokens.colors.textMuted,
                          fontFamily: tokens.typography.fontMono,
                          letterSpacing: tokens.typography.letterSpacing.mono,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <span>{formatDateTime(digest.generatedAt)}</span>
                        <span style={{ color }}>
                          {digest.threatLevel} | +{digest.escalationCount} / -
                          {digest.deescalationCount}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          borderTop: `${tokens.shape.borderWidth}px solid ${tokens.colors.border}`,
                          padding: "10px 12px",
                          color: tokens.colors.text,
                          fontSize: tokens.typography.sizes.body,
                        }}
                        dangerouslySetInnerHTML={{ __html: digest.contentHtml }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
