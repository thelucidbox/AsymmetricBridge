import { S } from "../../styles";
import { useTheme } from "../../design-tokens";

export default function LucidBoxHeader({
  section,
  onSwitchSection,
  threat,
  threatClr,
  isOwnerMode,
}) {
  const { tokens } = useTheme();

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
              background: tokens.colors.headerGradient,
              borderRadius: 2,
            }}
          />
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: tokens.typography.letterSpacing.heading,
            }}
          >
            Asymmetric Bridge
          </h1>
          <span
            style={{
              fontSize: 9,
              color: tokens.colors.accent,
              background: tokens.colors.accentSubtle,
              padding: "2px 8px",
              borderRadius: 4,
              fontWeight: 600,
              marginLeft: 6,
            }}
          >
            {isOwnerMode ? "PERSONAL EDITION" : "COMMAND CENTER"}
          </span>
        </div>
        <p
          style={{
            fontSize: 10,
            color: tokens.colors.textSubtle,
            marginLeft: 11,
            fontFamily: tokens.typography.fontMono,
          }}
        >
          {isOwnerMode
            ? "Lucid Box · Signal Tracker · Thesis & Portfolio · AI Jobs"
            : "Dashboard · Signal Tracker · Portfolio · Jobs"}
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
        {isOwnerMode && (
          <button
            onClick={() => onSwitchSection("lucidbox")}
            style={S.sectionTab(section === "lucidbox", tokens.colors.alert)}
          >
            Lucid Box
          </button>
        )}
        {!isOwnerMode && (
          <button
            onClick={() => onSwitchSection("lucidbox")}
            style={S.sectionTab(section === "lucidbox", tokens.colors.alert)}
          >
            My Dashboard
          </button>
        )}
        <button
          onClick={() => onSwitchSection("signals")}
          data-tour="section-signals"
          style={S.sectionTab(section === "signals", tokens.colors.accent)}
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
          style={S.sectionTab(section === "thesis", tokens.colors.dominoPolicy)}
        >
          Thesis & Portfolio
        </button>
        <button
          onClick={() => onSwitchSection("jobs")}
          style={S.sectionTab(section === "jobs", tokens.colors.baseline)}
        >
          AI Jobs
        </button>
      </div>
    </>
  );
}
