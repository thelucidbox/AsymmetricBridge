import { useMemo, useState } from "react";
import { S } from "../../styles";

function buildThresholdMap(signals, existingThresholds) {
  return signals.reduce((acc, signal) => {
    acc[signal.name] = signal.threshold || existingThresholds?.[signal.name] || "";
    return acc;
  }, {});
}

export default function ThesisSetup({ thesis, enabledDominoIds, onToggleDomino, onUpdateThesis, errors }) {
  const [expandedDominoId, setExpandedDominoId] = useState(thesis.dominos[0]?.id ?? null);

  const activeDominos = useMemo(
    () => thesis.dominos.filter((domino) => enabledDominoIds.includes(domino.id)),
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
      <div style={{ ...S.card("rgba(233,196,106,0.2)"), marginBottom: 14 }}>
        <div style={S.label}>Thesis Metadata</div>
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
              Author
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
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {activeDominos.map((domino, index) => (
              <div key={domino.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    ...S.card(`${domino.color}33`),
                    marginBottom: 0,
                    padding: "8px 10px",
                    minWidth: 140,
                  }}
                >
                  <div style={{ fontSize: 10, color: domino.color, fontFamily: "'IBM Plex Mono', monospace" }}>
                    D{domino.id}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{domino.name}</div>
                </div>
                {index < activeDominos.length - 1 && (
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>→</div>
                )}
              </div>
            ))}
          </div>
        )}

        {errors.thesis && (
          <div style={{ marginTop: 10, color: "#F4A261", fontSize: 11 }}>{errors.thesis}</div>
        )}
      </div>

      <div>
        <div style={{ ...S.label, marginBottom: 8 }}>Domino Configuration</div>

        {thesis.dominos.map((domino) => {
          const isEnabled = enabledDominoIds.includes(domino.id);
          const isExpanded = expandedDominoId === domino.id;

          return (
            <div key={domino.id} style={{ ...S.card(`${domino.color}22`), marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    onToggleDomino(domino.id);
                    if (!isExpanded) setExpandedDominoId(domino.id);
                  }}
                  style={S.tab(isEnabled, domino.color)}
                >
                  {isEnabled ? "Enabled" : "Disabled"}
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedDominoId(isExpanded ? null : domino.id)}
                  style={S.tab(isExpanded, "#E9C46A")}
                >
                  {isExpanded ? "Hide" : "Edit"}
                </button>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                <input
                  value={domino.name}
                  onChange={(event) => updateDomino(domino.id, { name: event.target.value })}
                  style={inputStyle}
                  placeholder="Domino name"
                />
                <textarea
                  value={domino.description}
                  onChange={(event) => updateDomino(domino.id, { description: event.target.value })}
                  rows={2}
                  style={{ ...inputStyle, minHeight: 60 }}
                />
              </div>

              {isExpanded && isEnabled && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ ...S.label, marginBottom: 8 }}>Signal Thresholds</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {domino.signals.map((signal) => (
                      <div key={signal.name} style={S.card("rgba(255,255,255,0.08)")}>
                        <div style={{ fontSize: 11, marginBottom: 6 }}>{signal.name}</div>
                        <input
                          value={signal.threshold}
                          onChange={(event) =>
                            updateSignalThreshold(domino.id, signal.name, event.target.value)
                          }
                          style={inputStyle}
                          placeholder="Threshold"
                        />
                      </div>
                    ))}
                  </div>
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
  outline: "none",
  boxSizing: "border-box",
};
