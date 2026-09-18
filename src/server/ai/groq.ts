/**
 * Groq adapter over its OpenAI-compatible chat completions endpoint, used as
 * the fallback provider. Plain `fetch`, no SDK; never throws.
 */

import { modelList, tryModels, type AiResult, type JsonRequest } from "./types";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
/**
 * Chosen by live measurement (2026-09-18) on the real roadmap prompt with a
 * strict schema: gpt-oss-120b answered in 2.3 s and stayed closest to the
 * profile; gpt-oss-20b in 1.0 s. Both passed the validator with zero digits.
 */
const DEFAULT_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];

interface GroqResponse {
  choices?: { message?: { content?: string | null }; finish_reason?: string }[];
}

export function groqModels(): string[] {
  return modelList(process.env.GROQ_MODEL, DEFAULT_MODELS);
}

/**
 * Groq's strict mode requires `additionalProperties: false` on every object.
 * Derived here so the Gemini schema, which is verified live, stays untouched.
 */
export function toStrictSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map(toStrictSchema);
  }
  if (typeof schema !== "object" || schema === null) {
    return schema;
  }
  const strict: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) {
    strict[key] = toStrictSchema(value);
  }
  if (strict.type === "object") {
    strict.additionalProperties = false;
  }
  return strict;
}

/** Keep reasoning short and out of the answer; the knobs differ by model family. */
function reasoningOptions(model: string): Record<string, unknown> {
  if (model.startsWith("openai/gpt-oss")) {
    return { reasoning_effort: "low", include_reasoning: false };
  }
  if (model.startsWith("qwen/")) {
    return { reasoning_effort: "none", reasoning_format: "hidden" };
  }
  return {};
}

export async function generateJsonWithGroq(request: JsonRequest): Promise<AiResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "no-key" };
  }
  return tryModels(groqModels(), request, (model, timeoutMs) =>
    attempt(model, apiKey, request, timeoutMs),
  );
}

async function attempt(
  model: string,
  apiKey: string,
  { system, user, jsonSchema }: JsonRequest,
  timeoutMs: number,
): Promise<AiResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_completion_tokens: 8192,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "roadmap_advice", strict: true, schema: toStrictSchema(jsonSchema) },
        },
        ...reasoningOptions(model),
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

  let body: GroqResponse;
  try {
    body = (await response.json()) as GroqResponse;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const choice = body.choices?.[0];
  if (choice?.finish_reason === "content_filter") {
    return { ok: false, reason: "blocked" };
  }
  // "length" means the JSON was cut off; anything but a natural stop is unreliable.
  if (!choice || choice.finish_reason !== "stop" || typeof choice.message?.content !== "string") {
    return { ok: false, reason: "malformed" };
  }
  try {
    return { ok: true, data: JSON.parse(choice.message.content) as unknown, model };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}
