import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const DOMINOS = [
  {
    name: "SaaS Compression",
    color: "#E63946",
    desc: "Pricing power fades",
  },
  {
    name: "White-Collar Displacement",
    color: "#F4A261",
    desc: "Roles shrink",
  },
  {
    name: "Friction Collapse",
    color: "#2A9D8F",
    desc: "Middlemen lose ground",
  },
  {
    name: "Ghost GDP",
    color: "#264653",
    desc: "Growth without jobs",
  },
  {
    name: "Financial Contagion",
    color: "#9B2226",
    desc: "Stress spreads",
  },
  {
    name: "Policy Response",
    color: "#6D6875",
    desc: "Governments react",
  },
];

export const SignalScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(frame, [15, 35], [0, 1], {
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
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: headerOpacity,
          fontSize: 36,
          fontWeight: 700,
          marginBottom: 10,
          textAlign: "center",
          letterSpacing: "-0.5px",
        }}
      >
        Define your thesis as a chain of{" "}
        <span style={{ color: "#E9C46A" }}>dominos</span>.
      </div>

      <div
        style={{
          opacity: subOpacity,
          fontSize: 22,
          color: "rgba(255,255,255,0.45)",
          marginBottom: 50,
          textAlign: "center",
        }}
      >
        Each one connected to live economic signals. When one tips, it pressures
        the next.
      </div>

      <div
        style={{
          display: "flex",
          gap: 18,
          width: "100%",
          maxWidth: 1400,
        }}
      >
        {DOMINOS.map((domino, i) => {
          const delay = i * 8;
          const progress = spring({
            frame: frame - 40 - delay,
            fps,
            config: { damping: 200 },
          });

          const y = interpolate(progress, [0, 1], [50, 0]);
          const opacity = interpolate(progress, [0, 1], [0, 1]);

          const arrowOpacity =
            i < DOMINOS.length - 1
              ? interpolate(
                  spring({
                    frame: frame - 48 - delay,
                    fps,
                    config: { damping: 200 },
                  }),
                  [0, 1],
                  [0, 0.4],
                )
              : 0;

          return (
            <div
              key={domino.name}
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                gap: 12,
              }}
            >
              <div
                style={{
                  opacity,
                  transform: `translateY(${y}px)`,
                  flex: 1,
                  background: `${domino.color}12`,
                  border: `1px solid ${domino.color}35`,
                  borderRadius: 12,
                  padding: "28px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: `${domino.color}25`,
                    border: `2px solid ${domino.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    color: domino.color,
                  }}
                >
                  {i + 1}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.3,
                    color: "white",
                  }}
                >
                  {domino.name}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    textAlign: "center",
                  }}
                >
                  {domino.desc}
                </div>
              </div>

              {i < DOMINOS.length - 1 && (
                <div
                  style={{
                    opacity: arrowOpacity,
                    fontSize: 20,
                    color: "rgba(255,255,255,0.3)",
                    flexShrink: 0,
                  }}
                >
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
