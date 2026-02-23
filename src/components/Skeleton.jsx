import { S } from "../styles";

const baseBlockStyle = {
  background: "rgba(255,255,255,0.08)",
  borderRadius: 6,
};

export function SkeletonCard({ lines = 3, height }) {
  return (
    <div style={S.card("rgba(255,255,255,0.08)")}>
      {height ? (
        <div className="skeleton-pulse" style={{ ...baseBlockStyle, height }} />
      ) : (
        Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="skeleton-pulse"
            style={{
              ...baseBlockStyle,
              height: 10,
              width: index === lines - 1 ? "70%" : "100%",
              marginBottom: index === lines - 1 ? 0 : 8,
            }}
          />
        ))
      )}
    </div>
  );
}

export function SkeletonChart({ height = 200 }) {
  return (
    <div style={S.card("rgba(255,255,255,0.08)")}>
      <div className="skeleton-pulse" style={{ ...baseBlockStyle, height }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div style={S.card("rgba(255,255,255,0.08)")}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 8,
        }}
      >
        {Array.from({ length: rows * cols }).map((_, index) => (
          <div key={index} className="skeleton-pulse" style={{ ...baseBlockStyle, height: 12 }} />
        ))}
      </div>
    </div>
  );
}
