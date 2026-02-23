import { STATUS_CFG } from "../styles";
import SignalCard from "./SignalCard";

export default function DominoSection({ domino, isActive, onToggle }) {
  const sc = { green: 0, amber: 0, red: 0 };
  domino.signals.forEach(s => sc[s.currentStatus]++);
  const tl = sc.red >= 2 ? "CRITICAL" : sc.red >= 1 || sc.amber >= 3 ? "ELEVATED" : sc.amber >= 2 ? "WATCH" : "BASELINE";
  const tc = tl === "CRITICAL" ? "#E63946" : tl === "ELEVATED" ? "#F4A261" : tl === "WATCH" ? "#E9C46A" : "#2A9D8F";
  return (
    <div style={{ marginBottom: 12 }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: isActive ? `linear-gradient(135deg, ${domino.color}11, ${domino.color}08)` : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? domino.color + "33" : "rgba(255,255,255,0.06)"}`, borderRadius: isActive ? "10px 10px 0 0" : 10, cursor: "pointer", transition: "all 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, color: domino.color }}>{domino.icon}</span>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Domino {domino.id}: {domino.name}</span>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{domino.description}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {Object.entries(sc).map(([s, c]) => c > 0 ? <div key={s} style={{ fontSize: 10, color: STATUS_CFG[s].text, background: STATUS_CFG[s].bg, padding: "2px 6px", borderRadius: 3 }}>{c}</div> : null)}
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: tc, letterSpacing: "1px" }}>{tl}</span>
        </div>
      </div>
      {isActive && (
        <div style={{ padding: "14px 16px", background: "rgba(0,0,0,0.15)", border: `1px solid ${domino.color}22`, borderTop: "none", borderRadius: "0 0 10px 10px" }}>
          {domino.signals.map((sig, i) => <SignalCard key={i} signal={sig} dominoColor={domino.color} />)}
        </div>
      )}
    </div>
  );
}
