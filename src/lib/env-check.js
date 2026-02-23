const REQUIRED_ENV_VARS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const OPTIONAL_ENV_VARS = ["VITE_FRED_API_KEY", "VITE_TWELVE_DATA_KEY"];

export function validateEnv() {
  const missing = [];
  const warnings = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL_ENV_VARS) {
    if (!import.meta.env[key]) {
      warnings.push(
        `${key} is not set. Related live data integrations will be disabled.`,
      );
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
