import { S } from "../../styles";

export default function LucidBoxHeader({
  section,
  onSwitchSection,
  threat,
  threatClr,
}) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 3,
              height: 24,
              background: "linear-gradient(180deg, #E9C46A, #E63946)",
              borderRadius: 2,
            }}
          />
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.8px" }}>
            Asymmetric Bridge
          </h1>
          <span
            style={{
              fontSize: 9,
              color: "#E9C46A",
              background: "#E9C46A15",
              padding: "2px 8px",
              borderRadius: 4,
              fontWeight: 600,
              marginLeft: 6,
            }}
          >
            COMMAND CENTER
          </span>
        </div>
        <p
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
            marginLeft: 11,
            fontFamily: "'IBM Plex Mono'",
          }}
        >
          Lucid Box · Signal Tracker · Thesis & Portfolio · AI Jobs
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => onSwitchSection("lucidbox")}
          style={S.sectionTab(section === "lucidbox", "#E63946")}
        >
          Lucid Box
        </button>
        <button
          onClick={() => onSwitchSection("signals")}
          data-tour="section-signals"
          style={S.sectionTab(section === "signals", "#E9C46A")}
        >
          Signals
          <span
            style={{
              marginLeft: 6,
              fontSize: 9,
              color: threatClr,
              fontWeight: 700,
            }}
          >
            {threat}
          </span>
        </button>
        <button
          onClick={() => onSwitchSection("thesis")}
          data-tour="section-portfolio-tab"
          style={S.sectionTab(section === "thesis", "#6D6875")}
        >
          Thesis & Portfolio
        </button>
        <button
          onClick={() => onSwitchSection("jobs")}
          style={S.sectionTab(section === "jobs", "#2A9D8F")}
        >
          AI Jobs
        </button>
      </div>
    </>
  );
}
