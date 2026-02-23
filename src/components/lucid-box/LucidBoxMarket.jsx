export default function LucidBoxMarket({
  feeds,
  thresholdResult,
  signalStatuses,
  threatClr,
  threat,
  greenCt,
  amberCt,
  redCt,
  totalSig,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          padding: "8px 12px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: "'IBM Plex Mono'",
          }}
        >
          Feeds
        </span>
        {feeds.map((f) => (
          <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: f.loading
                  ? "#E9C46A"
                  : f.data
                    ? "#2A9D8F"
                    : f.active
                      ? "#F4A261"
                      : "rgba(255,255,255,0.15)",
                boxShadow: f.data ? "0 0 4px #2A9D8F66" : "none",
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: f.data ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
              }}
            >
              {f.name}
            </span>
          </div>
        ))}
        {thresholdResult && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'IBM Plex Mono'",
            }}
          >
            Auto: {thresholdResult.evaluated} eval · {thresholdResult.manualOnly} manual
            {thresholdResult.applied > 0 && (
              <span style={{ color: "#E9C46A" }}> · {thresholdResult.applied} updated</span>
            )}
          </span>
        )}
        {!thresholdResult && signalStatuses && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              color: "rgba(255,255,255,0.2)",
              fontFamily: "'IBM Plex Mono'",
            }}
          >
            {signalStatuses.length ? "Supabase connected" : "Static mode"}
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${threatClr}15, ${threatClr}08)`,
            border: `1px solid ${threatClr}33`,
            borderRadius: 10,
            padding: "14px 12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              marginBottom: 6,
              fontFamily: "'IBM Plex Mono'",
            }}
          >
            Threat Level
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: threatClr,
              letterSpacing: "1px",
            }}
          >
            {threat}
          </div>
        </div>
        {[
          { l: "Baseline", c: greenCt, clr: "#2A9D8F" },
          { l: "Watch", c: amberCt, clr: "#F4A261" },
          { l: "Alert", c: redCt, clr: "#E63946" },
        ].map((x) => (
          <div
            key={x.l}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "14px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                marginBottom: 6,
                fontFamily: "'IBM Plex Mono'",
              }}
            >
              {x.l}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: x.clr }}>{x.c}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
              of {totalSig}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
