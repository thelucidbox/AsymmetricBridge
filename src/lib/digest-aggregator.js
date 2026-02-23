import { DOMINOS } from "../data/dominos";
import { supabase } from "./supabase";

const STATUS_WEIGHT = {
  green: 0,
  amber: 1,
  red: 2,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STALE_THRESHOLD_DAYS = 30;

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function normalizeStatus(value) {
  if (value === "green" || value === "amber" || value === "red") return value;
  return null;
}

function signalKey(dominoId, signalName) {
  return `${dominoId}::${signalName}`;
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISODate(value) {
  const date = toDate(value);
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(value) {
  const date = toDate(value);
  if (!date) return "Unknown";
  return DATE_FORMATTER.format(date);
}

function resolveThreatLevel(redCount, amberCount) {
  if (redCount >= 6) return "CRISIS";
  if (redCount >= 3) return "CRITICAL";
  if (amberCount >= 12) return "ELEVATED";
  if (amberCount >= 6) return "WATCH";
  return "BASELINE";
}

function buildSignalCatalog() {
  return DOMINOS.flatMap((domino) =>
    domino.signals.map((signal) => ({
      dominoId: domino.id,
      dominoName: domino.name,
      dominoColor: domino.color,
      signalName: signal.name,
      defaultStatus: normalizeStatus(signal.currentStatus) || "green",
      source: signal.source || null,
      frequency: signal.frequency || null,
      threshold: signal.threshold || null,
      notes: signal.notes || null,
      whyItMatters: signal.whyItMatters || null,
    })),
  );
}

async function querySupabaseDigestData(periodStartIso) {
  if (!supabase) {
    return {
      historyRows: [],
      statusRows: [],
      latestHistoryRows: [],
    };
  }

  const [historyResult, statusResult, latestHistoryResult] = await Promise.all([
    supabase
      .from("signal_history")
      .select("domino_id, signal_name, old_status, new_status, reason, changed_at")
      .gte("changed_at", periodStartIso)
      .order("changed_at", { ascending: false }),
    supabase
      .from("signal_statuses")
      .select("id, domino_id, signal_name, status, reason, notes, updated_at"),
    supabase
      .from("signal_history")
      .select("domino_id, signal_name, changed_at")
      .order("changed_at", { ascending: false })
      .limit(500),
  ]);

  if (historyResult.error) {
    console.warn("Digest aggregator: unable to read signal_history:", historyResult.error.message);
  }
  if (statusResult.error) {
    console.warn("Digest aggregator: unable to read signal_statuses:", statusResult.error.message);
  }
  if (latestHistoryResult.error) {
    console.warn(
      "Digest aggregator: unable to read latest signal_history rows:",
      latestHistoryResult.error.message,
    );
  }

  return {
    historyRows: historyResult.data || [],
    statusRows: statusResult.data || [],
    latestHistoryRows: latestHistoryResult.data || [],
  };
}

function fallbackChangeReason(change, signalMeta) {
  if (change.reason) return change.reason;
  if (signalMeta?.notes) return signalMeta.notes;
  if (signalMeta?.threshold) return `Threshold watch: ${signalMeta.threshold}`;
  return "No reason provided.";
}

export async function aggregateDigestData(dayRange = 7) {
  const now = new Date();
  const parsedDayRange = Number(dayRange);
  const safeDayRange = Number.isFinite(parsedDayRange)
    ? Math.max(1, Math.round(parsedDayRange))
    : 7;

  const periodStart = new Date(now);
  periodStart.setHours(0, 0, 0, 0);
  periodStart.setDate(periodStart.getDate() - safeDayRange + 1);

  const signalCatalog = buildSignalCatalog();
  const signalMetaByKey = new Map(
    signalCatalog.map((signal) => [signalKey(signal.dominoId, signal.signalName), signal]),
  );
  const dominoById = new Map(DOMINOS.map((domino) => [domino.id, domino]));

  const { historyRows, statusRows, latestHistoryRows } = await querySupabaseDigestData(
    periodStart.toISOString(),
  );

  const statusBySignalKey = new Map(
    statusRows.map((row) => [signalKey(row.domino_id, row.signal_name), row]),
  );

  const latestHistoryBySignalKey = new Map();
  for (const row of latestHistoryRows) {
    const key = signalKey(row.domino_id, row.signal_name);
    if (!latestHistoryBySignalKey.has(key)) latestHistoryBySignalKey.set(key, row);
  }

  const changedSignalKeys = new Set();
  const escalations = [];
  const deescalations = [];
  const allChanges = [];

  for (const row of historyRows) {
    const fromStatus = normalizeStatus(row.old_status);
    const toStatus = normalizeStatus(row.new_status);
    if (!fromStatus || !toStatus || fromStatus === toStatus) continue;

    const key = signalKey(row.domino_id, row.signal_name);
    const signalMeta = signalMetaByKey.get(key);
    const dominoMeta = dominoById.get(row.domino_id);
    const delta = STATUS_WEIGHT[toStatus] - STATUS_WEIGHT[fromStatus];
    const direction = delta > 0 ? "escalation" : "deescalation";

    const change = {
      dominoId: row.domino_id,
      dominoName: dominoMeta?.name || signalMeta?.dominoName || `Domino ${row.domino_id}`,
      dominoColor: dominoMeta?.color || signalMeta?.dominoColor || null,
      signalName: row.signal_name,
      fromStatus,
      toStatus,
      direction,
      changedAt: row.changed_at || null,
      changedAtLabel: formatDateLabel(row.changed_at),
      reason: fallbackChangeReason(row, signalMeta),
      source: signalMeta?.source || null,
      frequency: signalMeta?.frequency || null,
      threshold: signalMeta?.threshold || null,
      whyItMatters: signalMeta?.whyItMatters || null,
    };

    changedSignalKeys.add(key);
    allChanges.push(change);

    if (direction === "escalation") escalations.push(change);
    else deescalations.push(change);
  }

  const nowMs = now.getTime();
  const signalsWithCurrentStatus = signalCatalog.map((signal) => {
    const key = signalKey(signal.dominoId, signal.signalName);
    const statusRow = statusBySignalKey.get(key);
    const latestHistoryRow = latestHistoryBySignalKey.get(key);

    const currentStatus = normalizeStatus(statusRow?.status) || signal.defaultStatus;

    const statusUpdatedAt = toDate(statusRow?.updated_at);
    const latestHistoryAt = toDate(latestHistoryRow?.changed_at);

    const lastUpdatedAt = [statusUpdatedAt, latestHistoryAt]
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime())[0] || null;

    const daysSinceUpdate = lastUpdatedAt
      ? Math.floor((nowMs - lastUpdatedAt.getTime()) / MS_PER_DAY)
      : null;

    return {
      ...signal,
      currentStatus,
      lastUpdatedAt: lastUpdatedAt?.toISOString() || null,
      lastUpdatedLabel: formatDateLabel(lastUpdatedAt),
      daysSinceUpdate,
      liveReason: statusRow?.reason || statusRow?.notes || null,
    };
  });

  const staleSignals = signalsWithCurrentStatus
    .filter(
      (signal) => signal.daysSinceUpdate === null || signal.daysSinceUpdate > STALE_THRESHOLD_DAYS,
    )
    .map((signal) => ({
      dominoId: signal.dominoId,
      dominoName: signal.dominoName,
      dominoColor: signal.dominoColor,
      signalName: signal.signalName,
      status: signal.currentStatus,
      lastUpdatedAt: signal.lastUpdatedAt,
      lastUpdatedLabel: signal.lastUpdatedLabel,
      daysSinceUpdate: signal.daysSinceUpdate,
      reason: signal.liveReason || signal.notes || null,
    }))
    .sort((a, b) => {
      const aDays = a.daysSinceUpdate === null ? Number.POSITIVE_INFINITY : a.daysSinceUpdate;
      const bDays = b.daysSinceUpdate === null ? Number.POSITIVE_INFINITY : b.daysSinceUpdate;
      return bDays - aDays;
    });

  const unchangedSignals = signalsWithCurrentStatus
    .filter((signal) => !changedSignalKeys.has(signalKey(signal.dominoId, signal.signalName)))
    .map((signal) => ({
      dominoId: signal.dominoId,
      dominoName: signal.dominoName,
      dominoColor: signal.dominoColor,
      signalName: signal.signalName,
      status: signal.currentStatus,
      lastUpdatedAt: signal.lastUpdatedAt,
      lastUpdatedLabel: signal.lastUpdatedLabel,
      daysSinceUpdate: signal.daysSinceUpdate,
    }));

  const dominoSummaries = DOMINOS.map((domino) => {
    const dominoSignals = signalsWithCurrentStatus.filter((signal) => signal.dominoId === domino.id);
    const dominoEscalations = escalations.filter((change) => change.dominoId === domino.id);
    const dominoDeescalations = deescalations.filter((change) => change.dominoId === domino.id);
    const dominoStaleSignals = staleSignals.filter((signal) => signal.dominoId === domino.id);
    const dominoChanges = allChanges.filter((change) => change.dominoId === domino.id);
    const latestChangeBySignal = new Map();

    for (const change of dominoChanges) {
      const key = signalKey(change.dominoId, change.signalName);
      if (!latestChangeBySignal.has(key)) latestChangeBySignal.set(key, change);
    }

    const statusCounts = dominoSignals.reduce(
      (acc, signal) => {
        if (signal.currentStatus === "green") acc.green += 1;
        else if (signal.currentStatus === "amber") acc.amber += 1;
        else if (signal.currentStatus === "red") acc.red += 1;
        return acc;
      },
      { green: 0, amber: 0, red: 0 },
    );

    const netEscalation = dominoEscalations.length - dominoDeescalations.length;
    const posture = netEscalation > 0 ? "deteriorating" : netEscalation < 0 ? "improving" : "stable";

    return {
      dominoId: domino.id,
      dominoName: domino.name,
      dominoColor: domino.color,
      escalationCount: dominoEscalations.length,
      deescalationCount: dominoDeescalations.length,
      unchangedCount: dominoSignals.length - latestChangeBySignal.size,
      staleCount: dominoStaleSignals.length,
      posture,
      currentStatusCounts: statusCounts,
      changedSignals: Array.from(latestChangeBySignal.values()),
    };
  });

  const threatCounts = signalsWithCurrentStatus.reduce(
    (acc, signal) => {
      if (signal.currentStatus === "green") acc.greenCount += 1;
      else if (signal.currentStatus === "amber") acc.amberCount += 1;
      else if (signal.currentStatus === "red") acc.redCount += 1;
      return acc;
    },
    { greenCount: 0, amberCount: 0, redCount: 0 },
  );

  const totalSignals = threatCounts.greenCount + threatCounts.amberCount + threatCounts.redCount;
  const overallThreatLevel = resolveThreatLevel(threatCounts.redCount, threatCounts.amberCount);

  return {
    period: {
      dayRange: safeDayRange,
      startDate: toISODate(periodStart),
      endDate: toISODate(now),
      startISO: periodStart.toISOString(),
      endISO: now.toISOString(),
      label: `${formatDateLabel(periodStart)} to ${formatDateLabel(now)}`,
    },
    escalations,
    deescalations,
    staleSignals,
    unchangedSignals,
    dominoSummaries,
    overallThreatLevel,
    threatCounts: {
      ...threatCounts,
      totalSignals,
    },
    generatedAt: now.toISOString(),
  };
}

