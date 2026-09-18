"use client";

import { ArrowUpDown, Info, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { ActionButton } from "@/components/ActionButton";
import { annualTuitionUsd, SOURCE_NOTICE } from "@/data/programs";
import { pluralRu } from "@/lib/plural";
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
  const worst = Math.max(excluded.budget, excluded.region, excluded.language);
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
    { label: "Дороже бюджета", count: result.excluded.budget },
    { label: "Нужен сертификат", count: result.excluded.language },
    { label: "Другой регион", count: result.excluded.region },
  ].filter((reason) => reason.count > 0);

  return (
    <div className={styles.empty}>
      <SearchX aria-hidden="true" className={styles.emptyIcon} size={30} strokeWidth={2} />
      <h3 className={styles.emptyTitle}>Ничего не подошло</h3>
      <p className={styles.emptyText}>
        {pluralRu(result.totalConsidered, {
          one: `Почему отсеялась ${result.totalConsidered} программа:`,
          few: `Почему отсеялись ${result.totalConsidered} программы:`,
          many: `Почему отсеялись ${result.totalConsidered} программ:`,
        })}
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
          <ActionButton
            block
            onClick={() => onProfileChange(suggestion.nextProfile)}
            variant="warm"
            withArrow
          >
            {suggestion.label}
          </ActionButton>
        ) : null}
        <ActionButton block onClick={onEditFullProfile} variant="ghost">
          Вернуться к профилю
        </ActionButton>
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
  const [sortBy, setSortBy] = useState<"score" | "tuition" | "country">("score");

  const sortedMatches = useMemo(() => {
    const list = [...result.matches];
    if (sortBy === "tuition") {
      list.sort(
        (a, b) => annualTuitionUsd(a.program.tuition) - annualTuitionUsd(b.program.tuition),
      );
    } else if (sortBy === "country") {
      list.sort((a, b) => a.program.country.localeCompare(b.program.country, "ru"));
    } else {
      list.sort((a, b) => b.score - a.score);
    }
    return list;
  }, [result.matches, sortBy]);

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
        <Info aria-hidden="true" size={16} strokeWidth={2.2} />
        <span>{SOURCE_NOTICE}</span>
      </p>

      <div className={styles.toolbar}>
        <span className={styles.countText}>
          Показано: {sortedMatches.length}{" "}
          {pluralRu(sortedMatches.length, {
            one: "программа",
            few: "программы",
            many: "программ",
          })}
        </span>
        <div className={styles.sortGroup}>
          <label className={styles.sortLabel} htmlFor="sort-select">
            <ArrowUpDown aria-hidden="true" size={14} strokeWidth={2.4} />
            Сортировка:
          </label>
          <select
            className={styles.sortSelect}
            id="sort-select"
            onChange={(e) => setSortBy(e.target.value as "score" | "tuition" | "country")}
            value={sortBy}
          >
            <option value="score">По соответствию (рейтинг)</option>
            <option value="tuition">По стоимости (от бюджетных)</option>
            <option value="country">По странам (А–Я)</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {sortedMatches.slice(0, 8).map((match, index) => (
          <RecommendationCard
            canSelectForComparison={canSelectMore}
            isSelectedForComparison={comparedProgramIds.includes(match.program.id)}
            key={match.program.id}
            match={match}
            onToggleComparison={onToggleComparison}
            revealDelay={index * 80}
          />
        ))}
      </div>
    </div>
  );
}
