// AI-powered digest generation — uses the BYO LLM provider
// Falls back to template-based rendering if no AI is configured

import { callAI, isAIConfigured } from "./ai-provider";
import { renderDigest } from "./digest-templates";

const SYSTEM_PROMPT = `You are a strategic intelligence analyst writing a personalized signal digest.
Your audience is a professional navigating career and investment decisions during economic disruption.
Write in plain, accessible English — no unexplained jargon.

Rules:
- Use everyday analogies for macro signals (e.g., "M2 velocity measures how fast money changes hands — like how quickly cash moves through a neighborhood economy")
- When a signal changes status, explain what it means in practical terms
- Avoid jargon without explanation. If you use "NRR" or "JOLTS", explain it immediately
- Be direct about what matters and what doesn't

Structure (use these exact headers):
1. **Executive Summary** — 2-3 sentences on the overall state
2. **Signal Analysis** — Domino-by-domino breakdown of what moved and why
3. **Career Positioning** — What this means for the reader's career trajectory. Be specific: what skills to build, what roles are gaining/losing leverage, what moves to consider based on their profile
4. **Investment Considerations** — How portfolio alignment maps to the current signal state. Not financial advice — strategic framing for how disruption signals connect to asset positioning
5. **Bottom Line** — One sentence on what this all means for the thesis

- Keep it under 1000 words
- Use markdown formatting (headers, bold, bullet points)
- If career profile is provided, make sections 3 and 4 specific to their situation
- If no career profile, keep sections 3 and 4 general but still actionable`;

function buildUserPrompt(aggregatedData, careerProfile) {
  const parts = [];

  parts.push(
    "Generate a personalized signal intelligence digest from this data:\n",
  );

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

  if (careerProfile) {
    parts.push("\n--- Reader's Career Profile ---");
    if (careerProfile.currentRole)
      parts.push(`Current role: ${careerProfile.currentRole}`);
    if (careerProfile.targetRole)
      parts.push(`Target role: ${careerProfile.targetRole}`);
    if (careerProfile.industry)
      parts.push(`Industry: ${careerProfile.industry}`);
    if (careerProfile.experience)
      parts.push(`Experience: ${careerProfile.experience}`);
    const goals = careerProfile.goals || [];
    if (goals.length) parts.push(`Goals: ${goals.join(", ")}`);
    parts.push(
      "Use this profile to make the Career Positioning and Investment Considerations sections specific to this person's situation.",
    );
  }

  return parts.join("\n");
}

export async function generateAIDigest(aggregatedData, careerProfile = null) {
  if (!isAIConfigured()) {
    return {
      content: renderDigest(aggregatedData),
      source: "template",
    };
  }

  try {
    const userPrompt = buildUserPrompt(aggregatedData, careerProfile);
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
