// BYO LLM — Provider-agnostic AI layer
// Users bring their own API keys for Claude, OpenAI, or Gemini.
// Keys stored in localStorage only — never sent to our server.

const PROVIDER_CONFIGS = {
  anthropic: {
    name: "Claude (Anthropic)",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    keyPrefix: "sk-ant-",
    buildRequest: (apiKey, systemPrompt, userPrompt) => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    }),
    parseResponse: (data) => data?.content?.[0]?.text ?? "",
  },

  openai: {
    name: "GPT (OpenAI)",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
    keyPrefix: "sk-",
    buildRequest: (apiKey, systemPrompt, userPrompt) => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    }),
    parseResponse: (data) => data?.choices?.[0]?.message?.content ?? "",
  },

  gemini: {
    name: "Gemini (Google)",
    endpoint:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    model: "gemini-2.5-flash",
    keyPrefix: "AI",
    buildRequest: (apiKey, systemPrompt, userPrompt) => ({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Gemini uses URL-based auth
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 2048 },
      }),
    }),
    parseResponse: (data) =>
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
  },
};

const STORAGE_KEY = "ab-ai-provider";
const API_KEY_PREFIX = "ab-ai-key-";

export function getConfiguredProvider() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

export function setProvider(providerId) {
  if (!PROVIDER_CONFIGS[providerId]) return false;
  localStorage.setItem(STORAGE_KEY, providerId);
  return true;
}

export function getApiKey(providerId) {
  return localStorage.getItem(API_KEY_PREFIX + providerId) || null;
}

export function setApiKey(providerId, key) {
  localStorage.setItem(API_KEY_PREFIX + providerId, key);
}

export function removeApiKey(providerId) {
  localStorage.removeItem(API_KEY_PREFIX + providerId);
}

export function isAIConfigured() {
  const provider = getConfiguredProvider();
  if (!provider) return false;
  return !!getApiKey(provider);
}

export function getAvailableProviders() {
  return Object.entries(PROVIDER_CONFIGS).map(([id, config]) => ({
    id,
    name: config.name,
    model: config.model,
    configured: !!getApiKey(id),
  }));
}

export async function callAI(systemPrompt, userPrompt) {
  const providerId = getConfiguredProvider();
  if (!providerId) throw new Error("No AI provider configured");

  const apiKey = getApiKey(providerId);
  if (!apiKey) throw new Error(`No API key for ${providerId}`);

  const config = PROVIDER_CONFIGS[providerId];
  if (!config) throw new Error(`Unknown provider: ${providerId}`);

  const request = config.buildRequest(apiKey, systemPrompt, userPrompt);
  const url = request.url || config.endpoint;

  const response = await fetch(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI request failed (${response.status}): ${error}`);
  }

  const data = await response.json();
  return config.parseResponse(data);
}

// Validate an API key by making a minimal request
export async function testApiKey(providerId, apiKey) {
  const config = PROVIDER_CONFIGS[providerId];
  if (!config) return { valid: false, error: "Unknown provider" };

  try {
    const request = config.buildRequest(apiKey, "Reply with OK", "Test");
    const url = request.url || config.endpoint;

    const response = await fetch(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    if (response.ok) {
      return { valid: true };
    }

    const status = response.status;
    if (status === 401 || status === 403) {
      return { valid: false, error: "Invalid API key" };
    }
    return { valid: false, error: `API returned ${status}` };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
