import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [0, 25], [30, 0], {
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [40, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [40, 65], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const questionProgress = spring({
    frame: frame - 100,
    fps,
    config: { damping: 200 },
  });
  const questionOpacity = interpolate(questionProgress, [0, 1], [0, 1]);
  const questionScale = interpolate(questionProgress, [0, 1], [0.95, 1]);

  const disclaimerOpacity = interpolate(frame, [160, 180], [0, 1], {
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
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          fontSize: 32,
          color: "rgba(255,255,255,0.55)",
          fontWeight: 400,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 1000,
          marginBottom: 16,
        }}
      >
        Everyone has a take on where AI and the economy are headed.
      </div>

      <div
        style={{
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          fontSize: 32,
          color: "rgba(255,255,255,0.55)",
          fontWeight: 400,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 1000,
          marginBottom: 50,
        }}
      >
        Research papers, macro theses, bold conviction calls.
      </div>

      <div
        style={{
          opacity: questionOpacity,
          transform: `scale(${questionScale})`,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: "-1px",
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: 900,
        }}
      >
        But how do you actually <span style={{ color: "#E9C46A" }}>track</span>{" "}
        whether
        {"\n"}any of it is playing out?
      </div>

      <div
        style={{
          opacity: disclaimerOpacity,
          fontSize: 16,
          color: "rgba(255,255,255,0.3)",
          marginTop: 40,
          fontFamily: "monospace",
        }}
      >
        Not investment advice. A fun project born from curiosity.
      </div>
    </div>
  );
};
