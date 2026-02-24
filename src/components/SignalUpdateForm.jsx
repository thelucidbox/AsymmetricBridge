import { useState } from "react";
import { useTheme } from "../design-tokens";
import { S, STATUS_CFG } from "../styles";
import { DOMINOS } from "../data/dominos";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import {
  useUpdateSignalStatus,
  useRecentHistory,
} from "../hooks/useSignalStatuses";

const STATUS_OPTIONS = ["green", "amber", "red"];

export default function SignalUpdateForm() {
  const { tokens } = useTheme();
  const { userId } = useAuth();
  const [selectedDomino, setSelectedDomino] = useState("");
  const [selectedSignal, setSelectedSignal] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [dataValue, setDataValue] = useState("");
  const [dataDate, setDataDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [sourceUrl, setSourceUrl] = useState("");
  const [feedback, setFeedback] = useState(null);

  const mutation = useUpdateSignalStatus();
  const { data: recentHistory = [] } = useRecentHistory();

  const domino = DOMINOS.find((d) => d.id === Number(selectedDomino));
  const signal = domino?.signals.find((s) => s.name === selectedSignal);

  const hasDataPoint = dataValue.trim().length > 0;
  const hasStatusChange = newStatus.length > 0;
  const canSubmit =
    domino && signal && (hasDataPoint || (hasStatusChange && reason.trim()));

  const persistDataPoint = async () => {
    if (!supabase || !domino || !signal || !hasDataPoint) return;

    const { error } = await supabase.from("signal_data_points").upsert(
      {
        domino_id: domino.id,
        signal_name: signal.name,
        date: dataDate,
        value: dataValue.trim(),
        status: newStatus || signal.currentStatus || "green",
        source: sourceUrl.trim() || signal.source || "manual",
      },
      { onConflict: "domino_id,signal_name,date" },
    );

    if (error) {
      console.warn("Unable to persist data point:", error.message);
      throw new Error(`Data point save failed: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setFeedback(null);
    try {
      if (hasDataPoint) {
        await persistDataPoint();
      }

      if (hasStatusChange && reason.trim()) {
        const result = await mutation.mutateAsync({
          dominoId: domino.id,
          signalName: signal.name,
          newStatus,
          reason: reason.trim(),
          triggerType: "manual",
        });

        if (result?.skipped) {
          setFeedback({
            type: "info",
            text: hasDataPoint
              ? "Data point saved. Status unchanged (already at that level)."
              : "No change — signal already at that status.",
          });
        } else {
          setFeedback({
            type: "success",
            text: hasDataPoint
              ? `Data logged + status updated: ${result.oldStatus} → ${result.newStatus}`
              : `Updated: ${result.oldStatus} → ${result.newStatus}`,
          });
        }
      } else if (hasDataPoint) {
        setFeedback({
          type: "success",
          text: `Data point logged: ${dataValue.trim()} (${dataDate})`,
        });
      }

      setNewStatus("");
      setReason("");
      setDataValue("");
      setSourceUrl("");
      setDataDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Update failed" });
    }
  };

  const selectStyle = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 13,
    background: tokens.colors.borderSubtle,
    border: `1px solid ${tokens.colors.borderStrong}`,
    borderRadius: 8,
    color: tokens.colors.text,
    appearance: "none",
    cursor: "pointer",
  };

  const inputStyle = {
    ...selectStyle,
    cursor: "text",
    fontFamily: tokens.typography.fontSans,
  };

  return (
    <div>
      {/* Form */}
      <div style={{ ...S.card("rgba(233,196,106,0.15)"), marginBottom: 14 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: tokens.colors.accent,
            marginBottom: 12,
          }}
        >
          Update a Signal
        </div>

        {/* Domino Picker */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ ...S.label, marginBottom: 4 }}>Domino</div>
          <select
            value={selectedDomino}
            onChange={(e) => {
              setSelectedDomino(e.target.value);
              setSelectedSignal("");
              setNewStatus("");
              setFeedback(null);
              setDataValue("");
              setSourceUrl("");
            }}
            style={selectStyle}
          >
            <option value="">Select domino...</option>
            {DOMINOS.map((d) => (
              <option key={d.id} value={d.id}>
                D{d.id}: {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Signal Picker */}
        {domino && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 4 }}>Signal</div>
            <select
              value={selectedSignal}
              onChange={(e) => {
                setSelectedSignal(e.target.value);
                setNewStatus("");
                setFeedback(null);
                setDataValue("");
                setSourceUrl("");
              }}
              style={selectStyle}
            >
              <option value="">Select signal...</option>
              {domino.signals.map((sig) => (
                <option key={sig.name} value={sig.name}>
                  {STATUS_CFG[sig.currentStatus]?.label || "Baseline"} —{" "}
                  {sig.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Signal Context + Source Guidance */}
        {signal && (
          <div
            style={{
              background: tokens.colors.surfaceRaised,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    STATUS_CFG[signal.currentStatus]?.dot ||
                    tokens.colors.baseline,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    STATUS_CFG[signal.currentStatus]?.text ||
                    tokens.colors.baseline,
                }}
              >
                Currently:{" "}
                {STATUS_CFG[signal.currentStatus]?.label || "Baseline"}
              </span>
            </div>
            {signal.baseline && (
              <div
                style={{
                  fontSize: 11,
                  color: tokens.colors.textSoft,
                  marginBottom: 2,
                }}
              >
                Baseline: {signal.baseline}
              </div>
            )}
            {signal.threshold && (
              <div
                style={{
                  fontSize: 11,
                  color: tokens.colors.textSoft,
                  marginBottom: 6,
                }}
              >
                Threshold: {signal.threshold}
              </div>
            )}

            {/* Source Guidance */}
            {signal.source && (
              <div
                style={{
                  marginTop: 6,
                  padding: "8px 10px",
                  borderRadius: 6,
                  background: tokens.colors.surfaceSoft,
                  border: `1px solid ${tokens.colors.borderSubtle}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: tokens.colors.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 4,
                  }}
                >
                  Where to find this data
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: tokens.colors.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {signal.source}
                  {signal.frequency && (
                    <span style={{ color: tokens.colors.textMuted }}>
                      {" "}
                      · Updated {signal.frequency.toLowerCase()}
                    </span>
                  )}
                </div>
                {signal.notes && (
                  <div
                    style={{
                      fontSize: 11,
                      color: tokens.colors.textSoft,
                      marginTop: 4,
                      fontStyle: "italic",
                    }}
                  >
                    {signal.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Data Point Entry */}
        {signal && (
          <div
            style={{
              background: tokens.colors.surfaceSoft,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                ...S.label,
                marginBottom: 8,
                color: tokens.colors.baseline,
              }}
            >
              Log a Data Point (optional)
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                value={dataValue}
                onChange={(e) => setDataValue(e.target.value)}
                placeholder="Value (e.g., 118%, 1.8M, $42.50)"
                style={inputStyle}
              />
              <input
                type="date"
                value={dataDate}
                onChange={(e) => setDataDate(e.target.value)}
                style={{ ...inputStyle, width: 150 }}
              />
            </div>
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Source URL (optional — link to where you found this)"
              style={inputStyle}
            />
          </div>
        )}

        {/* New Status Buttons */}
        {signal && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 6 }}>
              Change Status (optional if logging data)
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {STATUS_OPTIONS.map((status) => {
                const cfg = STATUS_CFG[status];
                const isActive = newStatus === status;
                const isCurrent = signal.currentStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setNewStatus(isActive ? "" : status)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#0D0D0F" : cfg.text,
                      background: isActive ? cfg.dot : cfg.bg,
                      border: `1px solid ${isActive ? cfg.dot : cfg.border}`,
                      borderRadius: 8,
                      cursor: isCurrent ? "not-allowed" : "pointer",
                      opacity: isCurrent ? 0.35 : 1,
                      transition:
                        "color 0.2s, background 0.2s, border-color 0.2s, opacity 0.2s, box-shadow 0.2s",
                    }}
                    disabled={isCurrent}
                  >
                    {cfg.label}
                    {isCurrent && " (current)"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reason (required only for status changes) */}
        {newStatus && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 4 }}>
              Reason (required for status change)
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this signal changing? (e.g., Q4 earnings show NRR dropped to 108%)"
              rows={3}
              style={{
                ...selectStyle,
                resize: "vertical",
                fontFamily: tokens.typography.fontSans,
                lineHeight: 1.5,
              }}
            />
          </div>
        )}

        {/* Submit */}
        {canSubmit && (
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 13,
              fontWeight: 700,
              color: "#0D0D0F",
              background: hasStatusChange
                ? STATUS_CFG[newStatus].dot
                : tokens.colors.baseline,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              transition: tokens.motion.default,
            }}
          >
            {mutation.isPending
              ? "Saving..."
              : hasStatusChange && hasDataPoint
                ? `Log Data + Update to ${STATUS_CFG[newStatus].label}`
                : hasStatusChange
                  ? `Update to ${STATUS_CFG[newStatus].label}`
                  : "Log Data Point"}
          </button>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background:
                feedback.type === "success"
                  ? "rgba(42,157,143,0.15)"
                  : feedback.type === "error"
                    ? "rgba(230,57,70,0.15)"
                    : "rgba(233,196,106,0.15)",
              color:
                feedback.type === "success"
                  ? tokens.colors.baseline
                  : feedback.type === "error"
                    ? tokens.colors.alert
                    : tokens.colors.accent,
              border: `1px solid ${
                feedback.type === "success"
                  ? "rgba(42,157,143,0.3)"
                  : feedback.type === "error"
                    ? "rgba(230,57,70,0.3)"
                    : "rgba(233,196,106,0.3)"
              }`,
            }}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Recent History */}
      <div style={S.label}>Recent Updates</div>
      <div style={S.card("rgba(255,255,255,0.06)")}>
        {recentHistory.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: tokens.colors.textSubtle,
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            No signal updates yet
          </div>
        ) : (
          recentHistory.map((entry, i) => {
            const oldCfg = STATUS_CFG[entry.old_status] || STATUS_CFG.green;
            const newCfg = STATUS_CFG[entry.new_status] || STATUS_CFG.green;
            const time = entry.changed_at
              ? new Date(entry.changed_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "—";
            return (
              <div
                key={entry.id || i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom:
                    i < recentHistory.length - 1
                      ? `1px solid ${tokens.colors.borderSubtle}`
                      : "none",
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 12, color: tokens.colors.textSecondary }}
                  >
                    {entry.signal_name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: tokens.colors.textSubtle,
                      marginTop: 2,
                    }}
                  >
                    D{entry.domino_id} ·{" "}
                    <span style={{ color: oldCfg.dot }}>
                      {entry.old_status}
                    </span>
                    {" → "}
                    <span style={{ color: newCfg.dot }}>
                      {entry.new_status}
                    </span>
                    {entry.reason && (
                      <span style={{ marginLeft: 6, fontStyle: "italic" }}>
                        {entry.reason}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: tokens.colors.textSubtle,
                    fontFamily: tokens.typography.fontMono,
                    whiteSpace: "nowrap",
                  }}
                >
                  {time}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
