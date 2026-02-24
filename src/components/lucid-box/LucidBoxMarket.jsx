import { useTheme } from "../../design-tokens";

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
  const { tokens } = useTheme();

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          padding: "8px 12px",
          background: tokens.colors.surfaceSoft,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 8,
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: tokens.colors.textSoft,
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: tokens.typography.fontMono,
          }}
        >
          Feeds
        </span>
        {feeds.map((f) => (
          <div
            key={f.name}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: f.loading
                  ? tokens.colors.accent
                  : f.data
                    ? tokens.colors.baseline
                    : f.active
                      ? tokens.colors.watch
                      : tokens.colors.borderStrong,
                boxShadow: f.data
                  ? `0 0 4px ${tokens.colors.baseline}66`
                  : "none",
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: f.data
                  ? tokens.colors.textMuted
                  : tokens.colors.textSubtle,
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
              color: tokens.colors.textSubtle,
              fontFamily: tokens.typography.fontMono,
            }}
          >
            Auto: {thresholdResult.evaluated} eval ·{" "}
            {thresholdResult.manualOnly} manual
            {thresholdResult.applied > 0 && (
              <span style={{ color: tokens.colors.accent }}>
                {" "}
                · {thresholdResult.applied} updated
              </span>
            )}
          </span>
        )}
        {!thresholdResult && signalStatuses && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              color: tokens.colors.textSubtle,
              fontFamily: tokens.typography.fontMono,
            }}
          >
            {signalStatuses.length ? "Supabase connected" : "Static mode"}
          </span>
        )}
      </div>

      <div
        data-tour="status-colors"
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
              color: tokens.colors.textSoft,
              textTransform: "uppercase",
              letterSpacing: tokens.typography.letterSpacing.label,
              marginBottom: 6,
              fontFamily: tokens.typography.fontMono,
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
          { l: "Baseline", c: greenCt, clr: tokens.colors.baseline },
          { l: "Watch", c: amberCt, clr: tokens.colors.watch },
          { l: "Alert", c: redCt, clr: tokens.colors.alert },
        ].map((x) => (
          <div
            key={x.l}
            style={{
              background: tokens.colors.surfaceSoft,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 10,
              padding: "14px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: tokens.colors.textSoft,
                textTransform: "uppercase",
                letterSpacing: tokens.typography.letterSpacing.label,
                marginBottom: 6,
                fontFamily: tokens.typography.fontMono,
              }}
            >
              {x.l}
            </div>
            <div
              className="ab-tabular-nums"
              style={{ fontSize: 24, fontWeight: 700, color: x.clr }}
            >
              {x.c}
            </div>
            <div
              className="ab-tabular-nums"
              style={{ fontSize: 10, color: tokens.colors.textSubtle }}
            >
              of {totalSig}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
