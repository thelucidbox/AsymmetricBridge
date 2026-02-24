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
import { isOwnerMode } from "../config/ThesisContext";
import { useTheme } from "../design-tokens";
import { useCryptoData } from "../hooks/useCryptoData";
import { useFredData } from "../hooks/useFredData";
import { useSignalStatuses } from "../hooks/useSignalStatuses";
import { useStockData } from "../hooks/useStockData";
import { useAutoThreshold } from "../hooks/useAutoThreshold";
import { getFredApiKey } from "../lib/fred";
import { getTwelveDataApiKey } from "../lib/stocks";
import { S } from "../styles";

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

function normalizeFeedError(error, source = "unknown") {
  if (!error) return null;

  if (typeof error === "object" && "code" in error && "message" in error) {
    return {
      code: error.code || "NETWORK_ERROR",
      message: error.message || "Unknown error",
      retryable: Boolean(error.retryable),
      source: error.source || source,
    };
  }

  if (error instanceof Error) {
    return {
      code: "NETWORK_ERROR",
      message: error.message,
      retryable: true,
      source,
    };
  }

  return {
    code: "NETWORK_ERROR",
    message: String(error),
    retryable: true,
    source,
  };
}

function latestTimestamp(values) {
  const valid = values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (!valid.length) return null;
  valid.sort((a, b) => b.getTime() - a.getTime());
  return valid[0].toISOString();
}

function EmptyStateCard({ title, description, color }) {
  const { tokens } = useTheme();
  return (
    <div
      style={{
        ...S.card(`${color}22`),
        textAlign: "center",
        padding: "32px 20px",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: tokens.colors.textMuted,
          lineHeight: 1.6,
        }}
      >
        {description}
      </div>
    </div>
  );
}

function SampleDataBanner() {
  const { tokens } = useTheme();
  const hasApiKeys = getFredApiKey() || getTwelveDataApiKey();
  if (hasApiKeys) return null;

  return (
    <div
      style={{
        ...S.card("rgba(233,196,106,0.15)"),
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: tokens.colors.textMuted,
          lineHeight: 1.5,
        }}
      >
        Showing sample data — add your FRED and Twelve Data API keys in Settings
        for live updates.
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const { tokens } = useTheme();
  const [section, setSection] = useState(isOwnerMode ? "lucidbox" : "signals");
  const [subTab, setSubTab] = useState(isOwnerMode ? "products" : "dominos");
  const [activeDominos, setActiveDominos] = useState(new Set([1]));
  const [expandedProduct, setExpandedProduct] = useState(3);
  const [signalSubTab, setSignalSubTab] = useState("tracker");

  const fredQuery = useFredData();
  const stockQuery = useStockData();
  const cryptoQuery = useCryptoData();
  const signalStatusesQuery = useSignalStatuses();

  const {
    data: fredData,
    isLoading: fredLoading,
    isFetching: fredFetching,
    error: fredQueryError,
    dataUpdatedAt: fredDataUpdatedAt,
  } = fredQuery;
  const {
    data: stockData,
    isLoading: stockLoading,
    isFetching: stockFetching,
    error: stockQueryError,
    dataUpdatedAt: stockDataUpdatedAt,
  } = stockQuery;
  const {
    data: cryptoData,
    isLoading: cryptoLoading,
    isFetching: cryptoFetching,
    error: cryptoQueryError,
    dataUpdatedAt: cryptoDataUpdatedAt,
  } = cryptoQuery;
  const { data: signalStatuses, isLoading: signalStatusesLoading } =
    signalStatusesQuery;

  const thresholdResult = useAutoThreshold({
    fredData,
    stockData,
    cryptoData,
    signalStatuses,
  });

  const liveDominos = useMemo(() => {
    return DOMINOS.map((domino) => ({
      ...domino,
      signals: domino.signals.map((signal) => {
        const live = signalStatuses?.find(
          (status) =>
            status.domino_id === domino.id &&
            status.signal_name === signal.name,
        );
        const baseSignal = {
          ...signal,
          dominoId: domino.id,
        };
        if (!live) return baseSignal;
        return {
          ...baseSignal,
          currentStatus: live.status,
          isOverride: live.is_override,
          updatedAt: live.updated_at,
          updatedBy: live.updated_by,
          statusReason: live.reason || live.notes || null,
          signalId: live.signal_id || signal.signalId || null,
          statusRowId: live.id,
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

  const totalSig = liveDominos.reduce(
    (sum, domino) => sum + domino.signals.length,
    0,
  );
  const amberCt = liveDominos.reduce(
    (sum, domino) =>
      sum +
      domino.signals.filter((signal) => signal.currentStatus === "amber")
        .length,
    0,
  );
  const redCt = liveDominos.reduce(
    (sum, domino) =>
      sum +
      domino.signals.filter((signal) => signal.currentStatus === "red").length,
    0,
  );
  const greenCt = totalSig - amberCt - redCt;
  const threat =
    redCt >= 6
      ? "CRISIS"
      : redCt >= 3
        ? "CRITICAL"
        : amberCt >= 12
          ? "ELEVATED"
          : amberCt >= 6
            ? "WATCH"
            : "BASELINE";
  const threatClr =
    threat === "CRISIS" || threat === "CRITICAL"
      ? tokens.colors.alert
      : threat === "ELEVATED"
        ? tokens.colors.watch
        : threat === "WATCH"
          ? tokens.colors.accent
          : tokens.colors.baseline;

  const fredSeries = useMemo(() => {
    if (
      !fredData ||
      typeof fredData !== "object" ||
      Array.isArray(fredData) ||
      "error" in fredData
    ) {
      return [];
    }
    return Object.values(fredData).filter(
      (entry) => entry && typeof entry === "object",
    );
  }, [fredData]);

  const fredSuccessfulSeries = fredSeries.filter((entry) =>
    Array.isArray(entry.observations),
  );
  const fredNestedErrors = fredSeries
    .map((entry) => normalizeFeedError(entry.error, "fred"))
    .filter(Boolean);
  const fredError =
    normalizeFeedError(fredData?.error, "fred") ||
    fredNestedErrors.find((error) => error.code === "RATE_LIMITED") ||
    fredNestedErrors[0] ||
    normalizeFeedError(fredQueryError, "fred");
  const fredConnected = fredSuccessfulSeries.length > 0;
  const fredLastSuccess =
    latestTimestamp(fredSuccessfulSeries.map((entry) => entry.fetchedAt)) ||
    (fredConnected && fredDataUpdatedAt
      ? new Date(fredDataUpdatedAt).toISOString()
      : null);

  const stockConnected = Boolean(
    stockData &&
    typeof stockData === "object" &&
    !Array.isArray(stockData) &&
    !("error" in stockData) &&
    Object.keys(stockData).length > 0,
  );
  const stockError =
    normalizeFeedError(stockData?.error, "twelve_data") ||
    normalizeFeedError(stockQueryError, "twelve_data");
  const stockLastSuccess =
    stockConnected && stockDataUpdatedAt
      ? new Date(stockDataUpdatedAt).toISOString()
      : null;

  const cryptoConnected = Boolean(
    cryptoData &&
    typeof cryptoData === "object" &&
    !Array.isArray(cryptoData) &&
    Array.isArray(cryptoData.coins),
  );
  const cryptoError =
    normalizeFeedError(cryptoData?.error, "coingecko") ||
    normalizeFeedError(cryptoQueryError, "coingecko");
  const cryptoLastSuccess = cryptoConnected
    ? cryptoData.fetchedAt ||
      (cryptoDataUpdatedAt ? new Date(cryptoDataUpdatedAt).toISOString() : null)
    : null;

  const feeds = [
    {
      name: "FRED",
      active: !!getFredApiKey(),
      loading: fredLoading || fredFetching,
      connected: fredConnected,
      data: fredConnected,
      lastSuccessfulFetch: fredLastSuccess,
      error: fredError,
    },
    {
      name: "Twelve Data",
      active: !!getTwelveDataApiKey(),
      loading: stockLoading || stockFetching,
      connected: stockConnected,
      data: stockConnected,
      lastSuccessfulFetch: stockLastSuccess,
      error: stockError,
    },
    {
      name: "CoinGecko",
      active: true,
      loading: cryptoLoading || cryptoFetching,
      connected: cryptoConnected,
      data: cryptoConnected,
      lastSuccessfulFetch: cryptoLastSuccess,
      error: cryptoError,
    },
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
        background: tokens.colors.bg,
        color: tokens.colors.text,
        fontFamily: tokens.typography.fontSans,
        padding: tokens.spacing.pagePadding,
      }}
    >
      <div className="ab-content-shell">
        <LucidBoxHeader
          section={section}
          onSwitchSection={switchSection}
          threat={threat}
          threatClr={threatClr}
          isOwnerMode={isOwnerMode}
        />

        <div
          aria-live="polite"
          style={{
            fontSize: 10,
            color: tokens.colors.textMuted,
            fontFamily: tokens.typography.fontMono,
            letterSpacing: "0.3px",
            marginBottom: 4,
          }}
        >
          {greenCt} green · {amberCt} amber · {redCt} red — {threat}
        </div>

        {!isOwnerMode && <SampleDataBanner />}

        {section === "lucidbox" && isOwnerMode && (
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

        {section === "lucidbox" && !isOwnerMode && (
          <EmptyStateCard
            title="Your Portfolio"
            description="Upload your portfolio CSV in the Performance Lab to see thesis alignment and track your positioning."
            color="#E63946"
          />
        )}

        {section === "signals" && (
          <ErrorBoundary>
            <LucidBoxSignals
              signalSubTab={signalSubTab}
              setSignalSubTab={setSignalSubTab}
              feeds={feeds}
              thresholdResult={thresholdResult}
              signalStatuses={signalStatuses}
              isSignalsLoading={signalStatusesLoading}
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

        {section === "thesis" && isOwnerMode && (
          <ErrorBoundary>
            <ThesisPortfolio />
          </ErrorBoundary>
        )}

        {section === "thesis" && !isOwnerMode && (
          <EmptyStateCard
            title="Your Thesis Portfolio"
            description="After tracking signals for a while, build your portfolio thesis here. This section shows how your investment positioning maps to the domino cascade."
            color="#6D6875"
          />
        )}

        {section === "jobs" && isOwnerMode && (
          <ErrorBoundary>
            <AIJobs />
          </ErrorBoundary>
        )}

        {section === "jobs" && !isOwnerMode && (
          <EmptyStateCard
            title="AI Jobs Tracker"
            description="Track AI-related job market trends and opportunities relevant to your career positioning."
            color="#2A9D8F"
          />
        )}

        <div
          style={{
            marginTop: 24,
            padding: "10px",
            textAlign: "center",
            fontSize: 9,
            color: tokens.colors.borderStrong,
            borderTop: `1px solid ${tokens.colors.borderSubtle}`,
          }}
        >
          Asymmetric Bridge v3.2 · Signal Tracker + Thesis Dashboard · Not
          financial advice
        </div>
      </div>
    </div>
  );
}
