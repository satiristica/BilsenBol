"use client";

import { Leaf, type LucideIcon, Snowflake, Sprout } from "lucide-react";

import type { RoadmapPhase, RoadmapSeason } from "@/domain/roadmap";
import { classNames } from "@/lib/classNames";

import styles from "./RoadmapTimeline.module.css";

const SEASON_ICONS: Record<RoadmapSeason, LucideIcon> = {
  autumn: Leaf,
  winter: Snowflake,
  spring: Sprout,
};

interface RoadmapTimelineProps {
  phases: readonly RoadmapPhase[];
  completedStepIds: ReadonlySet<string>;
  nextStepId: string | null;
  onToggleStep: (stepId: string) => void;
}

export function RoadmapTimeline({
  phases,
  completedStepIds,
  nextStepId,
  onToggleStep,
}: RoadmapTimelineProps) {
  return (
    <ol className={styles.timeline}>
      {phases.map((phase, index) => {
        const doneCount = phase.steps.filter((step) => completedStepIds.has(step.id)).length;
        const isComplete = doneCount === phase.steps.length;
        const holdsNextStep = phase.steps.some((step) => step.id === nextStepId);
        const SeasonIcon = SEASON_ICONS[phase.season];

        return (
          <li
            className={classNames(
              styles.phase,
              holdsNextStep && styles.phaseActive,
              isComplete && styles.phaseDone,
            )}
            key={phase.season}
            style={
              {
                "--delay": `${index * 110}ms`,
                "--phase-progress": phase.steps.length
                  ? doneCount / phase.steps.length
                  : 0,
              } as React.CSSProperties
            }
          >
            <div className={styles.phaseHeader}>
              <div className={styles.phaseMeta}>
                <span className={styles.period}>
                  <SeasonIcon aria-hidden="true" size={13} strokeWidth={2.4} />
                  {phase.period}
                </span>
                <span className={styles.phaseCount}>
                  {doneCount} из {phase.steps.length}
                </span>
              </div>
              <h3 className={styles.phaseTitle}>{phase.title}</h3>
            </div>

            <ul className={styles.steps}>
              {phase.steps.map((step) => (
                <li className={styles.step} key={step.id}>
                  <label className={styles.stepLabel}>
                    <input
                      checked={completedStepIds.has(step.id)}
                      className={styles.checkbox}
                      onChange={() => onToggleStep(step.id)}
                      type="checkbox"
                    />
                    <span className={styles.stepBody}>
                      <span className={styles.stepTitle}>
                        {step.title}
                        {step.id === nextStepId ? (
                          <span className={styles.nextMark}>сейчас</span>
                        ) : null}
                      </span>
                      {step.id === nextStepId ? (
                        <span className={styles.stepDetail}>{step.detail}</span>
                      ) : null}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
