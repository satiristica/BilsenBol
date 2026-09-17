"use client";

import { DEMO_DATA_NOTICE } from "@/data/programs";
import type { RecommendationResult } from "@/domain/matching";
import {
  BUDGET_OPTIONS,
  REGION_OPTIONS,
  type ApplicantProfile,
} from "@/domain/profile";

import { RecommendationCard } from "./RecommendationCard";
import styles from "./RecommendationList.module.css";

export const MAX_COMPARED_PROGRAMS = 2;

interface RecommendationListProps {
  profile: ApplicantProfile;
  result: RecommendationResult;
  comparedProgramIds: readonly string[];
  onToggleComparison: (programId: string) => void;
  onProfileChange: (profile: ApplicantProfile) => void;
  onEditFullProfile: () => void;
}

interface RelaxSuggestion {
  label: string;
  nextProfile: ApplicantProfile;
}

/** Picks the single cheapest change that would reopen the catalogue. */
function buildRelaxSuggestion(
  profile: ApplicantProfile,
  result: RecommendationResult,
): RelaxSuggestion | null {
  const { excluded } = result;
  const worst = Math.max(excluded.budget, excluded.region, excluded.gpa, excluded.language);
  if (worst === 0) {
    return null;
  }

  if (worst === excluded.budget) {
    const currentIndex = BUDGET_OPTIONS.findIndex((option) => option.value === profile.budget);
    const next = BUDGET_OPTIONS[currentIndex + 1];
    if (next) {
      return {
        label: `Поднять бюджет до варианта «${next.label}»`,
        nextProfile: { ...profile, budget: next.value },
      };
    }
  }

  if (worst === excluded.region && profile.regions.length < REGION_OPTIONS.length) {
    return {
      label: "Смотреть программы во всех регионах",
      nextProfile: { ...profile, regions: REGION_OPTIONS.map((option) => option.value) },
    };
  }

  if (worst === excluded.language && profile.english === "school") {
    return {
      label: "Посмотреть, что откроется с сертификатом Duolingo",
      nextProfile: { ...profile, english: "duolingo" },
    };
  }

  return null;
}

function EmptyState({
  profile,
  result,
  onProfileChange,
  onEditFullProfile,
}: Pick<
  RecommendationListProps,
  "profile" | "result" | "onProfileChange" | "onEditFullProfile"
>) {
  const suggestion = buildRelaxSuggestion(profile, result);
  const reasons: { label: string; count: number }[] = [
    { label: "Дороже вашего бюджета", count: result.excluded.budget },
    { label: "Требуют более высокий средний балл", count: result.excluded.gpa },
    { label: "Нужен языковой сертификат без Foundation", count: result.excluded.language },
    { label: "Находятся вне выбранных регионов", count: result.excluded.region },
  ].filter((reason) => reason.count > 0);

  return (
    <div className={styles.empty}>
      <h3 className={styles.emptyTitle}>Под текущие условия не подошла ни одна программа</h3>
      <p className={styles.emptyText}>
        Мы не показываем варианты, которые нарушают ваши обязательные условия. Вот почему
        отсеялись все {result.totalConsidered} программ каталога:
      </p>
      <ul className={styles.reasons}>
        {reasons.map((reason) => (
          <li className={styles.reasonItem} key={reason.label}>
            <span>{reason.label}</span>
            <span className={styles.reasonCount}>{reason.count}</span>
          </li>
        ))}
      </ul>
      <div className={styles.emptyActions}>
        {suggestion ? (
          <button
            className={styles.emptyAction}
            onClick={() => onProfileChange(suggestion.nextProfile)}
            type="button"
          >
            {suggestion.label}
          </button>
        ) : null}
        <button
          className={`${styles.emptyAction} ${styles.emptySecondary}`}
          onClick={onEditFullProfile}
          type="button"
        >
          Вернуться к профилю
        </button>
      </div>
    </div>
  );
}

export function RecommendationList({
  profile,
  result,
  comparedProgramIds,
  onToggleComparison,
  onProfileChange,
  onEditFullProfile,
}: RecommendationListProps) {
  if (result.matches.length === 0) {
    return (
      <div className={styles.wrapper}>
        <EmptyState
          onEditFullProfile={onEditFullProfile}
          onProfileChange={onProfileChange}
          profile={profile}
          result={result}
        />
      </div>
    );
  }

  const canSelectMore = comparedProgramIds.length < MAX_COMPARED_PROGRAMS;

  return (
    <div className={styles.wrapper}>
      <p className={styles.notice}>
        <span aria-hidden="true">ⓘ</span>
        <span>{DEMO_DATA_NOTICE}</span>
      </p>
      <div className={styles.grid}>
        {result.matches.slice(0, 6).map((match) => (
          <RecommendationCard
            canSelectForComparison={canSelectMore}
            isSelectedForComparison={comparedProgramIds.includes(match.program.id)}
            key={match.program.id}
            match={match}
            onToggleComparison={onToggleComparison}
          />
        ))}
      </div>
    </div>
  );
}
