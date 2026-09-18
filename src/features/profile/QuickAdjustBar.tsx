"use client";

import { ChevronDown, Minus, PenLine, Plus, SlidersHorizontal } from "lucide-react";
import { useId, useState } from "react";

import {
  BUDGET_OPTIONS,
  ENGLISH_OPTIONS,
  GPA_MAX,
  GPA_MIN,
  GPA_STEP,
  formatGpa,
  labelOf,
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
 * Lets the applicant flip the inputs that move results the most and see the
 * recommendations, diagnosis and roadmap recompute without leaving the result.
 * Collapsed to a one-line summary by default so the results, not the
 * controls, fill the first screen on a phone.
 */
export function QuickAdjustBar({
  profile,
  onChange,
  onEditFullProfile,
}: QuickAdjustBarProps) {
  const [isOpen, setOpen] = useState(false);
  const panelId = useId();
  const summary = `${labelOf(BUDGET_OPTIONS, profile.budget)} · ${labelOf(ENGLISH_OPTIONS, profile.english)} · балл ${formatGpa(profile.gpa)}`;

  const shiftGpa = (delta: number) => {
    const next = roundGpa(Math.min(GPA_MAX, Math.max(GPA_MIN, profile.gpa + delta)));
    onChange({ ...profile, gpa: next });
  };

  return (
    <section aria-label="Быстрая правка профиля" className={styles.bar}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={styles.toggle}
        onClick={() => setOpen((open) => !open)}
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" className={styles.toggleIcon} size={17} strokeWidth={2.3} />
        <span className={styles.toggleText}>
          <span className={styles.toggleTitle}>Ваши условия</span>
          <span className={styles.toggleSummary}>{summary}</span>
        </span>
        <span className={styles.toggleAction}>
          {isOpen ? "Свернуть" : "Изменить"}
          <ChevronDown aria-hidden="true" className={styles.chevron} size={16} strokeWidth={2.4} />
        </span>
      </button>

      <div className={styles.panel} hidden={!isOpen} id={panelId}>
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
      </div>
    </section>
  );
}
