import { S, STATUS_CFG } from "../styles";
import { THRESHOLD_RULES, RULE_STATS } from "../lib/threshold-rules";

const AUTO_SIGNALS = THRESHOLD_RULES.filter(
  (r) => !r.manual_only && r.thresholds?.length > 0,
);
const LIMITED_SIGNALS = THRESHOLD_RULES.filter(
  (r) => !r.manual_only && (!r.thresholds || r.thresholds.length === 0),
);
const MANUAL_SIGNALS = THRESHOLD_RULES.filter((r) => r.manual_only);

const CADENCE = {
  fred: "Daily (cached 24h)",
  stocks: "15min (market hours only)",
  crypto: "Every 5 minutes",
};

const DOMINO_NAMES = {
  1: "SaaS Compression",
  2: "White-Collar Displacement",
  3: "Friction Collapse",
  4: "Ghost GDP",
  5: "Financial Contagion",
  6: "Policy Response",
};

export default function WorkflowInfo() {
  return (
    <div>
      {/* Overview */}
      <div style={{ ...S.card("rgba(233,196,106,0.2)"), marginBottom: 14 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#E9C46A",
            marginBottom: 8,
          }}
        >
          How the Signal Tracker Works
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.7,
          }}
        >
          The tracker monitors 24 signals across 6 dominos. Some update
          automatically from live data feeds, others require manual assessment
          from earnings reports, government data, and industry analysis.
        </div>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: "rgba(42,157,143,0.1)",
            border: "1px solid rgba(42,157,143,0.25)",
            borderRadius: 8,
            padding: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: "#2A9D8F" }}>
            {RULE_STATS.auto}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "'IBM Plex Mono'",
            }}
          >
            Auto-Evaluated
          </div>
        </div>
        <div
          style={{
            background: "rgba(244,162,97,0.1)",
            border: "1px solid rgba(244,162,97,0.25)",
            borderRadius: 8,
            padding: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: "#F4A261" }}>
            {RULE_STATS.manual}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "'IBM Plex Mono'",
            }}
          >
            Manual Input
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: "#E8E4DF" }}>
            {RULE_STATS.total}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "'IBM Plex Mono'",
            }}
          >
            Total Signals
          </div>
        </div>
      </div>

      {/* Auto Signals */}
      <div style={S.label}>Auto-Evaluated Signals ({AUTO_SIGNALS.length})</div>
      <div style={{ ...S.card("rgba(42,157,143,0.15)"), marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          These signals fetch live data and evaluate against thresholds
          automatically. No action needed unless you want to override.
        </div>
        {AUTO_SIGNALS.map((rule, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 140px",
              gap: 8,
              alignItems: "center",
              padding: "8px 0",
              borderBottom:
                i < AUTO_SIGNALS.length - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                {rule.signal_name}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
                D{rule.domino_id}: {DOMINO_NAMES[rule.domino_id]}
              </div>
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#2A9D8F",
                fontFamily: "'IBM Plex Mono'",
                textTransform: "uppercase",
              }}
            >
              {rule.data_source}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'IBM Plex Mono'",
              }}
            >
              {CADENCE[rule.data_source] || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Limited Auto */}
      {LIMITED_SIGNALS.length > 0 && (
        <>
          <div style={S.label}>
            Data Available, Manual Judgment Needed ({LIMITED_SIGNALS.length})
          </div>
          <div style={{ ...S.card("rgba(233,196,106,0.1)"), marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              These fetch live data but need additional context to evaluate
              (e.g., GDP alone doesn't tell you the wage spread).
            </div>
            {LIMITED_SIGNALS.map((rule, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 0",
                  borderBottom:
                    i < LIMITED_SIGNALS.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                  {rule.signal_name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 2,
                  }}
                >
                  D{rule.domino_id}: {DOMINO_NAMES[rule.domino_id]} —{" "}
                  {rule.notes ||
                    `Fetches ${rule.fred_series || rule.data_source} but needs manual comparison`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Manual Signals */}
      <div style={S.label}>Manual Signals ({MANUAL_SIGNALS.length})</div>
      <div style={{ ...S.card("rgba(244,162,97,0.1)"), marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          These require reading earnings reports, government releases, and
          industry data. Update via the Update Signal tab or Claude Code.
        </div>
        {MANUAL_SIGNALS.map((rule, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 8,
              alignItems: "center",
              padding: "8px 0",
              borderBottom:
                i < MANUAL_SIGNALS.length - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                {rule.signal_name}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
                D{rule.domino_id}: {DOMINO_NAMES[rule.domino_id]}
              </div>
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#F4A261",
                fontFamily: "'IBM Plex Mono'",
              }}
            >
              MANUAL
            </div>
          </div>
        ))}
      </div>

      {/* How to Update */}
      <div style={S.label}>How to Update Signals</div>
      <div style={S.card("rgba(255,255,255,0.06)")}>
        {[
          {
            method: "Update Signal Tab",
            desc: "Use the form in this dashboard to change any signal's status with a reason.",
            color: "#E9C46A",
          },
          {
            method: "Claude Code Skill",
            desc: "Run /signal-update in Claude Code for conversational updates with context.",
            color: "#2A9D8F",
          },
          {
            method: "Supabase Direct",
            desc: "Edit the signal_statuses table directly in the Supabase dashboard.",
            color: "#6D6875",
          },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "8px 0",
              borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: m.color,
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: m.color }}>
                {m.method}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {m.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cadence Guide */}
      <div style={{ ...S.card("rgba(255,255,255,0.06)"), marginTop: 10 }}>
        <div style={S.label}>Suggested Update Cadence</div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
          }}
        >
          <div>
            <span style={{ color: "#2A9D8F", fontWeight: 600 }}>Weekly:</span>{" "}
            Check JOLTS, jobless claims, BLS data as they release
          </div>
          <div>
            <span style={{ color: "#E9C46A", fontWeight: 600 }}>Monthly:</span>{" "}
            Indeed job postings, mortgage delinquency, Challenger layoffs
          </div>
          <div>
            <span style={{ color: "#F4A261", fontWeight: 600 }}>
              Quarterly:
            </span>{" "}
            Earnings season signals (NRR, take rates, V/MA volume, PE defaults,
            spending forecasts)
          </div>
          <div>
            <span style={{ color: "#E63946", fontWeight: 600 }}>
              As Announced:
            </span>{" "}
            Fed language, Congressional activity, NAIC actions, YC batches
          </div>
        </div>
      </div>
    </div>
  );
}
