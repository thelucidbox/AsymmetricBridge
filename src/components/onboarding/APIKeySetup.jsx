import { useState } from "react";
import { S } from "../../styles";

const FRED_KEY_STORAGE = "ab-fred-api-key";
const TWELVE_DATA_KEY_STORAGE = "ab-twelve-data-api-key";

function statusColor(status) {
  if (status === "success") return "#2A9D8F";
  if (status === "error") return "#E63946";
  return "rgba(255,255,255,0.45)";
}

function statusLabel(status) {
  if (status === "loading") return "Testing...";
  if (status === "success") return "Success";
  if (status === "error") return "Failed";
  return "Idle";
}

export default function APIKeySetup({ value, onChange }) {
  const [testResults, setTestResults] = useState({
    fred: { status: "idle", message: "" },
    twelveData: { status: "idle", message: "" },
  });

  const saveKey = (storageKey, keyValue) => {
    if (typeof window === "undefined") return;
    if (!keyValue.trim()) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    window.localStorage.setItem(storageKey, keyValue.trim());
  };

  const updateKey = (field, storageKey, nextValue) => {
    onChange({ ...value, [field]: nextValue });
    saveKey(storageKey, nextValue);
  };

  const updateTest = (provider, status, message = "") => {
    setTestResults((current) => ({
      ...current,
      [provider]: {
        status,
        message,
      },
    }));
  };

  const testFredKey = async () => {
    if (!value.fredKey?.trim()) {
      updateTest("fred", "error", "Enter a FRED key first.");
      return;
    }

    updateTest("fred", "loading", "");

    try {
      const endpoint = `https://api.stlouisfed.org/fred/series?series_id=M2SL&api_key=${encodeURIComponent(value.fredKey.trim())}&file_type=json`;
      const response = await fetch(endpoint);
      const payload = await response.json().catch(() => ({}));

      if (response.status === 429 || payload?.error_code === 429) {
        updateTest("fred", "error", "Rate limit hit. Wait and retry.");
        return;
      }

      if (!response.ok || payload?.error_code) {
        const message = payload?.error_message || payload?.message || `HTTP ${response.status}`;
        updateTest("fred", "error", message);
        return;
      }

      if (!Array.isArray(payload?.seriess) || payload.seriess.length === 0) {
        updateTest("fred", "error", "Key accepted but sample payload was empty.");
        return;
      }

      updateTest("fred", "success", "Valid key. FRED sample call returned data.");
    } catch (error) {
      updateTest(
        "fred",
        "error",
        `Network/CORS issue while testing key. ${error instanceof Error ? error.message : "Try again."}`,
      );
    }
  };

  const testTwelveDataKey = async () => {
    if (!value.twelveDataKey?.trim()) {
      updateTest("twelveData", "error", "Enter a Twelve Data key first.");
      return;
    }

    updateTest("twelveData", "loading", "");

    try {
      const endpoint = `https://api.twelvedata.com/price?symbol=AAPL&apikey=${encodeURIComponent(value.twelveDataKey.trim())}`;
      const response = await fetch(endpoint);
      const payload = await response.json().catch(() => ({}));

      if (response.status === 429 || payload?.code === 429) {
        updateTest("twelveData", "error", "Rate limit hit. Wait and retry.");
        return;
      }

      if (!response.ok || payload?.status === "error") {
        const message = payload?.message || payload?.code || `HTTP ${response.status}`;
        updateTest("twelveData", "error", String(message));
        return;
      }

      if (payload?.price === undefined) {
        updateTest("twelveData", "error", "Key accepted but sample payload was empty.");
        return;
      }

      updateTest("twelveData", "success", `Valid key. AAPL sample price: ${payload.price}`);
    } catch (error) {
      updateTest(
        "twelveData",
        "error",
        `Network/CORS issue while testing key. ${error instanceof Error ? error.message : "Try again."}`,
      );
    }
  };

  return (
    <div style={S.card("rgba(233,196,106,0.2)")}>
      <div style={S.label}>API Key Setup</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", marginBottom: 12, lineHeight: 1.6 }}>
        Keys are stored locally in this browser (`localStorage`) for OSS onboarding convenience.
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        <div style={S.card("rgba(255,255,255,0.08)")}>
          <label htmlFor="fredKey" style={S.label}>
            FRED API Key
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              id="fredKey"
              value={value.fredKey}
              onChange={(event) => updateKey("fredKey", FRED_KEY_STORAGE, event.target.value)}
              placeholder="Enter your FRED API key"
              style={{ ...inputStyle, flex: 1, minWidth: 250 }}
            />
            <button type="button" onClick={testFredKey} style={S.tab(false, "#2A9D8F")}>
              Test
            </button>
          </div>
          <div style={{ fontSize: 11, marginTop: 8, color: statusColor(testResults.fred.status) }}>
            {statusLabel(testResults.fred.status)}{testResults.fred.message ? ` · ${testResults.fred.message}` : ""}
          </div>
          <a
            href="https://fredaccount.stlouisfed.org/apikeys"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 11, color: "#E9C46A", display: "inline-block", marginTop: 8 }}
          >
            Get a free FRED key
          </a>
        </div>

        <div style={S.card("rgba(255,255,255,0.08)")}>
          <label htmlFor="twelveDataKey" style={S.label}>
            Twelve Data API Key
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              id="twelveDataKey"
              value={value.twelveDataKey}
              onChange={(event) => updateKey("twelveDataKey", TWELVE_DATA_KEY_STORAGE, event.target.value)}
              placeholder="Enter your Twelve Data API key"
              style={{ ...inputStyle, flex: 1, minWidth: 250 }}
            />
            <button type="button" onClick={testTwelveDataKey} style={S.tab(false, "#2A9D8F")}>
              Test
            </button>
          </div>
          <div style={{ fontSize: 11, marginTop: 8, color: statusColor(testResults.twelveData.status) }}>
            {statusLabel(testResults.twelveData.status)}{testResults.twelveData.message ? ` · ${testResults.twelveData.message}` : ""}
          </div>
          <a
            href="https://twelvedata.com/apikey"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 11, color: "#E9C46A", display: "inline-block", marginTop: 8 }}
          >
            Get a free Twelve Data key
          </a>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: 8,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#E8E4DF",
  padding: "9px 10px",
  fontSize: 12,
  fontFamily: "'IBM Plex Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};
