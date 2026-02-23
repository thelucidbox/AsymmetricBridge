import { useMemo, useState } from "react";
import { S } from "../../styles";

function buildThresholdMap(signals, existingThresholds) {
  return signals.reduce((acc, signal) => {
    acc[signal.name] =
      signal.threshold || existingThresholds?.[signal.name] || "";
    return acc;
  }, {});
}

export default function ThesisSetup({
  thesis,
  enabledDominoIds,
  onToggleDomino,
  onUpdateThesis,
  errors,
}) {
  const [expandedDominoId, setExpandedDominoId] = useState(null);
  const [showThresholds, setShowThresholds] = useState(false);

  const activeDominos = useMemo(
    () =>
      thesis.dominos.filter((domino) => enabledDominoIds.includes(domino.id)),
    [enabledDominoIds, thesis.dominos],
  );

  const updateMeta = (field, value) => {
    onUpdateThesis((current) => ({
      ...current,
      meta: {
        ...current.meta,
        [field]: value,
      },
    }));
  };

  const updateDomino = (dominoId, updates) => {
    onUpdateThesis((current) => ({
      ...current,
      dominos: current.dominos.map((domino) => {
        if (domino.id !== dominoId) return domino;
        return {
          ...domino,
          ...updates,
        };
      }),
    }));
  };

  const updateSignalThreshold = (dominoId, signalName, thresholdValue) => {
    onUpdateThesis((current) => ({
      ...current,
      dominos: current.dominos.map((domino) => {
        if (domino.id !== dominoId) return domino;

        const nextSignals = domino.signals.map((signal) =>
          signal.name === signalName
            ? {
                ...signal,
                threshold: thresholdValue,
              }
            : signal,
        );

        return {
          ...domino,
          signals: nextSignals,
          thresholds: buildThresholdMap(nextSignals, domino.thresholds),
        };
      }),
    }));
  };

  return (
    <div>
      <div style={{ ...S.card("rgba(42,157,143,0.12)"), marginBottom: 14 }}>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.7,
          }}
        >
          These 6 dominos are a cause-and-effect chain from specific macro
          research. Each represents a disruption force. Defaults are
          pre-configured — you can customize anytime from the dashboard.
        </div>
      </div>

      <div style={{ ...S.card("rgba(233,196,106,0.2)"), marginBottom: 14 }}>
        <div style={S.label}>Name Your Thesis</div>
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <label htmlFor="thesisName" style={S.label}>
              Thesis Name
            </label>
            <input
              id="thesisName"
              value={thesis.meta.name}
              onChange={(event) => updateMeta("name", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="thesisAuthor" style={S.label}>
              Your Name
            </label>
            <input
              id="thesisAuthor"
              value={thesis.meta.author}
              onChange={(event) => updateMeta("author", event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <div style={{ ...S.card("rgba(42,157,143,0.2)"), marginBottom: 14 }}>
        <div style={S.label}>Live Domino Cascade Preview</div>

        {activeDominos.length === 0 ? (
          <div style={{ color: "#F4A261", fontSize: 12 }}>
            Enable at least one domino to build your cascade.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
            }}
          >
            {activeDominos.map((domino, index) => (
              <div
                key={domino.id}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    ...S.card(`${domino.color}33`),
                    marginBottom: 0,
                    padding: "8px 10px",
                    minWidth: 140,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: domino.color,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    D{domino.id}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {domino.name}
                  </div>
                </div>
                {index < activeDominos.length - 1 && (
                  <div
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {errors.thesis && (
          <div style={{ marginTop: 10, color: "#F4A261", fontSize: 11 }}>
            {errors.thesis}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => setShowThresholds(false)}
          style={{
            ...S.tab(!showThresholds, "#2A9D8F"),
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: !showThresholds ? 700 : 500,
          }}
        >
          Use defaults (recommended)
        </button>
        <button
          type="button"
          onClick={() => setShowThresholds(true)}
          style={{
            ...S.tab(showThresholds, "#6D6875"),
            padding: "10px 16px",
            fontSize: 13,
          }}
        >
          Customize thresholds
        </button>
      </div>

      <div>
        <div style={{ ...S.label, marginBottom: 8 }}>Domino Configuration</div>

        {thesis.dominos.map((domino) => {
          const isEnabled = enabledDominoIds.includes(domino.id);
          const isExpanded = expandedDominoId === domino.id && showThresholds;

          return (
            <div
              key={domino.id}
              style={{ ...S.card(`${domino.color}22`), marginBottom: 10 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}
                  >
                    {domino.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.5,
                    }}
                  >
                    {domino.description}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleDomino(domino.id)}
                  style={S.tab(isEnabled, domino.color)}
                >
                  {isEnabled ? "On" : "Off"}
                </button>
              </div>

              {showThresholds && (
                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  <input
                    value={domino.name}
                    onChange={(event) =>
                      updateDomino(domino.id, { name: event.target.value })
                    }
                    style={inputStyle}
                    placeholder="Domino name"
                  />
                  <textarea
                    value={domino.description}
                    onChange={(event) =>
                      updateDomino(domino.id, {
                        description: event.target.value,
                      })
                    }
                    rows={2}
                    style={{ ...inputStyle, minHeight: 60 }}
                  />

                  {isEnabled && (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDominoId(isExpanded ? null : domino.id)
                        }
                        style={{
                          ...S.tab(isExpanded, "#E9C46A"),
                          marginBottom: 8,
                        }}
                      >
                        {isExpanded ? "Hide Signals" : "Edit Signals"}
                      </button>

                      {isExpanded && (
                        <div style={{ display: "grid", gap: 8 }}>
                          {domino.signals.map((signal) => (
                            <div
                              key={signal.name}
                              style={S.card("rgba(255,255,255,0.08)")}
                            >
                              <div style={{ fontSize: 11, marginBottom: 4 }}>
                                {signal.name}
                              </div>
                              {signal.source && (
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "rgba(255,255,255,0.35)",
                                    marginBottom: 6,
                                  }}
                                >
                                  Source: {signal.source}
                                </div>
                              )}
                              <input
                                value={signal.threshold}
                                onChange={(event) =>
                                  updateSignalThreshold(
                                    domino.id,
                                    signal.name,
                                    event.target.value,
                                  )
                                }
                                style={inputStyle}
                                placeholder="Threshold"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
