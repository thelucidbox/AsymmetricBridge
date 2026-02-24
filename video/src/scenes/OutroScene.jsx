import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleScale = interpolate(titleProgress, [0, 1], [0.95, 1]);

  const nameOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const disclaimerOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const techOpacity = interpolate(frame, [120, 140], [0, 1], {
    extrapolateLeft: "clamp",
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
        background: "linear-gradient(180deg, #0D0D0F 0%, #141418 100%)",
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: "-1px",
            lineHeight: 1.25,
          }}
        >
          Asymmetric Bridge
        </div>
      </div>

      <div
        style={{
          opacity: nameOpacity,
          fontSize: 22,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        Track the thesis. See how it fits your career and your portfolio.
      </div>

      <div
        style={{
          opacity: urlOpacity,
          fontSize: 26,
          color: "#E9C46A",
          fontFamily: "monospace",
          fontWeight: 600,
          padding: "14px 36px",
          border: "2px solid rgba(233,196,106,0.5)",
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        github.com/thelucidbox/AsymmetricBridge
      </div>

      <div
        style={{
          opacity: disclaimerOpacity,
          fontSize: 18,
          color: "rgba(255,255,255,0.35)",
          marginBottom: 30,
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: 600,
        }}
      >
        Open source. MIT licensed. Not investment advice — just a fun project
        born from reading too many macro research papers.
      </div>

      <div
        style={{
          opacity: techOpacity,
          display: "flex",
          gap: 14,
        }}
      >
        {["React 19", "Supabase", "FRED", "Twelve Data", "BYO LLM"].map(
          (tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 18px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                fontFamily: "monospace",
              }}
            >
              {tag}
            </div>
          ),
        )}
      </div>
    </div>
  );
};
