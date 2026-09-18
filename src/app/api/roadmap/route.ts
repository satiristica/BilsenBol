import { parseApplicantProfile } from "@/domain/profile";
import {
  adviceCacheKey,
  sanitizeRoadmapAdvice,
  type RoadmapAdviceResponse,
} from "@/features/roadmap/roadmapAdvice";
import { generateJson } from "@/server/ai/gemini";
import { ROADMAP_SYSTEM_INSTRUCTION, buildRoadmapPrompt } from "@/server/ai/roadmapPrompt";

// The model call is bounded well below this; the platform limit is a backstop.
export const maxDuration = 30;

// Two model attempts of 12 s each stay inside maxDuration.
const MODEL_TIMEOUT_MS = 12_000;
const CACHE_LIMIT = 200;
/** Upstream calls allowed per instance per minute: protects the free-tier quota. */
const CALLS_PER_MINUTE = 20;

// Per-instance memory. Serverless instances do not share it, so the browser
// keeps its own cache as well; this one absorbs repeats within a warm instance.
const cache = new Map<string, RoadmapAdviceResponse>();
let windowStartedAt = 0;
let callsInWindow = 0;

function takeCallSlot(now: number): boolean {
  if (now - windowStartedAt > 60_000) {
    windowStartedAt = now;
    callsInWindow = 0;
  }
  if (callsInWindow >= CALLS_PER_MINUTE) {
    return false;
  }
  callsInWindow += 1;
  return true;
}

function remember(key: string, value: RoadmapAdviceResponse) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(key, value);
}

const unavailable: RoadmapAdviceResponse = { status: "unavailable" };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }

  const profile = parseApplicantProfile((body as { profile?: unknown } | null)?.profile);
  if (!profile || profile.fields.length === 0 || profile.regions.length === 0) {
    return Response.json({ error: "invalid-profile" }, { status: 400 });
  }

  const key = adviceCacheKey(profile);
  const cached = cache.get(key);
  if (cached) {
    return Response.json(cached);
  }

  if (!takeCallSlot(Date.now())) {
    return Response.json(unavailable);
  }

  // The skeleton is rebuilt here from the validated profile; nothing the
  // client says about its roadmap is trusted.
  const prompt = buildRoadmapPrompt(profile);
  const result = await generateJson({
    system: ROADMAP_SYSTEM_INSTRUCTION,
    user: prompt.user,
    jsonSchema: prompt.jsonSchema,
    timeoutMs: MODEL_TIMEOUT_MS,
  });

  if (!result.ok) {
    // Reason only: the profile itself is never logged.
    console.warn(`[roadmap-ai] unavailable: ${result.reason}${result.status ? ` ${result.status}` : ""}`);
    return Response.json(unavailable);
  }

  const advice = sanitizeRoadmapAdvice(result.data, prompt.allowedStepIds);
  if (!advice) {
    console.warn("[roadmap-ai] unavailable: nothing usable after validation");
    return Response.json(unavailable);
  }

  const response: RoadmapAdviceResponse = { status: "ready", advice, model: result.model };
  remember(key, response);
  return Response.json(response);
}
