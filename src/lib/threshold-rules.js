// Threshold Rules — maps live data sources to signal evaluations
// Each rule defines: which data source, how to extract the value, and what thresholds trigger status changes
// Rules evaluate top-to-bottom, first match wins. No match = green (baseline).

export const THRESHOLD_RULES = [
  // ============================================
  // DOMINO 1: SaaS Compression
  // ============================================
  {
    domino_id: 1,
    signal_name: "Public SaaS Net Revenue Retention",
    data_source: "stocks",
    manual_only: false,
    extract: (stockData) => {
      // Use SaaS stock aggregate price change as NRR proxy
      // Real NRR comes from earnings (manual), but stock trajectory signals direction
      const tickers = ["SNOW", "NOW", "CRM", "ZS"];
      const prices = tickers.map((t) => stockData?.[t]).filter(Boolean);
      if (prices.length === 0) return null;
      // Average percent change from 52-week high
      const avgPctChange =
        prices.reduce((sum, p) => {
          const change = p.percent_change ? parseFloat(p.percent_change) : 0;
          return sum + change;
        }, 0) / prices.length;
      return {
        value: avgPctChange,
        label: `SaaS avg change: ${avgPctChange.toFixed(1)}%`,
      };
    },
    thresholds: [
      {
        operator: "<",
        value: -20,
        status: "red",
        reason:
          "Major software companies down over 20% — pricing pressure is accelerating",
      },
      {
        operator: "<",
        value: -10,
        status: "amber",
        reason:
          "Software stocks falling — early sign of subscription pricing pressure",
      },
    ],
  },
  {
    domino_id: 1,
    signal_name: "Indeed SaaS Sales Job Postings",
    manual_only: true,
  },
  {
    domino_id: 1,
    signal_name: "Y Combinator 'Replace X' Startups",
    manual_only: true,
  },
  {
    domino_id: 1,
    signal_name: "Enterprise Software Spending Forecasts",
    manual_only: true,
  },

  // ============================================
  // DOMINO 2: White-Collar Displacement
  // ============================================
  {
    domino_id: 2,
    signal_name: "JOLTS: Professional Services Openings",
    data_source: "fred",
    manual_only: false,
    fred_series: "JTS540099000000000JOL",
    extract: (fredData) => {
      const series = fredData?.["JTS540099000000000JOL"];
      if (!series?.observations?.[0]) return null;
      const val = parseFloat(series.observations[0].value) / 1000; // Convert to millions
      return { value: val, label: `${val.toFixed(1)}M openings` };
    },
    thresholds: [
      {
        operator: "<",
        value: 1.5,
        status: "red",
        reason:
          "Professional job openings below 1.5 million — lasting shift in hiring, not just a dip",
      },
      {
        operator: "<",
        value: 1.8,
        status: "amber",
        reason:
          "Fewer professional job openings — hiring is cooling in office-type roles",
      },
    ],
  },
  {
    domino_id: 2,
    signal_name: "BLS Employment: Information Sector",
    data_source: "fred",
    manual_only: false,
    fred_series: "CES5000000001",
    extract: (fredData) => {
      const series = fredData?.["CES5000000001"];
      if (!series?.observations || series.observations.length < 3) return null;
      const recent = series.observations
        .slice(0, 3)
        .map((o) => parseFloat(o.value));
      const declining = recent.every((v, i) => i === 0 || v <= recent[i - 1]);
      const latest = recent[0] / 1000; // Convert to millions
      return {
        value: latest,
        label: `${latest.toFixed(1)}M employed`,
        declining,
      };
    },
    thresholds: [
      {
        operator: "custom",
        test: (extracted) => extracted?.declining && extracted?.value < 2.8,
        status: "red",
        reason:
          "Tech employment falling for 3 straight months and below 2.8 million — significant job losses",
      },
      {
        operator: "custom",
        test: (extracted) => extracted?.declining,
        status: "amber",
        reason:
          "Tech employment declining 3 months in a row — watch for sustained trend",
      },
    ],
  },
  {
    domino_id: 2,
    signal_name: "Challenger Layoff Announcements (Tech/Finance)",
    manual_only: true,
  },
  {
    domino_id: 2,
    signal_name: "Initial Jobless Claims Composition",
    data_source: "fred",
    manual_only: false,
    fred_series: "ICSA",
    extract: (fredData) => {
      const series = fredData?.["ICSA"];
      if (!series?.observations?.[0]) return null;
      const val = parseFloat(series.observations[0].value) / 1000; // Convert to thousands
      return { value: val, label: `${val.toFixed(0)}K weekly claims` };
    },
    thresholds: [
      {
        operator: ">",
        value: 350,
        status: "red",
        reason:
          "Over 350K weekly unemployment claims — approaching crisis levels",
      },
      {
        operator: ">",
        value: 280,
        status: "amber",
        reason:
          "Unemployment claims rising above normal — more people losing jobs each week",
      },
    ],
  },

  // ============================================
  // DOMINO 3: Friction Collapse
  // ============================================
  {
    domino_id: 3,
    signal_name: "DoorDash/Uber Eats Take Rate",
    manual_only: true,
  },
  {
    domino_id: 3,
    signal_name: "Visa/Mastercard Purchase Volume Growth",
    manual_only: true,
  },
  {
    domino_id: 3,
    signal_name: "Stablecoin Transaction Volume",
    data_source: "crypto",
    manual_only: false,
    extract: (cryptoData) => {
      if (!cryptoData?.totalVolume) return null;
      const monthlyVol = cryptoData.totalVolume * 30; // Daily → monthly estimate
      const volBillions = monthlyVol / 1e9;
      return {
        value: volBillions,
        label: `~$${volBillions.toFixed(0)}B/month`,
      };
    },
    thresholds: [
      {
        operator: ">",
        value: 2000,
        status: "red",
        reason:
          "Over $2 trillion/month in stablecoin transactions — AI-driven payments going mainstream",
      },
      {
        operator: ">",
        value: 1000,
        status: "amber",
        reason:
          "Stablecoin volume surpassing $1 trillion/month — digital payment rails growing fast",
      },
    ],
  },
  {
    domino_id: 3,
    signal_name: "Real Estate Commission Compression",
    manual_only: true,
  },

  // ============================================
  // DOMINO 4: Ghost GDP
  // ============================================
  {
    domino_id: 4,
    signal_name: "GDP Growth vs. Real Wage Growth Spread",
    data_source: "fred",
    manual_only: false,
    fred_series: "GDP",
    extract: (fredData) => {
      const series = fredData?.["GDP"];
      if (!series?.observations?.[0]) return null;
      // GDP value alone isn't the spread — need wage data too (manual supplement)
      // For auto: flag if GDP growth is anomalously high
      const val = parseFloat(series.observations[0].value);
      return { value: val, label: `GDP: $${(val / 1000).toFixed(1)}T` };
    },
    // GDP alone can't determine the spread — keep as manual-supplemented
    thresholds: [],
    notes:
      "Auto-evaluation limited — GDP/wage spread requires manual wage data comparison",
  },
  {
    domino_id: 4,
    signal_name: "M2 Velocity of Money",
    data_source: "fred",
    manual_only: false,
    fred_series: "M2V",
    extract: (fredData) => {
      const series = fredData?.["M2V"];
      if (!series?.observations?.[0]) return null;
      const val = parseFloat(series.observations[0].value);
      return { value: val, label: `Velocity: ${val.toFixed(2)}` };
    },
    thresholds: [
      {
        operator: "<",
        value: 1.0,
        status: "red",
        reason:
          "Money velocity below 1.0 — cash barely changing hands, economy sluggish despite looking okay on paper",
      },
      {
        operator: "<",
        value: 1.15,
        status: "amber",
        reason:
          "Money circulating slower than normal — spending and business activity weakening",
      },
    ],
  },
  {
    domino_id: 4,
    signal_name: "Consumer Confidence vs. CEO Confidence",
    data_source: "fred",
    manual_only: false,
    fred_series: "CSCICP03USM665S",
    extract: (fredData) => {
      const series = fredData?.["CSCICP03USM665S"];
      if (!series?.observations?.[0]) return null;
      const val = parseFloat(series.observations[0].value);
      return { value: val, label: `Consumer confidence: ${val.toFixed(1)}` };
    },
    // Consumer confidence alone — CEO confidence divergence is manual
    thresholds: [
      {
        operator: "<",
        value: 95,
        status: "red",
        reason: "Consumers are deeply pessimistic — spending cuts likely ahead",
      },
      {
        operator: "<",
        value: 98,
        status: "amber",
        reason:
          "Consumer confidence dropping — people starting to feel uneasy about their finances",
      },
    ],
  },
  {
    domino_id: 4,
    signal_name: "Labor Share of GDP",
    data_source: "fred",
    manual_only: false,
    fred_series: "PRS85006173",
    extract: (fredData) => {
      const series = fredData?.["PRS85006173"];
      if (!series?.observations?.[0]) return null;
      const val = parseFloat(series.observations[0].value);
      return { value: val, label: `Labor share: ${val.toFixed(1)}%` };
    },
    thresholds: [
      {
        operator: "<",
        value: 52,
        status: "red",
        reason:
          "Workers getting less than 52% of economic output — wealth concentrating away from paychecks",
      },
      {
        operator: "<",
        value: 55,
        status: "amber",
        reason:
          "Workers' share of the economy shrinking — more income going to companies and investors",
      },
    ],
  },

  // ============================================
  // DOMINO 5: Financial Contagion
  // ============================================
  {
    domino_id: 5,
    signal_name: "PE-Backed Software Default Rate",
    manual_only: true,
  },
  {
    domino_id: 5,
    signal_name: "Alt Manager Stock Prices (BX, APO, KKR)",
    data_source: "stocks",
    manual_only: false,
    extract: (stockData) => {
      const tickers = ["BX", "APO", "KKR"];
      const prices = tickers.map((t) => stockData?.[t]).filter(Boolean);
      if (prices.length === 0) return null;
      // Check drawdown from 52-week high
      const avgDrawdown =
        prices.reduce((sum, p) => {
          const pctFrom52 = p.fifty_two_week?.high
            ? ((parseFloat(p.close) - parseFloat(p.fifty_two_week.high)) /
                parseFloat(p.fifty_two_week.high)) *
              100
            : parseFloat(p.percent_change) || 0;
          return sum + pctFrom52;
        }, 0) / prices.length;
      return {
        value: avgDrawdown,
        label: `Avg drawdown from 52w high: ${avgDrawdown.toFixed(1)}%`,
      };
    },
    thresholds: [
      {
        operator: "<",
        value: -25,
        status: "red",
        reason:
          "Major investment firms down over 25% from highs — markets pricing in serious financial stress",
      },
      {
        operator: "<",
        value: -15,
        status: "amber",
        reason:
          "Large investment firms falling — early sign of broader financial strain",
      },
    ],
  },
  {
    domino_id: 5,
    signal_name: "Prime Mortgage Delinquency (Tech Metros)",
    manual_only: true,
  },
  {
    domino_id: 5,
    signal_name: "NAIC Insurance Capital Actions",
    manual_only: true,
  },

  // ============================================
  // DOMINO 6: Policy Response
  // ============================================
  {
    domino_id: 6,
    signal_name: "Congressional AI Legislation Activity",
    manual_only: true,
  },
  {
    domino_id: 6,
    signal_name: "Fed Language: Structural vs. Cyclical",
    manual_only: true,
  },
  {
    domino_id: 6,
    signal_name: "Federal Receipts vs. CBO Baseline",
    data_source: "fred",
    manual_only: false,
    fred_series: "FGRECPT",
    extract: (fredData) => {
      const series = fredData?.["FGRECPT"];
      if (!series?.observations?.[0]) return null;
      const val = parseFloat(series.observations[0].value);
      return {
        value: val,
        label: `Federal receipts: $${(val / 1000).toFixed(0)}B`,
      };
    },
    // Receipts alone don't tell us % below baseline without CBO data — mostly manual
    thresholds: [],
    notes: "Auto-evaluation limited — needs CBO baseline comparison (manual)",
  },
  {
    domino_id: 6,
    signal_name: "Deficit Trajectory",
    manual_only: true,
  },
];

// Count of auto-evaluable vs manual-only signals
export const RULE_STATS = {
  total: THRESHOLD_RULES.length,
  auto: THRESHOLD_RULES.filter(
    (r) => !r.manual_only && r.thresholds?.length > 0,
  ).length,
  manual: THRESHOLD_RULES.filter((r) => r.manual_only || !r.thresholds?.length)
    .length,
};
