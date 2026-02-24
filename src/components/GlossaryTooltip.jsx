import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY } from "../data/glossary";
import { useTheme } from "../design-tokens";
import { S } from "../styles";

const VIEWPORT_MARGIN = 8;
const GAP = 10;

function normalizeTerm(term) {
  return (term || "").trim().toLowerCase();
}

const TERM_LOOKUP = Object.keys(GLOSSARY).reduce((lookup, key) => {
  lookup[normalizeTerm(key)] = key;
  return lookup;
}, {});

function resolveTerm(term) {
  const directKey = TERM_LOOKUP[normalizeTerm(term)];
  if (directKey) return directKey;

  return Object.keys(GLOSSARY).find((candidate) =>
    normalizeTerm(term).includes(normalizeTerm(candidate)),
  );
}

export default function GlossaryTooltip({ term, children }) {
  const { tokens } = useTheme();
  const anchorRef = useRef(null);
  const tooltipRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });

  const glossaryKey = useMemo(() => resolveTerm(term), [term]);
  const entry = glossaryKey ? GLOSSARY[glossaryKey] : null;

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const closeTooltip = () => {
    clearCloseTimer();
    setIsOpen(false);
    setIsPinned(false);
  };

  const scheduleClose = () => {
    if (isPinned) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  const updatePosition = () => {
    if (!anchorRef.current || !tooltipRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const spaceAbove = anchorRect.top;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const shouldPlaceAbove =
      spaceBelow < tooltipRect.height + GAP && spaceAbove > spaceBelow;
    const placement = shouldPlaceAbove ? "top" : "bottom";

    const desiredTop =
      placement === "top"
        ? anchorRect.top - tooltipRect.height - GAP
        : anchorRect.bottom + GAP;
    const desiredLeft =
      anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;

    const top = Math.min(
      Math.max(desiredTop, VIEWPORT_MARGIN),
      window.innerHeight - tooltipRect.height - VIEWPORT_MARGIN,
    );
    const left = Math.min(
      Math.max(desiredLeft, VIEWPORT_MARGIN),
      window.innerWidth - tooltipRect.width - VIEWPORT_MARGIN,
    );

    setPosition({ top, left, placement });
  };

  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    updatePosition();
    return undefined;
  }, [isOpen, term]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") closeTooltip();
    };
    const handleOutsideClick = (event) => {
      const target = event.target;
      if (anchorRef.current?.contains(target)) return;
      if (tooltipRef.current?.contains(target)) return;
      closeTooltip();
    };
    const syncPosition = () => updatePosition();

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("scroll", syncPosition, true);
    window.addEventListener("resize", syncPosition);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("scroll", syncPosition, true);
      window.removeEventListener("resize", syncPosition);
    };
  }, [isOpen]);

  useEffect(() => () => clearCloseTimer(), []);

  if (!entry) return <>{children}</>;

  const tooltipNode =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
            style={{
              ...S.card("rgba(233,196,106,0.28)"),
              position: "fixed",
              top: position.top,
              left: position.left,
              maxWidth: 320,
              zIndex: 200,
              marginBottom: 0,
              pointerEvents: "auto",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
              background: `linear-gradient(180deg, ${tokens.colors.surfaceRaised}, ${tokens.colors.surfaceSoft})`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: tokens.colors.accent,
                letterSpacing: "0.9px",
                textTransform: "uppercase",
                fontFamily: tokens.typography.fontMono,
                marginBottom: 6,
              }}
            >
              {glossaryKey}
            </div>
            <div
              style={{
                fontSize: 12,
                color: tokens.colors.textSecondary,
                lineHeight: 1.55,
                marginBottom: 8,
              }}
            >
              {entry.definition}
            </div>
            <div
              style={{
                fontSize: 11,
                color: tokens.colors.textMuted,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: tokens.colors.textSecondary }}>
                Analogy:
              </strong>{" "}
              {entry.analogy}
            </div>
            <div
              style={{
                position: "absolute",
                left: 18,
                width: 10,
                height: 10,
                transform: "rotate(45deg)",
                background: tokens.colors.border,
                borderLeft: "1px solid rgba(233,196,106,0.28)",
                borderTop: "1px solid rgba(233,196,106,0.28)",
                top: position.placement === "top" ? "calc(100% - 5px)" : -5,
                borderRight: "none",
                borderBottom: "none",
              }}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={anchorRef}
        tabIndex={0}
        role="button"
        aria-label={`Show definition for ${glossaryKey}`}
        aria-expanded={isOpen}
        onMouseEnter={() => {
          clearCloseTimer();
          setIsOpen(true);
        }}
        onMouseLeave={scheduleClose}
        onFocus={() => {
          clearCloseTimer();
          setIsOpen(true);
        }}
        onBlur={scheduleClose}
        onClick={(event) => {
          event.stopPropagation();
          clearCloseTimer();
          setIsPinned((current) => {
            const next = !current;
            setIsOpen(next);
            return next;
          });
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            clearCloseTimer();
            setIsPinned((current) => {
              const next = !current;
              setIsOpen(next);
              return next;
            });
          }
          if (event.key === "Escape") closeTooltip();
        }}
        style={{
          cursor: "help",
          textDecoration: "underline dotted rgba(233,196,106,0.6)",
          textUnderlineOffset: 3,
          color: "inherit",
          borderRadius: 3,
        }}
      >
        {children}
      </span>
      {tooltipNode}
    </>
  );
}
