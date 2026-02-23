import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { STATUS_CFG, S } from "../styles";

const MIN_SEGMENT_MS = 60 * 60 * 1000;

function toDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const parsed = toDate(value);
  if (!parsed) return "Unknown date";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeStatus(status) {
  return status === "red" || status === "amber" || status === "green"
    ? status
    : null;
}

function getSignalIdentity(signal) {
  return {
    signalId: signal?.signalId || signal?.signal_id || null,
    dominoId: signal?.dominoId || signal?.domino_id || null,
    signalName: signal?.name || signal?.signal_name || null,
  };
}

function collapseEntries(entries) {
  const sorted = entries
    .map((entry) => ({
      ...entry,
      status: normalizeStatus(entry.status),
      atDate: toDate(entry.at),
    }))
    .filter((entry) => entry.status && entry.atDate)
    .sort((a, b) => a.atDate.getTime() - b.atDate.getTime());

  const collapsed = [];
  for (const entry of sorted) {
    const last = collapsed[collapsed.length - 1];
    if (last && last.status === entry.status) {
      last.at = entry.atDate.toISOString();
      if (entry.reason) last.reason = entry.reason;
      continue;
    }
    collapsed.push({
      status: entry.status,
      at: entry.atDate.toISOString(),
      reason: entry.reason || "",
    });
  }
  return collapsed;
}

function buildStatusEntries(rows) {
  return collapseEntries(
    (rows || []).map((row) => ({
      status: row?.status,
      at: row?.updated_at || row?.created_at,
      reason: row?.reason || row?.notes || "",
    })),
  );
}

function buildHistoryEntries(rows) {
  if (!rows?.length) return [];

  const entries = [];
  const first = rows[0];
  entries.push({
    status: first?.old_status,
    at: first?.changed_at,
    reason: "Status before first recorded change",
  });

  rows.forEach((row) => {
    entries.push({
      status: row?.new_status,
      at: row?.changed_at,
      reason: row?.reason || "",
    });
  });

  return collapseEntries(entries);
}

async function fetchSignalTimeline(signal) {
  if (!supabase || !signal) return [];

  const { signalId, dominoId, signalName } = getSignalIdentity(signal);

  let statusRows = [];
  if (signalId) {
    const bySignalId = await supabase
      .from("signal_statuses")
      .select("*")
      .eq("signal_id", signalId)
      .order("updated_at", { ascending: true });

    if (!bySignalId.error) {
      statusRows = bySignalId.data || [];
    }
  }

  if (!statusRows.length && dominoId && signalName) {
    const byDominoAndName = await supabase
      .from("signal_statuses")
      .select("*")
      .eq("domino_id", dominoId)
      .eq("signal_name", signalName)
      .order("updated_at", { ascending: true });

    if (!byDominoAndName.error) {
      statusRows = byDominoAndName.data || [];
    }
  }

  let entries = buildStatusEntries(statusRows);

  if (entries.length <= 1 && dominoId && signalName) {
    const historyQuery = await supabase
      .from("signal_history")
      .select("*")
      .eq("domino_id", dominoId)
      .eq("signal_name", signalName)
      .order("changed_at", { ascending: true });

    if (!historyQuery.error) {
      const historyEntries = buildHistoryEntries(historyQuery.data || []);
      if (historyEntries.length) entries = historyEntries;
    }
  }

  if (!entries.length && signal?.currentStatus) {
    const fallbackAt = toDate(signal?.updatedAt) || new Date();
    entries = [
      {
        status: normalizeStatus(signal.currentStatus),
        at: fallbackAt.toISOString(),
        reason: signal?.statusReason || "",
      },
    ].filter((entry) => entry.status);
  }

  return entries;
}

export default function SignalTimeline({ signal }) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: [
      "signal-timeline",
      signal?.signalId || signal?.signal_id || null,
      signal?.dominoId || signal?.domino_id || null,
      signal?.name || signal?.signal_name || null,
    ],
    queryFn: () => fetchSignalTimeline(signal),
    enabled: Boolean(signal?.name || signal?.signal_name),
    staleTime: 30 * 1000,
  });

  const segments = useMemo(() => {
    if (!history.length) return [];

    const points = history
      .map((entry) => ({
        status: entry.status,
        reason: entry.reason || "",
        at: toDate(entry.at),
      }))
      .filter((entry) => entry.status && entry.at)
      .sort((a, b) => a.at.getTime() - b.at.getTime());

    if (!points.length) return [];

    const now = Date.now();
    const rawSegments = points.map((entry, index) => {
      const next = points[index + 1];
      const start = entry.at.getTime();
      const end = next
        ? next.at.getTime()
        : Math.max(now, start + MIN_SEGMENT_MS);
      const duration = Math.max(end - start, MIN_SEGMENT_MS);
      return {
        status: entry.status,
        reason: entry.reason,
        start,
        end,
        duration,
      };
    });

    const totalDuration = rawSegments.reduce(
      (sum, segment) => sum + segment.duration,
      0,
    );

    return rawSegments.map((segment) => ({
      ...segment,
      widthPct: totalDuration
        ? (segment.duration / totalDuration) * 100
        : 100 / rawSegments.length,
    }));
  }, [history]);

  if (isLoading) {
    return (
      <div style={{ marginTop: 10 }}>
        <div style={S.label}>Status Timeline</div>
        <div
          className="skeleton-pulse"
          style={{
            height: 18,
            borderRadius: 6,
            background: "rgba(255,255,255,0.08)",
          }}
        />
      </div>
    );
  }

  if (!segments.length) {
    return (
      <div style={{ marginTop: 10 }}>
        <div style={S.label}>Status Timeline</div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.16)",
            borderRadius: 6,
            padding: "8px 10px",
          }}
        >
          No history available
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={S.label}>Status Timeline</div>
      <div
        style={{
          display: "flex",
          height: 18,
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {segments.map((segment, index) => {
          const cfg = STATUS_CFG[segment.status] || STATUS_CFG.green;
          const dateRange = `${formatDate(segment.start)} - ${formatDate(segment.end)}`;
          const tooltip = `${cfg.label} | ${dateRange}${segment.reason ? ` | ${segment.reason}` : ""}`;
          return (
            <div
              key={`${segment.status}-${segment.start}-${index}`}
              title={tooltip}
              style={{
                width: `${segment.widthPct}%`,
                minWidth: 4,
                cursor: "help",
                background: `linear-gradient(180deg, ${cfg.dot}, ${cfg.dot}CC)`,
                borderRight:
                  index < segments.length - 1
                    ? "1px solid rgba(0,0,0,0.2)"
                    : "none",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "rgba(255,255,255,0.38)",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <span>{formatDate(segments[0].start)}</span>
        <span>{formatDate(segments[segments.length - 1].end)}</span>
      </div>
    </div>
  );
}
