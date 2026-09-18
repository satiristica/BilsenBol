"use client";

import { ArrowLeft, CheckCircle2, Leaf, Lock, type LucideIcon, Snowflake, Sparkles, Sprout } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ActionLink } from "@/components/ActionButton";
import { buildDiagnosis } from "@/domain/diagnosis";
import { rankPrograms } from "@/domain/matching";
import type { ApplicantProfile } from "@/domain/profile";
import { buildRoadmap, calculateProgress, listSteps, type RoadmapPhase, type RoadmapSeason } from "@/domain/roadmap";
import { loadJourney } from "@/features/journey/journeyPersistence";
import { JourneySkeleton } from "@/features/journey/JourneySkeleton";
import { useIsClient } from "@/lib/useIsClient";
import { pluralRu } from "@/lib/plural";

import { AiRoadmapCard } from "./AiRoadmapCard";
import styles from "./AiPlanPage.module.css";
import { useRoadmapAdvice } from "./useRoadmapAdvice";

const SEASON_ICONS: Record<RoadmapSeason, LucideIcon> = {
  autumn: Leaf,
  winter: Snowflake,
  spring: Sprout,
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <Link className={styles.brand} href="/">
          <span aria-hidden="true" className={styles.brandMark}>
            B
          </span>
          <span>BilsenBol</span>
        </Link>
        <Link className={styles.backLink} href="/journey">
          <ArrowLeft aria-hidden="true" size={15} strokeWidth={2.4} />К плану
        </Link>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}

/** The saved journey lives in localStorage, so this page reads it only on the client. */
export function AiPlanEntry() {
  const isClient = useIsClient();
  return isClient ? <AiPlanPage /> : <JourneySkeleton />;
}

function AiPlanPage() {
  const [journey] = useState(() => loadJourney());

  if (!journey || journey.profile.fields.length === 0 || journey.profile.regions.length === 0) {
    return (
      <Shell>
        <section className={styles.stateCard}>
          <Sparkles aria-hidden="true" size={28} strokeWidth={2} />
          <h1 className={styles.stateTitle}>Сначала постройте маршрут</h1>
          <p className={styles.stateText}>
            ИИ-план строится по вашему профилю и плану поступления.
          </p>
          <div className={styles.actions}>
            <ActionLink href="/journey" withArrow>
              Построить маршрут
            </ActionLink>
          </div>
        </section>
      </Shell>
    );
  }

  return <UnlockGate completedStepIds={journey.completedStepIds} profile={journey.profile} />;
}

function UnlockGate({
  profile,
  completedStepIds,
}: {
  profile: ApplicantProfile;
  completedStepIds: string[];
}) {
  const result = useMemo(() => rankPrograms(profile), [profile]);
  const phases = useMemo(() => buildRoadmap(profile, result), [profile, result]);
  const progress = useMemo(
    () => calculateProgress(phases, new Set(completedStepIds)),
    [phases, completedStepIds],
  );
  const profileSummary = useMemo(
    () => buildDiagnosis(profile, result).profileSummary,
    [profile, result],
  );

  // Same rule as the button on the roadmap step: opening the URL directly
  // before the plan is finished must not unlock it, nor spend a model call.
  if (progress.percent < 100) {
    const remaining = progress.totalCount - progress.completedCount;
    return (
      <Shell>
        <section className={styles.stateCard}>
          <Lock aria-hidden="true" size={28} strokeWidth={2} />
          <h1 className={styles.stateTitle}>ИИ-план откроется, когда вы пройдёте весь маршрут</h1>
          <p className={styles.stateText}>
            Выполнено {progress.completedCount} из {progress.totalCount}. Осталось{" "}
            {remaining} {pluralRu(remaining, { one: "шаг", few: "шага", many: "шагов" })}.
          </p>
          <div className={styles.actions}>
            <ActionLink href="/journey" withArrow>
              Вернуться к плану
            </ActionLink>
          </div>
        </section>
      </Shell>
    );
  }

  return <AiPlanContent phases={phases} profile={profile} profileSummary={profileSummary} />;
}

function AiPlanContent({
  profile,
  phases,
  profileSummary,
}: {
  profile: ApplicantProfile;
  phases: RoadmapPhase[];
  profileSummary: string;
}) {
  const stepIds = useMemo(() => new Set(listSteps(phases).map((step) => step.id)), [phases]);
  const state = useRoadmapAdvice(profile, stepIds, true);
  const adviceById =
    state.status === "ready"
      ? new Map(state.advice.steps.map((item) => [item.id, item.advice]))
      : new Map<string, string>();

  return (
    <Shell>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>
          <Sparkles aria-hidden="true" size={14} strokeWidth={2.4} />
          ИИ-план
        </p>
        <h1 className={styles.title}>Ваш маршрут глазами ИИ</h1>
        <p className={styles.lead}>{profileSummary}</p>
        <span className={styles.doneChip}>
          <CheckCircle2 aria-hidden="true" size={15} strokeWidth={2.4} />
          Все шаги плана выполнены
        </span>
      </section>

      <AiRoadmapCard
        state={state}
        title="Стратегия"
        unavailableText="ИИ сейчас недоступен — попробуйте открыть страницу чуть позже."
      />

      {state.status === "ready" && adviceById.size > 0 ? (
        <>
          <h2 className={styles.sectionTitle}>Разбор по шагам</h2>
          <ol className={styles.phases}>
            {phases.map((phase) => {
              const SeasonIcon = SEASON_ICONS[phase.season];
              const steps = phase.steps.filter((step) => adviceById.has(step.id));
              if (steps.length === 0) {
                return null;
              }
              return (
                <li className={styles.phase} key={phase.season}>
                  <span className={styles.season}>
                    <SeasonIcon aria-hidden="true" size={13} strokeWidth={2.4} />
                    {phase.period} · {phase.title}
                  </span>
                  <ul className={styles.steps}>
                    {steps.map((step) => (
                      <li className={styles.step} key={step.id}>
                        <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.4} />
                        <span className={styles.stepBody}>
                          <span className={styles.stepTitle}>{step.title}</span>
                          <p className={styles.stepAdvice}>{adviceById.get(step.id)}</p>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </>
      ) : null}

      <div className={styles.actions}>
        <ActionLink href="/journey" variant="ghost">
          <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} />
          Вернуться к плану
        </ActionLink>
      </div>
    </Shell>
  );
}
