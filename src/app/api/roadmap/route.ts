import { parseApplicantProfile } from "@/domain/profile";
import { adviceCacheKey, type RoadmapAdviceResponse } from "@/features/roadmap/roadmapAdvice";
import { generateRoadmapAdvice } from "@/server/ai/adviceChain";
import { buildRoadmapPrompt } from "@/server/ai/roadmapPrompt";

// The model call is bounded well below this; the platform limit is a backstop.
export const maxDuration = 30;

// All providers together must finish before this, leaving headroom under maxDuration.
const MODEL_BUDGET_MS = 26_000;
const CACHE_LIMIT = 200;
/** Requests allowed to reach the providers per instance per minute: protects free-tier quotas. */
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
  const outcome = await generateRoadmapAdvice(prompt, Date.now() + MODEL_BUDGET_MS);

  if (!outcome.ok) {
    // Reasons only: the profile itself is never logged.
    console.warn(`[roadmap-ai] unavailable: ${outcome.failures.join(", ")}`);
    return Response.json(unavailable);
  }
  if (outcome.provider !== "gemini") {
    console.info(`[roadmap-ai] served by fallback ${outcome.provider} (${outcome.model})`);
  }

  const response: RoadmapAdviceResponse = {
    status: "ready",
    advice: outcome.advice,
    provider: outcome.provider,
    model: outcome.model,
  };
  remember(key, response);
  return Response.json(response);
}
