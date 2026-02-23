import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { S } from "../styles";

const DEFAULT_SECTIONS = [
  { id: "dashboard", label: "Dashboard", path: "/", color: "#E63946" },
  {
    id: "performance",
    label: "Performance Lab",
    path: "/performance",
    color: "#E9C46A",
  },
  { id: "conviction", label: "Conviction", path: "/conviction", color: "#2A9D8F" },
  { id: "digests", label: "Digests", path: "/digests", color: "#6D6875" },
];

function isPathActive(pathname, path) {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
}

export default function Navigation({ sections, activeSection, onSectionChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navSections = useMemo(() => {
    if (!sections?.length) return DEFAULT_SECTIONS;
    return sections.map((section, index) => ({
      ...section,
      path: section.path || (section.id === "dashboard" ? "/" : `/${section.id}`),
      color: section.color || DEFAULT_SECTIONS[index % DEFAULT_SECTIONS.length].color,
    }));
  }, [sections]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    if (media.addEventListener) media.addEventListener("change", onChange);
    else media.addListener(onChange);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", onChange);
      else media.removeListener(onChange);
    };
  }, []);

  const resolvedActive = activeSection
    ? activeSection
    : navSections.find((section) => isPathActive(location.pathname, section.path))?.id;

  const handleSelect = (section) => {
    setIsMenuOpen(false);
    if (typeof onSectionChange === "function") {
      onSectionChange(section.id);
      return;
    }
    navigate(section.path);
  };

  const renderNavButton = (section, vertical = false) => {
    const isActive = resolvedActive === section.id || isPathActive(location.pathname, section.path);
    return (
      <button
        key={section.id}
        onClick={() => handleSelect(section)}
        style={{
          ...S.sectionTab(isActive, section.color),
          padding: vertical ? "10px 12px" : "8px 14px",
          width: vertical ? "100%" : "auto",
          textAlign: vertical ? "left" : "center",
          background: isActive
            ? `${section.color}18`
            : vertical
              ? "rgba(255,255,255,0.01)"
              : "transparent",
        }}
      >
        {section.label}
      </button>
    );
  };

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(13,13,15,0.96)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Asymmetric Bridge
          </div>

          {!isMobile && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {navSections.map((section) => renderNavButton(section))}
            </div>
          )}

          {isMobile && (
            <button
              aria-label="Toggle navigation menu"
              onClick={() => setIsMenuOpen((current) => !current)}
              style={{
                ...S.sectionTab(isMenuOpen, "#E9C46A"),
                padding: "8px 12px",
                minWidth: 44,
              }}
            >
              ☰
            </button>
          )}
        </div>
      </nav>

      {isMobile && isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            border: "none",
            background: "rgba(0,0,0,0.45)",
            zIndex: 45,
            cursor: "pointer",
          }}
        />
      )}

      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: isMenuOpen ? 0 : -260,
            width: 250,
            height: "100vh",
            zIndex: 46,
            background: "rgba(13,13,15,0.98)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: "70px 12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            transition: "left 0.2s ease",
            backdropFilter: "blur(16px)",
          }}
        >
          {navSections.map((section) => renderNavButton(section, true))}
        </div>
      )}
    </>
  );
}
