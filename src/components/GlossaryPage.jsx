import { useState, useMemo } from "react";
import { GLOSSARY, GLOSSARY_KEYS } from "../data/glossary";
import { useTheme } from "../design-tokens";
import { S } from "../styles";

export default function GlossaryPage() {
  const { tokens } = useTheme();
  const [filter, setFilter] = useState("");

  const filteredTerms = useMemo(() => {
    if (!filter.trim()) return GLOSSARY_KEYS;
    const lower = filter.toLowerCase();
    return GLOSSARY_KEYS.filter((term) => {
      const entry = GLOSSARY[term];
      return (
        term.toLowerCase().includes(lower) ||
        entry.definition.toLowerCase().includes(lower) ||
        entry.analogy.toLowerCase().includes(lower)
      );
    });
  }, [filter]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 62px)",
        padding: tokens.spacing.pagePadding,
      }}
    >
      <div className="ab-content-shell">
        <div style={{ ...S.card("rgba(255,255,255,0.1)"), marginBottom: 14 }}>
          <div style={S.label}>Reference</div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.3px",
              marginBottom: 8,
            }}
          >
            Glossary
          </div>
          <div
            style={{
              fontSize: 12,
              color: tokens.colors.textMuted,
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            Plain English definitions of financial and macro terms used in
            Asymmetric Bridge.
          </div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search terms..."
            style={{
              width: "100%",
              borderRadius: 8,
              background: tokens.colors.surfaceRaised,
              border: `1px solid ${tokens.colors.borderStrong}`,
              color: tokens.colors.text,
              padding: "9px 10px",
              fontSize: 12,
              fontFamily: tokens.typography.fontSans,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 11,
            color: tokens.colors.textMuted,
            marginBottom: 10,
          }}
        >
          {filteredTerms.length} term{filteredTerms.length !== 1 ? "s" : ""}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {filteredTerms.map((term) => {
            const entry = GLOSSARY[term];
            return (
              <div key={term} style={S.card("rgba(255,255,255,0.06)")}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 6,
                    textTransform: "capitalize",
                  }}
                >
                  {term}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: tokens.colors.textSecondary,
                    lineHeight: 1.6,
                    marginBottom: 8,
                  }}
                >
                  {entry.definition}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: tokens.colors.accent,
                    lineHeight: 1.6,
                    fontStyle: "italic",
                    marginBottom: 8,
                  }}
                >
                  {entry.analogy}
                </div>
                {entry.relatedTerms?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {entry.relatedTerms.map((related) => (
                      <span
                        key={related}
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: tokens.colors.border,
                          color: tokens.colors.textMuted,
                        }}
                      >
                        {related}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
