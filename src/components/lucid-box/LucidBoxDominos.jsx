import { S } from "../../styles";
import GlossaryTooltip from "../GlossaryTooltip";
import DominoSection from "../DominoSection";

export default function LucidBoxDominos({
  liveDominos,
  activeDominos,
  onToggleDomino,
}) {
  return (
    <>
      <div
        data-tour="domino-cascade"
        style={{
          marginBottom: 20,
          padding: "16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
        }}
      >
        <div style={{ ...S.label, marginBottom: 12 }}>
          <GlossaryTooltip term="domino">Domino Cascade</GlossaryTooltip>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {liveDominos.map((d, i) => {
            const sc = { green: 0, amber: 0, red: 0 };
            d.signals.forEach((s) => sc[s.currentStatus]++);
            const denominator = Math.max(d.signals.length * 2, 1);
            const heat = (sc.red * 2 + sc.amber) / denominator;
            return (
              <div key={d.id} style={{ display: "flex", alignItems: "center" }}>
                <div
                  onClick={() => onToggleDomino(d.id)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${d.color}${Math.round(heat * 80 + 20)
                      .toString(16)
                      .padStart(2, "0")}, transparent)`,
                    border: `2px solid ${d.color}${Math.round(heat * 200 + 55)
                      .toString(16)
                      .padStart(2, "0")}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: d.color }}>
                    {d.id}
                  </span>
                  {heat > 0.5 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: heat > 0.75 ? "#E63946" : "#F4A261",
                        boxShadow: `0 0 5px ${heat > 0.75 ? "#E63946" : "#F4A261"}`,
                      }}
                    />
                  )}
                </div>
                {i < liveDominos.length - 1 && (
                  <div
                    style={{
                      width: 30,
                      height: 2,
                      background: `linear-gradient(90deg, ${d.color}44, ${liveDominos[i + 1].color}44)`,
                      margin: "0 3px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            padding: "0 2px",
          }}
        >
          {liveDominos.map((d) => (
            <div
              key={d.id}
              style={{
                width: 48,
                textAlign: "center",
                fontSize: 8,
                color: "rgba(255,255,255,0.25)",
                fontFamily: "'IBM Plex Mono'",
              }}
            >
              {d.name.split(" ")[0]}
            </div>
          ))}
        </div>
      </div>

      {liveDominos.map((d, index) => (
        <DominoSection
          key={d.id}
          domino={d}
          isActive={activeDominos.has(d.id)}
          onToggle={() => onToggleDomino(d.id)}
          showConnector={index < liveDominos.length - 1}
          nextDominoColor={liveDominos[index + 1]?.color}
        />
      ))}

      <div
        style={{
          marginTop: 16,
          padding: "14px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "rgba(255,255,255,0.45)" }}>How to Use:</strong> Update{" "}
        <GlossaryTooltip term="signal">signal</GlossaryTooltip> statuses as new data
        arrives. Green = <GlossaryTooltip term="baseline">baseline</GlossaryTooltip>.
        Amber = <GlossaryTooltip term="watch">watch</GlossaryTooltip>. Red ={" "}
        <GlossaryTooltip term="alert">alert</GlossaryTooltip>. Review when a{" "}
        <GlossaryTooltip term="threshold">threshold</GlossaryTooltip> is crossed,
        then track weekly during earnings season.
      </div>
    </>
  );
}
