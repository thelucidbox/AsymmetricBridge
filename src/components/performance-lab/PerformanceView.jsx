import { useMemo } from "react";
import { UNALIGNED_LEG_NAME } from "../../lib/leg-mapper";
import {
  copyToClipboard,
  downloadFile,
  performanceToMarkdown,
} from "../../lib/export-utils";
import { useTheme } from "../../design-tokens";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { S } from "../../styles";
import CSVUpload from "./CSVUpload";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatPercent(value, digits = 1) {
  const safeValue = Number(value) || 0;
  return `${safeValue.toFixed(digits)}%`;
}

function ScoreRing({ score }) {
  const { tokens } = useTheme();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(score, 100)) / 100) * circumference;

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={tokens.colors.borderStrong}
          strokeWidth="10"
          fill="transparent"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={tokens.colors.baseline}
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          transform="rotate(-90 70 70)"
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
          className="ab-tabular-nums"
          style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-1px" }}
        >
          {Math.round(score)}
        </div>
        <div
          style={{
            fontSize: 10,
            color: tokens.colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: tokens.typography.fontMono,
          }}
        >
          alignment
        </div>
      </div>
    </div>
  );
}

export default function PerformanceView() {
  const { tokens } = useTheme();
  const {
    positions,
    legBreakdown,
    alignmentScore,
    uploadCSV,
    isProcessing,
    detectedFormat,
    lastImportMeta,
    totalPortfolioValue,
  } = usePortfolioData();

  const unalignedBucket = useMemo(
    () => legBreakdown.find((bucket) => bucket.legName === UNALIGNED_LEG_NAME),
    [legBreakdown],
  );

  const alignedLegs = useMemo(
    () => alignmentScore.breakdown || [],
    [alignmentScore.breakdown],
  );

  const defaultTarget = alignedLegs.length > 0 ? 100 / alignedLegs.length : 0;

  const comparisonRows = alignedLegs.map((row) => ({
    ...row,
    targetForChart:
      row.targetPercent === null ? defaultTarget : row.targetPercent,
    usesDerivedTarget: row.targetPercent === null,
  }));

  async function onAnalyze(parsedPayload) {
    await uploadCSV(parsedPayload);
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 62px)",
        padding: "28px 14px",
      }}
    >
      <div className="ab-content-shell" style={{ display: "grid", gap: 12 }}>
        <CSVUpload onConfirm={onAnalyze} isProcessing={isProcessing} />

        {positions.length > 0 && (
          <>
            <div
              className="ab-stack-grid"
              style={{
                ...S.card("rgba(42,157,143,0.24)"),
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 20,
                alignItems: "center",
              }}
            >
              <ScoreRing score={alignmentScore.score} />
              <div style={{ minWidth: 0 }}>
                <div style={{ ...S.label, marginBottom: 6 }}>
                  Thesis Performance Lab
                </div>
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    marginBottom: 6,
                    margin: "0 0 6px 0",
                  }}
                >
                  Portfolio Thesis Alignment
                </h1>
                <div
                  style={{
                    fontSize: 12,
                    color: tokens.colors.textSecondary,
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}
                >
                  {formatPercent(alignmentScore.alignedPercent)} aligned to
                  thesis legs. {formatPercent(alignmentScore.unalignedPercent)}{" "}
                  sits outside your mapped thesis exposure.
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span
                    className="ab-tabular-nums"
                    style={{
                      fontSize: 10,
                      fontFamily: tokens.typography.fontMono,
                      color: tokens.colors.textMuted,
                      border: `1px solid ${tokens.colors.borderStrong}`,
                      borderRadius: 5,
                      padding: "4px 7px",
                    }}
                  >
                    Total Value: {formatCurrency(totalPortfolioValue)}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: tokens.typography.fontMono,
                      color: tokens.colors.textMuted,
                      border: `1px solid ${tokens.colors.borderStrong}`,
                      borderRadius: 5,
                      padding: "4px 7px",
                    }}
                  >
                    Format: {detectedFormat || "Unknown"}
                  </span>
                  {lastImportMeta && (
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: tokens.typography.fontMono,
                        color: tokens.colors.textMuted,
                        border: `1px solid ${tokens.colors.borderStrong}`,
                        borderRadius: 5,
                        padding: "4px 7px",
                      }}
                    >
                      Rows: {lastImportMeta.totalRows} (
                      {lastImportMeta.skippedRows} skipped)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const md = performanceToMarkdown(
                        alignmentScore,
                        legBreakdown,
                        positions,
                        totalPortfolioValue,
                        detectedFormat,
                      );
                      copyToClipboard(md);
                    }}
                    style={{
                      fontSize: 10,
                      fontFamily: tokens.typography.fontMono,
                      color: tokens.colors.textMuted,
                      border: `1px solid ${tokens.colors.borderStrong}`,
                      borderRadius: 5,
                      padding: "4px 7px",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    Copy .md
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const md = performanceToMarkdown(
                        alignmentScore,
                        legBreakdown,
                        positions,
                        totalPortfolioValue,
                        detectedFormat,
                      );
                      downloadFile(md, "performance-report.md");
                    }}
                    style={{
                      fontSize: 10,
                      fontFamily: tokens.typography.fontMono,
                      color: tokens.colors.textMuted,
                      border: `1px solid ${tokens.colors.borderStrong}`,
                      borderRadius: 5,
                      padding: "4px 7px",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    Download .md
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {alignedLegs.map((row) => {
                const mappedLeg = legBreakdown.find(
                  (leg) => leg.legName === row.leg,
                );
                const hasTarget = row.targetPercent !== null;
                const deltaColor =
                  row.delta === null
                    ? tokens.colors.textMuted
                    : row.delta > 4
                      ? tokens.colors.alert
                      : row.delta < -4
                        ? tokens.colors.watch
                        : tokens.colors.baseline;

                return (
                  <div
                    key={row.leg}
                    style={S.card(`${row.color || tokens.colors.baseline}33`)}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: row.color || tokens.colors.text,
                        marginBottom: 4,
                      }}
                    >
                      {row.leg}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: tokens.colors.textMuted,
                        lineHeight: 1.5,
                        marginBottom: 10,
                      }}
                    >
                      {mappedLeg?.thesis}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div style={{ ...S.label, marginBottom: 3 }}>
                          Actual
                        </div>
                        <div
                          className="ab-tabular-nums"
                          style={{ fontSize: 16, fontWeight: 700 }}
                        >
                          {formatPercent(row.actualPercent)}
                        </div>
                      </div>
                      <div>
                        <div style={{ ...S.label, marginBottom: 3 }}>
                          Target
                        </div>
                        <div
                          className="ab-tabular-nums"
                          style={{ fontSize: 16, fontWeight: 700 }}
                        >
                          {hasTarget ? formatPercent(row.targetPercent) : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div style={{ ...S.label, marginBottom: 3 }}>Delta</div>
                        <div
                          className="ab-tabular-nums"
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: deltaColor,
                          }}
                        >
                          {hasTarget ? formatPercent(row.delta) : "N/A"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{ fontSize: 11, color: tokens.colors.textMuted }}
                    >
                      {mappedLeg?.positions?.length || 0} mapped positions ·{" "}
                      {formatCurrency(row.totalValue)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={S.card("rgba(233,196,106,0.24)")}>
              <div style={{ ...S.label, marginBottom: 8 }}>
                Allocation Comparison
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: tokens.colors.textSecondary,
                  marginBottom: 10,
                }}
              >
                Actual vs target allocation by leg.
                {comparisonRows.some((row) => row.usesDerivedTarget) && (
                  <span style={{ color: tokens.colors.textMuted }}>
                    {" "}
                    If no target is defined, an equal-weight reference is used
                    for comparison.
                  </span>
                )}
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {comparisonRows.map((row) => (
                  <div
                    key={`bars-${row.leg}`}
                    style={{ display: "grid", gap: 5 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600 }}>
                        {row.leg}
                      </div>
                      <div
                        style={{ fontSize: 10, color: tokens.colors.textMuted }}
                      >
                        {formatPercent(row.actualPercent)} vs{" "}
                        {formatPercent(row.targetForChart)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ display: "grid", gap: 4, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 9,
                            color: tokens.colors.textSoft,
                          }}
                        >
                          Actual
                        </div>
                        <div
                          style={{
                            height: 10,
                            borderRadius: 999,
                            background: tokens.colors.border,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(Math.max(row.actualPercent, 0), 100)}%`,
                              height: "100%",
                              background: row.color || tokens.colors.baseline,
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 4, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 9,
                            color: tokens.colors.textSoft,
                          }}
                        >
                          {row.usesDerivedTarget ? "Ref Target" : "Target"}
                        </div>
                        <div
                          style={{
                            height: 10,
                            borderRadius: 999,
                            background: tokens.colors.border,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(Math.max(row.targetForChart, 0), 100)}%`,
                              height: "100%",
                              background: "rgba(233,196,106,0.9)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.card("rgba(230,57,70,0.24)")}>
              <div style={{ ...S.label, marginBottom: 8 }}>
                Unaligned Positions
              </div>
              {unalignedBucket?.positions?.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <div
                    style={{ fontSize: 12, color: tokens.colors.textSecondary }}
                  >
                    {unalignedBucket.positions.length} positions are currently
                    unmapped to thesis legs.
                  </div>
                  <div
                    style={{
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8,
                        padding: "8px 10px",
                        fontSize: 10,
                        fontFamily: tokens.typography.fontMono,
                        color: tokens.colors.textMuted,
                        background: tokens.colors.surfaceRaised,
                      }}
                    >
                      <span>Symbol</span>
                      <span>Quantity</span>
                      <span>Market Value</span>
                    </div>
                    {unalignedBucket.positions.map((position, index) => (
                      <div
                        key={`${position.symbol}-${index}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 8,
                          padding: "8px 10px",
                          borderTop: `1px solid ${tokens.colors.borderSubtle}`,
                          fontSize: 11,
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>
                          {position.symbol}
                        </span>
                        <span
                          className="ab-tabular-nums"
                          style={{ color: tokens.colors.textSecondary }}
                        >
                          {Number(position.quantity || 0).toFixed(4)}
                        </span>
                        <span
                          className="ab-tabular-nums"
                          style={{ color: tokens.colors.textSecondary }}
                        >
                          {formatCurrency(position.marketValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{ fontSize: 12, color: tokens.colors.textSecondary }}
                >
                  All parsed positions map to your thesis legs.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
