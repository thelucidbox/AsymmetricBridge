import { useMemo, useState } from "react";
import AIJobs from "./AIJobs";
import ErrorBoundary from "./ErrorBoundary";
import ThesisPortfolio from "./ThesisPortfolio";
import LucidBoxHeader from "./lucid-box/LucidBoxHeader";
import LucidBoxPortfolio from "./lucid-box/LucidBoxPortfolio";
import LucidBoxSignals from "./lucid-box/LucidBoxSignals";
import { ALOS_COMPONENTS } from "../data/alos-components";
import { DOMINOS } from "../data/dominos";
import { PRODUCTS } from "../data/products";
import { REVENUE_SCENARIOS } from "../data/revenue";
import { TWITTER_PILLARS } from "../data/twitter";
import { useCryptoData } from "../hooks/useCryptoData";
import { useFredData } from "../hooks/useFredData";
import { useSignalStatuses } from "../hooks/useSignalStatuses";
import { useStockData } from "../hooks/useStockData";
import { useAutoThreshold } from "../hooks/useAutoThreshold";
import { FRED_API_KEY } from "../lib/fred";
import { TWELVE_DATA_API_KEY } from "../lib/stocks";

const PRODUCT_STATUS_LABELS = {
  launch_now: "LAUNCH NOW",
  build_this_month: "THIS MONTH",
  launch_month_2: "MONTH 2",
  launch_quarter_2: "Q2",
  launch_quarter_3: "Q3",
  build_quarter_3: "BUILD Q3",
};

const PRODUCT_STATUS_COLORS = {
  launch_now: "#E63946",
  build_this_month: "#F4A261",
  launch_month_2: "#E9C46A",
  launch_quarter_2: "#2A9D8F",
  launch_quarter_3: "#6D6875",
  build_quarter_3: "#264653",
};

export default function CommandCenter() {
  const [section, setSection] = useState("lucidbox");
  const [subTab, setSubTab] = useState("products");
  const [activeDominos, setActiveDominos] = useState(new Set([1]));
  const [expandedProduct, setExpandedProduct] = useState(3);
  const [signalSubTab, setSignalSubTab] = useState("tracker");

  const { data: fredData, isLoading: fredLoading } = useFredData();
  const { data: stockData, isLoading: stockLoading } = useStockData();
  const { data: cryptoData, isLoading: cryptoLoading } = useCryptoData();
  const { data: signalStatuses } = useSignalStatuses();

  const thresholdResult = useAutoThreshold({ fredData, stockData, cryptoData, signalStatuses });

  const liveDominos = useMemo(() => {
    if (!signalStatuses?.length) return DOMINOS;
    return DOMINOS.map((domino) => ({
      ...domino,
      signals: domino.signals.map((signal) => {
        const live = signalStatuses.find(
          (status) => status.domino_id === domino.id && status.signal_name === signal.name,
        );
        if (!live) return signal;
        return {
          ...signal,
          currentStatus: live.status,
          isOverride: live.is_override,
          updatedAt: live.updated_at,
          updatedBy: live.updated_by,
        };
      }),
    }));
  }, [signalStatuses]);

  const toggleDomino = (id) => {
    setActiveDominos((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalSig = liveDominos.reduce((sum, domino) => sum + domino.signals.length, 0);
  const amberCt = liveDominos.reduce(
    (sum, domino) => sum + domino.signals.filter((signal) => signal.currentStatus === "amber").length,
    0,
  );
  const redCt = liveDominos.reduce(
    (sum, domino) => sum + domino.signals.filter((signal) => signal.currentStatus === "red").length,
    0,
  );
  const greenCt = totalSig - amberCt - redCt;
  const threat = redCt >= 6 ? "CRISIS" : redCt >= 3 ? "CRITICAL" : amberCt >= 12 ? "ELEVATED" : amberCt >= 6 ? "WATCH" : "BASELINE";
  const threatClr =
    threat === "CRISIS" || threat === "CRITICAL"
      ? "#E63946"
      : threat === "ELEVATED"
        ? "#F4A261"
        : threat === "WATCH"
          ? "#E9C46A"
          : "#2A9D8F";

  const feeds = [
    { name: "FRED", active: !!FRED_API_KEY, loading: fredLoading, data: !!fredData },
    { name: "Stocks", active: !!TWELVE_DATA_API_KEY, loading: stockLoading, data: !!stockData },
    { name: "Crypto", active: true, loading: cryptoLoading, data: !!cryptoData },
  ];

  const switchSection = (nextSection) => {
    setSection(nextSection);
    if (nextSection === "lucidbox") setSubTab("products");
    else setSubTab("dominos");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D0F",
        color: "#E8E4DF",
        fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
        padding: "20px 14px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <LucidBoxHeader section={section} onSwitchSection={switchSection} threat={threat} threatClr={threatClr} />

        {section === "lucidbox" && (
          <ErrorBoundary>
            <LucidBoxPortfolio
              subTab={subTab}
              setSubTab={setSubTab}
              expandedProduct={expandedProduct}
              setExpandedProduct={setExpandedProduct}
              products={PRODUCTS}
              alosComponents={ALOS_COMPONENTS}
              twitterPillars={TWITTER_PILLARS}
              revenueScenarios={REVENUE_SCENARIOS}
              statusLabels={PRODUCT_STATUS_LABELS}
              statusColors={PRODUCT_STATUS_COLORS}
            />
          </ErrorBoundary>
        )}

        {section === "signals" && (
          <ErrorBoundary>
            <LucidBoxSignals
              signalSubTab={signalSubTab}
              setSignalSubTab={setSignalSubTab}
              feeds={feeds}
              thresholdResult={thresholdResult}
              signalStatuses={signalStatuses}
              threatClr={threatClr}
              threat={threat}
              greenCt={greenCt}
              amberCt={amberCt}
              redCt={redCt}
              totalSig={totalSig}
              liveDominos={liveDominos}
              activeDominos={activeDominos}
              onToggleDomino={toggleDomino}
            />
          </ErrorBoundary>
        )}

        {section === "thesis" && (
          <ErrorBoundary>
            <ThesisPortfolio />
          </ErrorBoundary>
        )}

        {section === "jobs" && (
          <ErrorBoundary>
            <AIJobs />
          </ErrorBoundary>
        )}

        <div
          style={{
            marginTop: 24,
            padding: "10px",
            textAlign: "center",
            fontSize: 9,
            color: "rgba(255,255,255,0.12)",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          Asymmetric Bridge Command Center v3.0 · Lucid Box + Signal Tracker · Feb 22, 2026 · Not financial advice
        </div>
      </div>
    </div>
  );
}
