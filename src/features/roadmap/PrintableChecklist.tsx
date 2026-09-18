"use client";

import { SOURCE_NOTICE } from "@/data/programs";
import { englishRequirementText, formatTuition, type ProgramMatch } from "@/domain/matching";
import type { RoadmapPhase } from "@/domain/roadmap";

import styles from "./PrintableChecklist.module.css";
import type { RoadmapAdviceState } from "./useRoadmapAdvice";

interface PrintableChecklistProps {
  phases: RoadmapPhase[];
  goals: ProgramMatch[];
  profileSummary: string;
  completedStepIds: ReadonlySet<string>;
  adviceState: RoadmapAdviceState;
}

/**
 * A plain black-on-white version of the plan that only exists on paper: the
 * screen never shows it, and printing shows nothing else. The browser's print
 * dialog turns it into a PDF ("Сохранить как PDF"), so no PDF library or
 * embedded Cyrillic font is needed.
 */
export function PrintableChecklist({
  phases,
  goals,
  profileSummary,
  completedStepIds,
  adviceState,
}: PrintableChecklistProps) {
  const advice = adviceState.status === "ready" ? adviceState.advice : null;
  const adviceById = new Map(advice?.steps.map((item) => [item.id, item.advice]));
  const printedOn = new Date().toLocaleDateString("ru-RU");

  return (
    <article className={styles.sheet}>
      <header className={styles.header}>
        <p className={styles.brand}>BilsenBol · план поступления</p>
        <h1 className={styles.title}>Мой чек-лист поступления</h1>
        <p className={styles.meta}>
          {profileSummary} · составлено {printedOn}
        </p>
      </header>

      {advice?.summary ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Стратегия (совет ИИ)</h2>
          <p className={styles.text}>{advice.summary}</p>
        </section>
      ) : null}

      {goals.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Целевые программы</h2>
          {goals.map((match) => (
            <div className={styles.program} key={match.program.id}>
              <p className={styles.programName}>
                {match.program.programName} — {match.program.university}, {match.program.city}
              </p>
              <p className={styles.fact}>Стоимость: {formatTuition(match.program)} ({match.program.tuition.note})</p>
              <p className={styles.fact}>Английский: {englishRequirementText(match.program)}</p>
              <p className={styles.fact}>Окно подачи: {match.program.applicationWindow}</p>
              {match.program.entranceExam ? (
                <p className={styles.fact}>Испытания: {match.program.entranceExam}</p>
              ) : null}
              <p className={styles.source}>
                Источник: {match.program.sources[0]?.url}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {phases.map((phase) => {
        const extras = advice?.extras.filter((extra) => extra.season === phase.season) ?? [];
        return (
          <section className={styles.section} key={phase.season}>
            <h2 className={styles.sectionTitle}>
              {phase.period} · {phase.title}
            </h2>
            <ul className={styles.checklist}>
              {phase.steps.map((step) => {
                const isDone = completedStepIds.has(step.id);
                const stepAdvice = adviceById.get(step.id);
                return (
                  <li className={styles.item} key={step.id}>
                    <span className={styles.box}>{isDone ? "✓" : ""}</span>
                    <span>
                      <span className={styles.itemTitle}>{step.title}</span>
                      <span className={styles.text}>{step.detail}</span>
                      {stepAdvice ? <span className={styles.advice}>Совет ИИ: {stepAdvice}</span> : null}
                    </span>
                  </li>
                );
              })}
              {extras.map((extra) => (
                <li className={styles.item} key={extra.title}>
                  <span className={styles.box} />
                  <span>
                    <span className={styles.itemTitle}>{extra.title} (предложение ИИ)</span>
                    <span className={styles.text}>{extra.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <footer className={styles.footer}>
        <p>{SOURCE_NOTICE}</p>
        <p>Советы ИИ — ориентир, а не требования вузов. Шансы поступления сервис не оценивает.</p>
      </footer>
    </article>
  );
}
