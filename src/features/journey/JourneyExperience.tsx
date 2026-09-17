"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

import { STEP_NAMES, STEP_ORDER, type JourneyStep } from "./steps";

import styles from "./JourneyExperience.module.css";

interface JourneyExperienceProps {
  initialProfile?: ApplicantProfile;
  initialStep?: JourneyStep;
}

export function JourneyExperience({
  initialProfile = DEFAULT_PROFILE,
  initialStep = "profile",
}: JourneyExperienceProps) {
  const [profile, setProfile] = useState<ApplicantProfile>(initialProfile);
  const [step, setStep] = useState<JourneyStep>(initialStep);
  const [completedStepIds, setCompletedStepIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [comparedProgramIds, setComparedProgramIds] = useState<string[]>([]);
  const [isComparisonOpen, setComparisonOpen] = useState(false);

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
    setStep(nextStep);
  };

  const quickAdjust = (
    <QuickAdjustBar
      onChange={setProfile}
      onEditFullProfile={() => setStep("profile")}
      profile={profile}
    />
  );

  const sectionCopy: Record<JourneyStep, { title: string; lead: React.ReactNode }> = {
    profile: {
      title: "Шаг 1. Ваш профиль",
      lead: "Эти ответы — единственный источник для диагностики, подборки и плана. Изменить их можно в любой момент.",
    },
    diagnosis: {
      title: "Шаг 2. Где вы сейчас",
      lead: "Честная оценка профиля: что уже работает на вас, что мешает и сколько времени в запасе.",
    },
    recommendations: {
      title: "Шаг 3. Подходящие программы",
      lead: (
        <>
          Программы, которые проходят ваши обязательные условия.{" "}
          <span className={styles.counter}>Подходит: {result.matches.length}</span>. Отметьте
          две и сравните их лицом к лицу.
        </>
      ),
    },
    roadmap: {
      title: "Шаг 4. Ваш план поступления",
      lead: "Маршрут по сезонам, одно ближайшее действие и шкала готовности, которая растёт вместе с отметками.",
    },
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
        <span className={styles.demoTag}>{DEMO_DATA_BADGE}</span>
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
                <span className={styles.stepperIndex}>Шаг {index + 1}</span>
                <span className={styles.stepperName}>{STEP_NAMES[item]}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {step === "profile" ? null : (
        <div className={styles.sectionHead}>
          <h1 className={styles.sectionTitle}>{sectionCopy[step].title}</h1>
          <p aria-live="polite" className={styles.sectionLead}>
            {sectionCopy[step].lead}
          </p>
        </div>
      )}

      <main className={styles.content} key={step}>
        {step === "profile" ? (
          <ProfileWizard
            onChange={setProfile}
            onSubmit={() => setStep("diagnosis")}
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
              onEditFullProfile={() => setStep("profile")}
              onProfileChange={setProfile}
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
            ← Назад
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
