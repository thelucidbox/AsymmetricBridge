import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const TRACKS = [
  {
    title: "Your Career",
    desc: "See how macro shifts map to the roles and industries that matter to you.",
    color: "#F4A261",
    icon: "→",
  },
  {
    title: "Your Portfolio",
    desc: "Upload your brokerage CSV. Find out if your bets match your beliefs.",
    color: "#E9C46A",
    icon: "→",
  },
  {
    title: "Your Conviction",
    desc: "Record predictions. Set evaluation windows. Track your batting average over time.",
    color: "#2A9D8F",
    icon: "→",
  },
  {
    title: "Your Understanding",
    desc: "150+ term glossary. Tooltips on every signal. Built for curiosity, not credentials.",
    color: "#6D6875",
    icon: "→",
  },
];

export const PerformanceScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0D0D0F",
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: headerOpacity,
          fontSize: 36,
          fontWeight: 700,
          marginBottom: 12,
          textAlign: "center",
          letterSpacing: "-0.5px",
        }}
      >
        Not just "is it right?" —{" "}
        <span style={{ color: "#E9C46A" }}>how does it affect you?</span>
      </div>

      <div
        style={{
          opacity: headerOpacity,
          fontSize: 22,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 55,
          textAlign: "center",
          maxWidth: 700,
        }}
      >
        Track the thesis against your actual life.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          maxWidth: 1100,
          width: "100%",
        }}
      >
        {TRACKS.map((track, i) => {
          const delay = i * 10;
          const progress = spring({
            frame: frame - 35 - delay,
            fps,
            config: { damping: 200 },
          });

          const x = interpolate(progress, [0, 1], [40, 0]);
          const opacity = interpolate(progress, [0, 1], [0, 1]);

          return (
            <div
              key={track.title}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "28px 24px",
                borderLeft: `3px solid ${track.color}`,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "white",
                }}
              >
                {track.title}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.6,
                }}
              >
                {track.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
