"use client";

import { CalendarDays, Check, ExternalLink, Languages, TriangleAlert, Wallet } from "lucide-react";

import { ActionButton } from "@/components/ActionButton";
import {
  englishRequirementText,
  formatTuition,
  isFreeTuition,
  type ProgramMatch,
} from "@/domain/matching";
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
    ...(isFreeTuition(program) ? [{ label: "Бесплатно", isGrant: true }] : []),
    ...(program.fullFunding ? [{ label: program.fullFunding.name, isGrant: true }] : []),
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
        <div
          aria-label={`Совпадение: ${match.score}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={match.score}
          className={classNames(
            styles.scoreRingContainer,
            match.score >= 80 && styles.scoreRingHigh,
            match.score >= 65 && match.score < 80 && styles.scoreRingMid,
            match.score < 65 && styles.scoreRingLow,
          )}
          role="progressbar"
        >
          <svg className={styles.scoreSvg} height="72" viewBox="0 0 72 72" width="72">
            <circle
              className={styles.scoreBgCircle}
              cx="36"
              cy="36"
              fill="transparent"
              r="30"
              strokeWidth="5"
            />
            <circle
              className={styles.scoreFgCircle}
              cx="36"
              cy="36"
              fill="transparent"
              r="30"
              strokeDasharray="188.5"
              strokeDashoffset={188.5 - (188.5 * animatedScore) / 100}
              strokeWidth="5"
            />
          </svg>
          <div className={styles.scoreInner}>
            <span className={styles.scoreValue}>{animatedScore}</span>
            <span className={styles.scoreLabel}>совпад.</span>
          </div>
        </div>
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
          {program.fullFunding ? (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>{program.fullFunding.name}</span>
              <p className={styles.detailText}>
                Покрывает: {program.fullFunding.covers}. Кому: {program.fullFunding.eligibility}.
              </p>
            </div>
          ) : null}
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
            <Languages aria-hidden="true" size={15} strokeWidth={2.2} />
            <span className={styles.srOnly}>Английский</span>
          </dt>
          <dd className={styles.factValue}>{englishRequirementText(program)}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>
            <CalendarDays aria-hidden="true" size={15} strokeWidth={2.2} />
            <span className={styles.srOnly}>Окно подачи</span>
          </dt>
          <dd className={styles.factValue}>{program.applicationWindow}</dd>
        </div>
      </dl>

      <p className={styles.sources}>
        <span className={styles.sourcesLabel}>Источники:</span>
        {program.sources.map((source) => (
          <a
            className={styles.sourceLink}
            href={source.url}
            key={source.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {source.label}
            <ExternalLink aria-hidden="true" size={12} strokeWidth={2.4} />
          </a>
        ))}
      </p>

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
