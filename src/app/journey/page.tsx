import type { Metadata } from "next";

import { findPreset } from "@/domain/profile";
import { JourneyEntry } from "@/features/journey/JourneyEntry";
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
  const preset = findPreset(typeof params.preset === "string" ? params.preset : undefined);

  return (
    <JourneyEntry
      presetProfile={preset?.profile ?? null}
      requestedStep={isJourneyStep(params.step) ? params.step : null}
    />
  );
}
