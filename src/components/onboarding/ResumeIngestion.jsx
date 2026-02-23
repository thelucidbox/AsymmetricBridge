import { useState } from "react";
import { S } from "../../styles";

const JOB_TITLE_PATTERNS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Engineer",
  "Engineering Manager",
  "Product Manager",
  "Program Manager",
  "Project Manager",
  "Account Executive",
  "Sales Manager",
  "Business Development Manager",
  "Revenue Operations Manager",
  "Customer Success Manager",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "UX Designer",
  "Marketing Manager",
  "Founder",
  "Consultant",
  "Analyst",
  "Director",
  "Vice President",
  "CEO",
  "CTO",
  "COO",
];

const INDUSTRY_PATTERNS = [
  { label: "AI / Machine Learning", regex: /\b(ai|machine learning|ml|llm|genai|artificial intelligence)\b/i },
  { label: "SaaS / Software", regex: /\b(saas|software|cloud|b2b software|enterprise software)\b/i },
  { label: "Finance / Fintech", regex: /\b(finance|banking|fintech|capital markets|asset management)\b/i },
  { label: "Healthcare", regex: /\b(healthcare|health care|medtech|biotech|hospital)\b/i },
  { label: "Education", regex: /\b(education|edtech|curriculum|instructional|teaching)\b/i },
  { label: "Consulting", regex: /\b(consulting|advisor|advisory|strategy practice)\b/i },
  { label: "Marketing / Media", regex: /\b(marketing|media|advertising|growth)\b/i },
  { label: "Ecommerce / Retail", regex: /\b(ecommerce|e-commerce|retail|marketplace)\b/i },
];

const SKILL_KEYWORDS = [
  "ai",
  "machine learning",
  "genai",
  "prompt engineering",
  "python",
  "sql",
  "javascript",
  "react",
  "supabase",
  "sales",
  "enterprise sales",
  "account management",
  "product strategy",
  "go-to-market",
  "marketing",
  "financial modeling",
  "operations",
  "consulting",
  "teaching",
  "instructional design",
  "research",
  "data analysis",
  "forecasting",
  "project management",
];

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))];
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSentence(value) {
  if (!value) return "";
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function toExperienceBucket(years) {
  if (!Number.isFinite(years) || years <= 0) return "";
  if (years <= 2) return "0-2";
  if (years <= 5) return "3-5";
  if (years <= 10) return "6-10";
  return "10+";
}

function estimateYearsOfExperience(text) {
  const explicit = text.match(/(\d{1,2})\+?\s*(?:years|yrs)\s*(?:of)?\s*experience/i);
  if (explicit) {
    return Number.parseInt(explicit[1], 10);
  }

  const allYears = [...text.matchAll(/\b(19\d{2}|20\d{2})\b/g)]
    .map((match) => Number.parseInt(match[1], 10))
    .filter((year) => year >= 1980 && year <= new Date().getFullYear());

  if (allYears.length < 2) return 0;

  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  const span = maxYear - minYear;

  if (span < 0 || span > 50) return 0;
  return span;
}

function parseResumeText(text) {
  const cleaned = text.replace(/\r/g, "");
  const lower = cleaned.toLowerCase();

  const jobTitles = unique(
    JOB_TITLE_PATTERNS.filter((title) => {
      const regex = new RegExp(`\\b${escapeRegex(title.toLowerCase())}\\b`, "i");
      return regex.test(lower);
    }),
  );

  const industry = INDUSTRY_PATTERNS.find((entry) => entry.regex.test(cleaned))?.label || "";

  const companiesFromAt = [...cleaned.matchAll(/\b(?:at|@)\s+([A-Z][A-Za-z0-9&'.-]*(?:\s+[A-Z][A-Za-z0-9&'.-]*){0,4})/g)].map(
    (match) => match[1],
  );

  const companiesWithSuffix = [
    ...cleaned.matchAll(
      /\b([A-Z][A-Za-z0-9&'.-]*(?:\s+[A-Z][A-Za-z0-9&'.-]*){0,4}\s(?:Inc|LLC|Corp|Corporation|Company|Co\.?|Technologies|Tech|Labs|Group|Systems|Partners|Capital|Bank|University))\b/g,
    ),
  ].map((match) => match[1]);

  const companyNames = unique([...companiesFromAt, ...companiesWithSuffix])
    .filter((name) => !/(Bachelor|Master|Degree|Resume|Objective)/i.test(name))
    .slice(0, 8);

  const yearsExperience = estimateYearsOfExperience(cleaned);

  const skills = unique(
    SKILL_KEYWORDS.filter((keyword) => {
      const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
      return regex.test(lower);
    }).map((keyword) => normalizeSentence(keyword)),
  ).slice(0, 10);

  const goalsFromObjective = [
    ...cleaned.matchAll(/(?:seeking to|looking to|aim(?:ing)? to|goal is to|objective(?: is)? to)\s+([^\.\n]{8,120})/gi),
  ]
    .map((match) => normalizeSentence(match[1]))
    .filter((goal) => goal.length > 8);

  const generatedGoals = skills.slice(0, 3).map((skill) => `Apply ${skill} to higher-leverage work`);
  const goals = unique([...goalsFromObjective, ...generatedGoals]).slice(0, 4);

  const targetRoleMatch = cleaned.match(/(?:target role|seeking|objective|career goal)\s*[:\-]\s*([^\n\.]{6,90})/i);

  return {
    currentRole: jobTitles[0] || "",
    targetRole: targetRoleMatch ? normalizeSentence(targetRoleMatch[1]) : "",
    industry,
    experience: toExperienceBucket(yearsExperience),
    goals,
    jobTitles,
    companyNames,
    yearsExperience,
    skills,
  };
}

export default function ResumeIngestion({ onApply }) {
  const [resumeText, setResumeText] = useState("");
  const [parseError, setParseError] = useState("");
  const [parsed, setParsed] = useState(null);

  const handleParse = () => {
    if (!resumeText.trim()) {
      setParseError("Paste resume text first.");
      setParsed(null);
      return;
    }

    const result = parseResumeText(resumeText);
    const hasFindings =
      result.currentRole ||
      result.industry ||
      result.experience ||
      result.goals.length > 0 ||
      result.skills.length > 0 ||
      result.companyNames.length > 0;

    if (!hasFindings) {
      setParseError("No clear patterns found. Add more detail from experience and skills sections.");
      setParsed(null);
      return;
    }

    setParseError("");
    setParsed(result);
  };

  const applyParse = () => {
    if (!parsed) return;
    onApply(parsed);
  };

  return (
    <div style={{ ...S.card("rgba(255,255,255,0.08)"), marginBottom: 14 }}>
      <div style={S.label}>Resume Ingestion (Regex Heuristics)</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 10, lineHeight: 1.6 }}>
        Paste resume text and extract job titles, companies, experience band, and skill keywords to prefill your profile.
      </div>

      <textarea
        value={resumeText}
        onChange={(event) => setResumeText(event.target.value)}
        placeholder="Paste resume text here..."
        rows={9}
        style={{
          width: "100%",
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#E8E4DF",
          padding: "10px 12px",
          fontSize: 12,
          lineHeight: 1.5,
          fontFamily: "'IBM Plex Sans', sans-serif",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={handleParse} style={S.tab(false, "#E9C46A")}>
          Parse Resume
        </button>
        <button
          type="button"
          onClick={applyParse}
          disabled={!parsed}
          style={{
            ...S.tab(!!parsed, "#2A9D8F"),
            opacity: parsed ? 1 : 0.5,
            cursor: parsed ? "pointer" : "not-allowed",
          }}
        >
          Apply To Profile
        </button>
      </div>

      {parseError && (
        <div style={{ marginTop: 10, fontSize: 11, color: "#F4A261" }}>{parseError}</div>
      )}

      {parsed && (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            Parsed role: <span style={{ color: "#E8E4DF" }}>{parsed.currentRole || "Not found"}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            Industry: <span style={{ color: "#E8E4DF" }}>{parsed.industry || "Not found"}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            Experience estimate: <span style={{ color: "#E8E4DF" }}>{parsed.yearsExperience || 0} years</span>
          </div>

          {parsed.jobTitles.length > 0 && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              Titles: {parsed.jobTitles.join(" · ")}
            </div>
          )}
          {parsed.companyNames.length > 0 && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              Companies: {parsed.companyNames.join(" · ")}
            </div>
          )}
          {parsed.skills.length > 0 && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              Skills: {parsed.skills.join(" · ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
