import {
  sanitizeRoadmapAdvice,
  type AiProvider,
  type RoadmapAdvice,
} from "@/features/roadmap/roadmapAdvice";

import { generateJsonWithGemini } from "./gemini";
import { generateJsonWithGroq } from "./groq";
import { ROADMAP_SYSTEM_INSTRUCTION, type RoadmapPrompt } from "./roadmapPrompt";
import { MIN_ATTEMPT_MS, type AiResult, type JsonRequest } from "./types";

export interface AdviceProvider {
  name: AiProvider;
  generate: (request: JsonRequest) => Promise<AiResult>;
  attemptTimeoutMs: number;
}

/**
 * Gemini first, Groq as the fallback. Per-attempt ceilings (two models each)
 * add up to about the route's deadline, so the fallback still gets time when
 * Gemini is slow.
 */
export const DEFAULT_PROVIDERS: readonly AdviceProvider[] = [
  { name: "gemini", generate: generateJsonWithGemini, attemptTimeoutMs: 8_000 },
  { name: "groq", generate: generateJsonWithGroq, attemptTimeoutMs: 6_000 },
];

export type AdviceOutcome =
  | { ok: true; advice: RoadmapAdvice; provider: AiProvider; model: string }
  | { ok: false; failures: string[] };

/**
 * Asks each provider in turn and validates before accepting. A provider that
 * answers with nothing usable counts as a failure, so the next one gets a
 * chance. Failures carry reasons only, never profile data.
 */
export async function generateRoadmapAdvice(
  prompt: RoadmapPrompt,
  deadline: number,
  providers: readonly AdviceProvider[] = DEFAULT_PROVIDERS,
): Promise<AdviceOutcome> {
  const failures: string[] = [];
  for (const provider of providers) {
    if (deadline - Date.now() < MIN_ATTEMPT_MS) {
      failures.push(`${provider.name}:no-time`);
      break;
    }
    const result = await provider.generate({
      system: ROADMAP_SYSTEM_INSTRUCTION,
      user: prompt.user,
      jsonSchema: prompt.jsonSchema,
      attemptTimeoutMs: provider.attemptTimeoutMs,
      deadline,
    });
    if (!result.ok) {
      failures.push(`${provider.name}:${result.reason}${result.status ? ` ${result.status}` : ""}`);
      continue;
    }
    const advice = sanitizeRoadmapAdvice(result.data, prompt.allowedStepIds);
    if (advice) {
      return { ok: true, advice, provider: provider.name, model: result.model };
    }
    failures.push(`${provider.name}:invalid`);
  }
  return { ok: false, failures };
}
