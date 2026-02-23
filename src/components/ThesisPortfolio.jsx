import { useState } from "react";
import { S, STATUS_CFG, Badge } from "../styles";
import { DOMINOS } from "../data/dominos";
import { SOURCES } from "../data/sources";
import { COMPARISON } from "../data/comparison";

const POSITIONING = [
  {
    leg: "Long AI Infrastructure",
    thesis: "Capability buildout is real regardless of bear/bull outcome",
    color: "#2A9D8F",
    tickers: ["NVDA", "MSFT", "GOOGL", "AMZN"],
    notes:
      "Compute demand accelerates through 2027. Both Citrini and Leopold agree on capability trajectory.",
  },
  {
    leg: "Short / Underweight Legacy SaaS",
    thesis:
      "In-house AI becomes credible BATNA → NRR compression → margin collapse",
    color: "#E63946",
    tickers: ["SNOW", "NOW", "CRM", "ZS"],
    notes:
      "Track NRR below 110% as confirmation. Watch Q1 2026 earnings cycle closely.",
  },
  {
    leg: "Watch Alt Managers for Contagion",
    thesis:
      "PE-insurance daisy chain (Apollo/Athene model) is the transmission mechanism",
    color: "#F4A261",
    tickers: ["BX", "APO", "KKR"],
    notes:
      ">25% drawdown = market pricing financial contagion. Currently near ATH — no signal yet.",
  },
  {
    leg: "Hedge: Hard Assets + Long Vol",
    thesis: "If displacement accelerates, real assets and volatility benefit",
    color: "#E9C46A",
    tickers: ["GLD", "TLT", "VIX calls"],
    notes:
      "Arya Deniz thesis: long-end yield curve is where the trade lives if demand fragility materializes.",
  },
  {
    leg: "BUILD the Adaptation",
    thesis:
      "You ARE the 'New Guilds' thesis — Lucid Box is the adaptation play",
    color: "#6D6875",
    tickers: [],
    notes:
      "Bloch's rebuttal: displaced workers + cheap AI = business formation explosion. Your consulting practice is this thesis in action.",
  },
];

const SIGNAL_CONNECTIONS = [
  {
    dominoId: 1,
    signal: "SaaS NRR < 110%",
    action: "Confirms short SaaS leg",
  },
  {
    dominoId: 2,
    signal: "JOLTS < 1.5M professional openings",
    action: "Increase hard asset / vol hedge",
  },
  {
    dominoId: 3,
    signal: "Stablecoin vol > $2T/month",
    action: "Friction collapse accelerating — watch V/MA",
  },
  {
    dominoId: 4,
    signal: "M2 velocity < 1.0",
    action: "Ghost GDP confirmed — defensive positioning",
  },
  {
    dominoId: 5,
    signal: "BX/APO/KKR > 25% drawdown",
    action: "Contagion priced in — evaluate PE shorts",
  },
  {
    dominoId: 6,
    signal: "Fed says 'structural displacement'",
    action: "Paradigm shift — full defensive posture",
  },
].map((item) => {
  const domino = DOMINOS.find((entry) => entry.id === item.dominoId);
  return {
    ...item,
    domino: `D${item.dominoId}`,
    color: domino?.color || "#E8E4DF",
  };
});

export default function ThesisPortfolio() {
  const [expandedSource, setExpandedSource] = useState(-1);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div>
      {/* Synthesis Card */}
      <div
        style={{
          ...S.card("rgba(233,196,106,0.2)"),
          marginBottom: 14,
          background:
            "linear-gradient(135deg, rgba(230,57,70,0.06), rgba(233,196,106,0.06), rgba(42,157,143,0.06))",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#E9C46A",
            letterSpacing: "1px",
            marginBottom: 8,
            fontFamily: "'IBM Plex Mono'",
            textTransform: "uppercase",
          }}
        >
          Strategy Synthesis
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.7,
          }}
        >
          {COMPARISON.synthesis}
        </div>
      </div>

      {/* Portfolio Positioning */}
      <div style={S.label}>Portfolio Positioning (5 Legs)</div>
      {POSITIONING.map((p, i) => (
        <div key={i} style={{ ...S.card(`${p.color}15`), marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
                {p.leg}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 2,
                  lineHeight: 1.5,
                }}
              >
                {p.thesis}
              </div>
            </div>
          </div>
          {p.tickers.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              {p.tickers.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: p.color,
                    background: `${p.color}12`,
                    border: `1px solid ${p.color}33`,
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontFamily: "'IBM Plex Mono'",
                    letterSpacing: "0.5px",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            {p.notes}
          </div>
        </div>
      ))}

      {/* Signal ↔ Position Map */}
      <div style={{ ...S.label, marginTop: 14 }}>
        Signal → Position Connection
      </div>
      <div style={S.card("rgba(255,255,255,0.06)")}>
        {SIGNAL_CONNECTIONS.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 1fr",
              gap: 8,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: row.color,
                fontFamily: "'IBM Plex Mono'",
              }}
            >
              {row.domino}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
              {row.signal}
            </span>
            <span style={{ fontSize: 11, color: row.color, fontWeight: 500 }}>
              {row.action}
            </span>
          </div>
        ))}
      </div>

      {/* Source Materials */}
      <div style={{ ...S.label, marginTop: 14 }}>Source Materials</div>
      {SOURCES.map((s, i) => (
        <div
          key={i}
          style={{
            ...S.card(
              expandedSource === i ? `${s.color}22` : "rgba(255,255,255,0.04)",
            ),
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => setExpandedSource(expandedSource === i ? -1 : i)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                <Badge text={s.type.toUpperCase()} color={s.color} />
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.25)",
                    fontFamily: "'IBM Plex Mono'",
                  }}
                >
                  {s.date}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {s.author}
              </div>
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.2)",
                transform:
                  expandedSource === i ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s",
              }}
            >
              ▾
            </span>
          </div>

          {expandedSource === i && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.7,
                  padding: "10px 12px",
                  background: `${s.color}06`,
                  borderLeft: `2px solid ${s.color}33`,
                  borderRadius: "0 6px 6px 0",
                  marginBottom: 10,
                }}
              >
                <strong style={{ color: s.color }}>Core Thesis:</strong>{" "}
                {s.keyThesis}
              </div>

              {s.chapters.map((ch, ci) => (
                <div
                  key={ci}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "5px 0",
                    borderBottom:
                      ci < s.chapters.length - 1
                        ? "1px solid rgba(255,255,255,0.03)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: s.color,
                      fontWeight: 700,
                      fontFamily: "'IBM Plex Mono'",
                      flexShrink: 0,
                      width: 16,
                    }}
                  >
                    {ci + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.5,
                    }}
                  >
                    {ch}
                  </span>
                </div>
              ))}

              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#E9C46A",
                    fontWeight: 600,
                    letterSpacing: "0.8px",
                    marginBottom: 4,
                  }}
                >
                  OUR ASSESSMENT
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                  }}
                >
                  {s.ourAssessment}
                </div>
              </div>

              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  fontSize: 11,
                  color: s.color,
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}33`,
                  padding: "5px 12px",
                  borderRadius: 5,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Read Full Article →
              </a>
            </div>
          )}
        </div>
      ))}

      {/* Comparison */}
      <div
        style={{
          ...S.card(
            showComparison
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.04)",
          ),
          marginTop: 4,
          cursor: "pointer",
        }}
        onClick={() => setShowComparison(!showComparison)}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Bear vs. Bull vs. Capability — Comparison
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.2)",
              transform: showComparison ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          >
            ▾
          </span>
        </div>

        {showComparison && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ ...S.label, marginBottom: 6 }}>Where They Agree</div>
            {COMPARISON.overlap.map((o, i) => (
              <div
                key={i}
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.55)",
                  padding: "4px 0 4px 12px",
                  borderLeft: "2px solid rgba(255,255,255,0.06)",
                }}
              >
                {o}
              </div>
            ))}

            <div style={{ ...S.label, marginTop: 14, marginBottom: 8 }}>
              Where They Diverge
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 1fr",
                gap: 0,
                fontSize: 9,
                color: "rgba(255,255,255,0.25)",
                fontFamily: "'IBM Plex Mono'",
                marginBottom: 4,
              }}
            >
              <div>Topic</div>
              <div style={{ color: "#E63946" }}>Citrini (Bear)</div>
              <div style={{ color: "#E9C46A" }}>Leopold (Capability)</div>
            </div>
            {COMPARISON.divergence.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 1fr",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {d.topic}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                  {d.citrini}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                  {d.leopold}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: 14,
          padding: "10px 12px",
          background: "rgba(230,57,70,0.06)",
          border: "1px solid rgba(230,57,70,0.15)",
          borderRadius: 8,
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          lineHeight: 1.5,
        }}
      >
        Not financial advice. This is a personal research framework for tracking
        macro theses and their investment implications. All positions are
        educational/paper-trading context. Do your own research.
      </div>
    </div>
  );
}
