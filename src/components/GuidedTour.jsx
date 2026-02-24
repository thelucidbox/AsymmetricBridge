import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useThesis } from "../config/ThesisContext";
import { useTheme } from "../design-tokens";
import { getFredApiKey } from "../lib/fred";
import { getTwelveDataApiKey } from "../lib/stocks";
import { S } from "../styles";

const TOUR_STORAGE_KEY = "ab-guided-tour-complete";
const EDGE = 12;
const TARGET_PADDING = 6;

const ALL_TOUR_STEPS = [
  {
    id: "domino-cascade",
    title: "Domino Cascade Overview",
    selector: '[data-tour="domino-cascade"]',
    description:
      "Each domino is a disruption vector. Heat and status mix tell you where stress is starting and where it may spread next.",
  },
  {
    id: "signal-cards",
    title: "Signal Cards",
    selector: '[data-tour="signal-cards"]',
    description:
      "Every signal is one measurable checkpoint. Status colors give the quick read, and full mode lets you expand for deeper context.",
  },
  {
    id: "status-colors",
    title: "Status Colors",
    selector: '[data-tour="status-colors"]',
    description:
      "Green means baseline, amber means watch, and red means alert. Treat color shifts as momentum changes, not one-off noise.",
  },
  {
    id: "thresholds",
    title: "How to Read Thresholds",
    selector: '[data-tour="thresholds"]',
    description:
      "Baselines define normal. Thresholds define escalation. When a signal crosses its threshold, the domino risk level should be reconsidered.",
  },
  {
    id: "portfolio",
    title: "Thesis & Portfolio",
    selector: '[data-tour="section-portfolio-tab"]',
    description:
      "This section connects the macro thesis to positioning. Upload your portfolio CSV and map signal movement to practical decision points.",
  },
];

function markTourComplete() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
}

function hasCompletedTour() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
}

function findTarget(selector) {
  if (typeof document === "undefined") return null;
  return document.querySelector(selector);
}

export default function GuidedTour() {
  const location = useLocation();
  const { hasThesis } = useThesis();
  const { tokens } = useTheme();
  const cardRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [cardPosition, setCardPosition] = useState({ top: EDGE, left: EDGE });

  const hasApiKeys = getFredApiKey() || getTwelveDataApiKey();

  const steps = useMemo(() => {
    return ALL_TOUR_STEPS.map((s) => {
      if (!hasApiKeys && s.id === "signal-cards") {
        return {
          ...s,
          description:
            s.description +
            " Currently using sample data — add API keys for live updates.",
        };
      }
      return s;
    });
  }, [hasApiKeys]);

  const step = steps[stepIndex] || steps[0];

  const openTour = useCallback(() => {
    previousFocusRef.current = document.activeElement;
    setIsOpen(true);
    setStepIndex(0);
  }, []);

  const closeTour = useCallback(() => {
    markTourComplete();
    setIsOpen(false);
    previousFocusRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsOpen(false);
      return;
    }
    if (!hasThesis) return;
    if (!hasCompletedTour()) openTour();
  }, [location.pathname, hasThesis, openTour]);

  useEffect(() => {
    if (isOpen && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isOpen, stepIndex]);

  const alignSectionForStep = () => {
    if (typeof document === "undefined" || !step) return;

    if (
      step.id === "domino-cascade" ||
      step.id === "signal-cards" ||
      step.id === "status-colors" ||
      step.id === "thresholds"
    ) {
      const signalsButton = findTarget('[data-tour="section-signals"]');
      const signalTarget = findTarget('[data-tour="signal-cards"]');
      if (!signalTarget) signalsButton?.click();
    } else if (step.id === "portfolio") {
      const portfolioTab = findTarget('[data-tour="section-portfolio-tab"]');
      const portfolioTarget = findTarget('[data-tour="portfolio-section"]');
      if (!portfolioTarget) portfolioTab?.click();
    }

    if (step.id === "thresholds" && !findTarget('[data-tour="thresholds"]')) {
      const firstSignalCard = findTarget('[data-tour="signal-card"]');
      firstSignalCard?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    }
  };

  const updateLayout = () => {
    if (!isOpen || !step) return;
    const target = findTarget(step.selector);
    const rect = target?.getBoundingClientRect();
    setTargetRect(
      rect
        ? {
            top: Math.max(rect.top - TARGET_PADDING, EDGE),
            left: Math.max(rect.left - TARGET_PADDING, EDGE),
            width: Math.min(
              rect.width + TARGET_PADDING * 2,
              window.innerWidth - EDGE * 2,
            ),
            height: Math.min(
              rect.height + TARGET_PADDING * 2,
              window.innerHeight - EDGE * 2,
            ),
          }
        : null,
    );

    const cardWidth = cardRef.current?.offsetWidth || 320;
    const cardHeight = cardRef.current?.offsetHeight || 220;

    if (!rect) {
      setCardPosition({
        top: Math.max((window.innerHeight - cardHeight) / 2, EDGE),
        left: Math.max((window.innerWidth - cardWidth) / 2, EDGE),
      });
      return;
    }

    const belowTop = rect.bottom + 16;
    const aboveTop = rect.top - cardHeight - 16;
    const top =
      belowTop + cardHeight <= window.innerHeight - EDGE
        ? belowTop
        : Math.max(aboveTop, EDGE);
    const left = Math.min(
      Math.max(rect.left, EDGE),
      window.innerWidth - cardWidth - EDGE,
    );

    setCardPosition({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    alignSectionForStep();
    const warmup = window.setTimeout(updateLayout, 120);

    const onReflow = () => updateLayout();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);

    return () => {
      window.clearTimeout(warmup);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeTour();
        return;
      }
      if (event.key === "Tab" && cardRef.current) {
        const focusable = cardRef.current.querySelectorAll(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeTour]);

  const isLast = stepIndex === steps.length - 1;
  const progressText = useMemo(
    () => `Step ${stepIndex + 1} of ${steps.length}`,
    [stepIndex, steps.length],
  );

  if (!isOpen || location.pathname !== "/" || !step) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guided tour"
      style={{ position: "fixed", inset: 0, zIndex: 160 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
        }}
      />

      {targetRect && (
        <div
          style={{
            position: "absolute",
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: 12,
            border: "2px solid rgba(233,196,106,0.85)",
            boxShadow: "0 0 0 200vmax rgba(0,0,0,0.58)",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        aria-live="polite"
        style={{
          ...S.card("rgba(233,196,106,0.42)"),
          position: "absolute",
          top: cardPosition.top,
          left: cardPosition.left,
          width: "min(92vw, 360px)",
          marginBottom: 0,
          background:
            "linear-gradient(180deg, rgba(20,20,25,0.98), rgba(13,13,15,0.98))",
          boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: tokens.colors.accent,
              fontWeight: 700,
              letterSpacing: "0.9px",
              textTransform: "uppercase",
              fontFamily: tokens.typography.fontMono,
            }}
          >
            Guided Tour
          </span>
          <span
            style={{
              fontSize: 10,
              color: tokens.colors.textMuted,
              fontFamily: tokens.typography.fontMono,
            }}
          >
            {progressText}
          </span>
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          {step.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: tokens.colors.textSecondary,
            lineHeight: 1.6,
            marginBottom: 14,
          }}
        >
          {step.description}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button
            onClick={closeTour}
            style={{
              ...S.tab(false, tokens.colors.watch),
              borderColor: tokens.colors.borderStrong,
              color: tokens.colors.textSecondary,
            }}
          >
            Skip
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() =>
                setStepIndex((current) => Math.max(current - 1, 0))
              }
              disabled={stepIndex === 0}
              style={{
                ...S.tab(stepIndex > 0, tokens.colors.dominoPolicy),
                opacity: stepIndex === 0 ? 0.5 : 1,
                cursor: stepIndex === 0 ? "not-allowed" : "pointer",
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (isLast) {
                  closeTour();
                  return;
                }
                setStepIndex((current) =>
                  Math.min(current + 1, steps.length - 1),
                );
              }}
              style={S.tab(true, tokens.colors.accent)}
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
