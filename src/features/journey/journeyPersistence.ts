import { DEFAULT_PROFILE, parseApplicantProfile, type ApplicantProfile } from "@/domain/profile";
import { readJson, removeKey, writeJson } from "@/lib/browserStorage";

import { isJourneyStep, type JourneyStep } from "./steps";

/** Bump when the stored shape changes; older payloads are then discarded. */
const STORAGE_VERSION = 1;
const STORAGE_KEY = "bilsenbol.journey";
/** Roadmaps have about a dozen steps; anything far larger is not ours. */
const MAX_STORED_STEP_IDS = 100;

export interface JourneySnapshot {
  profile: ApplicantProfile;
  step: JourneyStep;
  completedStepIds: string[];
}

interface StoredJourney extends JourneySnapshot {
  version: typeof STORAGE_VERSION;
}

export function parseStoredJourney(value: unknown): JourneySnapshot | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== STORAGE_VERSION) {
    return null;
  }

  const profile = parseApplicantProfile(candidate.profile);
  const { step, completedStepIds } = candidate;
  if (
    profile === null ||
    !isJourneyStep(step) ||
    !Array.isArray(completedStepIds) ||
    completedStepIds.length > MAX_STORED_STEP_IDS ||
    !completedStepIds.every((id) => typeof id === "string")
  ) {
    return null;
  }

  return { profile, step, completedStepIds: [...new Set(completedStepIds as string[])] };
}

function isProfileReady(profile: ApplicantProfile): boolean {
  return profile.fields.length > 0 && profile.regions.length > 0;
}

interface InitialJourneyInput {
  /** Profile of a preset requested through the URL, if any. */
  presetProfile: ApplicantProfile | null;
  /** Step requested through the URL, if any. */
  requestedStep: JourneyStep | null;
  stored: JourneySnapshot | null;
}

/**
 * Decides where the journey starts.
 * An explicit preset is a request to begin from that example, so it wins over
 * saved progress and starts with a clean roadmap. Without one, the saved
 * session is restored. A step that needs a complete profile falls back to the
 * profile step when the profile is not complete.
 */
export function resolveInitialJourney({
  presetProfile,
  requestedStep,
  stored,
}: InitialJourneyInput): JourneySnapshot {
  const base: JourneySnapshot = presetProfile
    ? { profile: presetProfile, step: "diagnosis", completedStepIds: [] }
    : (stored ?? { profile: DEFAULT_PROFILE, step: "profile", completedStepIds: [] });

  const step = requestedStep ?? base.step;
  return {
    ...base,
    step: step !== "profile" && !isProfileReady(base.profile) ? "profile" : step,
  };
}

export function loadJourney(): JourneySnapshot | null {
  return parseStoredJourney(readJson(STORAGE_KEY));
}

export function saveJourney(snapshot: JourneySnapshot): void {
  const payload: StoredJourney = { version: STORAGE_VERSION, ...snapshot };
  writeJson(STORAGE_KEY, payload);
}

export function clearJourney(): void {
  removeKey(STORAGE_KEY);
}
