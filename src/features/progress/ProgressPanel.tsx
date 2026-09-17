"use client";

import { ActionButton } from "@/components/ActionButton";
import type { RoadmapProgress } from "@/domain/roadmap";
import { useCountUp } from "@/lib/useCountUp";

import styles from "./Progress.module.css";

interface ProgressMeterProps {
  progress: RoadmapProgress;
}

export function ProgressMeter({ progress }: ProgressMeterProps) {
  const animatedPercent = useCountUp(progress.percent);

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
        aria-valuetext={`${progress.completedCount} из ${progress.totalCount} шагов выполнено`}
        className={styles.track}
        role="progressbar"
      >
        <span className={styles.fill} style={{ width: `${progress.percent}%` }} />
      </div>
      <p className={styles.meterCaption}>
        Выполнено {progress.completedCount} из {progress.totalCount} шагов маршрута.
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
        <h3 className={styles.finishedTitle}>Все шаги маршрута закрыты</h3>
        <p className={styles.finishedText}>
          Обновите профиль, если условия изменились, — маршрут пересоберётся под новые вводные.
        </p>
      </section>
    );
  }

  return (
    <section aria-live="polite" className={styles.nextCard}>
      <span className={styles.nextLabel}>🎯 Твоё следующее действие на этой неделе</span>
      <h3 className={styles.nextTitle}>{nextStep.title}</h3>
      <p className={styles.nextDetail}>{nextStep.detail}</p>
      {nextPhase ? (
        <span className={styles.nextMeta}>
          Этап: {nextPhase.period} — {nextPhase.title}
        </span>
      ) : null}
      <div className={styles.nextAction}>
        <ActionButton onClick={() => onComplete(nextStep.id)} variant="warm">
          Выполнено
        </ActionButton>
      </div>
    </section>
  );
}
