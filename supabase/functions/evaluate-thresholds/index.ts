import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Status = "green" | "amber" | "red";
type Comparator = "lt" | "gt";

type SignalDefinitionRow = {
  domino_id: number;
  signal_name: string;
  status: Status;
  is_override: boolean | null;
};

type SignalDataPointRow = {
  domino_id: number;
  signal_name: string;
  value: string;
  created_at: string;
};

type ThresholdDefinition = {
  comparator: Comparator;
  amber: number;
  red: number;
};

const THRESHOLD_DEFINITIONS: Record<string, ThresholdDefinition> = {
  "1|Public SaaS Net Revenue Retention": {
    comparator: "lt",
    amber: 120,
    red: 110,
  },
  "2|JOLTS: Professional Services Openings": {
    comparator: "lt",
    amber: 1.8,
    red: 1.5,
  },
  "2|Initial Jobless Claims Composition": {
    comparator: "gt",
    amber: 280,
    red: 350,
  },
  "3|Stablecoin Transaction Volume": {
    comparator: "gt",
    amber: 1000,
    red: 2000,
  },
  "4|M2 Velocity of Money": {
    comparator: "lt",
    amber: 1.15,
    red: 1.0,
  },
  "4|Consumer Confidence vs. CEO Confidence": {
    comparator: "lt",
    amber: 98,
    red: 95,
  },
  "4|Labor Share of GDP": {
    comparator: "lt",
    amber: 55,
    red: 52,
  },
  "5|Alt Manager Stock Prices (BX, APO, KKR)": {
    comparator: "lt",
    amber: -15,
    red: -25,
  },
};

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: CORS_HEADERS,
  });

const signalKey = (dominoId: number, signalName: string): string =>
  `${dominoId}|${signalName}`;

const parseNumericValue = (value: string): number | null => {
  const match = String(value ?? "")
    .replaceAll(",", "")
    .match(/-?\d+(\.\d+)?/);

  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const evaluateStatus = (
  value: number,
  threshold: ThresholdDefinition,
): Status => {
  if (threshold.comparator === "lt") {
    if (value < threshold.red) return "red";
    if (value < threshold.amber) return "amber";
    return "green";
  }

  if (value > threshold.red) return "red";
  if (value > threshold.amber) return "amber";
  return "green";
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ??
    Deno.env.get("VITE_SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse(
      {
        evaluated: 0,
        changed: 0,
        errors: [
          "Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY",
        ],
      },
      500,
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const errors: string[] = [];
  let evaluated = 0;
  let changed = 0;

  const [
    { data: signalDefinitions, error: definitionsError },
    { data: dataPoints, error: dataPointsError },
  ] = await Promise.all([
    supabase
      .from("signal_statuses")
      .select("domino_id, signal_name, status, is_override")
      .order("domino_id", { ascending: true }),
    supabase
      .from("signal_data_points")
      .select("domino_id, signal_name, value, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (definitionsError) {
    errors.push(`Failed to fetch signal definitions: ${definitionsError.message}`);
  }

  if (dataPointsError) {
    errors.push(`Failed to fetch latest data points: ${dataPointsError.message}`);
  }

  const definitions = (signalDefinitions ?? []) as SignalDefinitionRow[];
  const points = (dataPoints ?? []) as SignalDataPointRow[];

  const latestDataPointBySignal = new Map<string, SignalDataPointRow>();
  for (const point of points) {
    const key = signalKey(point.domino_id, point.signal_name);
    if (!latestDataPointBySignal.has(key)) {
      latestDataPointBySignal.set(key, point);
    }
  }

  for (const definition of definitions) {
    const key = signalKey(definition.domino_id, definition.signal_name);
    const threshold = THRESHOLD_DEFINITIONS[key];

    if (!threshold) {
      continue;
    }

    if (definition.is_override) {
      continue;
    }

    const latestPoint = latestDataPointBySignal.get(key);
    if (!latestPoint) {
      errors.push(`No data point found for ${key}`);
      continue;
    }

    const parsedValue = parseNumericValue(latestPoint.value);
    if (parsedValue === null) {
      errors.push(`Could not parse numeric value for ${key}: "${latestPoint.value}"`);
      continue;
    }

    const nextStatus = evaluateStatus(parsedValue, threshold);
    evaluated += 1;

    if (nextStatus === definition.status) {
      continue;
    }

    const updatedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("signal_statuses")
      .update({
        status: nextStatus,
        updated_at: updatedAt,
        updated_by: "cron",
      })
      .eq("domino_id", definition.domino_id)
      .eq("signal_name", definition.signal_name);

    if (updateError) {
      errors.push(`Failed to update ${key}: ${updateError.message}`);
      continue;
    }

    const { error: historyError } = await supabase
      .from("signal_history")
      .insert({
        domino_id: definition.domino_id,
        signal_name: definition.signal_name,
        old_status: definition.status,
        new_status: nextStatus,
        trigger_type: "cron",
        reason: `Threshold evaluation from latest value "${latestPoint.value}"`,
      });

    if (historyError) {
      errors.push(`Updated ${key}, but history insert failed: ${historyError.message}`);
    }

    changed += 1;
  }

  return jsonResponse({ evaluated, changed, errors });
});
