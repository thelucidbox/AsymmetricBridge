import { useState } from "react";
import { COMPARISON } from "../data/comparison";
import { SOURCES } from "../data/sources";
import { useTheme } from "../design-tokens";

export default function SourceMaterials() {
  const { tokens } = useTheme();
  const [expanded, setExpanded] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.colors.bg,
        color: tokens.colors.text,
        fontFamily: tokens.typography.fontSans,
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 3,
                height: 24,
                background: `linear-gradient(180deg, ${tokens.colors.accent}, ${tokens.colors.alert})`,
                borderRadius: 2,
              }}
            />
            <h1
              style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.8px" }}
            >
              Source Materials & Thesis Comparison
            </h1>
          </div>
          <p
            style={{
              fontSize: 10,
              color: tokens.colors.textSubtle,
              marginLeft: 11,
              fontFamily: tokens.typography.fontMono,
            }}
          >
            The foundational readings behind the Asymmetric Bridge strategy
          </p>
        </div>

        {/* Source Cards */}
        {SOURCES.map((s, i) => (
          <div
            key={i}
            style={{
              background: tokens.colors.surface,
              border: `1px solid ${expanded === i ? `${s.color}33` : tokens.colors.border}`,
              borderRadius: 10,
              padding: "16px 18px",
              marginBottom: 12,
              cursor: "pointer",
              transition: tokens.motion.default,
            }}
            onClick={() => setExpanded(expanded === i ? -1 : i)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: s.color,
                      background: `${s.color}15`,
                      padding: "2px 8px",
                      borderRadius: 3,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {s.type.toUpperCase()}
                  </span>
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
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: tokens.colors.text,
                    marginBottom: 2,
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: 12, color: tokens.colors.textSoft }}>
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
                  transform: expanded === i ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s",
                }}
              >
                ▾
              </span>
            </div>

            {expanded === i && (
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: `1px solid ${tokens.colors.border}`,
                }}
              >
                {/* Links */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      color: s.color,
                      background: `${s.color}12`,
                      border: `1px solid ${s.color}33`,
                      padding: "4px 10px",
                      borderRadius: 5,
                      fontWeight: 600,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read Article →
                  </a>
                  {s.pdfUrl && (
                    <a
                      href={s.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11,
                        color: tokens.colors.textMuted,
                        background: tokens.colors.borderSubtle,
                        border: `1px solid ${tokens.colors.borderStrong}`,
                        padding: "4px 10px",
                        borderRadius: 5,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      PDF (165 pages) →
                    </a>
                  )}
                </div>

                {/* Format & Thesis */}
                <div
                  style={{
                    fontSize: 10,
                    color: tokens.colors.textSubtle,
                    marginBottom: 4,
                  }}
                >
                  Format: {s.format}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: tokens.colors.textSecondary,
                    lineHeight: 1.7,
                    marginBottom: 12,
                    padding: "10px 12px",
                    background: `${s.color}06`,
                    borderLeft: `2px solid ${s.color}33`,
                    borderRadius: "0 6px 6px 0",
                  }}
                >
                  <strong style={{ color: s.color }}>Core Thesis:</strong>{" "}
                  {s.keyThesis}
                </div>

                {/* Key Points */}
                <div
                  style={{
                    fontSize: 10,
                    color: tokens.colors.textSoft,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 6,
                    fontFamily: tokens.typography.fontMono,
                  }}
                >
                  Key Arguments
                </div>
                {s.chapters.map((ch, ci) => (
                  <div
                    key={ci}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "6px 0",
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

                {/* Our Assessment */}
                <div
                  style={{
                    marginTop: 12,
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

                {/* Strengths & Weaknesses */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: tokens.colors.baseline,
                        fontWeight: 600,
                        letterSpacing: "0.8px",
                        marginBottom: 4,
                      }}
                    >
                      STRENGTHS
                    </div>
                    {s.strengthsWeaknesses.strengths.map((st, si) => (
                      <div
                        key={si}
                        style={{
                          fontSize: 10,
                          color: tokens.colors.textMuted,
                          padding: "3px 0",
                          lineHeight: 1.4,
                        }}
                      >
                        + {st}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: tokens.colors.alert,
                        fontWeight: 600,
                        letterSpacing: "0.8px",
                        marginBottom: 4,
                      }}
                    >
                      WEAKNESSES
                    </div>
                    {s.strengthsWeaknesses.weaknesses.map((w, wi) => (
                      <div
                        key={wi}
                        style={{
                          fontSize: 10,
                          color: tokens.colors.textMuted,
                          padding: "3px 0",
                          lineHeight: 1.4,
                        }}
                      >
                        - {w}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Comparison Toggle */}
        <div
          onClick={() => setShowComparison(!showComparison)}
          style={{
            background: tokens.colors.surfaceRaised,
            border: `1px solid ${tokens.colors.borderStrong}`,
            borderRadius: 10,
            padding: "16px 18px",
            marginTop: 16,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              Citrini vs. Leopold vs. Bull Rebuttal — Synthesis
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
                marginTop: 14,
                paddingTop: 14,
                borderTop: `1px solid ${tokens.colors.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Overlap */}
              <div
                style={{
                  fontSize: 10,
                  color: tokens.colors.textSoft,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 6,
                  fontFamily: tokens.typography.fontMono,
                }}
              >
                Where They Agree
              </div>
              {COMPARISON.overlap.map((o, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    color: tokens.colors.textMuted,
                    padding: "4px 0",
                    paddingLeft: 12,
                    borderLeft: `2px solid ${tokens.colors.border}`,
                  }}
                >
                  {o}
                </div>
              ))}

              {/* Divergence Table */}
              <div
                style={{
                  fontSize: 10,
                  color: tokens.colors.textSoft,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: 16,
                  marginBottom: 8,
                  fontFamily: tokens.typography.fontMono,
                }}
              >
                Where They Diverge
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 1fr",
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
                    gridTemplateColumns: "80px 1fr 1fr",
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
                  <span
                    style={{ fontSize: 10, color: tokens.colors.textMuted }}
                  >
                    {d.citrini}
                  </span>
                  <span
                    style={{ fontSize: 10, color: tokens.colors.textMuted }}
                  >
                    {d.leopold}
                  </span>
                </div>
              ))}

              {/* Synthesis */}
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 14px",
                  background:
                    "linear-gradient(135deg, #E6394608, #E9C46A08, #2A9D8F08)",
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: tokens.colors.accent,
                    letterSpacing: "1px",
                    marginBottom: 6,
                  }}
                >
                  SYNTHESIS → YOUR STRATEGY
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
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 9,
            color: tokens.colors.borderStrong,
            borderTop: `1px solid ${tokens.colors.borderSubtle}`,
            padding: "14px",
          }}
        >
          Asymmetric Bridge · Source Materials v1.0 · Feb 22, 2026
        </div>
      </div>
    </div>
  );
}
