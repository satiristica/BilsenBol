"use client";

import { ArrowLeft, CheckCircle2, FileDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ActionButton, ActionLink } from "@/components/ActionButton";
import { BrandMark } from "@/components/BrandMark";
import { buildDiagnosis } from "@/domain/diagnosis";
import { rankPrograms, type ProgramMatch } from "@/domain/matching";
import type { ApplicantProfile } from "@/domain/profile";
import { buildRoadmap, calculateProgress, listSteps, type RoadmapPhase } from "@/domain/roadmap";
import { loadJourney } from "@/features/journey/journeyPersistence";
import { JourneySkeleton } from "@/features/journey/JourneySkeleton";
import { useIsClient } from "@/lib/useIsClient";

import { AiRoadmapCard } from "./AiRoadmapCard";
import styles from "./AiPlanPage.module.css";
import { PrintableChecklist } from "./PrintableChecklist";
import { RoadmapTree } from "./RoadmapTree";
import { useRoadmapAdvice } from "./useRoadmapAdvice";

/** Top programmes shown as the tree's goal nodes. */
const TREE_GOALS = 3;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <Link className={styles.brand} href="/">
          <BrandMark size={34} />
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

  return (
    <AiPlanContent
      completedStepIds={completedStepIds}
      goals={result.matches.slice(0, TREE_GOALS)}
      phases={phases}
      profile={profile}
      profileSummary={profileSummary}
      progressPercent={progress.percent}
    />
  );
}

/** The saved file is named after the page title in most browsers. */
function printChecklist() {
  const screenTitle = document.title;
  document.title = "BilsenBol — чек-лист поступления";
  window.addEventListener("afterprint", () => (document.title = screenTitle), { once: true });
  window.print();
}

function AiPlanContent({
  profile,
  phases,
  goals,
  profileSummary,
  completedStepIds,
  progressPercent,
}: {
  profile: ApplicantProfile;
  phases: RoadmapPhase[];
  goals: ProgramMatch[];
  profileSummary: string;
  completedStepIds: string[];
  progressPercent: number;
}) {
  const stepIds = useMemo(() => new Set(listSteps(phases).map((step) => step.id)), [phases]);
  const state = useRoadmapAdvice(profile, stepIds, true);
  const completed = useMemo(() => new Set(completedStepIds), [completedStepIds]);
  const isAllDone = progressPercent >= 100;

  return (
    <Shell>
      <PrintableChecklist
        adviceState={state}
        completedStepIds={completed}
        goals={goals}
        phases={phases}
        profileSummary={profileSummary}
      />
      <div className={styles.screenOnly}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>
            <Sparkles aria-hidden="true" size={14} strokeWidth={2.4} />
            ИИ-план и стратегия
          </p>
          <h1 className={styles.title}>Ваш маршрут глазами ИИ</h1>
          <p className={styles.lead}>{profileSummary}</p>
          <span className={styles.doneChip}>
            <CheckCircle2 aria-hidden="true" size={15} strokeWidth={2.4} />
            {isAllDone
              ? "Все шаги плана выполнены"
              : `Прогресс маршрута: ${completedStepIds.length} из ${stepIds.size} шагов (${progressPercent}%)`}
          </span>
          <div className={styles.exportRow}>
            <ActionButton compact onClick={printChecklist} variant="ghost">
              <FileDown aria-hidden="true" size={17} strokeWidth={2.4} />
              Чек-лист в PDF
            </ActionButton>
            <span className={styles.exportHint}>Сохранить как PDF или распечатать</span>
          </div>
        </section>

        <AiRoadmapCard
          state={state}
          title="Стратегия"
          unavailableText="ИИ сейчас недоступен — попробуйте открыть страницу чуть позже."
        />

        <RoadmapTree
          adviceState={state}
          completedStepIds={completed}
          goals={goals}
          phases={phases}
          profileSummary={profileSummary}
        />

        <div className={styles.actions}>
          <ActionLink href="/journey" variant="ghost">
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} />
            Вернуться к плану
          </ActionLink>
        </div>
      </div>
    </Shell>
  );
}
