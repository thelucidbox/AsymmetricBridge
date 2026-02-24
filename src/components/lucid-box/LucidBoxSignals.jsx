import { useMemo, useState } from "react";
import { S, STATUS_CFG } from "../../styles";
import FeedStatus from "../FeedStatus";
import { SkeletonCard, SkeletonChart, SkeletonTable } from "../Skeleton";
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
  isSignalsLoading,
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [dominoFilter, setDominoFilter] = useState("all");
  const statusFilters = [
    { id: "all", label: "All", color: "rgba(255,255,255,0.5)" },
    { id: "green", label: "Green", color: STATUS_CFG.green.text },
    { id: "amber", label: "Amber", color: STATUS_CFG.amber.text },
    { id: "red", label: "Red", color: STATUS_CFG.red.text },
  ];

  const filteredDominos = useMemo(() => {
    const dominosBySelection =
      dominoFilter === "all"
        ? liveDominos
        : liveDominos.filter((domino) => String(domino.id) === dominoFilter);

    return dominosBySelection
      .map((domino) => ({
        ...domino,
        signals: domino.signals.filter((signal) =>
          statusFilter === "all" ? true : signal.currentStatus === statusFilter,
        ),
      }))
      .filter((domino) => domino.signals.length > 0);
  }, [liveDominos, dominoFilter, statusFilter]);

  const showEmptyFilters = !isSignalsLoading && filteredDominos.length === 0;

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
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSignalSubTab(tab.id)}
            style={S.tab(signalSubTab === tab.id, tab.c)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {signalSubTab === "howItWorks" && <WorkflowInfo />}
      {signalSubTab === "update" && <SignalUpdateForm />}

      {signalSubTab === "tracker" && (
        <div>
          <FeedStatus feeds={feeds} />

          {isSignalsLoading ? (
            <div>
              <SkeletonCard lines={3} />
              <SkeletonChart height={150} />
              <SkeletonTable rows={8} cols={3} />
            </div>
          ) : (
            <>
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

              <div
                style={{
                  marginBottom: 12,
                  padding: "12px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  }}
                >
                  <span style={S.label}>Status Filter</span>
                  {statusFilters.map((filter) => {
                    const isActive = statusFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setStatusFilter(filter.id)}
                        style={{
                          padding: "6px 10px",
                          fontSize: 11,
                          borderRadius: 6,
                          cursor: "pointer",
                          fontWeight: isActive ? 700 : 500,
                          border: `1px solid ${isActive ? `${filter.color}66` : "rgba(255,255,255,0.08)"}`,
                          background: isActive
                            ? `${filter.color}18`
                            : "transparent",
                          color: isActive
                            ? filter.color
                            : "rgba(255,255,255,0.45)",
                          transition:
                            "color 0.2s, background 0.2s, border-color 0.2s, opacity 0.2s, box-shadow 0.2s",
                        }}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={S.label}>Domino Filter</span>
                  <select
                    value={dominoFilter}
                    onChange={(event) => setDominoFilter(event.target.value)}
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.75)",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 6,
                      padding: "6px 10px",
                      width: "min(100%, 260px)",
                    }}
                  >
                    <option value="all">All dominos</option>
                    {liveDominos.map((domino) => (
                      <option key={domino.id} value={String(domino.id)}>
                        {`Domino ${domino.id}: ${domino.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {showEmptyFilters ? (
                <div
                  style={{
                    marginBottom: 14,
                    padding: "14px",
                    border: "1px dashed rgba(255,255,255,0.16)",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.48)",
                  }}
                >
                  No signals match the selected filters.
                </div>
              ) : (
                <LucidBoxDominos
                  liveDominos={filteredDominos}
                  activeDominos={activeDominos}
                  onToggleDomino={onToggleDomino}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
