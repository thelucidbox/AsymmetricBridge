import { useMemo, useRef, useState } from "react";
import { parsePortfolioCsv } from "../../lib/csv-parser";
import { useTheme } from "../../design-tokens";
import { S } from "../../styles";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(Number(value) || 0);
}

export default function CSVUpload({ onConfirm, isProcessing }) {
  const { tokens } = useTheme();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseError, setParseError] = useState("");
  const [pasteValue, setPasteValue] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [parsedPayload, setParsedPayload] = useState(null);

  const previewRows = useMemo(
    () => parsedPayload?.positions?.slice(0, 10) || [],
    [parsedPayload],
  );

  async function parseInput(input, label) {
    setIsParsing(true);
    setParseProgress(0);
    setParseError("");

    try {
      const parsed = await parsePortfolioCsv(input, {
        onProgress: (progress) => {
          setParseProgress(Math.round(progress));
        },
      });

      setParsedPayload(parsed);
      setSourceLabel(label);
      setParseProgress(100);
    } catch (error) {
      setParsedPayload(null);
      setParseError(error?.message || "Unable to parse CSV file.");
      setParseProgress(0);
    } finally {
      setIsParsing(false);
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function onFileSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isCsv =
      file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
    if (!isCsv) {
      setParseError("Only .csv files are supported.");
      return;
    }

    parseInput(file, file.name);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    const isCsv =
      file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
    if (!isCsv) {
      setParseError("Only .csv files are supported.");
      return;
    }

    parseInput(file, file.name);
  }

  async function handleConfirm() {
    if (!parsedPayload || typeof onConfirm !== "function") return;
    setParseError("");
    try {
      await onConfirm(parsedPayload);
    } catch (error) {
      setParseError(error?.message || "Analysis failed. Please try again.");
    }
  }

  async function parsePastedCsv() {
    if (!pasteValue.trim()) {
      setParseError("Paste CSV text before parsing.");
      return;
    }
    await parseInput(pasteValue, "Pasted CSV");
  }

  return (
    <div style={S.card("rgba(233,196,106,0.26)")}>
      <div style={{ ...S.label, marginBottom: 8 }}>Portfolio CSV Ingest</div>
      <div
        style={{
          fontSize: 13,
          color: tokens.colors.textSecondary,
          marginBottom: 12,
        }}
      >
        Upload brokerage exports (Schwab, Fidelity, IBKR, Robinhood) or paste
        CSV text.
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={onFileSelected}
        style={{ display: "none" }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        style={{
          border: `1px dashed ${isDragging ? "rgba(233,196,106,0.7)" : tokens.colors.textSubtle}`,
          background: isDragging
            ? "rgba(233,196,106,0.08)"
            : tokens.colors.surfaceSoft,
          borderRadius: 10,
          padding: "22px 14px",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 12,
          transition: tokens.motion.default,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
          Drop CSV here or click to choose a file
        </div>
        <div style={{ fontSize: 10, color: tokens.colors.textMuted }}>
          Client-side parse only. No server upload.
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ ...S.label, marginBottom: 6 }}>Paste CSV (Optional)</div>
        <textarea
          value={pasteValue}
          onChange={(event) => setPasteValue(event.target.value)}
          placeholder="Symbol,Quantity,Market Value"
          style={{
            width: "100%",
            minHeight: 100,
            borderRadius: 8,
            border: `1px solid ${tokens.colors.borderStrong}`,
            background: "rgba(0,0,0,0.2)",
            color: tokens.colors.text,
            fontSize: 11,
            lineHeight: 1.4,
            fontFamily: tokens.typography.fontMono,
            padding: "10px 11px",
            resize: "vertical",
          }}
        />
        <button
          type="button"
          onClick={parsePastedCsv}
          disabled={isParsing || isProcessing}
          style={{
            ...S.tab(true, "#E9C46A"),
            marginTop: 8,
            opacity: isParsing || isProcessing ? 0.6 : 1,
            cursor: isParsing || isProcessing ? "not-allowed" : "pointer",
          }}
        >
          Parse Pasted CSV
        </button>
      </div>

      {(isParsing || parseProgress > 0) && (
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: tokens.colors.textMuted,
              marginBottom: 4,
            }}
          >
            <span>Parsing Progress</span>
            <span>{parseProgress}%</span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 999,
              background: tokens.colors.border,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${parseProgress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #E9C46A, #2A9D8F)",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>
      )}

      {parseError && (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgba(230,57,70,0.14)",
            border: "1px solid rgba(230,57,70,0.35)",
            color: "#F6A8AE",
            fontSize: 11,
            marginBottom: 10,
          }}
        >
          {parseError}
        </div>
      )}

      {parsedPayload && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.5px",
                color: tokens.colors.baseline,
                background: tokens.colors.baselineBg,
                border: `1px solid ${tokens.colors.baselineBorder}`,
                padding: "3px 7px",
                borderRadius: 5,
                fontFamily: tokens.typography.fontMono,
              }}
            >
              {parsedPayload.format} detected
            </span>
            <span style={{ fontSize: 10, color: tokens.colors.textMuted }}>
              Source: {sourceLabel}
            </span>
            <span style={{ fontSize: 10, color: tokens.colors.textMuted }}>
              {parsedPayload.positions.length} positions
            </span>
            <span style={{ fontSize: 10, color: tokens.colors.textMuted }}>
              {parsedPayload.skippedRows} skipped rows
            </span>
          </div>

          <div
            style={{
              border: `1px solid ${tokens.colors.borderStrong}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 8,
                padding: "8px 10px",
                fontSize: 10,
                fontFamily: tokens.typography.fontMono,
                color: tokens.colors.textMuted,
                background: tokens.colors.surfaceRaised,
              }}
            >
              <span>Symbol</span>
              <span>Quantity</span>
              <span>Market Value</span>
              <span>Cost Basis</span>
            </div>
            {previewRows.map((row, index) => (
              <div
                key={`${row.symbol}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 8,
                  padding: "8px 10px",
                  fontSize: 11,
                  borderTop: `1px solid ${tokens.colors.borderSubtle}`,
                }}
              >
                <span style={{ fontWeight: 700, color: tokens.colors.text }}>
                  {row.symbol}
                </span>
                <span style={{ color: tokens.colors.textSecondary }}>
                  {formatNumber(row.quantity)}
                </span>
                <span style={{ color: tokens.colors.textSecondary }}>
                  {formatCurrency(row.marketValue)}
                </span>
                <span style={{ color: tokens.colors.textMuted }}>
                  {row.costBasis !== undefined
                    ? formatCurrency(row.costBasis)
                    : "—"}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 10,
              color: tokens.colors.textMuted,
            }}
          >
            Preview shows first {previewRows.length} parsed rows.
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!parsedPayload || isParsing || isProcessing}
        onClick={handleConfirm}
        style={{
          ...S.sectionTab(true, "#E9C46A"),
          width: "100%",
          justifyContent: "center",
          opacity: !parsedPayload || isParsing || isProcessing ? 0.6 : 1,
          cursor:
            !parsedPayload || isParsing || isProcessing
              ? "not-allowed"
              : "pointer",
        }}
      >
        {isProcessing ? "Analyzing Portfolio..." : "Confirm & Analyze"}
      </button>
    </div>
  );
}
