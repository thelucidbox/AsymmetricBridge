import { createElement } from "react";
import { getThemeTokens, useTheme } from "./design-tokens";

function buildStatusConfig(tokens) {
  return {
    green: {
      label: "Baseline",
      bg: tokens.colors.baselineBg,
      border: tokens.colors.baselineBorder,
      dot: tokens.colors.baseline,
      text: tokens.colors.baseline,
    },
    amber: {
      label: "Watch",
      bg: tokens.colors.watchBg,
      border: tokens.colors.watchBorder,
      dot: tokens.colors.watch,
      text: tokens.colors.watchText,
    },
    red: {
      label: "Alert",
      bg: tokens.colors.alertBg,
      border: tokens.colors.alertBorder,
      dot: tokens.colors.alert,
      text: tokens.colors.alert,
    },
  };
}

export const STATUS_CFG = {
  get green() {
    return buildStatusConfig(getThemeTokens()).green;
  },
  get amber() {
    return buildStatusConfig(getThemeTokens()).amber;
  },
  get red() {
    return buildStatusConfig(getThemeTokens()).red;
  },
};

function maybeGlassCard(tokens) {
  if (!tokens.useGlass) return {};
  return {
    backdropFilter: tokens.glass.blur,
    WebkitBackdropFilter: tokens.glass.blur,
    boxShadow: tokens.glass.shadow,
    willChange: "transform",
  };
}

export const S = {
  get label() {
    const tokens = getThemeTokens();
    return {
      fontSize: tokens.typography.sizes.label,
      color: tokens.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: tokens.typography.letterSpacing.label,
      marginBottom: tokens.spacing.labelMarginBottom,
      fontFamily: tokens.typography.fontMono,
    };
  },

  card: (borderColor) => {
    const tokens = getThemeTokens();
    return {
      background: tokens.colors.surface,
      border: `${tokens.shape.borderWidth}px solid ${borderColor || tokens.colors.border}`,
      borderRadius: tokens.shape.cardRadius,
      padding: tokens.spacing.cardPadding,
      marginBottom: tokens.spacing.cardMarginBottom,
      ...maybeGlassCard(tokens),
    };
  },

  tab: (isActive, accentColor) => {
    const tokens = getThemeTokens();
    const activeColor = accentColor || tokens.colors.accent;

    return {
      padding: tokens.spacing.tabPadding,
      fontSize: tokens.typography.sizes.tab,
      fontWeight: isActive ? tokens.typography.weights.bold : tokens.typography.weights.medium,
      color: isActive ? activeColor : tokens.colors.textSoft,
      background: isActive ? `${activeColor}15` : "transparent",
      border: `${tokens.shape.borderWidth}px solid ${isActive ? `${activeColor}33` : "transparent"}`,
      borderRadius: tokens.shape.tabRadius,
      cursor: "pointer",
      transition: tokens.motion.default,
    };
  },

  sectionTab: (isActive, accentColor) => {
    const tokens = getThemeTokens();
    const activeColor = accentColor || tokens.colors.accent;

    return {
      padding: tokens.spacing.sectionPadding,
      fontSize: tokens.typography.sizes.sectionTab,
      fontWeight: isActive ? tokens.typography.weights.bold : tokens.typography.weights.medium,
      color: isActive ? tokens.colors.text : tokens.colors.textMuted,
      background: isActive ? `${activeColor}18` : "transparent",
      border: `${tokens.shape.borderWidth}px solid ${isActive ? `${activeColor}44` : tokens.colors.border}`,
      borderRadius: tokens.shape.sectionTabRadius,
      cursor: "pointer",
      transition: tokens.motion.default,
      letterSpacing: tokens.typography.letterSpacing.sectionTab,
    };
  },
};

export const Badge = ({ text, color }) => {
  const { tokens } = useTheme();
  const activeTokens = tokens || getThemeTokens();
  const badgeColor = color || activeTokens.colors.accent;

  return createElement(
    "span",
    {
      style: {
        fontSize: activeTokens.typography.sizes.badge,
        fontWeight: activeTokens.typography.weights.bold,
        fontFamily: activeTokens.typography.fontSans,
        color: badgeColor,
        background: `${badgeColor}15`,
        padding: activeTokens.spacing.badgePadding,
        borderRadius: activeTokens.shape.badgeRadius,
        letterSpacing: activeTokens.typography.letterSpacing.badge,
      },
    },
    text,
  );
};
