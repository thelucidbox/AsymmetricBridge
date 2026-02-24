import { useMemo, useState } from "react";
import { useThesis } from "../../config/ThesisContext";
import { S } from "../../styles";

export default function ResearchDiscovery({ careerProfile, dominos }) {
  const { thesis } = useThesis();
  const [copied, setCopied] = useState(false);

  const resolvedProfile = careerProfile || thesis.careerProfile;
  const resolvedDominos = dominos || thesis.dominos;

  const prompt = useMemo(() => {
    const role = resolvedProfile?.currentRole || "professional";
    const target = resolvedProfile?.targetRole || "career transition";
    const industry = resolvedProfile?.industry || "technology";
    const dominoNames =
      resolvedDominos?.map((d) => d.name).join(", ") ||
      "macro disruption forces";

    return `I'm a ${role} transitioning toward ${target} in ${industry}. I track macro disruption signals through a framework with these forces: ${dominoNames}.

Find me 3-5 recent macro research articles, reports, or analyst notes relevant to my thesis. For each, provide:
1. Title and author/source
2. Key thesis in 2-3 sentences
3. Which of my disruption forces it relates to
4. One actionable insight for my career positioning

Focus on credible sources: research firms, economists, financial analysts, academic papers. Avoid opinion pieces without data.`;
  }, [resolvedProfile, resolvedDominos]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={S.card("rgba(129,140,248,0.1)")}>
      <div style={S.label}>Find Your Own Research Sources</div>
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.6,
          marginBottom: 12,
        }}
      >
        Copy this prompt into ChatGPT, Claude, or Perplexity to find macro
        research relevant to your thesis.
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "12px 14px",
          fontSize: 12,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          marginBottom: 10,
        }}
      >
        {prompt}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          ...S.tab(true, copied ? "#2A9D8F" : "#818CF8"),
          padding: "8px 14px",
        }}
      >
        {copied ? "Copied!" : "Copy Prompt"}
      </button>
    </div>
  );
}
