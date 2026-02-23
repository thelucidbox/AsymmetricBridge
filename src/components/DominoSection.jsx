import { STATUS_CFG } from "../styles";
import SignalCard from "./SignalCard";

function getHealth(sc) {
  if (sc.red > 0) return { key: "red", label: "ALERT" };
  if (sc.amber > 0) return { key: "amber", label: "WATCH" };
  return { key: "green", label: "BASELINE" };
}

export default function DominoSection({
  domino,
  isActive,
  onToggle,
  showConnector = false,
  nextDominoColor,
}) {
  const sc = { green: 0, amber: 0, red: 0 };
  domino.signals.forEach((signal) => {
    const status = signal.currentStatus;
    if (status === "green" || status === "amber" || status === "red") {
      sc[status] += 1;
    }
  });

  const totalSignals = domino.signals.length;
  const health = getHealth(sc);
  const healthCfg = STATUS_CFG[health.key];
  const hasRedSignals = sc.red > 0;

  const summaryText = `${sc.green}/${totalSignals || 0} green`;

  return (
    <div style={{ marginBottom: showConnector ? 8 : 12 }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: isActive
            ? `linear-gradient(135deg, ${domino.color}11, ${domino.color}08)`
            : "rgba(255,255,255,0.02)",
          border: `1px solid ${isActive ? `${domino.color}44` : "rgba(255,255,255,0.06)"}`,
          borderRadius: isActive ? "10px 10px 0 0" : 10,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{ fontSize: 19, color: domino.color }}>{domino.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>{`Domino ${domino.id}: ${domino.name}`}</span>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.3px",
                }}
              >
                {summaryText}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              {domino.description}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {Object.entries(sc).map(([status, count]) => {
              if (count === 0) return null;
              const cfg = STATUS_CFG[status];
              return (
                <div
                  key={status}
                  style={{
                    fontSize: 10,
                    color: cfg.text,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {count}
                </div>
              );
            })}
          </div>

          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: healthCfg.text,
              background: healthCfg.bg,
              border: `1px solid ${healthCfg.border}`,
              letterSpacing: "1px",
              borderRadius: 4,
              padding: "3px 7px",
              animation: hasRedSignals
                ? "domino-alert-pulse 2s ease-in-out infinite"
                : "none",
            }}
          >
            {health.label}
          </span>
        </div>
      </div>

      {isActive && (
        <div
          data-tour="signal-cards"
          style={{
            padding: "14px 16px",
            background: "rgba(0,0,0,0.15)",
            border: `1px solid ${domino.color}22`,
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
          }}
        >
          {domino.signals.map((signal) => (
            <SignalCard
              key={`${domino.id}-${signal.name}`}
              signal={signal}
              dominoColor={domino.color}
            />
          ))}
        </div>
      )}

      {showConnector && (
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 6,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 2,
              height: 18,
              borderRadius: 999,
              background: `linear-gradient(180deg, ${domino.color}66, ${(nextDominoColor || domino.color)}22)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
