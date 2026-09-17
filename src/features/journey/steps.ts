/**
 * Step identity is shared between the server route (which reads the URL) and
 * the client experience, so it must stay out of the "use client" module.
 */
export type JourneyStep = "profile" | "diagnosis" | "recommendations" | "roadmap";

export const STEP_ORDER: readonly JourneyStep[] = [
  "profile",
  "diagnosis",
  "recommendations",
  "roadmap",
];

export const STEP_NAMES: Record<JourneyStep, string> = {
  profile: "Профиль",
  diagnosis: "Диагностика",
  recommendations: "Подбор",
  roadmap: "План",
};

export function isJourneyStep(value: unknown): value is JourneyStep {
  return typeof value === "string" && STEP_ORDER.includes(value as JourneyStep);
}
