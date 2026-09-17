"use client";

import { MultiChoice, SingleChoice } from "@/components/ChoiceGroup";
import {
  BUDGET_OPTIONS,
  ENGLISH_OPTIONS,
  FIELD_OPTIONS,
  GPA_MAX,
  GPA_MIN,
  GPA_STEP,
  GRADE_OPTIONS,
  GRANT_COMPETITIVE_GPA,
  REGION_OPTIONS,
  formatGpa,
  type ApplicantProfile,
} from "@/domain/profile";

import styles from "./ProfileForm.module.css";

interface ProfileFormProps {
  profile: ApplicantProfile;
  onChange: (profile: ApplicantProfile) => void;
  onSubmit: () => void;
}

export function ProfileForm({ profile, onChange, onSubmit }: ProfileFormProps) {
  const patch = (changes: Partial<ApplicantProfile>) => {
    onChange({ ...profile, ...changes });
  };

  const missingFields = profile.fields.length === 0;
  const missingRegions = profile.regions.length === 0;
  const isIncomplete = missingFields || missingRegions;

  const gpaNote =
    profile.gpa >= GRANT_COMPETITIVE_GPA
      ? "Это конкурентный балл для грантовых программ."
      : "Для полных грантов обычно нужен балл от 4.5 — это можно успеть подтянуть.";

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (!isIncomplete) {
          onSubmit();
        }
      }}
    >
      <div className={styles.intro}>
        <h2>Расскажите о себе</h2>
        <p>Шесть ответов — и маршрут поступления пересчитается под вас.</p>
      </div>

      <SingleChoice
        legend="Где вы сейчас учитесь"
        name="grade"
        onChange={(grade) => patch({ grade })}
        options={GRADE_OPTIONS}
        value={profile.grade}
      />

      <div className={styles.gpaBlock}>
        <div className={styles.gpaHeader}>
          <label className={styles.gpaLabel} htmlFor="gpa">
            Средний балл аттестата
          </label>
          <output className={styles.gpaValue} htmlFor="gpa">
            {formatGpa(profile.gpa)}
          </output>
        </div>
        <input
          className={styles.slider}
          id="gpa"
          max={GPA_MAX}
          min={GPA_MIN}
          onChange={(event) => patch({ gpa: Number(event.target.value) })}
          step={GPA_STEP}
          type="range"
          value={profile.gpa}
        />
        <div className={styles.scale}>
          <span>{formatGpa(GPA_MIN)}</span>
          <span>{formatGpa(GRANT_COMPETITIVE_GPA)} — уровень грантов</span>
          <span>{formatGpa(GPA_MAX)}</span>
        </div>
        <p className={styles.gpaNote}>{gpaNote}</p>
      </div>

      <SingleChoice
        help="Выберите то, что уже сдано или планируется в ближайшее время."
        legend="Английский язык"
        name="english"
        onChange={(english) => patch({ english })}
        options={ENGLISH_OPTIONS}
        value={profile.english}
      />

      <SingleChoice
        help="Сколько семья готова платить за обучение в год."
        legend="Семейный бюджет"
        name="budget"
        onChange={(budget) => patch({ budget })}
        options={BUDGET_OPTIONS}
        value={profile.budget}
      />

      <MultiChoice
        help="Можно выбрать несколько — они отмечаются как приоритетные."
        legend="Интересы и направление"
        onChange={(fields) => patch({ fields })}
        options={FIELD_OPTIONS}
        values={profile.fields}
      />

      <MultiChoice
        help="Программы за пределами выбранных регионов не попадут в подборку."
        legend="Предпочитаемые регионы"
        onChange={(regions) => patch({ regions })}
        options={REGION_OPTIONS}
        values={profile.regions}
      />

      <div className={styles.footer}>
        {isIncomplete ? (
          <p className={styles.validation} role="status">
            {missingFields && missingRegions
              ? "Выберите хотя бы одно направление и один регион."
              : missingFields
                ? "Выберите хотя бы одно направление."
                : "Выберите хотя бы один регион."}
          </p>
        ) : null}
        <button className={styles.submit} disabled={isIncomplete} type="submit">
          Построить мой маршрут
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
