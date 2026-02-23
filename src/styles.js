import { createElement } from "react";

export const STATUS_CFG = {
  green: { label: "Baseline", bg: "rgba(42,157,143,0.12)", border: "rgba(42,157,143,0.3)", dot: "#2A9D8F", text: "#2A9D8F" },
  amber: { label: "Watch", bg: "rgba(244,162,97,0.12)", border: "rgba(244,162,97,0.3)", dot: "#F4A261", text: "#E9C46A" },
  red: { label: "Alert", bg: "rgba(230,57,70,0.12)", border: "rgba(230,57,70,0.3)", dot: "#E63946", text: "#E63946" },
};

export const S = {
  label: { fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" },
  card: (c) => ({ background: "rgba(255,255,255,0.025)", border: `1px solid ${c || "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }),
  tab: (a, c) => ({ padding: "7px 12px", fontSize: 11, fontWeight: a ? 700 : 500, color: a ? c : "rgba(255,255,255,0.4)", background: a ? `${c}15` : "transparent", border: `1px solid ${a ? `${c}33` : "transparent"}`, borderRadius: 7, cursor: "pointer", transition: "all 0.2s" }),
  sectionTab: (a, c) => ({ padding: "10px 20px", fontSize: 13, fontWeight: a ? 700 : 500, color: a ? "#E8E4DF" : "rgba(255,255,255,0.35)", background: a ? `${c}18` : "transparent", border: `1px solid ${a ? `${c}44` : "rgba(255,255,255,0.06)"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.2s", letterSpacing: "-0.2px" }),
};

export const Badge = ({ text, color }) => (
  createElement(
    "span",
    {
      style: {
        fontSize: 9,
        fontWeight: 700,
        color,
        background: `${color}15`,
        padding: "2px 6px",
        borderRadius: 3,
        letterSpacing: "0.5px",
      },
    },
    text
  )
);
