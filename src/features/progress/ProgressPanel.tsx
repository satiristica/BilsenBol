"use client";

import { PartyPopper, Sparkles, Target } from "lucide-react";

import { ActionButton, ActionLink } from "@/components/ActionButton";
import { formatShortDate } from "@/domain/dates";
import type { RoadmapPhase, RoadmapProgress } from "@/domain/roadmap";
import { SEASON_ICONS, stepVisual } from "@/features/roadmap/stepVisuals";
import { classNames } from "@/lib/classNames";
import { useCountUp } from "@/lib/useCountUp";
import { pluralRu } from "@/lib/plural";

import styles from "./Progress.module.css";

interface ProgressMeterProps {
  progress: RoadmapProgress;
  phases: readonly RoadmapPhase[];
  completedStepIds: ReadonlySet<string>;
}

/** A ring for the overall share and one dot per step for each season. */
export function ProgressMeter({ progress, phases, completedStepIds }: ProgressMeterProps) {
  const animatedPercent = useCountUp(progress.percent);
  const stepsGenitive = pluralRu(progress.totalCount, { one: "шага", few: "шагов", many: "шагов" });

  return (
    <section aria-label="Готовность к поступлению" className={styles.meter}>
      <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress.percent}
        aria-valuetext={`${progress.completedCount} из ${progress.totalCount} ${stepsGenitive} выполнено`}
        className={styles.ring}
        role="progressbar"
        style={{ "--percent": animatedPercent } as React.CSSProperties}
      >
        <span className={styles.ringValue}>{animatedPercent}%</span>
        <span className={styles.ringCaption}>
          {progress.completedCount} из {progress.totalCount}
        </span>
      </div>
      <ul className={styles.seasons}>
        {phases.map((phase) => {
          const SeasonIcon = SEASON_ICONS[phase.season];
          const done = phase.steps.filter((step) => completedStepIds.has(step.id)).length;
          return (
            <li className={styles.season} key={phase.season}>
              <span className={styles.seasonName}>
                <SeasonIcon aria-hidden="true" size={14} strokeWidth={2.4} />
                {phase.period}
              </span>
              <span aria-label={`${done} из ${phase.steps.length}`} className={styles.dots} role="img">
                {phase.steps.map((step) => (
                  <span
                    className={classNames(styles.dot, completedStepIds.has(step.id) && styles.dotDone)}
                    key={step.id}
                  />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface NextActionCardProps {
  progress: RoadmapProgress;
  onComplete: (stepId: string) => void;
}

/** Path of the AI plan page, unlocked once every roadmap step is done. */
export const AI_PLAN_PATH = "/journey/ai";

export function NextActionCard({ progress, onComplete }: NextActionCardProps) {
  const { nextStep, nextPhase } = progress;

  if (!nextStep) {
    return (
      <section aria-live="polite" className={styles.finished}>
        <PartyPopper aria-hidden="true" className={styles.finishedIcon} size={30} strokeWidth={2} />
        <h3 className={styles.finishedTitle}>Все шаги закрыты</h3>
        <p className={styles.finishedText}>
          Открыт ИИ-план: разбор вашего маршрута и что можно сделать дальше.
        </p>
        <div className={styles.finishedAction}>
          <ActionLink href={AI_PLAN_PATH} withArrow>
            <Sparkles aria-hidden="true" size={17} strokeWidth={2.3} />
            Открыть ИИ-план
          </ActionLink>
        </div>
      </section>
    );
  }

  const NextIcon = stepVisual(nextStep).icon;

  return (
    <section aria-live="polite" className={styles.nextCard}>
      <span aria-hidden="true" className={styles.nextIcon}>
        <NextIcon size={30} strokeWidth={2} />
      </span>
      <span className={styles.nextLabel}>
        <Target aria-hidden="true" size={16} strokeWidth={2.4} />
        Следующий шаг{nextPhase ? ` · ${nextPhase.period}` : ""}
        {nextStep.dueDate ? ` · до ${formatShortDate(nextStep.dueDate)}` : ""}
      </span>
      <h3 className={styles.nextTitle}>{nextStep.title}</h3>
      <p className={styles.nextDetail}>{nextStep.detail}</p>
      <div className={styles.nextAction}>
        <ActionButton onClick={() => onComplete(nextStep.id)} variant="warm">
          Выполнено
        </ActionButton>
      </div>
    </section>
  );
}
