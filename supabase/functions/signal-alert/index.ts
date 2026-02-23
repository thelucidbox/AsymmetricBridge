type JsonObject = Record<string, unknown>;

type SignalHistoryRecord = {
  id?: string;
  domino_id: number | string;
  signal_name: string;
  old_status: string;
  new_status: string;
  trigger_type: string;
  reason?: string | null;
  changed_at?: string | null;
};

type TelegramResult =
  | { ok: true; messageId: number | null }
  | { ok: false; error: string; details?: unknown };

type PendingAlert = {
  record: SignalHistoryRecord;
  resolve: (response: Response) => void;
};

const STATUS_EMOJI: Record<string, string> = {
  green: "🟢",
  amber: "🟡",
  red: "🔴",
};

const DOMINO_NAMES: Record<number, string> = {
  1: "SaaS Compression",
  2: "White-Collar Displacement",
  3: "Friction Collapse",
  4: "Ghost GDP",
  5: "Financial Contagion",
  6: "Policy Response",
};

const BATCH_THRESHOLD = 5;
const BATCH_WINDOW_MS = 10_000;

const CENTRAL_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZoneName: "short",
});

let pendingAlerts: PendingAlert[] = [];
let batchTimer: number | undefined;

const jsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizeStatus = (status: unknown): string =>
  String(status ?? "").trim().toLowerCase();

const normalizeTrigger = (triggerType: unknown): string =>
  String(triggerType ?? "").trim().toLowerCase();

const getStatusEmoji = (status: string): string =>
  STATUS_EMOJI[normalizeStatus(status)] ?? "⚪";

const toDominoId = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDominoName = (dominoId: number): string =>
  DOMINO_NAMES[dominoId] ?? `Domino ${dominoId}`;

const truncate = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
};

const formatCentralTime = (value: string | null | undefined): string => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return CENTRAL_TIME_FORMATTER.format(new Date());
  }

  return CENTRAL_TIME_FORMATTER.format(date);
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const extractRecord = (payload: unknown): SignalHistoryRecord | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = (payload as JsonObject).record;
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const record = candidate as JsonObject;

  return {
    id: record.id ? String(record.id) : undefined,
    domino_id: (record.domino_id as number | string) ?? "0",
    signal_name: String(record.signal_name ?? "Unknown signal"),
    old_status: String(record.old_status ?? "unknown"),
    new_status: String(record.new_status ?? "unknown"),
    trigger_type: String(record.trigger_type ?? "unknown"),
    reason: record.reason == null ? null : String(record.reason),
    changed_at: record.changed_at == null ? null : String(record.changed_at),
  };
};

const buildSingleAlertMessage = (record: SignalHistoryRecord): string => {
  const dominoId = toDominoId(record.domino_id);
  const dominoName = getDominoName(dominoId);
  const signalName = record.signal_name;
  const oldStatus = normalizeStatus(record.old_status) || "unknown";
  const newStatus = normalizeStatus(record.new_status) || "unknown";
  const triggerType = normalizeTrigger(record.trigger_type) || "unknown";
  const oldEmoji = getStatusEmoji(oldStatus);
  const newEmoji = getStatusEmoji(newStatus);
  const reason = record.reason?.trim();
  const changedAt = formatCentralTime(record.changed_at);

  if (newStatus === "red") {
    const escalationLines = [
      "⚠️ ESCALATION",
      `${newEmoji} Signal Alert`,
      `Domino ${dominoId}: ${dominoName}`,
      `Signal: ${signalName}`,
      `Status: ${oldEmoji} ${oldStatus} → ${newEmoji} ${newStatus}`,
      `Trigger: ${triggerType}`,
      reason ? `Reason: ${reason}` : null,
      `Time (America/Chicago): ${changedAt}`,
    ].filter((line): line is string => Boolean(line));

    return `<b>${escapeHtml(escalationLines.join("\n"))}</b>`;
  }

  const lines = [
    `${newEmoji} <b>Signal Alert</b>`,
    `<b>Domino ${dominoId}:</b> ${escapeHtml(dominoName)}`,
    `<b>Signal:</b> ${escapeHtml(signalName)}`,
    `<b>Status:</b> ${oldEmoji} ${escapeHtml(oldStatus)} → ${newEmoji} ${escapeHtml(newStatus)}`,
    `<b>Trigger:</b> ${escapeHtml(triggerType)}`,
    reason ? `<b>Reason:</b> ${escapeHtml(reason)}` : null,
    `<i>${escapeHtml(changedAt)} (America/Chicago)</i>`,
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
};

const buildBatchSummaryMessage = (records: SignalHistoryRecord[]): string => {
  const rows = records.map((record, index) => {
    const dominoId = toDominoId(record.domino_id);
    const dominoLabel = `D${dominoId} ${truncate(getDominoName(dominoId), 16)}`;
    const signalLabel = truncate(record.signal_name, 24);
    const oldStatus = normalizeStatus(record.old_status) || "unknown";
    const newStatus = normalizeStatus(record.new_status) || "unknown";
    const trigger = (normalizeTrigger(record.trigger_type) || "unknown").slice(0, 1).toUpperCase();
    const transition = `${getStatusEmoji(oldStatus)}${oldStatus.slice(0, 1).toUpperCase()}→${getStatusEmoji(newStatus)}${newStatus.slice(0, 1).toUpperCase()}`;

    return `${String(index + 1).padStart(2, " ")}  ${dominoLabel.padEnd(20, " ")}  ${signalLabel.padEnd(24, " ")}  ${transition.padEnd(8, " ")}  ${trigger}`;
  });

  const redCount = records.filter(
    (record) => normalizeStatus(record.new_status) === "red",
  ).length;

  const table = [
    "#  Domino                Signal                    Change    T",
    ...rows,
  ].join("\n");

  const lines = [
    `🔔 <b>Batch Update: ${records.length} signals changed</b>`,
    redCount > 0
      ? `⚠️ <b>${redCount} red escalation${redCount === 1 ? "" : "s"} in batch</b>`
      : null,
    `<pre>${escapeHtml(table)}</pre>`,
    `<i>${escapeHtml(formatCentralTime(undefined))} (America/Chicago)</i>`,
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
};

const sendTelegramMessage = async (text: string): Promise<TelegramResult> => {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

  if (!botToken || !chatId) {
    return {
      ok: false,
      error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID secret",
    };
  }

  let telegramResponse: Response;
  try {
    telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      },
    );
  } catch (error) {
    return { ok: false, error: `Telegram request failed: ${errorMessage(error)}` };
  }

  const telegramPayload = await telegramResponse.json().catch(() => null);

  if (!telegramResponse.ok || !telegramPayload?.ok) {
    // TODO: Add email fallback notification path (e.g., Resend) for Telegram delivery failures.
    return {
      ok: false,
      error: "Telegram API returned an error",
      details:
        telegramPayload ??
        { status: telegramResponse.status, statusText: telegramResponse.statusText },
    };
  }

  const messageId = typeof telegramPayload.result?.message_id === "number"
    ? telegramPayload.result.message_id
    : null;

  return { ok: true, messageId };
};

const sendSingleAlert = async (record: SignalHistoryRecord): Promise<TelegramResult> =>
  await sendTelegramMessage(buildSingleAlertMessage(record));

const sendBatchSummary = async (
  records: SignalHistoryRecord[],
): Promise<TelegramResult> =>
  await sendTelegramMessage(buildBatchSummaryMessage(records));

const flushPendingAlerts = async (): Promise<void> => {
  const batch = pendingAlerts;
  pendingAlerts = [];

  if (batchTimer !== undefined) {
    clearTimeout(batchTimer);
    batchTimer = undefined;
  }

  if (batch.length === 0) {
    return;
  }

  try {
    if (batch.length > BATCH_THRESHOLD) {
      const result = await sendBatchSummary(batch.map((item) => item.record));

      if (result.ok) {
        for (const item of batch) {
          item.resolve(
            jsonResponse({
              ok: true,
              mode: "batch",
              count: batch.length,
              message_id: result.messageId,
            }),
          );
        }
      } else {
        for (const item of batch) {
          item.resolve(
            jsonResponse({ error: result.error, details: result.details }, 500),
          );
        }
      }

      return;
    }

    for (const item of batch) {
      const result = await sendSingleAlert(item.record);
      if (result.ok) {
        item.resolve(
          jsonResponse({
            ok: true,
            mode: "single",
            message_id: result.messageId,
          }),
        );
      } else {
        item.resolve(
          jsonResponse({ error: result.error, details: result.details }, 500),
        );
      }
    }
  } catch (error) {
    const message = `Alert flush failed: ${errorMessage(error)}`;
    for (const item of batch) {
      item.resolve(jsonResponse({ error: message }, 500));
    }
  }
};

const queueAlert = (record: SignalHistoryRecord): Promise<Response> =>
  new Promise((resolve) => {
    pendingAlerts.push({ record, resolve });

    if (batchTimer === undefined) {
      batchTimer = setTimeout(() => {
        void flushPendingAlerts();
      }, BATCH_WINDOW_MS);
    }
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!webhookSecret) {
    return jsonResponse({ error: "Missing WEBHOOK_SECRET secret" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${webhookSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    return jsonResponse({ error: `Invalid JSON payload: ${errorMessage(error)}` }, 400);
  }

  const record = extractRecord(payload);
  if (!record) {
    return jsonResponse({ error: "No record in payload" }, 400);
  }

  return await queueAlert(record);
});
