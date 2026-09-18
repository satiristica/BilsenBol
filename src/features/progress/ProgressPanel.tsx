"use client";

import { PartyPopper, Target } from "lucide-react";

import { ActionButton } from "@/components/ActionButton";
import type { RoadmapProgress } from "@/domain/roadmap";
import { useCountUp } from "@/lib/useCountUp";
import { pluralRu } from "@/lib/plural";

import styles from "./Progress.module.css";

interface ProgressMeterProps {
  progress: RoadmapProgress;
}

export function ProgressMeter({ progress }: ProgressMeterProps) {
  const animatedPercent = useCountUp(progress.percent);
  const stepsGenitive = pluralRu(progress.totalCount, { one: "шага", few: "шагов", many: "шагов" });

  return (
    <section aria-label="Готовность к поступлению" className={styles.meter}>
      <div className={styles.meterHeader}>
        <span className={styles.meterLabel}>Готовность</span>
        <span className={styles.meterValue}>{animatedPercent}%</span>
      </div>
      <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress.percent}
        aria-valuetext={`${progress.completedCount} из ${progress.totalCount} ${stepsGenitive} выполнено`}
        className={styles.track}
        role="progressbar"
      >
        <span className={styles.fill} style={{ width: `${progress.percent}%` }} />
      </div>
      <p className={styles.meterCaption}>
        {progress.completedCount} из {progress.totalCount} {stepsGenitive}
      </p>
    </section>
  );
}

interface NextActionCardProps {
  progress: RoadmapProgress;
  onComplete: (stepId: string) => void;
}

export function NextActionCard({ progress, onComplete }: NextActionCardProps) {
  const { nextStep, nextPhase } = progress;

  if (!nextStep) {
    return (
      <section aria-live="polite" className={styles.finished}>
        <PartyPopper aria-hidden="true" className={styles.finishedIcon} size={30} strokeWidth={2} />
        <h3 className={styles.finishedTitle}>Все шаги закрыты</h3>
      </section>
    );
  }

  return (
    <section aria-live="polite" className={styles.nextCard}>
      <span className={styles.nextLabel}>
        <Target aria-hidden="true" size={16} strokeWidth={2.4} />
        Следующий шаг{nextPhase ? ` · ${nextPhase.period}` : ""}
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
