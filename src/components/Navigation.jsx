import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle, useTheme } from "../design-tokens";
import {
  DISPLAY_MODES,
  setDisplayMode,
  useDisplayMode,
} from "../hooks/useDisplayMode";
import { isOwnerMode, useThesis } from "../config/ThesisContext";
import { useAuth } from "../lib/AuthContext";
import GuidedTour from "./GuidedTour";
import { S } from "../styles";

const DEFAULT_SECTION_DEFS = [
  { id: "dashboard", label: "Dashboard", path: "/", colorKey: "alert" },
  {
    id: "performance",
    label: "Performance Lab",
    path: "/performance",
    colorKey: "accent",
  },
  {
    id: "conviction",
    label: "Conviction",
    path: "/conviction",
    colorKey: "baseline",
  },
  {
    id: "digests",
    label: "Digests",
    path: "/digests",
    colorKey: "dominoPolicy",
  },
  {
    id: "glossary",
    label: "Glossary",
    path: "/glossary",
    colorKey: "aiAccent",
  },
];

function isPathActive(pathname, path) {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
}

export default function Navigation({
  sections,
  activeSection,
  onSectionChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tokens } = useTheme();
  const displayMode = useDisplayMode();
  const { enterTestMode } = useThesis();
  const { requireAuth, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (isMenuOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isMenuOpen]);

  const handleTestAsNewUser = () => {
    enterTestMode();
    navigate("/onboarding", { replace: true });
  };

  const defaultSections = useMemo(
    () =>
      DEFAULT_SECTION_DEFS.map((d) => ({
        ...d,
        color: tokens.colors[d.colorKey],
      })),
    [tokens],
  );

  const navSections = useMemo(() => {
    if (!sections?.length) return defaultSections;
    return sections.map((section, index) => ({
      ...section,
      path:
        section.path || (section.id === "dashboard" ? "/" : `/${section.id}`),
      color:
        section.color || defaultSections[index % defaultSections.length].color,
    }));
  }, [sections, defaultSections]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();
    if (media.addEventListener) media.addEventListener("change", onChange);
    else media.addListener(onChange);
    return () => {
      if (media.removeEventListener)
        media.removeEventListener("change", onChange);
      else media.removeListener(onChange);
    };
  }, []);

  const resolvedActive = activeSection
    ? activeSection
    : navSections.find((section) =>
        isPathActive(location.pathname, section.path),
      )?.id;
  const simplifiedMode = displayMode === DISPLAY_MODES.simplified;

  const handleSelect = (section) => {
    setIsMenuOpen(false);
    if (typeof onSectionChange === "function") {
      onSectionChange(section.id);
      return;
    }
    navigate(section.path);
  };

  const renderNavButton = (section, vertical = false) => {
    const isActive =
      resolvedActive === section.id ||
      isPathActive(location.pathname, section.path);
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
              ? tokens.colors.surfaceSoft
              : "transparent",
        }}
      >
        {section.label}
      </button>
    );
  };

  return (
    <>
      <a href="#main-content" className="ab-skip-link">
        Skip to main content
      </a>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: tokens.zIndex.nav,
          background: tokens.colors.navBg,
          borderBottom: `1px solid ${tokens.colors.border}`,
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
        }}
      >
        <div
          className="ab-content-shell"
          style={{
            padding: tokens.spacing.navPadding,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: tokens.typography.sizes.label,
              color: tokens.colors.textSoft,
              letterSpacing: tokens.typography.letterSpacing.mono,
              textTransform: "uppercase",
              fontFamily: tokens.typography.fontMono,
            }}
          >
            Asymmetric Bridge
          </div>

          {!isMobile && (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {navSections.map((section) => renderNavButton(section))}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  marginLeft: 4,
                  paddingLeft: 8,
                  borderLeft: `1px solid ${tokens.colors.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: tokens.typography.sizes.label,
                    color: tokens.colors.textMuted,
                    fontFamily: tokens.typography.fontMono,
                    letterSpacing: tokens.typography.letterSpacing.mono,
                  }}
                >
                  View
                </span>
                <button
                  onClick={() => setDisplayMode(DISPLAY_MODES.simplified)}
                  style={S.tab(simplifiedMode, tokens.colors.baseline)}
                  aria-pressed={simplifiedMode}
                >
                  Simplified
                </button>
                <button
                  onClick={() => setDisplayMode(DISPLAY_MODES.full)}
                  style={S.tab(!simplifiedMode, tokens.colors.accent)}
                  aria-pressed={!simplifiedMode}
                >
                  Full
                </button>
              </div>

              <div
                style={{
                  marginLeft: 2,
                  paddingLeft: 8,
                  borderLeft: `1px solid ${tokens.colors.border}`,
                }}
              >
                <ThemeToggle />
              </div>

              {isOwnerMode && (
                <div
                  style={{
                    marginLeft: 2,
                    paddingLeft: 8,
                    borderLeft: `1px solid ${tokens.colors.border}`,
                  }}
                >
                  <button
                    onClick={handleTestAsNewUser}
                    style={{
                      ...S.tab(false, tokens.colors.watch),
                      fontSize: tokens.typography.sizes.label,
                      fontFamily: tokens.typography.fontMono,
                      textTransform: "uppercase",
                      letterSpacing: tokens.typography.letterSpacing.label,
                    }}
                  >
                    Test as new user
                  </button>
                </div>
              )}

              {requireAuth && (
                <div
                  style={{
                    marginLeft: 2,
                    paddingLeft: 8,
                    borderLeft: `1px solid ${tokens.colors.border}`,
                  }}
                >
                  <button
                    onClick={signOut}
                    style={{
                      ...S.tab(false, tokens.colors.alert),
                      fontSize: tokens.typography.sizes.label,
                      fontFamily: tokens.typography.fontMono,
                      textTransform: "uppercase",
                      letterSpacing: tokens.typography.letterSpacing.label,
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {isMobile && (
            <button
              aria-label="Toggle navigation menu"
              onClick={() => setIsMenuOpen((current) => !current)}
              style={{
                ...S.sectionTab(isMenuOpen, tokens.colors.accent),
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
          aria-label="Close navigation menu"
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            border: "none",
            background: "rgba(0,0,0,0.45)",
            zIndex: tokens.zIndex.nav - 1,
            cursor: "pointer",
          }}
        />
      )}

      {isMobile && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsMenuOpen(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: isMenuOpen ? 0 : -260,
            width: "min(250px, 82vw)",
            height: "100vh",
            zIndex: tokens.zIndex.nav + 1,
            background: tokens.colors.drawerBg,
            borderRight: `1px solid ${tokens.colors.border}`,
            padding: "70px 12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            transition: "left 0.2s ease",
            backdropFilter: tokens.glass.elevatedBlur,
            WebkitBackdropFilter: tokens.glass.elevatedBlur,
          }}
        >
          {navSections.map((section) => renderNavButton(section, true))}

          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${tokens.colors.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: tokens.typography.sizes.label,
                color: tokens.colors.textMuted,
                fontFamily: tokens.typography.fontMono,
                letterSpacing: tokens.typography.letterSpacing.mono,
              }}
            >
              Display Mode
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setDisplayMode(DISPLAY_MODES.simplified)}
                style={{
                  ...S.tab(simplifiedMode, tokens.colors.baseline),
                  flex: 1,
                }}
                aria-pressed={simplifiedMode}
              >
                Simplified
              </button>
              <button
                onClick={() => setDisplayMode(DISPLAY_MODES.full)}
                style={{
                  ...S.tab(!simplifiedMode, tokens.colors.accent),
                  flex: 1,
                }}
                aria-pressed={!simplifiedMode}
              >
                Full
              </button>
            </div>

            <div style={{ marginTop: 4 }}>
              <ThemeToggle />
            </div>

            {isOwnerMode && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleTestAsNewUser();
                }}
                style={{
                  ...S.tab(false, tokens.colors.watch),
                  width: "100%",
                  marginTop: 8,
                }}
              >
                Test as new user
              </button>
            )}

            {requireAuth && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
                style={{
                  ...S.tab(false, tokens.colors.alert),
                  width: "100%",
                  marginTop: 8,
                }}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      <GuidedTour />
    </>
  );
}
