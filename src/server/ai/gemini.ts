/**
 * Minimal Gemini adapter over the REST `generateContent` endpoint.
 *
 * Stateless on purpose: the newer Interactions API stores requests server-side
 * by default, and we send data about school students. Plain `fetch` keeps the
 * integration dependency-free. The adapter never throws; callers get a reason.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
/**
 * Chosen by live measurement on the free tier (2026-09-18): gemini-3.8-flash
 * timed out even on a one-word prompt and gemini-3.5-flash returned 503 "high
 * demand"; gemini-2.5-flash rejects our step-id enum as "too many states". The
 * lite models answered the full roadmap prompt in about four seconds.
 */
const DEFAULT_MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

export type GeminiFailure = "no-key" | "timeout" | "http" | "blocked" | "malformed";

export type GeminiResult =
  | { ok: true; data: unknown; model: string }
  | { ok: false; reason: GeminiFailure; status?: number };

interface GenerateJsonRequest {
  system: string;
  user: string;
  jsonSchema: Record<string, unknown>;
  /** Per model attempt; the fallback model gets its own budget. */
  timeoutMs: number;
}

interface GeminiPart {
  text?: string;
  /** Thought summaries are not part of the answer. */
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

/** `GEMINI_MODEL` may list several models, comma-separated, in order of preference. */
export function geminiModels(): string[] {
  const configured = (process.env.GEMINI_MODEL ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : DEFAULT_MODELS;
}

/**
 * Tries each model in turn. Overload, quota, timeout and HTTP errors move on
 * to the next model; a blocked or malformed answer does not, since another
 * model given the same prompt is no more likely to be safe or well-formed.
 */
export async function generateJson(request: GenerateJsonRequest): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "no-key" };
  }

  let lastFailure: GeminiResult = { ok: false, reason: "http" };
  for (const model of geminiModels()) {
    const result = await attempt(model, apiKey, request);
    if (result.ok || (result.reason !== "timeout" && result.reason !== "http")) {
      return result;
    }
    lastFailure = result;
  }
  return lastFailure;
}

async function attempt(
  model: string,
  apiKey: string,
  { system, user, jsonSchema, timeoutMs }: GenerateJsonRequest,
): Promise<GeminiResult> {
  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.4,
          // Thinking tokens count toward this limit, so leave room for them.
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseJsonSchema: jsonSchema,
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    return { ok: false, reason: isTimeout ? "timeout" : "http" };
  }

  if (!response.ok) {
    return { ok: false, reason: "http", status: response.status };
  }

  let body: GeminiResponse;
  try {
    body = (await response.json()) as GeminiResponse;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (body.promptFeedback?.blockReason) {
    return { ok: false, reason: "blocked" };
  }
  const candidate = body.candidates?.[0];
  // Anything but a natural stop (length cut-off, safety stop) is an unreliable answer.
  if (!candidate || candidate.finishReason !== "STOP") {
    return { ok: false, reason: candidate?.finishReason === "SAFETY" ? "blocked" : "malformed" };
  }

  const text = (candidate.content?.parts ?? [])
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
  try {
    return { ok: true, data: JSON.parse(text) as unknown, model };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}
