import { useState } from "react";
import { useTheme } from "../../design-tokens";
import { S } from "../../styles";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const { tokens } = useTheme();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "magic") {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
        });
        if (otpError) throw otpError;
        setMessage("Check your email for a magic link.");
      } else if (mode === "signup") {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signupError) throw signupError;
        setMessage("Check your email for a confirmation link.");
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitLabel =
    mode === "login"
      ? "Sign In"
      : mode === "signup"
        ? "Create Account"
        : "Send Magic Link";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: tokens.colors.bg,
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: tokens.typography.sizes.label,
              fontFamily: tokens.typography.fontMono,
              color: tokens.colors.textSoft,
              letterSpacing: tokens.typography.letterSpacing.mono,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Asymmetric Bridge
          </div>
          <div
            style={{
              fontSize: tokens.typography.sizes.h1,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text,
            }}
          >
            {mode === "login"
              ? "Sign In"
              : mode === "signup"
                ? "Create Account"
                : "Magic Link"}
          </div>
        </div>

        <div style={S.card("rgba(255,255,255,0.08)")}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label htmlFor="auth-email" style={S.label}>
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  style={inputStyle}
                />
              </div>

              {mode !== "magic" && (
                <div>
                  <label htmlFor="auth-password" style={S.label}>
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    style={inputStyle}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...S.tab(true, tokens.colors.baseline),
                  width: "100%",
                  padding: "10px",
                  fontSize: tokens.typography.sizes.body,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Please wait..." : submitLabel}
              </button>
            </div>
          </form>

          {error && (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: tokens.colors.alert,
              }}
            >
              {error}
            </div>
          )}
          {message && (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: tokens.colors.baseline,
              }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {mode !== "login" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                style={{
                  ...S.tab(false, tokens.colors.textMuted),
                  fontSize: 11,
                }}
              >
                Sign In
              </button>
            )}
            {mode !== "signup" && (
              <button
                type="button"
                onClick={() => switchMode("signup")}
                style={{
                  ...S.tab(false, tokens.colors.textMuted),
                  fontSize: 11,
                }}
              >
                Create Account
              </button>
            )}
            {mode !== "magic" && (
              <button
                type="button"
                onClick={() => switchMode("magic")}
                style={{
                  ...S.tab(false, tokens.colors.textMuted),
                  fontSize: 11,
                }}
              >
                Magic Link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: 8,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#E8E4DF",
  padding: "9px 10px",
  fontSize: 12,
  fontFamily: "'IBM Plex Sans', sans-serif",
  boxSizing: "border-box",
};
