import { useMemo, useState } from "react";
import { DISPLAY_MODES, useDisplayMode } from "../hooks/useDisplayMode";
import SignalTimeline from "./SignalTimeline";
import { STATUS_CFG, S } from "../styles";

function parseDataPointDate(value) {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim();
  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct;

  const quarterMatch = /^Q([1-4])\s+(\d{4})$/i.exec(trimmed);
  if (quarterMatch) {
    const quarter = Number(quarterMatch[1]);
    const year = Number(quarterMatch[2]);
    return new Date(Date.UTC(year, quarter * 3, 0));
  }

  const monthYearMatch = /^([A-Za-z]{3,9})\s+(\d{4})$/.exec(trimmed);
  if (monthYearMatch) {
    const parsed = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const yearMatch = /^(\d{4})$/.exec(trimmed);
  if (yearMatch) {
    return new Date(Date.UTC(Number(yearMatch[1]), 11, 31));
  }

  return null;
}

function getFreshness(signal) {
  const dataPoints = Array.isArray(signal?.dataPoints) ? signal.dataPoints : [];

  if (!dataPoints.length) {
    return {
      label: "No datapoint",
      detail: null,
      bg: "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.45)",
    };
  }

  const datedPoints = dataPoints
    .map((point) => ({
      ...point,
      parsedDate: parseDataPointDate(point.date),
    }))
    .filter((point) => point.parsedDate)
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

  if (!datedPoints.length) {
    return {
      label: "Date unknown",
      detail: null,
      bg: "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.45)",
    };
  }

  const latest = datedPoints[0];
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSince = Math.max(
    0,
    Math.floor((Date.now() - latest.parsedDate.getTime()) / msPerDay),
  );

  const freshnessStatus =
    daysSince < 7 ? "green" : daysSince <= 30 ? "amber" : "red";
  const cfg = STATUS_CFG[freshnessStatus];
  const ageLabel =
    daysSince === 0
      ? "Updated today"
      : daysSince === 1
        ? "1 day old"
        : `${daysSince} days old`;

  return {
    label: ageLabel,
    detail: latest.date,
    bg: cfg.bg,
    border: cfg.border,
    color: cfg.text,
  };
}

export default function SignalCard({ signal, dominoColor }) {
  const [exp, setExp] = useState(false);
  const displayMode = useDisplayMode();
  const simplifiedMode = displayMode === DISPLAY_MODES.simplified;
  const st = STATUS_CFG[signal.currentStatus] || STATUS_CFG.green;
  const freshness = useMemo(() => getFreshness(signal), [signal]);
  const dataPoints = Array.isArray(signal?.dataPoints) ? signal.dataPoints : [];

  return (
    <div
      data-tour="signal-card"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${exp && !simplifiedMode ? `${dominoColor}44` : "rgba(255,255,255,0.06)"}`,
        borderRadius: 8,
        padding: "12px 14px",
        transition: "all 0.2s",
        marginBottom: 6,
      }}
    >
      <div
        onClick={() => {
          if (simplifiedMode) return;
          setExp((previous) => !previous);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          cursor: simplifiedMode ? "default" : "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: st.dot,
              flexShrink: 0,
              boxShadow: `0 0 5px ${st.dot}66`,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{signal.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            title={
              freshness.detail
                ? `Most recent data point: ${freshness.detail}`
                : "No dated data points"
            }
            style={{
              fontSize: 10,
              color: freshness.color,
              background: freshness.bg,
              border: `1px solid ${freshness.border}`,
              padding: "2px 7px",
              borderRadius: 4,
              fontWeight: 600,
              letterSpacing: "0.4px",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {freshness.label}
          </span>
          <span
            style={{
              fontSize: 10,
              color: st.text,
              background: st.bg,
              border: `1px solid ${st.border}`,
              padding: "2px 7px",
              borderRadius: 4,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {st.label}
          </span>
          {!simplifiedMode && (
            <span
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 11,
                transform: exp ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s",
              }}
            >
              ▾
            </span>
          )}
        </div>
      </div>

      {simplifiedMode && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "rgba(255,255,255,0.62)",
            lineHeight: 1.55,
            borderLeft: `2px solid ${dominoColor}33`,
            paddingLeft: 10,
          }}
        >
          {signal.whyItMatters ||
            "This signal helps show whether conditions are improving or deteriorating."}
        </div>
      )}

      {!simplifiedMode && (
        <div
          style={{
            display: "grid",
            gridTemplateRows: exp ? "1fr" : "0fr",
            transition: "grid-template-rows 300ms ease",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                opacity: exp ? 1 : 0,
                transition: "opacity 220ms ease",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={S.label}>Source</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                    {signal.source}
                  </div>
                </div>
                <div>
                  <div style={S.label}>Frequency</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                    {signal.frequency}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={S.label}>Baseline</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                  {signal.baseline}
                </div>
              </div>

              <div data-tour="thresholds" style={{ marginBottom: 8 }}>
                <div style={{ ...S.label, color: dominoColor, fontWeight: 600 }}>
                  Trigger Threshold
                </div>
                <div style={{ fontSize: 12, color: "#E8E4DF", fontWeight: 500 }}>
                  {signal.threshold}
                </div>
              </div>

              {signal.whyItMatters && (
                <div style={{ marginBottom: 8 }}>
                  <div style={S.label}>Why It Matters</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.72)",
                      lineHeight: 1.55,
                    }}
                  >
                    {signal.whyItMatters}
                  </div>
                </div>
              )}

              {signal.transmissionTo && (
                <div style={{ marginBottom: 8 }}>
                  <div style={S.label}>Transmission</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.55,
                    }}
                  >
                    {signal.transmissionTo}
                  </div>
                </div>
              )}

              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  fontStyle: "italic",
                  background: "rgba(255,255,255,0.02)",
                  padding: "7px 10px",
                  borderRadius: 5,
                  borderLeft: `2px solid ${dominoColor}33`,
                }}
              >
                {signal.notes}
              </div>

              <SignalTimeline signal={signal} />

              <div style={{ marginTop: 10 }}>
                <div style={S.label}>Data Points</div>
                {dataPoints.length > 0 ? (
                  <div
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr 86px",
                        gap: 8,
                        padding: "6px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.02)",
                        fontSize: 10,
                        color: "rgba(255,255,255,0.38)",
                        textTransform: "uppercase",
                        letterSpacing: "0.7px",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      <span>Date</span>
                      <span>Value</span>
                      <span>Status</span>
                    </div>
                    {dataPoints.map((point, index) => {
                      const pointStatus = STATUS_CFG[point.status] || STATUS_CFG.green;
                      return (
                        <div
                          key={`${point.date}-${point.value}-${index}`}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "120px 1fr 86px",
                            gap: 8,
                            padding: "7px 10px",
                            fontSize: 11,
                            borderBottom:
                              index < dataPoints.length - 1
                                ? "1px solid rgba(255,255,255,0.04)"
                                : "none",
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,0.45)" }}>{point.date}</span>
                          <span style={{ color: "rgba(255,255,255,0.72)" }}>{point.value}</span>
                          <span style={{ color: pointStatus.text, fontWeight: 600 }}>
                            {pointStatus.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.42)",
                      padding: "8px 10px",
                      border: "1px dashed rgba(255,255,255,0.16)",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    No data points available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
