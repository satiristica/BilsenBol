"use client";

import { Minus, PenLine, Plus, SlidersHorizontal } from "lucide-react";

import {
  BUDGET_OPTIONS,
  ENGLISH_OPTIONS,
  GPA_MAX,
  GPA_MIN,
  GPA_STEP,
  formatGpa,
  type ApplicantProfile,
} from "@/domain/profile";

import styles from "./QuickAdjustBar.module.css";

interface QuickAdjustBarProps {
  profile: ApplicantProfile;
  onChange: (profile: ApplicantProfile) => void;
  onEditFullProfile: () => void;
}

function roundGpa(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Lets the applicant flip the two inputs that move results the most and see the
 * recommendations, diagnosis and roadmap recompute without leaving the result.
 */
export function QuickAdjustBar({
  profile,
  onChange,
  onEditFullProfile,
}: QuickAdjustBarProps) {
  const shiftGpa = (delta: number) => {
    const next = roundGpa(Math.min(GPA_MAX, Math.max(GPA_MIN, profile.gpa + delta)));
    onChange({ ...profile, gpa: next });
  };

  return (
    <section aria-label="Быстрая правка профиля" className={styles.bar}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <SlidersHorizontal aria-hidden="true" size={17} strokeWidth={2.3} />
          Попробуйте другие условия
        </h2>
      </div>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowLabel} id="quick-budget">
            Бюджет
          </span>
          <div aria-labelledby="quick-budget" className={styles.chips} role="group">
            {BUDGET_OPTIONS.map((option) => (
              <button
                aria-pressed={profile.budget === option.value}
                className={styles.chip}
                key={option.value}
                onClick={() => onChange({ ...profile, budget: option.value })}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.rowLabel} id="quick-english">
            Английский
          </span>
          <div aria-labelledby="quick-english" className={styles.chips} role="group">
            {ENGLISH_OPTIONS.map((option) => (
              <button
                aria-pressed={profile.english === option.value}
                className={styles.chip}
                key={option.value}
                onClick={() => onChange({ ...profile, english: option.value })}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.rowLabel} id="quick-gpa">
            Средний балл
          </span>
          <div aria-labelledby="quick-gpa" className={styles.gpaRow} role="group">
            <button
              aria-label="Уменьшить средний балл"
              className={styles.stepper}
              disabled={profile.gpa <= GPA_MIN}
              onClick={() => shiftGpa(-GPA_STEP)}
              type="button"
            >
              <Minus aria-hidden="true" size={18} strokeWidth={2.6} />
            </button>
            <span aria-live="polite" className={styles.gpaValue}>
              {formatGpa(profile.gpa)}
            </span>
            <button
              aria-label="Увеличить средний балл"
              className={styles.stepper}
              disabled={profile.gpa >= GPA_MAX}
              onClick={() => shiftGpa(GPA_STEP)}
              type="button"
            >
              <Plus aria-hidden="true" size={18} strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </div>

      <button className={styles.editLink} onClick={onEditFullProfile} type="button">
        <PenLine aria-hidden="true" size={15} strokeWidth={2.3} />
        Весь профиль
      </button>
    </section>
  );
}
