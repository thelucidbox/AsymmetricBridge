import { useTheme } from "../design-tokens";
import { S } from "../styles";

function toDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimestamp(value) {
  const parsed = toDate(value);
  if (!parsed) return "No successful fetch yet";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getConnectionColor(feed, tokens) {
  if (!feed.active) return tokens.colors.textSubtle;
  if (feed.loading) return tokens.colors.accent;
  if (feed.connected) return tokens.colors.baseline;
  return tokens.colors.alert;
}

function getConnectionLabel(feed) {
  if (!feed.active) return "Disabled";
  if (feed.loading) return "Checking";
  return feed.connected ? "Connected" : "Disconnected";
}

function getRateLimitState(feed, tokens) {
  if (!feed.active) {
    return { label: "N/A", color: tokens.colors.textSubtle };
  }

  if (feed.error?.code === "RATE_LIMITED") {
    return { label: "Rate limited", color: tokens.colors.alert };
  }

  return { label: "Within limits", color: tokens.colors.baseline };
}

export default function FeedStatus({ feeds = [] }) {
  const { tokens } = useTheme();
  if (!feeds.length) return null;

  return (
    <div
      style={{
        marginBottom: 12,
        padding: "12px",
        background: tokens.colors.surfaceSoft,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.shape.cardRadius,
      }}
    >
      <div style={{ ...S.label, marginBottom: 10 }}>Feed Health</div>
      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {feeds.map((feed) => {
          const indicatorColor = getConnectionColor(feed, tokens);
          const connectionLabel = getConnectionLabel(feed);
          const rateLimit = getRateLimitState(feed, tokens);
          const errorMessage = feed.error?.message || "";
          return (
            <div
              key={feed.name}
              style={{
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.shape.tabRadius,
                padding: "10px",
                background: tokens.colors.surfaceSoft,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: indicatorColor,
                      boxShadow: `0 0 6px ${indicatorColor}66`,
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {feed.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: indicatorColor,
                    letterSpacing: "0.6px",
                    fontFamily: tokens.typography.fontMono,
                    textTransform: "uppercase",
                  }}
                >
                  {connectionLabel}
                </span>
              </div>

              <div style={{ fontSize: 10, color: tokens.colors.textSoft }}>
                Last success:{" "}
                <span style={{ color: tokens.colors.textSecondary }}>
                  {formatTimestamp(feed.lastSuccessfulFetch)}
                </span>
              </div>

              <div
                title={errorMessage}
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  color: rateLimit.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontFamily: tokens.typography.fontMono }}>
                  Rate limit:
                </span>
                <span>{rateLimit.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
