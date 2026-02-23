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

function getConnectionColor(feed) {
  if (!feed.active) return "rgba(255,255,255,0.22)";
  if (feed.loading) return "#E9C46A";
  if (feed.connected) return "#2A9D8F";
  return "#E63946";
}

function getConnectionLabel(feed) {
  if (!feed.active) return "Disabled";
  if (feed.loading) return "Checking";
  return feed.connected ? "Connected" : "Disconnected";
}

function getRateLimitState(feed) {
  if (!feed.active) {
    return { label: "N/A", color: "rgba(255,255,255,0.28)" };
  }

  if (feed.error?.code === "RATE_LIMITED") {
    return { label: "Rate limited", color: "#E63946" };
  }

  return { label: "Within limits", color: "#2A9D8F" };
}

export default function FeedStatus({ feeds = [] }) {
  if (!feeds.length) return null;

  return (
    <div
      style={{
        marginBottom: 12,
        padding: "12px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
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
          const indicatorColor = getConnectionColor(feed);
          const connectionLabel = getConnectionLabel(feed);
          const rateLimit = getRateLimitState(feed);
          const errorMessage = feed.error?.message || "";
          return (
            <div
              key={feed.name}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "10px",
                background: "rgba(255,255,255,0.015)",
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
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{feed.name}</span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: indicatorColor,
                    letterSpacing: "0.6px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    textTransform: "uppercase",
                  }}
                >
                  {connectionLabel}
                </span>
              </div>

              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                Last success:{" "}
                <span style={{ color: "rgba(255,255,255,0.7)" }}>
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
                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
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
