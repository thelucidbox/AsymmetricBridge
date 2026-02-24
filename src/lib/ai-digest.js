// AI-powered digest generation — uses the BYO LLM provider
// Falls back to template-based rendering if no AI is configured

import { callAI, isAIConfigured } from "./ai-provider";
import { renderDigest } from "./digest-templates";

const SYSTEM_PROMPT = `You are an analyst writing a signal intelligence digest for a macro thesis dashboard.
Your audience is NOT a financial expert — write in plain, accessible English.
Explain economic concepts as if talking to a smart friend who doesn't work in finance.

Rules:
- Use everyday analogies to explain macro signals (e.g., "M2 velocity measures how fast money changes hands — think of it like how quickly cash moves through a neighborhood economy")
- When a signal changes status, explain what it means in practical terms for regular people
- Avoid jargon without explanation. If you use a term like "NRR" or "JOLTS", immediately explain it
- Be direct about what matters and what doesn't
- Structure: Executive summary (2-3 sentences), then domino-by-domino analysis, then action items
- Keep it under 800 words
- Use markdown formatting (headers, bold, bullet points)
- End with a "Bottom Line" section — one sentence on what this means for the thesis`;

function buildUserPrompt(aggregatedData) {
  const parts = [];

  parts.push("Generate a signal intelligence digest from this data:\n");

  const period = aggregatedData.period;
  if (period?.label) {
    parts.push(`Period: ${period.label}`);
  }

  parts.push(
    `Overall threat level: ${aggregatedData.overallThreatLevel || "UNKNOWN"}`,
  );

  const counts = aggregatedData.threatCounts || {};
  parts.push(
    `Signal counts: ${counts.redCount || 0} red, ${counts.amberCount || 0} amber, ${counts.greenCount || 0} green`,
  );

  const escalations = aggregatedData.escalations || [];
  if (escalations.length) {
    parts.push("\nEscalations (signals that got worse):");
    for (const e of escalations) {
      parts.push(
        `- ${e.signalName} (Domino: ${e.dominoName}): ${e.fromStatus} → ${e.toStatus}. Reason: ${e.reason || "No reason given"}`,
      );
    }
  }

  const deescalations = aggregatedData.deescalations || [];
  if (deescalations.length) {
    parts.push("\nDe-escalations (signals that improved):");
    for (const d of deescalations) {
      parts.push(
        `- ${d.signalName} (Domino: ${d.dominoName}): ${d.fromStatus} → ${d.toStatus}. Reason: ${d.reason || "No reason given"}`,
      );
    }
  }

  const dominoSummaries = aggregatedData.dominoSummaries || [];
  if (dominoSummaries.length) {
    parts.push("\nDomino status summary:");
    for (const d of dominoSummaries) {
      parts.push(
        `- D${d.dominoId} ${d.dominoName}: ${d.posture} (${d.escalationCount} escalations, ${d.deescalationCount} de-escalations)`,
      );
    }
  }

  const staleSignals = aggregatedData.staleSignals || [];
  if (staleSignals.length) {
    parts.push(
      `\n${staleSignals.length} stale signals (>30 days without update)`,
    );
  }

  return parts.join("\n");
}

export async function generateAIDigest(aggregatedData) {
  if (!isAIConfigured()) {
    return {
      content: renderDigest(aggregatedData),
      source: "template",
    };
  }

  try {
    const userPrompt = buildUserPrompt(aggregatedData);
    const aiContent = await callAI(SYSTEM_PROMPT, userPrompt);

    if (!aiContent || aiContent.trim().length < 50) {
      return {
        content: renderDigest(aggregatedData),
        source: "template",
        aiError: "AI returned insufficient content",
      };
    }

    return {
      content: aiContent,
      source: "ai",
    };
  } catch (err) {
    return {
      content: renderDigest(aggregatedData),
      source: "template",
      aiError: err.message,
    };
  }
}
