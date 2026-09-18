"use client";

import { useEffect, useState } from "react";

import type { ApplicantProfile } from "@/domain/profile";
import { useIsClient } from "@/lib/useIsClient";

import { JourneyExperience } from "./JourneyExperience";
import { loadJourney, resolveInitialJourney } from "./journeyPersistence";
import { JourneySkeleton } from "./JourneySkeleton";
import type { JourneyStep } from "./steps";

interface JourneyEntryProps {
  presetProfile: ApplicantProfile | null;
  requestedStep: JourneyStep | null;
}

/**
 * The saved journey lives in localStorage, which the server cannot see.
 * `isClient` is false during the server render and during hydration, so both
 * sides produce the same skeleton; only after hydration does the client read
 * storage and mount the real journey. No hydration mismatch, no effect-driven
 * state update.
 */
export function JourneyEntry({ presetProfile, requestedStep }: JourneyEntryProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return <JourneySkeleton />;
  }
  return <RestoredJourney presetProfile={presetProfile} requestedStep={requestedStep} />;
}

function RestoredJourney({ presetProfile, requestedStep }: JourneyEntryProps) {
  const [initial] = useState(() =>
    resolveInitialJourney({ presetProfile, requestedStep, stored: loadJourney() }),
  );

  // `?preset` and `?step` are one-shot instructions. Once applied they are
  // dropped from the address, so a reload restores the saved session instead
  // of re-applying the preset over the user's progress.
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return <JourneyExperience initial={initial} />;
}
