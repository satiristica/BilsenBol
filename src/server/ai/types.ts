/** Shared by every model provider: callers never see provider-specific errors. */

export type AiFailure = "no-key" | "timeout" | "http" | "blocked" | "malformed";

export type AiResult =
  | { ok: true; data: unknown; model: string }
  | { ok: false; reason: AiFailure; status?: number };

export interface JsonRequest {
  system: string;
  user: string;
  jsonSchema: Record<string, unknown>;
  /** Ceiling for one model attempt. */
  attemptTimeoutMs: number;
  /** Absolute time (ms since epoch) after which no attempt may run. */
  deadline: number;
}

/** Below this much time left before the shared deadline, no new attempt starts. */
export const MIN_ATTEMPT_MS = 1_500;

/** Env var holding a comma-separated model list, or the given defaults. */
export function modelList(envValue: string | undefined, defaults: readonly string[]): string[] {
  const configured = (envValue ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : [...defaults];
}

/**
 * Runs `attempt` for each model in order. Overload, quota, timeout and HTTP
 * errors move on to the next model; blocked or malformed answers stop the
 * chain, because the same prompt is no safer or better-formed on a sibling.
 */
export async function tryModels(
  models: readonly string[],
  request: JsonRequest,
  attempt: (model: string, timeoutMs: number) => Promise<AiResult>,
): Promise<AiResult> {
  let lastFailure: AiResult = { ok: false, reason: "timeout" };
  for (const model of models) {
    // The floor applies to what is left of the shared deadline, not to the
    // attempt's own ceiling, which may legitimately be short.
    const remaining = request.deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) {
      break;
    }
    const result = await attempt(model, Math.min(request.attemptTimeoutMs, remaining));
    if (result.ok || (result.reason !== "timeout" && result.reason !== "http")) {
      return result;
    }
    lastFailure = result;
  }
  return lastFailure;
}
