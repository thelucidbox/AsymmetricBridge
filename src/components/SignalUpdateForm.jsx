import { useState } from "react";
import { S, STATUS_CFG } from "../styles";
import { DOMINOS } from "../data/dominos";
import {
  useUpdateSignalStatus,
  useRecentHistory,
} from "../hooks/useSignalStatuses";

const STATUS_OPTIONS = ["green", "amber", "red"];

export default function SignalUpdateForm() {
  const [selectedDomino, setSelectedDomino] = useState("");
  const [selectedSignal, setSelectedSignal] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState(null);

  const mutation = useUpdateSignalStatus();
  const { data: recentHistory = [] } = useRecentHistory();

  const domino = DOMINOS.find((d) => d.id === Number(selectedDomino));
  const signal = domino?.signals.find((s) => s.name === selectedSignal);

  const handleSubmit = async () => {
    if (!domino || !signal || !newStatus || !reason.trim()) return;

    setFeedback(null);
    try {
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
          text: "No change — signal already at that status.",
        });
      } else {
        setFeedback({
          type: "success",
          text: `Updated: ${result.oldStatus} → ${result.newStatus}`,
        });
        setNewStatus("");
        setReason("");
      }
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Update failed" });
    }
  };

  const selectStyle = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 13,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#E8E4DF",
    appearance: "none",
    cursor: "pointer",
  };

  return (
    <div>
      {/* Form */}
      <div style={{ ...S.card("rgba(233,196,106,0.15)"), marginBottom: 14 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#E9C46A",
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

        {/* Signal Context */}
        {signal && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
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
                    STATUS_CFG[signal.currentStatus]?.dot || "#2A9D8F",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: STATUS_CFG[signal.currentStatus]?.text || "#2A9D8F",
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
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 2,
                }}
              >
                Baseline: {signal.baseline}
              </div>
            )}
            {signal.threshold && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                Threshold: {signal.threshold}
              </div>
            )}
          </div>
        )}

        {/* New Status Buttons */}
        {signal && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 6 }}>New Status</div>
            <div style={{ display: "flex", gap: 8 }}>
              {STATUS_OPTIONS.map((status) => {
                const cfg = STATUS_CFG[status];
                const isActive = newStatus === status;
                const isCurrent = signal.currentStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setNewStatus(status)}
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

        {/* Reason */}
        {newStatus && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...S.label, marginBottom: 4 }}>Reason (required)</div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this signal changing? (e.g., Q4 earnings show NRR dropped to 108%)"
              rows={3}
              style={{
                ...selectStyle,
                resize: "vertical",
                fontFamily: "'IBM Plex Sans', sans-serif",
                lineHeight: 1.5,
              }}
            />
          </div>
        )}

        {/* Submit */}
        {newStatus && (
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || mutation.isPending}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 13,
              fontWeight: 700,
              color: reason.trim() ? "#0D0D0F" : "rgba(255,255,255,0.25)",
              background: reason.trim()
                ? STATUS_CFG[newStatus].dot
                : "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 8,
              cursor: reason.trim() ? "pointer" : "not-allowed",
              transition:
                "color 0.2s, background 0.2s, border-color 0.2s, opacity 0.2s, box-shadow 0.2s",
            }}
          >
            {mutation.isPending
              ? "Updating..."
              : `Update to ${STATUS_CFG[newStatus].label}`}
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
                  ? "#2A9D8F"
                  : feedback.type === "error"
                    ? "#E63946"
                    : "#E9C46A",
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
              color: "rgba(255,255,255,0.25)",
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
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                    {entry.signal_name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
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
                    color: "rgba(255,255,255,0.2)",
                    fontFamily: "'IBM Plex Mono'",
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
