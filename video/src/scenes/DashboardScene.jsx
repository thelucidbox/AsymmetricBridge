import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const DashboardScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const storyOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  const imgProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
  });
  const imgScale = interpolate(imgProgress, [0, 1], [0.95, 1]);
  const imgOpacity = interpolate(imgProgress, [0, 1], [0, 1]);

  const captionOpacity = interpolate(frame, [80, 100], [0, 1], {
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
        background: "#0D0D0F",
        padding: 60,
      }}
    >
      <div
        style={{
          opacity: storyOpacity,
          fontSize: 24,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
          marginBottom: 24,
          lineHeight: 1.5,
          maxWidth: 800,
        }}
      >
        I read the research. I had questions. So I built a way to follow the
        answers.
      </div>

      <div
        style={{
          opacity: imgOpacity,
          transform: `scale(${imgScale})`,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          maxWidth: 1300,
          width: "100%",
        }}
      >
        <Img
          src={staticFile("dashboard.png")}
          style={{
            width: "100%",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          opacity: captionOpacity,
          fontSize: 20,
          color: "rgba(255,255,255,0.5)",
          marginTop: 20,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Live signals. Real data feeds. A structured way to see what's actually
        moving.
      </div>
    </div>
  );
};
