import { z } from "zod";

import type { ApplicantProfile } from "@/domain/profile";
import type { RoadmapSeason } from "@/domain/roadmap";

/**
 * AI advice layered on top of the rule-based roadmap.
 *
 * Shared by the server (validating the model's reply) and the client
 * (validating what it cached), so both sides apply the same rules.
 */

/** Bump when the prompt or the shape changes, so stale cached advice is ignored. */
export const ROADMAP_ADVICE_VERSION = 1;

/** Same key on server and client: one profile, one model call. */
export function adviceCacheKey(profile: ApplicantProfile): string {
  return JSON.stringify([
    ROADMAP_ADVICE_VERSION,
    profile.grade,
    profile.gpa,
    profile.english,
    profile.budget,
    [...profile.fields].sort(),
    [...profile.regions].sort(),
  ]);
}

export const ADVICE_LIMITS = {
  summary: 320,
  stepAdvice: 260,
  extraTitle: 90,
  extraDetail: 240,
  maxSteps: 24,
  maxExtras: 3,
} as const;

export interface StepAdvice {
  id: string;
  advice: string;
}

export interface ExtraStep {
  season: RoadmapSeason;
  title: string;
  detail: string;
}

export interface RoadmapAdvice {
  summary: string | null;
  steps: StepAdvice[];
  extras: ExtraStep[];
}

export type RoadmapAdviceResponse =
  | { status: "ready"; advice: RoadmapAdvice; model: string }
  | { status: "unavailable" };

/**
 * Shape only. Lengths and content are checked per field in
 * `sanitizeRoadmapAdvice`, so one overlong sentence costs that sentence,
 * not the whole reply.
 */
const rawAdviceSchema = z.object({
  summary: z.string().optional(),
  steps: z.array(z.object({ id: z.string(), advice: z.string() })).optional(),
  extras: z
    .array(
      z.object({
        season: z.string(),
        title: z.string(),
        detail: z.string(),
      }),
    )
    .optional(),
});

/**
 * The model may not introduce a single number or link. Dates, prices,
 * scores, percentages and "sources" are exactly what the case forbids
 * inventing, and all of them need either a digit or a URL.
 */
const SEASONS: readonly RoadmapSeason[] = ["autumn", "winter", "spring"];

function isSeason(value: string): value is RoadmapSeason {
  return (SEASONS as readonly string[]).includes(value);
}

export function isSafeAdviceText(text: string, maxLength: number): boolean {
  return (
    text.length > 0 &&
    text.length <= maxLength &&
    !/\p{Nd}/u.test(text) &&
    !/https?:|www\./i.test(text)
  );
}

function clean(text: string): string {
  // Drop markdown emphasis and collapse whitespace; the UI renders plain text.
  return text.replace(/[*_#`]+/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Turns untrusted model output into advice the UI may show, or null when
 * nothing usable is left. Step advice is kept only for ids the rules
 * produced for this very profile.
 */
export function sanitizeRoadmapAdvice(
  raw: unknown,
  allowedStepIds: ReadonlySet<string>,
): RoadmapAdvice | null {
  const parsed = rawAdviceSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const summaryText = clean(parsed.data.summary ?? "");
  const summary = isSafeAdviceText(summaryText, ADVICE_LIMITS.summary) ? summaryText : null;

  const seen = new Set<string>();
  const steps: StepAdvice[] = [];
  for (const item of parsed.data.steps ?? []) {
    const advice = clean(item.advice);
    if (
      allowedStepIds.has(item.id) &&
      !seen.has(item.id) &&
      isSafeAdviceText(advice, ADVICE_LIMITS.stepAdvice)
    ) {
      seen.add(item.id);
      steps.push({ id: item.id, advice });
    }
  }

  const extras: ExtraStep[] = [];
  for (const item of parsed.data.extras ?? []) {
    const title = clean(item.title);
    const detail = clean(item.detail);
    if (
      isSeason(item.season) &&
      isSafeAdviceText(title, ADVICE_LIMITS.extraTitle) &&
      isSafeAdviceText(detail, ADVICE_LIMITS.extraDetail)
    ) {
      extras.push({ season: item.season, title, detail });
    }
  }

  const result: RoadmapAdvice = {
    summary,
    steps: steps.slice(0, ADVICE_LIMITS.maxSteps),
    extras: extras.slice(0, ADVICE_LIMITS.maxExtras),
  };
  const isEmpty = result.summary === null && result.steps.length === 0 && result.extras.length === 0;
  return isEmpty ? null : result;
}
