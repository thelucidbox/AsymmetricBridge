import { useCallback, useMemo, useState } from "react";
import { useThesis } from "../config/ThesisContext";
import { calculateAlignmentScore } from "../lib/alignment-score";
import { parsePortfolioCsv } from "../lib/csv-parser";
import { mapPositionsToLegs } from "../lib/leg-mapper";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

const EMPTY_ALIGNMENT = {
  score: 0,
  breakdown: [],
  unalignedPercent: 0,
  alignedPercent: 0,
};

function isParsedPayload(value) {
  return Boolean(
    value && typeof value === "object" && Array.isArray(value.positions),
  );
}

function analyzePortfolioPositions(positions, thesisLegs) {
  const mapped = mapPositionsToLegs(positions, thesisLegs);
  const score = calculateAlignmentScore(mapped.legBuckets);

  return {
    legBreakdown: mapped.legBuckets,
    alignmentScore: score,
    totalPortfolioValue: mapped.totalPortfolioValue,
  };
}

async function persistSnapshot(parsedPortfolio, analyzedPortfolio, userId) {
  if (!supabase) return;

  try {
    const snapshotPayload = {
      user_id: userId,
      captured_at: new Date().toISOString(),
      source_format: parsedPortfolio.format || null,
      positions: parsedPortfolio.positions,
      leg_breakdown: analyzedPortfolio.legBreakdown,
      alignment_score: analyzedPortfolio.alignmentScore.score,
      summary: {
        totalRows: parsedPortfolio.totalRows,
        skippedRows: parsedPortfolio.skippedRows,
        unalignedPercent: analyzedPortfolio.alignmentScore.unalignedPercent,
        totalPortfolioValue: analyzedPortfolio.totalPortfolioValue,
      },
    };

    const { error: insertError } = await supabase
      .from("portfolio_snapshots")
      .insert(snapshotPayload);

    if (insertError) {
      console.warn(
        "Unable to persist portfolio snapshot in Supabase:",
        insertError.message,
      );
    }
  } catch (error) {
    console.warn("Portfolio snapshot persistence failed:", error);
  }
}

export function usePortfolioData() {
  const { thesis } = useThesis();
  const { userId } = useAuth();
  const [positions, setPositions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState(null);
  const [lastImportMeta, setLastImportMeta] = useState(null);

  const thesisLegs = useMemo(() => thesis?.portfolio?.legs || [], [thesis]);

  const portfolioAnalysis = useMemo(
    () => analyzePortfolioPositions(positions, thesisLegs),
    [positions, thesisLegs],
  );

  const uploadCSV = useCallback(
    async (input, options = {}) => {
      setIsProcessing(true);

      try {
        const parsed = isParsedPayload(input)
          ? {
              format: input.format || "Parsed",
              formatId: input.formatId || "parsed",
              headers: input.headers || [],
              positions: input.positions,
              totalRows: input.totalRows ?? input.positions.length,
              skippedRows: input.skippedRows ?? 0,
            }
          : await parsePortfolioCsv(input, { onProgress: options.onProgress });

        const analysis = analyzePortfolioPositions(
          parsed.positions,
          thesisLegs,
        );

        setPositions(parsed.positions);
        setDetectedFormat(parsed.format);
        setLastImportMeta({
          totalRows: parsed.totalRows,
          skippedRows: parsed.skippedRows,
          headers: parsed.headers,
        });

        if (typeof options.onProgress === "function") {
          options.onProgress(100);
        }

        if (options.persist !== false) {
          await persistSnapshot(parsed, analysis, userId);
        }

        return {
          ...parsed,
          ...analysis,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [thesisLegs, userId],
  );

  return {
    positions,
    legBreakdown: portfolioAnalysis.legBreakdown,
    alignmentScore: portfolioAnalysis.alignmentScore || EMPTY_ALIGNMENT,
    uploadCSV,
    isProcessing,
    detectedFormat,
    lastImportMeta,
    totalPortfolioValue: portfolioAnalysis.totalPortfolioValue,
  };
}
