"use client";

import { useState } from "react";

import { CalendarDays, Check, ExternalLink, Languages, TriangleAlert, Wallet } from "lucide-react";

import { ActionButton } from "@/components/ActionButton";
import {
  englishRequirementText,
  englishShortText,
  formatTuition,
  isFreeTuition,
  type ProgramMatch,
} from "@/domain/matching";
import { nextDeadline } from "@/domain/reminders";
import { classNames } from "@/lib/classNames";
import { useCountUp } from "@/lib/useCountUp";

import styles from "./RecommendationCard.module.css";

const MAX_VISIBLE_BADGES = 3;

interface RecommendationCardProps {
  match: ProgramMatch;
  isSelectedForComparison: boolean;
  canSelectForComparison: boolean;
  onToggleComparison: (programId: string) => void;
  /** Stagger for the entrance animation, in milliseconds. */
  revealDelay?: number;
}

/** "2026-10-22" → "22.10.2026". */
function formatShortDate(isoDate: string): string {
  return isoDate.split("-").reverse().join(".");
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
  const [today] = useState(() => new Date());
  const deadline = nextDeadline(program, today);
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
      </div>

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
          <dd className={styles.factValue}>{englishShortText(program)}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>
            <CalendarDays aria-hidden="true" size={15} strokeWidth={2.2} />
            <span className={styles.srOnly}>Ближайший срок</span>
          </dt>
          <dd className={styles.factValue}>
            {deadline ? `до ${formatShortDate(deadline.date)}` : "Даты — на сайте"}
          </dd>
        </div>
      </dl>

      <a
        className={styles.sourceLink}
        href={program.sources[0]?.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        Официальный источник
        <ExternalLink aria-hidden="true" size={12} strokeWidth={2.4} />
      </a>

      {match.blocker ? (
        <p className={styles.blocker}>
          <TriangleAlert aria-hidden="true" size={16} strokeWidth={2.4} />
          <span>{match.blocker}</span>
        </p>
      ) : null}

      <details className={styles.details}>
        <summary className={styles.summary}>Подробнее</summary>
        <div className={styles.detailsBody}>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Почему подходит</span>
            <ul className={styles.reasons}>
              {match.whyItFits.map((reason) => (
                <li className={styles.reason} key={reason}>
                  <Check aria-hidden="true" className={styles.reasonMark} size={15} strokeWidth={3} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
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
            <span className={styles.detailLabel}>Английский</span>
            <p className={styles.detailText}>{englishRequirementText(program)}</p>
          </div>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Окно подачи</span>
            <p className={styles.detailText}>{program.applicationWindow}</p>
          </div>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>Источники</span>
            <p className={styles.sources}>
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
