/**
 * Supabase digests table schema:
 * - id (uuid)
 * - period_start (date)
 * - period_end (date)
 * - content_md (text)
 * - threat_level (text)
 * - generated_at (timestamp)
 * - escalation_count (int)
 * - deescalation_count (int)
 */
import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aggregateDigestData } from "../lib/digest-aggregator";
import {
  markdownToHtml,
  renderDigest,
  renderDigestHTML,
} from "../lib/digest-templates";
import { generateAIDigest } from "../lib/ai-digest";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { useThesis } from "../config/ThesisContext";

const DIGESTS_QUERY_KEY = ["signal-digests"];
const DIGEST_STORAGE_KEY = "ab-signal-digests";

function createDigestId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toTimestamp(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 0;
  return date.getTime();
}

function sortDigests(digests) {
  return [...digests].sort(
    (a, b) => toTimestamp(b.generatedAt) - toTimestamp(a.generatedAt),
  );
}

function normalizeDigestRecord(record) {
  if (!record || typeof record !== "object") return null;

  const normalized = {
    id: record.id || createDigestId(),
    periodStart: record.period_start || record.periodStart || null,
    periodEnd: record.period_end || record.periodEnd || null,
    contentMd: record.content_md || record.contentMd || "",
    threatLevel: record.threat_level || record.threatLevel || "BASELINE",
    generatedAt:
      record.generated_at || record.generatedAt || new Date().toISOString(),
    escalationCount: Number(
      record.escalation_count ?? record.escalationCount ?? 0,
    ),
    deescalationCount: Number(
      record.deescalation_count ?? record.deescalationCount ?? 0,
    ),
  };

  return {
    ...normalized,
    contentHtml: markdownToHtml(normalized.contentMd),
  };
}

function serializeDigestRecord(record) {
  return {
    id: record.id,
    periodStart: record.periodStart,
    periodEnd: record.periodEnd,
    contentMd: record.contentMd,
    threatLevel: record.threatLevel,
    generatedAt: record.generatedAt,
    escalationCount: record.escalationCount,
    deescalationCount: record.deescalationCount,
  };
}

function readLocalDigests() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DIGEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortDigests(parsed.map(normalizeDigestRecord).filter(Boolean));
  } catch {
    return [];
  }
}

function writeLocalDigests(digests) {
  if (typeof window === "undefined") return;
  const serializable = digests.map(serializeDigestRecord);
  window.localStorage.setItem(DIGEST_STORAGE_KEY, JSON.stringify(serializable));
}

function persistLocalDigest(digest) {
  const existing = readLocalDigests();
  const next = sortDigests([
    digest,
    ...existing.filter((item) => item.id !== digest.id),
  ]);
  writeLocalDigests(next);
  return next;
}

async function loadDigests(userId) {
  if (!supabase) return readLocalDigests();

  try {
    const { data, error } = await supabase
      .from("digests")
      .select(
        "id, period_start, period_end, content_md, threat_level, generated_at, escalation_count, deescalation_count",
      )
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(100);

    if (error) {
      console.warn(
        "Unable to load digests from Supabase. Falling back to localStorage:",
        error.message,
      );
      return readLocalDigests();
    }

    return sortDigests((data || []).map(normalizeDigestRecord).filter(Boolean));
  } catch (error) {
    console.warn("Digest load failed. Falling back to localStorage:", error);
    return readLocalDigests();
  }
}

export function useDigests() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const { thesis } = useThesis();
  const careerProfile = thesis?.careerProfile || null;

  const digestsQuery = useQuery({
    queryKey: [...DIGESTS_QUERY_KEY, userId],
    queryFn: () => loadDigests(userId),
    staleTime: 60 * 1000,
  });

  const generateMutation = useMutation({
    mutationFn: async (dayRange = 7) => {
      const aggregatedData = await aggregateDigestData(dayRange);
      const aiResult = await generateAIDigest(aggregatedData, careerProfile);
      const contentMd = aiResult.content;
      const contentHtml = markdownToHtml(contentMd);
      const generatedAt = new Date().toISOString();
      const payload = {
        user_id: userId,
        period_start:
          aggregatedData?.period?.startDate || generatedAt.slice(0, 10),
        period_end: aggregatedData?.period?.endDate || generatedAt.slice(0, 10),
        content_md: contentMd,
        threat_level: aggregatedData?.overallThreatLevel || "BASELINE",
        generated_at: generatedAt,
        escalation_count: aggregatedData?.escalations?.length || 0,
        deescalation_count: aggregatedData?.deescalations?.length || 0,
      };

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("digests")
            .insert(payload)
            .select(
              "id, period_start, period_end, content_md, threat_level, generated_at, escalation_count, deescalation_count",
            )
            .single();

          if (!error && data) {
            const normalizedDigest = normalizeDigestRecord(data);
            return {
              digest: {
                ...normalizedDigest,
                contentHtml,
              },
              storage: "supabase",
            };
          }

          console.warn(
            "Unable to persist digest in Supabase. Falling back to localStorage:",
            error?.message,
          );
        } catch (error) {
          console.warn(
            "Digest persistence failed. Falling back to localStorage:",
            error,
          );
        }
      }

      const localDigest = normalizeDigestRecord({
        id: createDigestId(),
        ...payload,
      });
      localDigest.contentHtml = contentHtml;
      const localDigests = persistLocalDigest(localDigest);

      return {
        digest: localDigest,
        storage: "local",
        localDigests,
      };
    },
    onSuccess: ({ storage, localDigests }) => {
      if (storage === "supabase") {
        queryClient.invalidateQueries({ queryKey: DIGESTS_QUERY_KEY });
        return;
      }
      queryClient.setQueryData(DIGESTS_QUERY_KEY, localDigests || []);
    },
  });

  const generateDigest = useCallback(
    async (dayRange = 7) => {
      const result = await generateMutation.mutateAsync(dayRange);
      return result.digest;
    },
    [generateMutation],
  );

  const exportMarkdown = useCallback(async (digest, mode = "copy") => {
    if (!digest?.contentMd) {
      throw new Error("No digest content available to export.");
    }

    if (mode === "copy") {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard is not available in this browser.");
      }
      await navigator.clipboard.writeText(digest.contentMd);
      return;
    }

    if (mode === "download") {
      if (typeof window === "undefined") {
        throw new Error("Download is only available in a browser environment.");
      }

      const fileName = `signal-digest-${digest.periodStart || "start"}-to-${digest.periodEnd || "end"}.md`;
      const blob = new Blob([digest.contentMd], {
        type: "text/markdown;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
      return;
    }

    throw new Error(`Unsupported export mode: ${mode}`);
  }, []);

  const digests = digestsQuery.data || [];
  const latestDigest = useMemo(() => digests[0] || null, [digests]);

  return {
    digests,
    latestDigest,
    generateDigest,
    isGenerating: generateMutation.isPending,
    exportMarkdown,
  };
}
