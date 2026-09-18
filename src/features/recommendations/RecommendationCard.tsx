"use client";

import { CalendarDays, Check, GraduationCap, TriangleAlert, Wallet } from "lucide-react";

import { ActionButton } from "@/components/ActionButton";
import { DEMO_DATA_BADGE } from "@/data/programs";
import { formatTuition, type ProgramMatch } from "@/domain/matching";
import { classNames } from "@/lib/classNames";
import { useCountUp } from "@/lib/useCountUp";

import styles from "./RecommendationCard.module.css";

const MAX_VISIBLE_BADGES = 3;
const MAX_VISIBLE_REASONS = 2;

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
  const hiddenReasons = match.whyItFits.slice(MAX_VISIBLE_REASONS);
  const visibleBadges = [
    ...(program.hasFullGrant ? [{ label: "100% грант", isGrant: true }] : []),
    ...match.matchBadges.map((badge) => ({ label: badge.label, isGrant: false })),
  ].slice(0, MAX_VISIBLE_BADGES);

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
        {visibleBadges.map((badge) => (
          <span
            className={classNames(styles.badge, badge.isGrant ? styles.badgeGrant : styles.badgeMatch)}
            key={badge.label}
          >
            {badge.label}
          </span>
        ))}
        <span className={classNames(styles.badge, styles.badgeDemo)}>{DEMO_DATA_BADGE}</span>
      </div>

      <ul className={styles.reasons}>
        {match.whyItFits.slice(0, MAX_VISIBLE_REASONS).map((reason) => (
          <li className={styles.reason} key={reason}>
            <Check aria-hidden="true" className={styles.reasonMark} size={16} strokeWidth={3} />
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      {match.blocker ? (
        <p className={styles.blocker}>
          <TriangleAlert aria-hidden="true" size={16} strokeWidth={2.4} />
          <span>{match.blocker}</span>
        </p>
      ) : null}

      <details className={styles.details}>
        <summary className={styles.summary}>Подробнее</summary>
        <div className={styles.detailsBody}>
          {hiddenReasons.length > 0 ? (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Ещё плюсы</span>
              {hiddenReasons.map((reason) => (
                <p className={styles.detailText} key={reason}>
                  {reason}
                </p>
              ))}
            </div>
          ) : null}
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Формат</span>
            <div className={styles.badges}>
              {match.programBadges.map((badge) => (
                <span className={styles.badge} key={badge.label}>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Компромисс</span>
            <p className={styles.detailText}>{match.tradeOff}</p>
          </div>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Как усилить заявку</span>
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
          <dt className={styles.factLabel}>
            <Wallet aria-hidden="true" size={15} strokeWidth={2.2} />
            <span className={styles.srOnly}>Стоимость</span>
          </dt>
          <dd className={styles.factValue}>{formatTuition(program)}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>
            <GraduationCap aria-hidden="true" size={15} strokeWidth={2.2} />
            <span className={styles.srOnly}>Минимальный балл</span>
          </dt>
          <dd className={styles.factValue}>от {program.minGpa.toFixed(1)}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>
            <CalendarDays aria-hidden="true" size={15} strokeWidth={2.2} />
            <span className={styles.srOnly}>Окно подачи</span>
          </dt>
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
