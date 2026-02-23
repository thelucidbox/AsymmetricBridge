import { UNALIGNED_LEG_NAME } from "./leg-mapper";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeTargets(legBuckets) {
  const explicitTargets = legBuckets
    .filter((bucket) => bucket.legName !== UNALIGNED_LEG_NAME)
    .map((bucket) => ({
      legName: bucket.legName,
      targetPercent: Number(bucket.targetPercent),
    }))
    .filter((entry) => Number.isFinite(entry.targetPercent) && entry.targetPercent > 0);

  if (explicitTargets.length === 0) {
    return null;
  }

  const totalTarget = explicitTargets.reduce(
    (accumulator, entry) => accumulator + entry.targetPercent,
    0,
  );

  if (!Number.isFinite(totalTarget) || totalTarget <= 0) {
    return null;
  }

  return new Map(
    explicitTargets.map((entry) => [
      entry.legName,
      (entry.targetPercent / totalTarget) * 100,
    ]),
  );
}

export function calculateAlignmentScore(legBuckets = []) {
  const safeBuckets = Array.isArray(legBuckets) ? legBuckets : [];
  const unalignedBucket = safeBuckets.find(
    (bucket) => bucket.legName === UNALIGNED_LEG_NAME,
  );

  const unalignedPercent = Number(unalignedBucket?.percentOfPortfolio || 0);
  const alignedPercent = clamp(100 - unalignedPercent, 0, 100);

  const targetMap = normalizeTargets(safeBuckets);
  const breakdown = safeBuckets
    .filter((bucket) => bucket.legName !== UNALIGNED_LEG_NAME)
    .map((bucket) => {
      const actualPercent = Number(bucket.percentOfPortfolio || 0);
      const targetPercent = targetMap?.has(bucket.legName)
        ? targetMap.get(bucket.legName)
        : null;

      return {
        leg: bucket.legName,
        color: bucket.color,
        totalValue: Number(bucket.totalValue || 0),
        actualPercent: round(actualPercent),
        targetPercent: targetPercent === null ? null : round(targetPercent),
        delta: targetPercent === null ? null : round(actualPercent - targetPercent),
      };
    });

  let score = alignedPercent;

  if (targetMap) {
    const targetedRows = breakdown.filter((row) => row.targetPercent !== null);
    const averageAbsoluteDelta = targetedRows.length > 0
      ? targetedRows.reduce(
        (accumulator, row) => accumulator + Math.abs(Number(row.delta || 0)),
        0,
      ) / targetedRows.length
      : 0;

    // 0 delta = 100 accuracy. 20pp average miss = 0 accuracy.
    const allocationAccuracy = clamp(100 - averageAbsoluteDelta * 5, 0, 100);
    score = (alignedPercent * 0.8) + (allocationAccuracy * 0.2);
  }

  return {
    score: round(clamp(score, 0, 100)),
    breakdown,
    unalignedPercent: round(unalignedPercent),
    alignedPercent: round(alignedPercent),
  };
}
