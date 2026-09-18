"use client";

import { Check, ExternalLink, Info, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  englishRequirementText,
  formatTuition,
  type ProgramMatch,
} from "@/domain/matching";
import type { RoadmapStep } from "@/domain/roadmap";
import { classNames } from "@/lib/classNames";

import type { ExtraStep } from "./roadmapAdvice";
import styles from "./TreeNodeDialog.module.css";
import type { RoadmapAdviceState } from "./useRoadmapAdvice";

export type TreeNode =
  | { kind: "step"; step: RoadmapStep; advice: string | null }
  | { kind: "extra"; extra: ExtraStep }
  | { kind: "program"; match: ProgramMatch };

interface TreeNodeDialogProps {
  node: TreeNode | null;
  goals: ProgramMatch[];
  adviceStatus: RoadmapAdviceState["status"];
  onClose: () => void;
  isCompleted?: boolean;
  onToggleStep?: (stepId: string) => void;
}

/**
 * Catalogue facts that belong to a step. They come from `programs.ts`, never
 * from the model, so dates and requirements stay the sourced ones.
 */
function factsForStep(step: RoadmapStep, goals: ProgramMatch[]) {
  if (step.id === "winter-applications") {
    return { label: "Окна подачи ваших программ", read: (m: ProgramMatch) => m.program.applicationWindow };
  }
  if (step.id === "winter-scholarships") {
    return {
      label: "Стипендии ваших программ",
      read: (m: ProgramMatch) =>
        m.program.fullFunding
          ? `${m.program.fullFunding.name}: ${m.program.fullFunding.eligibility}`
          : "Полной стипендии нет",
    };
  }
  if (step.id.startsWith("autumn-language")) {
    return { label: "Английский в ваших программах", read: (m: ProgramMatch) => englishRequirementText(m.program) };
  }
  if (step.id === "autumn-shortlist" && goals.length > 0) {
    return { label: "Стоимость ваших программ", read: (m: ProgramMatch) => formatTuition(m.program) };
  }
  return null;
}

function AdviceBlock({ advice, status }: { advice: string | null; status: RoadmapAdviceState["status"] }) {
  if (advice) {
    return (
      <div className={styles.ai}>
        <span className={styles.aiLabel}>
          <Sparkles aria-hidden="true" size={13} strokeWidth={2.5} />
          Совет ИИ для вас
        </span>
        <p className={styles.text}>{advice}</p>
      </div>
    );
  }
  const text =
    status === "loading" ? "ИИ ещё пишет совет к этому шагу…" : "Совета ИИ к этому шагу нет.";
  return <p className={styles.quiet}>{text}</p>;
}

function StepBody({ step, advice, goals, status }: {
  step: RoadmapStep;
  advice: string | null;
  goals: ProgramMatch[];
  status: RoadmapAdviceState["status"];
}) {
  const facts = factsForStep(step, goals);
  return (
    <>
      <div className={styles.block}>
        <span className={styles.label}>Что сделать</span>
        <p className={styles.text}>{step.detail}</p>
      </div>
      <AdviceBlock advice={advice} status={status} />
      {facts && goals.length > 0 ? (
        <div className={styles.block}>
          <span className={styles.label}>{facts.label}</span>
          <ul className={styles.facts}>
            {goals.map((match) => (
              <li className={styles.fact} key={match.program.id}>
                <span className={styles.factName}>{match.program.university}</span>
                <span className={styles.text}>{facts.read(match)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function ProgramBody({ match }: { match: ProgramMatch }) {
  const { program } = match;
  const rows: [string, string][] = [
    ["Город", `${program.city}, ${program.country}`],
    ["Стоимость", `${formatTuition(program)} · ${program.tuition.note}`],
    ["Английский", englishRequirementText(program)],
    ["Отбор", program.entranceExam ?? "Уточняйте на сайте"],
    ["Окно подачи", program.applicationWindow],
  ];
  if (program.fullFunding) {
    rows.push([program.fullFunding.name, `${program.fullFunding.covers}. Кому: ${program.fullFunding.eligibility}`]);
  }
  return (
    <>
      <dl className={styles.facts}>
        {rows.map(([label, value]) => (
          <div className={styles.fact} key={label}>
            <dt className={styles.factName}>{label}</dt>
            <dd className={styles.text}>{value}</dd>
          </div>
        ))}
      </dl>
      {match.blocker ? <p className={styles.warn}>{match.blocker}</p> : null}
      <div className={styles.block}>
        <span className={styles.label}>Источники</span>
        <ul className={styles.sources}>
          {program.sources.map((source) => (
            <li key={source.url}>
              <a className={styles.sourceLink} href={source.url} rel="noopener noreferrer" target="_blank">
                {source.label}
                <ExternalLink aria-hidden="true" size={12} strokeWidth={2.4} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function titleOf(node: TreeNode): { eyebrow: string; title: string } {
  switch (node.kind) {
    case "step":
      return { eyebrow: "Шаг плана", title: node.step.title };
    case "extra":
      return { eyebrow: "Предложение ИИ", title: node.extra.title };
    case "program":
      return { eyebrow: node.match.program.university, title: node.match.program.programName };
  }
}

export function TreeNodeDialog({
  node,
  goals,
  adviceStatus,
  onClose,
  isCompleted,
  onToggleStep,
}: TreeNodeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (node && !dialog.open) {
      dialog.showModal();
    } else if (!node && dialog.open) {
      dialog.close();
    }
  }, [node]);

  const heading = node ? titleOf(node) : null;

  return (
    <dialog
      aria-labelledby="tree-node-title"
      className={styles.dialog}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog element itself.
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      {node && heading ? (
        <div className={styles.inner}>
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>{heading.eyebrow}</span>
              <h3 className={styles.title} id="tree-node-title">
                {heading.title}
              </h3>
            </div>
            <button aria-label="Закрыть" className={styles.close} onClick={onClose} type="button">
              <X aria-hidden="true" size={18} strokeWidth={2.4} />
            </button>
          </header>

          {node.kind === "step" && onToggleStep ? (
            <div className={styles.actionRow}>
              <button
                className={classNames(
                  styles.toggleButton,
                  isCompleted && styles.toggleButtonDone
                )}
                onClick={() => onToggleStep(node.step.id)}
                type="button"
              >
                <Check aria-hidden="true" size={16} strokeWidth={3} />
                <span>{isCompleted ? "Выполнено (нажмите для отмены)" : "Отметить выполненным"}</span>
              </button>
            </div>
          ) : null}

          {node.kind === "step" ? (
            <StepBody advice={node.advice} goals={goals} status={adviceStatus} step={node.step} />
          ) : null}
          {node.kind === "extra" ? (
            <div className={styles.ai}>
              <span className={styles.aiLabel}>
                <Sparkles aria-hidden="true" size={13} strokeWidth={2.5} />
                Шаг, которого нет в базовом плане
              </span>
              <p className={styles.text}>{node.extra.detail}</p>
            </div>
          ) : null}
          {node.kind === "program" ? <ProgramBody match={node.match} /> : null}

          {node.kind !== "program" ? (
            <p className={styles.disclaimer}>
              <Info aria-hidden="true" size={14} strokeWidth={2.2} />
              <span>Советы ИИ — ориентир, а не требования вузов.</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
