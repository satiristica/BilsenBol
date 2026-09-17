"use client";

import { ActionButton } from "@/components/ActionButton";
import { DEMO_DATA_BADGE } from "@/data/programs";
import { formatTuition, type ProgramMatch } from "@/domain/matching";
import { classNames } from "@/lib/classNames";
import { useCountUp } from "@/lib/useCountUp";

import styles from "./RecommendationCard.module.css";

interface RecommendationCardProps {
  match: ProgramMatch;
  isSelectedForComparison: boolean;
  canSelectForComparison: boolean;
  onToggleComparison: (programId: string) => void;
  /** Stagger for the entrance animation, in milliseconds. */
  revealDelay?: number;
}

export function RecommendationCard({
  match,
  isSelectedForComparison,
  canSelectForComparison,
  onToggleComparison,
  revealDelay = 0,
}: RecommendationCardProps) {
  const { program } = match;
  const compareDisabled = !isSelectedForComparison && !canSelectForComparison;
  const animatedScore = useCountUp(match.score);
  const strongestFactor = Math.max(...match.factors.map((factor) => factor.delta));

  return (
    <article
      className={classNames(styles.card, isSelectedForComparison && styles.cardSelected)}
      style={
        {
          "--delay": `${revealDelay}ms`,
          "--score": animatedScore,
        } as React.CSSProperties
      }
    >
      <header className={styles.header}>
        <div className={styles.headings}>
          <span className={styles.university}>{program.university}</span>
          <h3 className={styles.programName}>{program.programName}</h3>
          <span className={styles.place}>
            {program.city}, {program.country}
          </span>
        </div>
        <p className={styles.score}>
          <span className={styles.scoreInner}>
            <span className={styles.scoreValue}>{animatedScore}</span>
            <span className={styles.scoreLabel}>совпад.</span>
          </span>
        </p>
      </header>

      <div className={styles.badges}>
        {match.programBadges.map((badge) => (
          <span
            className={classNames(
              styles.badge,
              badge.label === "100% грант" && styles.badgeGrant,
            )}
            key={badge.label}
          >
            {badge.label}
          </span>
        ))}
        {match.matchBadges.map((badge) => (
          <span className={classNames(styles.badge, styles.badgeMatch)} key={badge.kind}>
            {badge.label}
          </span>
        ))}
        <span className={classNames(styles.badge, styles.badgeDemo)}>{DEMO_DATA_BADGE}</span>
      </div>

      <ul className={styles.reasons}>
        {match.whyItFits.map((reason) => (
          <li className={styles.reason} key={reason}>
            <span aria-hidden="true" className={styles.reasonMark}>
              ✓
            </span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      {match.blocker ? (
        <p className={styles.blocker}>
          <span aria-hidden="true">!</span>
          <span>{match.blocker}</span>
        </p>
      ) : null}

      <details className={styles.details}>
        <summary className={styles.summary}>Почему эта программа в подборке</summary>
        <div className={styles.detailsBody}>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Компромисс</span>
            <p className={styles.detailText}>{match.tradeOff}</p>
          </div>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Что улучшит ваши шансы</span>
            <p className={styles.detailText}>{match.improvementAction}</p>
          </div>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Из чего сложилось совпадение</span>
            <ul className={styles.factors}>
              {match.factors.map((factor) => (
                <li className={styles.factor} key={factor.label}>
                  <span className={styles.factorLabel}>{factor.label}</span>
                  <span className={styles.factorDelta}>+{factor.delta}</span>
                  <span aria-hidden="true" className={styles.factorTrack}>
                    <span
                      className={styles.factorFill}
                      style={{ width: `${(factor.delta / strongestFactor) * 100}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Стоимость</dt>
          <dd className={styles.factValue}>{formatTuition(program)}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Минимальный балл</dt>
          <dd className={styles.factValue}>{program.minGpa.toFixed(1)}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Окно подачи</dt>
          <dd className={styles.factValue}>{program.applicationWindow}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <ActionButton
          aria-pressed={isSelectedForComparison}
          block
          compact
          disabled={compareDisabled}
          onClick={() => onToggleComparison(program.id)}
          variant={isSelectedForComparison ? "primary" : "ghost"}
        >
          {isSelectedForComparison
            ? "Убрать из сравнения"
            : compareDisabled
              ? "Уже выбрано две"
              : "Сравнить"}
        </ActionButton>
      </div>
    </article>
  );
}
