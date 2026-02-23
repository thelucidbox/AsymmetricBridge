import { useState } from "react";
import { COMPARISON } from "../data/comparison";
import { SOURCES } from "../data/sources";

export default function SourceMaterials() {
  const [expanded, setExpanded] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0F", color: "#E8E4DF", fontFamily: "'IBM Plex Sans', -apple-system, sans-serif", padding: "24px 16px" }}>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 24, background: "linear-gradient(180deg, #E9C46A, #E63946)", borderRadius: 2 }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.8px" }}>Source Materials & Thesis Comparison</h1>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 11, fontFamily: "'IBM Plex Mono'" }}>The foundational readings behind the Asymmetric Bridge strategy</p>
        </div>

        {/* Source Cards */}
        {SOURCES.map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${expanded === i ? `${s.color}33` : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12, cursor: "pointer", transition: "all 0.2s" }} onClick={() => setExpanded(expanded === i ? -1 : i)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: s.color, background: `${s.color}15`, padding: "2px 8px", borderRadius: 3, letterSpacing: "0.5px" }}>{s.type.toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono'" }}>{s.date}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#E8E4DF", marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.author}</div>
                {s.tldr && (
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.58)",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.tldr}
                  </div>
                )}
              </div>
              <span style={{ color: "rgba(255,255,255,0.2)", transform: expanded === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
            </div>

            {expanded === i && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Links */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: s.color, background: `${s.color}12`, border: `1px solid ${s.color}33`, padding: "4px 10px", borderRadius: 5, fontWeight: 600 }} onClick={e => e.stopPropagation()}>
                    Read Article →
                  </a>
                  {s.pdfUrl && (
                    <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 5 }} onClick={e => e.stopPropagation()}>
                      PDF (165 pages) →
                    </a>
                  )}
                </div>

                {/* Format & Thesis */}
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Format: {s.format}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 12, padding: "10px 12px", background: `${s.color}06`, borderLeft: `2px solid ${s.color}33`, borderRadius: "0 6px 6px 0" }}>
                  <strong style={{ color: s.color }}>Core Thesis:</strong> {s.keyThesis}
                </div>

                {/* Key Points */}
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, fontFamily: "'IBM Plex Mono'" }}>Key Arguments</div>
                {s.chapters.map((ch, ci) => (
                  <div key={ci} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: ci < s.chapters.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                    <span style={{ fontSize: 10, color: s.color, fontWeight: 700, fontFamily: "'IBM Plex Mono'", flexShrink: 0, width: 16 }}>{ci + 1}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{ch}</span>
                  </div>
                ))}

                {/* Our Assessment */}
                <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "#E9C46A", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 4 }}>OUR ASSESSMENT</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{s.ourAssessment}</div>
                </div>

                {/* Strengths & Weaknesses */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#2A9D8F", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 4 }}>STRENGTHS</div>
                    {s.strengthsWeaknesses.strengths.map((st, si) => (
                      <div key={si} style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", padding: "3px 0", lineHeight: 1.4 }}>+ {st}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#E63946", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 4 }}>WEAKNESSES</div>
                    {s.strengthsWeaknesses.weaknesses.map((w, wi) => (
                      <div key={wi} style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", padding: "3px 0", lineHeight: 1.4 }}>- {w}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Comparison Toggle */}
        <div onClick={() => setShowComparison(!showComparison)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "16px 18px", marginTop: 16, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Citrini vs. Leopold vs. Bull Rebuttal — Synthesis</span>
            <span style={{ color: "rgba(255,255,255,0.2)", transform: showComparison ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
          </div>

          {showComparison && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }} onClick={e => e.stopPropagation()}>
              {/* Overlap */}
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, fontFamily: "'IBM Plex Mono'" }}>Where They Agree</div>
              {COMPARISON.overlap.map((o, i) => (
                <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", padding: "4px 0", paddingLeft: 12, borderLeft: "2px solid rgba(255,255,255,0.06)" }}>{o}</div>
              ))}

              {/* Divergence Table */}
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginTop: 16, marginBottom: 8, fontFamily: "'IBM Plex Mono'" }}>Where They Diverge</div>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 0, fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono'", marginBottom: 4 }}>
                <div>Topic</div><div style={{ color: "#E63946" }}>Citrini (Bear)</div><div style={{ color: "#E9C46A" }}>Leopold (Capability)</div>
              </div>
              {COMPARISON.divergence.map((d, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{d.topic}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{d.citrini}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{d.leopold}</span>
                </div>
              ))}

              {/* Synthesis */}
              <div style={{ marginTop: 16, padding: "12px 14px", background: "linear-gradient(135deg, #E6394608, #E9C46A08, #2A9D8F08)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#E9C46A", letterSpacing: "1px", marginBottom: 6 }}>SYNTHESIS → YOUR STRATEGY</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{COMPARISON.synthesis}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.12)", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "14px" }}>
          Asymmetric Bridge · Source Materials v1.0 · Feb 22, 2026
        </div>
      </div>
    </div>
  );
}
