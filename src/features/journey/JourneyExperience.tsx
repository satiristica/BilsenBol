"use client";

import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ActionButton } from "@/components/ActionButton";
import { DEMO_DATA_BADGE } from "@/data/programs";
import { buildDiagnosis } from "@/domain/diagnosis";
import { rankPrograms, type ProgramMatch } from "@/domain/matching";
import { DEFAULT_PROFILE, type ApplicantProfile } from "@/domain/profile";
import { buildRoadmap, calculateProgress } from "@/domain/roadmap";
import { ComparisonDialog } from "@/features/comparison/ComparisonDialog";
import { ComparisonTray } from "@/features/comparison/ComparisonTray";
import { DiagnosisPanel } from "@/features/diagnosis/DiagnosisPanel";
import { ProfileWizard } from "@/features/profile/ProfileWizard";
import { QuickAdjustBar } from "@/features/profile/QuickAdjustBar";
import {
  MAX_COMPARED_PROGRAMS,
  RecommendationList,
} from "@/features/recommendations/RecommendationList";
import { NextActionCard, ProgressMeter } from "@/features/progress/ProgressPanel";
import { RoadmapTimeline } from "@/features/roadmap/RoadmapTimeline";
import { classNames } from "@/lib/classNames";
import { pluralRu } from "@/lib/plural";

import { clearJourney, saveJourney, type JourneySnapshot } from "./journeyPersistence";
import { ProfileImpact } from "./ProfileImpact";
import { collectFacts, describeProfileImpact, type ImpactItem } from "./profileImpact";
import { ResetControl } from "./ResetControl";
import { STEP_NAMES, STEP_ORDER, type JourneyStep } from "./steps";

import styles from "./JourneyExperience.module.css";

interface JourneyExperienceProps {
  initial: JourneySnapshot;
}

export function JourneyExperience({ initial }: JourneyExperienceProps) {
  const [profile, setProfile] = useState<ApplicantProfile>(initial.profile);
  const [step, setStep] = useState<JourneyStep>(initial.step);
  const [completedStepIds, setCompletedStepIds] = useState<ReadonlySet<string>>(
    () => new Set(initial.completedStepIds),
  );
  const [comparedProgramIds, setComparedProgramIds] = useState<string[]>([]);
  const [isComparisonOpen, setComparisonOpen] = useState(false);
  // Bumped on reset so the wizard remounts at its first question.
  const [resetCount, setResetCount] = useState(0);
  // What the latest edit on a result screen changed; `id` replays the entrance.
  const [lastImpact, setLastImpact] = useState<{ id: number; items: ImpactItem[] } | null>(null);

  // Every change is written through to storage, so a reload resumes here.
  useEffect(() => {
    saveJourney({ profile, step, completedStepIds: [...completedStepIds] });
  }, [profile, step, completedStepIds]);

  const resetJourney = () => {
    clearJourney();
    setProfile(DEFAULT_PROFILE);
    setStep("profile");
    setCompletedStepIds(new Set<string>());
    setComparedProgramIds([]);
    setComparisonOpen(false);
    setLastImpact(null);
    setResetCount((count) => count + 1);
  };

  // Edits made from a result screen report their effect; wizard edits do not,
  // because nothing has been computed for the user yet.
  const applyProfileChange = (next: ApplicantProfile) => {
    const items = describeProfileImpact(collectFacts(profile), collectFacts(next));
    setProfile(next);
    setLastImpact((previous) => ({ id: (previous?.id ?? 0) + 1, items }));
  };

  const moveToStep = (nextStep: JourneyStep) => {
    setLastImpact(null);
    setStep(nextStep);
  };

  // Everything downstream is derived from the profile, so any profile edit
  // recomputes the diagnosis, the catalogue ranking and the roadmap at once.
  const result = useMemo(() => rankPrograms(profile), [profile]);
  const diagnosis = useMemo(() => buildDiagnosis(profile, result), [profile, result]);
  const phases = useMemo(() => buildRoadmap(profile, result), [profile, result]);
  const progress = useMemo(
    () => calculateProgress(phases, completedStepIds),
    [phases, completedStepIds],
  );

  const comparedMatches = useMemo(
    () =>
      comparedProgramIds
        .map((id) => result.matches.find((match) => match.program.id === id))
        .filter((match): match is ProgramMatch => match !== undefined),
    [comparedProgramIds, result],
  );

  const comparisonPair: [ProgramMatch, ProgramMatch] | null =
    comparedMatches.length === MAX_COMPARED_PROGRAMS
      ? [comparedMatches[0], comparedMatches[1]]
      : null;

  const isProfileReady = profile.fields.length > 0 && profile.regions.length > 0;
  const stepIndex = STEP_ORDER.indexOf(step);

  const toggleComparison = (programId: string) => {
    setComparedProgramIds((current) => {
      if (current.includes(programId)) {
        return current.filter((id) => id !== programId);
      }
      if (current.length >= MAX_COMPARED_PROGRAMS) {
        return current;
      }
      return [...current, programId];
    });
  };

  const toggleRoadmapStep = (stepId: string) => {
    setCompletedStepIds((current) => {
      const next = new Set(current);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const completeRoadmapStep = (stepId: string) => {
    setCompletedStepIds((current) => new Set(current).add(stepId));
  };

  const goToStep = (nextStep: JourneyStep) => {
    if (nextStep !== "profile" && !isProfileReady) {
      return;
    }
    moveToStep(nextStep);
  };

  const quickAdjust = (
    <>
      <QuickAdjustBar
        onChange={applyProfileChange}
        onEditFullProfile={() => moveToStep("profile")}
        profile={profile}
      />
      {lastImpact ? (
        <ProfileImpact
          items={lastImpact.items}
          key={lastImpact.id}
          onDismiss={() => setLastImpact(null)}
        />
      ) : null}
    </>
  );

  const sectionCopy: Record<JourneyStep, { title: string; lead: React.ReactNode }> = {
    profile: { title: "Ваш профиль", lead: null },
    diagnosis: { title: "Где вы сейчас", lead: null },
    recommendations: {
      title: "Ваши программы",
      lead: (
        <>
          <span className={styles.counter}>
            {result.matches.length}{" "}
            {pluralRu(result.matches.length, { one: "подходит", few: "подходят", many: "подходят" })}
          </span>{" "}
          · отметьте
          две, чтобы сравнить
        </>
      ),
    },
    roadmap: { title: "Ваш план", lead: null },
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <Link className={styles.brand} href="/">
          <span aria-hidden="true" className={styles.brandMark}>
            B
          </span>
          <span>BilsenBol</span>
        </Link>
        <div className={styles.topActions}>
          <ResetControl onReset={resetJourney} />
          <span className={styles.demoTag}>{DEMO_DATA_BADGE}</span>
        </div>
      </header>

      <nav aria-label="Этапы маршрута">
        <ol className={styles.stepper}>
          {STEP_ORDER.map((item, index) => (
            <li className={styles.stepperItem} key={item}>
              <button
                aria-current={item === step ? "step" : undefined}
                className={classNames(
                  styles.stepperButton,
                  item === step && styles.stepperCurrent,
                  index < stepIndex && styles.stepperDone,
                )}
                disabled={item !== "profile" && !isProfileReady}
                onClick={() => goToStep(item)}
                type="button"
              >
                <span className={styles.stepperIndex}>
                  <span className={styles.stepperWord}>Шаг </span>
                  {index + 1}
                </span>
                <span className={styles.stepperName}>{STEP_NAMES[item]}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {step === "profile" ? null : (
        <div className={styles.sectionHead}>
          <h1 className={styles.sectionTitle}>{sectionCopy[step].title}</h1>
          {sectionCopy[step].lead ? (
            <p aria-live="polite" className={styles.sectionLead}>
              {sectionCopy[step].lead}
            </p>
          ) : null}
        </div>
      )}

      <main className={styles.content} key={`${step}-${resetCount}`}>
        {step === "profile" ? (
          <ProfileWizard
            onChange={setProfile}
            onSubmit={() => moveToStep("diagnosis")}
            profile={profile}
          />
        ) : null}

        {step === "diagnosis" ? (
          <>
            <DiagnosisPanel diagnosis={diagnosis} />
            {quickAdjust}
          </>
        ) : null}

        {step === "recommendations" ? (
          <>
            {quickAdjust}
            <RecommendationList
              comparedProgramIds={comparedProgramIds}
              onEditFullProfile={() => moveToStep("profile")}
              onProfileChange={applyProfileChange}
              onToggleComparison={toggleComparison}
              profile={profile}
              result={result}
            />
          </>
        ) : null}

        {step === "roadmap" ? (
          <>
            <ProgressMeter progress={progress} />
            <NextActionCard onComplete={completeRoadmapStep} progress={progress} />
            <p className={styles.notice}>
              <Info aria-hidden="true" size={16} strokeWidth={2.2} />
              <span>
                Шаги — общие ориентиры, а не требования конкретного вуза. Сроки и документы
                проверяйте на сайте программы.
              </span>
            </p>
            <RoadmapTimeline
              completedStepIds={completedStepIds}
              nextStepId={progress.nextStep?.id ?? null}
              onToggleStep={toggleRoadmapStep}
              phases={phases}
            />
            {quickAdjust}
          </>
        ) : null}
      </main>

      <div className={styles.nav}>
        {stepIndex > 0 ? (
          <ActionButton
            onClick={() => goToStep(STEP_ORDER[stepIndex - 1])}
            variant="ghost"
          >
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.4} /> Назад
          </ActionButton>
        ) : null}
        {stepIndex < STEP_ORDER.length - 1 && step !== "profile" ? (
          <ActionButton onClick={() => goToStep(STEP_ORDER[stepIndex + 1])} withArrow>
            Дальше: {STEP_NAMES[STEP_ORDER[stepIndex + 1]]}
          </ActionButton>
        ) : null}
      </div>

      {step === "recommendations" ? (
        <ComparisonTray
          onClear={() => {
            setComparedProgramIds([]);
            setComparisonOpen(false);
          }}
          onOpen={() => setComparisonOpen(true)}
          selected={comparedMatches}
        />
      ) : null}

      <ComparisonDialog
        isOpen={isComparisonOpen && comparisonPair !== null}
        onClose={() => setComparisonOpen(false)}
        pair={comparisonPair}
      />
    </div>
  );
}
