/* eslint-disable react-refresh/only-export-components */
import { Component } from "react";
import { useTheme } from "../design-tokens";
import { S } from "../styles";

function DefaultFallback({ error, onRetry }) {
  const { tokens } = useTheme();
  return (
    <div
      style={{
        ...S.card("rgba(230,57,70,0.2)"),
        background: "rgba(230,57,70,0.08)",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: tokens.colors.alert,
          marginBottom: 6,
        }}
      >
        Something went wrong
      </div>
      <div
        style={{
          fontSize: 11,
          color: tokens.colors.textMuted,
          marginBottom: 10,
        }}
      >
        This section failed to render. Try reloading this section.
      </div>
      {error && (
        <div
          style={{
            fontSize: 10,
            color: tokens.colors.textSoft,
            marginBottom: 10,
            fontFamily: tokens.typography.fontMono,
          }}
        >
          {error.message}
        </div>
      )}
      <button onClick={onRetry} style={S.sectionTab(true, tokens.colors.alert)}>
        Retry
      </button>
    </div>
  );
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
    if (typeof this.props.onError === "function") {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { fallback } = this.props;
    if (typeof fallback === "function") {
      return fallback(this.state.error, this.handleRetry);
    }

    if (fallback) {
      return fallback;
    }

    return (
      <DefaultFallback error={this.state.error} onRetry={this.handleRetry} />
    );
  }
}
