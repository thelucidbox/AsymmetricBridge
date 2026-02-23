import Papa from "papaparse";

const FORMAT_LABELS = {
  schwab: "Schwab",
  fidelity: "Fidelity",
  ibkr: "IBKR",
  robinhood: "Robinhood",
  generic: "Generic",
};

const TARGET_COLUMNS = {
  symbol: [
    "symbol",
    "ticker",
    "instrument",
    "security",
  ],
  quantity: [
    "quantity",
    "qty",
    "shares",
    "position",
    "units",
  ],
  marketValue: [
    "market value",
    "current value",
    "position value",
    "value",
    "amount",
  ],
  costBasis: [
    "cost basis",
    "cost basis total",
    "cost basis amount",
    "cost",
    "total cost",
    "book cost",
  ],
  lastPrice: [
    "last price",
    "price",
    "mark price",
  ],
};

const REQUIRED_HEADERS = {
  schwab: ["symbol", "quantity", "market value"],
  fidelity: ["symbol", "last price", "current value"],
  ibkr: ["symbol", "position", "market value"],
  robinhood: ["instrument", "quantity", "market value"],
};

function normalizeHeader(header) {
  return String(header || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildHeaderLookup(headers = []) {
  const lookup = new Map();
  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    if (normalized) lookup.set(normalized, String(header).trim());
  });
  return lookup;
}

function findColumn(headerLookup, candidates = []) {
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeHeader(candidate);
    if (headerLookup.has(normalizedCandidate)) {
      return headerLookup.get(normalizedCandidate);
    }
  }

  for (const [normalized, original] of headerLookup) {
    if (candidates.some((candidate) => normalized.includes(normalizeHeader(candidate)))) {
      return original;
    }
  }

  return null;
}

function hasRequiredHeaders(headerLookup, requiredHeaders = []) {
  return requiredHeaders.every((header) => headerLookup.has(normalizeHeader(header)));
}

function detectBrokerageFormat(headers = []) {
  const headerLookup = buildHeaderLookup(headers);

  if (hasRequiredHeaders(headerLookup, REQUIRED_HEADERS.schwab)) {
    return {
      id: "schwab",
      label: FORMAT_LABELS.schwab,
      columns: {
        symbol: headerLookup.get("symbol"),
        quantity: headerLookup.get("quantity"),
        marketValue: headerLookup.get("market value"),
        costBasis: findColumn(headerLookup, TARGET_COLUMNS.costBasis),
      },
    };
  }

  if (hasRequiredHeaders(headerLookup, REQUIRED_HEADERS.fidelity)) {
    return {
      id: "fidelity",
      label: FORMAT_LABELS.fidelity,
      columns: {
        symbol: headerLookup.get("symbol"),
        quantity: findColumn(headerLookup, TARGET_COLUMNS.quantity),
        marketValue: headerLookup.get("current value"),
        costBasis: findColumn(headerLookup, TARGET_COLUMNS.costBasis),
        lastPrice: headerLookup.get("last price"),
      },
    };
  }

  if (hasRequiredHeaders(headerLookup, REQUIRED_HEADERS.ibkr)) {
    return {
      id: "ibkr",
      label: FORMAT_LABELS.ibkr,
      columns: {
        symbol: headerLookup.get("symbol"),
        quantity: headerLookup.get("position"),
        marketValue: headerLookup.get("market value"),
        costBasis: findColumn(headerLookup, TARGET_COLUMNS.costBasis),
      },
    };
  }

  if (hasRequiredHeaders(headerLookup, REQUIRED_HEADERS.robinhood)) {
    return {
      id: "robinhood",
      label: FORMAT_LABELS.robinhood,
      columns: {
        symbol: headerLookup.get("instrument"),
        quantity: headerLookup.get("quantity"),
        marketValue: headerLookup.get("market value"),
        costBasis: findColumn(headerLookup, TARGET_COLUMNS.costBasis),
      },
    };
  }

  const symbolColumn = findColumn(headerLookup, TARGET_COLUMNS.symbol);
  const quantityColumn = findColumn(headerLookup, TARGET_COLUMNS.quantity);
  const marketValueColumn = findColumn(headerLookup, TARGET_COLUMNS.marketValue);

  if (!symbolColumn || !quantityColumn || !marketValueColumn) {
    throw new Error(
      "Unable to detect brokerage CSV columns. Expected symbol, quantity, and value headers.",
    );
  }

  return {
    id: "generic",
    label: FORMAT_LABELS.generic,
    columns: {
      symbol: symbolColumn,
      quantity: quantityColumn,
      marketValue: marketValueColumn,
      costBasis: findColumn(headerLookup, TARGET_COLUMNS.costBasis),
      lastPrice: findColumn(headerLookup, TARGET_COLUMNS.lastPrice),
    },
  };
}

function parseNumericValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value === null || value === undefined) return NaN;

  const raw = String(value).trim();
  if (!raw) return NaN;

  const isNegative = raw.startsWith("(") && raw.endsWith(")");
  const cleaned = raw
    .replace(/[$,%\s]/g, "")
    .replace(/[()]/g, "")
    .replace(/,/g, "");

  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return NaN;
  return isNegative ? -parsed : parsed;
}

function normalizeSymbol(value) {
  if (value === null || value === undefined) return "";

  const input = String(value).trim();
  if (!input) return "";

  const upper = input.toUpperCase();
  if (/^[A-Z0-9.-]{1,12}$/.test(upper)) return upper;

  const parenMatch = upper.match(/\(([A-Z0-9.-]{1,12})\)/);
  if (parenMatch?.[1]) return parenMatch[1];

  const tokenMatch = upper.match(/\b[A-Z]{1,5}(?:\.[A-Z]{1,2})?\b/);
  if (tokenMatch?.[0]) return tokenMatch[0];

  return upper;
}

function normalizeRow(row, columns) {
  const symbol = normalizeSymbol(row?.[columns.symbol]);
  if (!symbol) return null;

  const quantity = parseNumericValue(row?.[columns.quantity]);
  const parsedMarketValue = parseNumericValue(row?.[columns.marketValue]);
  const lastPrice = parseNumericValue(row?.[columns.lastPrice]);
  const computedMarketValue =
    Number.isFinite(parsedMarketValue)
      ? parsedMarketValue
      : Number.isFinite(quantity) && Number.isFinite(lastPrice)
        ? quantity * lastPrice
        : NaN;

  if (!Number.isFinite(computedMarketValue)) return null;

  const normalized = {
    symbol,
    quantity: Number.isFinite(quantity) ? quantity : 0,
    marketValue: computedMarketValue,
  };

  const costBasis = parseNumericValue(row?.[columns.costBasis]);
  if (Number.isFinite(costBasis)) {
    normalized.costBasis = costBasis;
  }

  return normalized;
}

function parseWithPapa(input, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    let rowCounter = 0;
    const totalBytes = typeof input === "object" && input !== null ? Number(input.size || 0) : 0;

    Papa.parse(input, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => String(header || "").replace(/^\uFEFF/, "").trim(),
      step: (stepResult) => {
        rowCounter += 1;
        if (typeof onProgress !== "function") return;
        if (totalBytes > 0 && Number.isFinite(stepResult.meta?.cursor)) {
          const byteProgress = Math.min((stepResult.meta.cursor / totalBytes) * 100, 100);
          onProgress(byteProgress);
          return;
        }
        onProgress(Math.min(rowCounter, 100));
      },
      complete: (result) => {
        if (typeof onProgress === "function") onProgress(100);
        resolve(result);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function parsePortfolioCsv(input, options = {}) {
  if (!input) {
    throw new Error("No CSV data provided.");
  }

  const parsed = await parseWithPapa(input, options);
  const headers = parsed.meta?.fields || [];

  if (headers.length === 0) {
    throw new Error("CSV appears to be empty or missing a header row.");
  }

  const detection = detectBrokerageFormat(headers);
  const rows = Array.isArray(parsed.data) ? parsed.data : [];

  const positions = [];
  let skippedRows = 0;

  rows.forEach((row) => {
    const normalized = normalizeRow(row, detection.columns);
    if (!normalized) {
      skippedRows += 1;
      return;
    }
    positions.push(normalized);
  });

  if (positions.length === 0) {
    throw new Error(
      "CSV parsed but no valid positions were found. Check symbol, quantity, and value columns.",
    );
  }

  const parseErrors = (parsed.errors || []).filter((entry) => entry.code !== "UndetectableDelimiter");
  if (parseErrors.length > 0) {
    const firstError = parseErrors[0];
    throw new Error(`Malformed CSV near row ${firstError.row ?? "unknown"}: ${firstError.message}`);
  }

  return {
    format: detection.label,
    formatId: detection.id,
    headers,
    positions,
    totalRows: rows.length,
    skippedRows,
  };
}

export { detectBrokerageFormat };
