import { useState } from "react";
import { STATUS_CFG, S } from "../styles";

export default function SignalCard({ signal, dominoColor }) {
  const [exp, setExp] = useState(false);
  const st = STATUS_CFG[signal.currentStatus];
  return (
    <div onClick={() => setExp(!exp)} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${exp ? dominoColor + "44" : "rgba(255,255,255,0.06)"}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s", marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot, flexShrink: 0, boxShadow: `0 0 5px ${st.dot}66` }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{signal.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: st.text, background: st.bg, border: `1px solid ${st.border}`, padding: "2px 7px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{st.label}</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, transform: exp ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
        </div>
      </div>
      {exp && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div><div style={S.label}>Source</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{signal.source}</div></div>
            <div><div style={S.label}>Frequency</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{signal.frequency}</div></div>
          </div>
          <div style={{ marginBottom: 8 }}><div style={S.label}>Baseline</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{signal.baseline}</div></div>
          <div style={{ marginBottom: 8 }}><div style={{ ...S.label, color: dominoColor, fontWeight: 600 }}>Trigger Threshold</div><div style={{ fontSize: 12, color: "#E8E4DF", fontWeight: 500 }}>{signal.threshold}</div></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontStyle: "italic", background: "rgba(255,255,255,0.02)", padding: "7px 10px", borderRadius: 5, borderLeft: `2px solid ${dominoColor}33` }}>{signal.notes}</div>
          {signal.dataPoints.length > 0 && (
            <div style={{ marginTop: 8 }}>{signal.dataPoints.map((dp, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_CFG[dp.status].dot }} />
                <span style={{ color: "rgba(255,255,255,0.35)" }}>{dp.date}</span><span>{dp.value}</span>
              </div>
            ))}</div>
          )}
        </div>
      )}
    </div>
  );
}
