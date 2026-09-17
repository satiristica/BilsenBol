import type { Metadata } from "next";

import { DEFAULT_PROFILE, findPreset } from "@/domain/profile";
import { JourneyExperience } from "@/features/journey/JourneyExperience";
import { isJourneyStep } from "@/features/journey/steps";

export const metadata: Metadata = {
  title: "Маршрут поступления | BilsenBol",
  description:
    "Профиль, диагностика, подбор программ, сравнение и персональная дорожная карта поступления.",
};

interface JourneyPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JourneyPage({ searchParams }: JourneyPageProps) {
  const params = await searchParams;
  const requestedPreset = params.preset;
  const preset = findPreset(
    typeof requestedPreset === "string" ? requestedPreset : undefined,
  );

  // A preset already answers the profile questions, so it opens on the result.
  const requestedStep = params.step;
  const initialStep = isJourneyStep(requestedStep)
    ? requestedStep
    : preset
      ? "diagnosis"
      : "profile";

  return (
    <JourneyExperience
      initialProfile={preset?.profile ?? DEFAULT_PROFILE}
      initialStep={initialStep}
    />
  );
}
