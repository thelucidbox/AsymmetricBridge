import { S } from "../../styles";
import SignalUpdateForm from "../SignalUpdateForm";
import WorkflowInfo from "../WorkflowInfo";
import LucidBoxDominos from "./LucidBoxDominos";
import LucidBoxMarket from "./LucidBoxMarket";

export default function LucidBoxSignals({
  signalSubTab,
  setSignalSubTab,
  feeds,
  thresholdResult,
  signalStatuses,
  threatClr,
  threat,
  greenCt,
  amberCt,
  redCt,
  totalSig,
  liveDominos,
  activeDominos,
  onToggleDomino,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        {[
          { id: "tracker", label: "Tracker", c: "#E9C46A" },
          { id: "howItWorks", label: "How It Works", c: "#2A9D8F" },
          { id: "update", label: "Update Signal", c: "#F4A261" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSignalSubTab(t.id)}
            style={S.tab(signalSubTab === t.id, t.c)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {signalSubTab === "howItWorks" && <WorkflowInfo />}
      {signalSubTab === "update" && <SignalUpdateForm />}

      {signalSubTab === "tracker" && (
        <div>
          <LucidBoxMarket
            feeds={feeds}
            thresholdResult={thresholdResult}
            signalStatuses={signalStatuses}
            threatClr={threatClr}
            threat={threat}
            greenCt={greenCt}
            amberCt={amberCt}
            redCt={redCt}
            totalSig={totalSig}
          />
          <LucidBoxDominos
            liveDominos={liveDominos}
            activeDominos={activeDominos}
            onToggleDomino={onToggleDomino}
          />
        </div>
      )}
    </div>
  );
}
