function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryable(error) {
  if (!error || typeof error !== "object") {
    return true;
  }

  if ("retryable" in error) {
    return Boolean(error.retryable);
  }

  return true;
}

export async function withRetry(
  fn,
  { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = {},
) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const data = await fn();
      return { data, error: null, attempts: attempt + 1 };
    } catch (error) {
      const attempts = attempt + 1;
      const shouldRetry = attempt < maxRetries && isRetryable(error);

      if (!shouldRetry) {
        return { data: null, error, attempts };
      }

      const jitter = Math.floor(Math.random() * 501);
      const delay = Math.min(baseDelay * 2 ** attempt, maxDelay) + jitter;

      if (typeof onRetry === "function") {
        try {
          onRetry({
            attempt,
            attempts,
            maxRetries,
            delay,
            error,
          });
        } catch {
          // Ignore callback errors so retry behavior stays deterministic.
        }
      }

      await sleep(delay);
      attempt += 1;
    }
  }

  return {
    data: null,
    error: new Error("Retry loop exited unexpectedly"),
    attempts: maxRetries + 1,
  };
}
