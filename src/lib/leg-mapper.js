export const UNALIGNED_LEG_NAME = "Unaligned";

const TARGET_WEIGHT_KEYS = [
  "targetPercent",
  "targetWeight",
  "targetAllocation",
  "weight",
  "allocation",
];

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function parseTargetPercent(rawValue) {
  if (rawValue === null || rawValue === undefined) return null;

  if (typeof rawValue === "string") {
    const cleaned = rawValue.trim();
    if (!cleaned) return null;
    if (cleaned.endsWith("%")) {
      const parsedPercent = Number.parseFloat(cleaned.slice(0, -1));
      return Number.isFinite(parsedPercent) ? parsedPercent : null;
    }
    const parsedNumber = Number.parseFloat(cleaned);
    if (!Number.isFinite(parsedNumber)) return null;
    return parsedNumber > 0 && parsedNumber <= 1 ? parsedNumber * 100 : parsedNumber;
  }

  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return rawValue > 0 && rawValue <= 1 ? rawValue * 100 : rawValue;
  }

  return null;
}

export function getLegTargetPercent(leg) {
  for (const key of TARGET_WEIGHT_KEYS) {
    const parsed = parseTargetPercent(leg?.[key]);
    if (parsed !== null) return parsed;
  }
  return null;
}

function normalizeTicker(value) {
  return String(value || "").trim().toUpperCase();
}

function toPositionValue(position) {
  const parsedValue = Number(position?.marketValue);
  if (!Number.isFinite(parsedValue)) return 0;
  return Math.abs(parsedValue);
}

export function mapPositionsToLegs(positions = [], thesisLegs = []) {
  const safePositions = Array.isArray(positions) ? positions : [];
  const safeLegs = Array.isArray(thesisLegs) ? thesisLegs : [];

  const tickerToLeg = new Map();
  const legBuckets = safeLegs.map((leg) => {
    const bucket = {
      legName: leg.leg,
      thesis: leg.thesis,
      color: leg.color,
      targetPercent: getLegTargetPercent(leg),
      positions: [],
      totalValue: 0,
      percentOfPortfolio: 0,
    };

    if (Array.isArray(leg.tickers)) {
      leg.tickers.forEach((ticker) => {
        const normalizedTicker = normalizeTicker(ticker);
        if (normalizedTicker && !tickerToLeg.has(normalizedTicker)) {
          tickerToLeg.set(normalizedTicker, bucket.legName);
        }
      });
    }

    return bucket;
  });

  const bucketByName = new Map(
    legBuckets.map((bucket) => [bucket.legName, bucket]),
  );

  const unalignedBucket = {
    legName: UNALIGNED_LEG_NAME,
    thesis: "Positions that are not mapped to any thesis leg ticker.",
    color: "rgba(255,255,255,0.45)",
    targetPercent: 0,
    positions: [],
    totalValue: 0,
    percentOfPortfolio: 0,
  };

  safePositions.forEach((position) => {
    const symbol = normalizeTicker(position?.symbol);
    const positionValue = toPositionValue(position);
    const matchedLegName = tickerToLeg.get(symbol);
    const destinationBucket = matchedLegName
      ? bucketByName.get(matchedLegName)
      : unalignedBucket;

    if (!destinationBucket) return;

    destinationBucket.positions.push({
      ...position,
      symbol,
    });
    destinationBucket.totalValue += positionValue;
  });

  const allBuckets = [...legBuckets, unalignedBucket];
  const totalPortfolioValue = allBuckets.reduce(
    (accumulator, bucket) => accumulator + bucket.totalValue,
    0,
  );

  allBuckets.forEach((bucket) => {
    const percent = totalPortfolioValue > 0
      ? (bucket.totalValue / totalPortfolioValue) * 100
      : 0;

    bucket.totalValue = round(bucket.totalValue, 2);
    bucket.percentOfPortfolio = round(percent, 2);
  });

  return {
    totalPortfolioValue: round(totalPortfolioValue, 2),
    legBuckets: allBuckets,
  };
}
