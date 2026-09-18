"use client";

import { Flag, GraduationCap, type LucideIcon, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";

import { shortUniversityName, type ProgramMatch } from "@/domain/matching";
import type { RoadmapPhase } from "@/domain/roadmap";
import { classNames } from "@/lib/classNames";

import styles from "./RoadmapTree.module.css";
import { SEASON_ICONS, stepVisual } from "./stepVisuals";
import { TreeNodeDialog, type TreeNode } from "./TreeNodeDialog";
import type { RoadmapAdviceState } from "./useRoadmapAdvice";

interface RoadmapTreeProps {
  phases: RoadmapPhase[];
  goals: ProgramMatch[];
  profileSummary: string;
  adviceState: RoadmapAdviceState;
}

interface GraphNodeProps {
  icon: LucideIcon;
  label: string;
  fullTitle: string;
  variant?: "step" | "extra" | "goal";
  hasAdvice?: boolean;
  order: number;
  onOpen: () => void;
}

function GraphNode({ icon: Icon, label, fullTitle, variant = "step", hasAdvice, order, onOpen }: GraphNodeProps) {
  return (
    <li className={styles.nodeItem} style={{ "--i": order } as React.CSSProperties}>
      <button
        aria-haspopup="dialog"
        aria-label={hasAdvice ? `${fullTitle}. Есть совет ИИ` : fullTitle}
        className={classNames(
          styles.node,
          variant === "extra" && styles.nodeExtra,
          variant === "goal" && styles.nodeGoal,
        )}
        onClick={onOpen}
        type="button"
      >
        <span className={styles.orb}>
          <Icon aria-hidden="true" size={20} strokeWidth={2.2} />
          {hasAdvice ? (
            <span aria-hidden="true" className={styles.aiDot} data-ai-advice="">
              <Sparkles size={10} strokeWidth={2.8} />
            </span>
          ) : null}
        </span>
        <span aria-hidden="true" className={styles.caption}>
          {label}
        </span>
      </button>
    </li>
  );
}

/**
 * The rule-based roadmap drawn as a node graph: applicant → seasons → steps →
 * target programmes. The structure never depends on the model, so the graph
 * renders the same with or without AI; the model only fills node details and
 * may add a few extra nodes, marked as its suggestions.
 */
export function RoadmapTree({ phases, goals, profileSummary, adviceState }: RoadmapTreeProps) {
  const [selected, setSelected] = useState<TreeNode | null>(null);
  const advice = adviceState.status === "ready" ? adviceState.advice : null;
  const adviceById = new Map(advice?.steps.map((item) => [item.id, item.advice]));

  let order = 0;

  return (
    <section aria-labelledby="tree-title" className={styles.tree}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading} id="tree-title">
          Древо маршрута
        </h2>
        <p className={styles.hint}>Нажмите на узел</p>
      </div>

      <div className={styles.root}>
        <span className={styles.rootOrb}>
          <UserRound aria-hidden="true" size={26} strokeWidth={2.2} />
        </span>
        <span className={styles.rootCaption}>Вы сейчас</span>
        <span className={styles.rootText}>{profileSummary}</span>
      </div>

      <ol className={styles.branches}>
        {phases.map((phase) => {
          const SeasonIcon = SEASON_ICONS[phase.season];
          const extras = advice?.extras.filter((extra) => extra.season === phase.season) ?? [];
          return (
            <li className={styles.branch} key={phase.season}>
              <span className={styles.season} style={{ "--i": order++ } as React.CSSProperties}>
                <SeasonIcon aria-hidden="true" size={15} strokeWidth={2.4} />
                {phase.period}
              </span>
              <ul className={styles.nodes}>
                {phase.steps.map((step) => {
                  const { icon, label } = stepVisual(step);
                  const stepAdvice = adviceById.get(step.id) ?? null;
                  return (
                    <GraphNode
                      fullTitle={step.title}
                      hasAdvice={stepAdvice !== null}
                      icon={icon}
                      key={step.id}
                      label={label}
                      onOpen={() => setSelected({ kind: "step", step, advice: stepAdvice })}
                      order={order++}
                    />
                  );
                })}
                {extras.map((extra) => (
                  <GraphNode
                    fullTitle={`Предложение ИИ: ${extra.title}`}
                    icon={Sparkles}
                    key={extra.title}
                    label={extra.title}
                    onOpen={() => setSelected({ kind: "extra", extra })}
                    order={order++}
                    variant="extra"
                  />
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      {goals.length > 0 ? (
        <div className={styles.goal}>
          <span className={styles.goalHead}>
            <Flag aria-hidden="true" size={14} strokeWidth={2.4} />
            Цель
          </span>
          <ul className={styles.goalNodes}>
            {goals.map((match) => (
              <GraphNode
                fullTitle={`${match.program.programName}, ${match.program.university}`}
                icon={GraduationCap}
                key={match.program.id}
                label={shortUniversityName(match.program)}
                onOpen={() => setSelected({ kind: "program", match })}
                order={order++}
                variant="goal"
              />
            ))}
          </ul>
        </div>
      ) : null}

      <TreeNodeDialog
        adviceStatus={adviceState.status}
        goals={goals}
        node={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
