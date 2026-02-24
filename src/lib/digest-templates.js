const STATUS_LABELS = {
  green: "baseline",
  amber: "watch",
  red: "alert",
};

const STATUS_WEIGHT = {
  green: 0,
  amber: 1,
  red: 2,
};

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

function formatStatus(status) {
  return STATUS_LABELS[status] || status || "unknown";
}

function formatPeriodLabel(period) {
  if (!period) return "Unknown period";
  if (period.label) return period.label;
  if (period.startDate && period.endDate)
    return `${period.startDate} to ${period.endDate}`;
  return "Unknown period";
}

function formatTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "Unknown";
  return TIMESTAMP_FORMATTER.format(date);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /`([^`]+)`/g,
      '<code style="font-size:0.92em;padding:0.1rem 0.28rem;border-radius:4px;border:1px solid currentColor;opacity:0.9;">$1</code>',
    );
}

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

function buildExecutiveSummary(data) {
  const threatCounts = data?.threatCounts || {};
  const redCount = threatCounts.redCount || 0;
  const amberCount = threatCounts.amberCount || 0;
  const greenCount = threatCounts.greenCount || 0;
  const escalations = data?.escalations || [];
  const deescalations = data?.deescalations || [];
  const staleSignals = data?.staleSignals || [];

  const movedDominos = new Set(
    [...escalations, ...deescalations]
      .map((change) => change.dominoName)
      .filter(Boolean),
  );

  const sentenceOne = `The overall picture is **${data?.overallThreatLevel || "UNKNOWN"}** with ${redCount} alert${redCount !== 1 ? "s" : ""}, ${amberCount} on watch, and ${greenCount} at baseline.`;
  const sentenceTwo =
    escalations.length || deescalations.length
      ? `${escalations.length} ${pluralize(escalations.length, "signal got worse", "signals got worse")} and ${deescalations.length} ${pluralize(deescalations.length, "improved", "improved")} across ${movedDominos.size} ${pluralize(movedDominos.size, "domino", "dominos")}.`
      : "No signals changed status in this period — everything held steady.";
  const sentenceThree = staleSignals.length
    ? `${staleSignals.length} ${pluralize(staleSignals.length, "signal hasn't", "signals haven't")} been updated in over 30 days — worth checking if the data is still current.`
    : "All signals have recent data — nothing looks outdated.";

  return [sentenceOne, sentenceTwo, sentenceThree];
}

function recommendedAction(change) {
  if (change.toStatus === "red") {
    return "This needs attention now — review whether your positioning still makes sense and decide on next steps within 24 hours.";
  }
  if (change.toStatus === "amber") {
    return "Double-check the data source and watch whether this trend continues. Prepare to act if it does.";
  }
  return "Keep an eye on this but no action needed yet — wait for more data before making changes.";
}

function sortEscalationsForAttention(escalations) {
  return [...escalations].sort((a, b) => {
    const severityDelta =
      (STATUS_WEIGHT[b.toStatus] || 0) - (STATUS_WEIGHT[a.toStatus] || 0);
    if (severityDelta !== 0) return severityDelta;
    const aTime = new Date(a.changedAt || 0).getTime();
    const bTime = new Date(b.changedAt || 0).getTime();
    return bTime - aTime;
  });
}

export function renderDigest(aggregatedData) {
  if (!aggregatedData) {
    return [
      "# Signal Digest — Unavailable",
      "",
      "Digest data is unavailable.",
      "",
      `Generated at: ${formatTimestamp()}`,
      "",
    ].join("\n");
  }

  const lines = [];
  const periodLabel = formatPeriodLabel(aggregatedData.period);
  const dominoChanges = (aggregatedData.dominoSummaries || []).filter(
    (summary) => (summary.changedSignals || []).length > 0,
  );

  lines.push(`# Signal Digest — ${periodLabel}`);
  lines.push("");
  lines.push("## Executive Summary");
  lines.push(buildExecutiveSummary(aggregatedData).join(" "));
  lines.push("");

  lines.push("## Domino-by-Domino");
  if (!dominoChanges.length) {
    lines.push("- No domino status changes in this window.");
    lines.push("");
  } else {
    for (const summary of dominoChanges) {
      lines.push(`### D${summary.dominoId} ${summary.dominoName}`);
      lines.push(`- Escalations: ${summary.escalationCount}`);
      lines.push(`- De-escalations: ${summary.deescalationCount}`);
      lines.push(`- Posture: ${summary.posture}`);

      for (const change of summary.changedSignals) {
        lines.push(
          `- **${change.signalName}** moved ${formatStatus(change.fromStatus)} -> ${formatStatus(change.toStatus)} on ${change.changedAtLabel}. Why: ${change.reason}`,
        );
      }
      lines.push("");
    }
  }

  lines.push("## Attention Items");
  const sortedEscalations = sortEscalationsForAttention(
    aggregatedData.escalations || [],
  );
  if (!sortedEscalations.length) {
    lines.push("- No newly escalated signals in this period.");
  } else {
    for (const change of sortedEscalations) {
      lines.push(
        `- **${change.signalName}** (D${change.dominoId} ${change.dominoName}) moved ${formatStatus(change.fromStatus)} -> ${formatStatus(change.toStatus)} on ${change.changedAtLabel}. Action: ${recommendedAction(change)}`,
      );
    }
  }
  lines.push("");

  lines.push("## Stale Signals");
  const staleSignals = aggregatedData.staleSignals || [];
  if (!staleSignals.length) {
    lines.push("- No stale signals (>30 days without updates).");
  } else {
    for (const stale of staleSignals) {
      const freshness =
        stale.daysSinceUpdate === null
          ? "has never been updated in tracked history"
          : `last updated ${stale.lastUpdatedLabel} (${stale.daysSinceUpdate} days ago)`;
      lines.push(
        `- D${stale.dominoId} ${stale.dominoName} - **${stale.signalName}** ${freshness}.`,
      );
    }
  }
  lines.push("");

  lines.push("---");
  lines.push(`Generated at: ${formatTimestamp(aggregatedData.generatedAt)}`);
  lines.push("");

  return lines.join("\n");
}

export function markdownToHtml(markdown) {
  const source = String(markdown || "").replace(/\r\n/g, "\n");
  const lines = source.split("\n");
  const html = [];
  let paragraphBuffer = [];
  let listBuffer = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    const paragraph = paragraphBuffer.join(" ");
    html.push(
      `<p style="margin:0 0 0.78rem 0;line-height:1.7;">${formatInlineMarkdown(paragraph)}</p>`,
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) return;
    const items = listBuffer
      .map(
        (item) =>
          `<li style="margin:0.28rem 0;line-height:1.6;">${formatInlineMarkdown(item)}</li>`,
      )
      .join("");
    html.push(
      `<ul style="margin:0 0 0.88rem 1.1rem;padding:0;list-style:disc;">${items}</ul>`,
    );
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed === "---") {
      flushParagraph();
      flushList();
      html.push(
        '<hr style="border:0;border-top:1px solid currentColor;opacity:0.22;margin:1rem 0;" />',
      );
      continue;
    }

    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      flushParagraph();
      flushList();
      const depth = headerMatch[1].length;
      const text = formatInlineMarkdown(headerMatch[2]);
      if (depth === 1) {
        html.push(
          `<h1 style="margin:0 0 0.9rem 0;font-size:1.38rem;line-height:1.25;">${text}</h1>`,
        );
      } else if (depth === 2) {
        html.push(
          `<h2 style="margin:1.1rem 0 0.65rem 0;font-size:1.08rem;line-height:1.3;">${text}</h2>`,
        );
      } else {
        html.push(
          `<h3 style="margin:0.92rem 0 0.58rem 0;font-size:0.98rem;line-height:1.35;">${text}</h3>`,
        );
      }
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2).trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}

export function renderDigestHTML(aggregatedData) {
  return markdownToHtml(renderDigest(aggregatedData));
}
