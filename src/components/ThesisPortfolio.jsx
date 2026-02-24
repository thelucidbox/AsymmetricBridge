import { useState } from "react";
import { useTheme } from "../design-tokens";
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
      "The 'New Guilds' thesis — displaced workers + cheap AI = new businesses",
    color: "#6D6875",
    tickers: [],
    notes:
      "Bloch's rebuttal: displaced workers + cheap AI = business formation explosion. New guild-style entrepreneurship emerges.",
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
  const { tokens } = useTheme();
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
            color: tokens.colors.accent,
            letterSpacing: "1px",
            marginBottom: 8,
            fontFamily: tokens.typography.fontMono,
            textTransform: "uppercase",
          }}
        >
          Strategy Synthesis
        </div>
        <div
          style={{
            fontSize: 12,
            color: tokens.colors.textSecondary,
            lineHeight: 1.7,
          }}
        >
          {COMPARISON.synthesis}
        </div>
      </div>

      {/* Portfolio Positioning */}
      <div data-tour="portfolio-section" style={S.label}>
        Portfolio Positioning (5 Legs)
      </div>
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
                  color: tokens.colors.textMuted,
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
                    fontFamily: tokens.typography.fontMono,
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
              color: tokens.colors.textSoft,
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
              borderBottom:
                i < 5 ? `1px solid ${tokens.colors.borderSubtle}` : "none",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: row.color,
                fontFamily: tokens.typography.fontMono,
              }}
            >
              {row.domino}
            </span>
            <span style={{ fontSize: 11, color: tokens.colors.textSecondary }}>
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
        <button
          type="button"
          key={i}
          style={{
            ...S.card(
              expandedSource === i
                ? `${s.color}22`
                : tokens.colors.borderSubtle,
            ),
            appearance: "none",
            textAlign: "left",
            width: "100%",
            cursor: "pointer",
            transition: tokens.motion.default,
            color: "inherit",
            font: "inherit",
          }}
          aria-expanded={expandedSource === i}
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
                    color: tokens.colors.textSubtle,
                    fontFamily: tokens.typography.fontMono,
                  }}
                >
                  {s.date}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: tokens.colors.textSoft }}>
                {s.author}
              </div>
              {s.tldr && (
                <div
                  style={{
                    marginTop: 5,
                    fontSize: 11,
                    color: tokens.colors.textMuted,
                    lineHeight: 1.5,
                  }}
                >
                  {s.tldr}
                </div>
              )}
            </div>
            <span
              style={{
                color: tokens.colors.textSubtle,
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
                borderTop: `1px solid ${tokens.colors.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  fontSize: 12,
                  color: tokens.colors.textSecondary,
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
                        ? `1px solid ${tokens.colors.surfaceRaised}`
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: s.color,
                      fontWeight: 700,
                      fontFamily: tokens.typography.fontMono,
                      flexShrink: 0,
                      width: 16,
                    }}
                  >
                    {ci + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: tokens.colors.textMuted,
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
                  background: tokens.colors.surfaceRaised,
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: tokens.colors.accent,
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
                    color: tokens.colors.textSecondary,
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
        </button>
      ))}

      {/* Comparison */}
      <button
        type="button"
        style={{
          ...S.card(
            showComparison ? tokens.colors.border : tokens.colors.borderSubtle,
          ),
          appearance: "none",
          textAlign: "left",
          width: "100%",
          marginTop: 4,
          cursor: "pointer",
          color: "inherit",
          font: "inherit",
        }}
        aria-expanded={showComparison}
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
              color: tokens.colors.textSubtle,
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
              borderTop: `1px solid ${tokens.colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ ...S.label, marginBottom: 6 }}>Where They Agree</div>
            {COMPARISON.overlap.map((o, i) => (
              <div
                key={i}
                style={{
                  fontSize: 11,
                  color: tokens.colors.textMuted,
                  padding: "4px 0 4px 12px",
                  borderLeft: `2px solid ${tokens.colors.border}`,
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
                color: tokens.colors.textSubtle,
                fontFamily: tokens.typography.fontMono,
                marginBottom: 4,
              }}
            >
              <div>Topic</div>
              <div style={{ color: tokens.colors.alert }}>Citrini (Bear)</div>
              <div style={{ color: tokens.colors.accent }}>
                Leopold (Capability)
              </div>
            </div>
            {COMPARISON.divergence.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 1fr",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: `1px solid ${tokens.colors.surfaceRaised}`,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: tokens.colors.textMuted,
                  }}
                >
                  {d.topic}
                </span>
                <span style={{ fontSize: 10, color: tokens.colors.textMuted }}>
                  {d.citrini}
                </span>
                <span style={{ fontSize: 10, color: tokens.colors.textMuted }}>
                  {d.leopold}
                </span>
              </div>
            ))}
          </div>
        )}
      </button>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: 14,
          padding: "10px 12px",
          background: "rgba(230,57,70,0.06)",
          border: "1px solid rgba(230,57,70,0.15)",
          borderRadius: 8,
          fontSize: 10,
          color: tokens.colors.textSubtle,
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
