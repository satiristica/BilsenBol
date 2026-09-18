"use client";

import { ArrowLeft, Check, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ActionButton } from "@/components/ActionButton";
import {
  BUDGET_ICONS,
  ENGLISH_ICONS,
  FIELD_ICONS,
  GRADE_ICONS,
  REGION_ICONS,
} from "@/components/optionIcons";
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
  type LabelledOption,
} from "@/domain/profile";
import { classNames } from "@/lib/classNames";

import {
  PROFILE_QUESTIONS,
  describeAnswer,
  isAnswered,
  type ProfileQuestion,
} from "./profileQuestions";
import styles from "./ProfileWizard.module.css";

interface ProfileWizardProps {
  profile: ApplicantProfile;
  onChange: (profile: ApplicantProfile) => void;
  onSubmit: () => void;
}

function optionsFor(id: ProfileQuestion["id"]): readonly LabelledOption<string>[] {
  switch (id) {
    case "grade":
      return GRADE_OPTIONS;
    case "english":
      return ENGLISH_OPTIONS;
    case "budget":
      return BUDGET_OPTIONS;
    case "fields":
      return FIELD_OPTIONS;
    case "regions":
      return REGION_OPTIONS;
    default:
      return [];
  }
}

function iconFor(id: ProfileQuestion["id"], value: string): LucideIcon | undefined {
  const maps: Partial<Record<ProfileQuestion["id"], Record<string, LucideIcon>>> = {
    grade: GRADE_ICONS,
    english: ENGLISH_ICONS,
    budget: BUDGET_ICONS,
    fields: FIELD_ICONS,
    regions: REGION_ICONS,
  };
  return maps[id]?.[value];
}

function selectedValues(profile: ApplicantProfile, id: ProfileQuestion["id"]): string[] {
  switch (id) {
    case "grade":
      return [profile.grade];
    case "english":
      return [profile.english];
    case "budget":
      return [profile.budget];
    case "fields":
      return profile.fields;
    case "regions":
      return profile.regions;
    default:
      return [];
  }
}

export function ProfileWizard({ profile, onChange, onSubmit }: ProfileWizardProps) {
  const [index, setIndex] = useState(0);
  const question = PROFILE_QUESTIONS[index];
  const isLast = index === PROFILE_QUESTIONS.length - 1;
  const options = optionsFor(question.id);
  const selected = selectedValues(profile, question.id);
  const canContinue = isAnswered(profile, question.id);

  const goNext = () => {
    if (!canContinue) {
      return;
    }
    if (isLast) {
      onSubmit();
      return;
    }
    setIndex((current) => Math.min(current + 1, PROFILE_QUESTIONS.length - 1));
  };

  // Picking an answer never advances on its own: the user moves on with "Далее".
  const applySingle = (value: string) => {
    onChange({ ...profile, [question.id]: value } as ApplicantProfile);
  };

  const toggleMulti = (value: string) => {
    const current = selected;
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...profile, [question.id]: next } as ApplicantProfile);
  };

  const pickByIndex = (optionIndex: number) => {
    const option = options[optionIndex];
    if (!option) {
      return;
    }
    if (question.kind === "single") {
      applySingle(option.value);
    } else if (question.kind === "multi") {
      toggleMulti(option.value);
    }
  };

  // Digit keys pick an option; Enter continues. Skipped while the slider or a
  // summary chip has focus so their own key handling keeps working.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "BUTTON" || target?.getAttribute("type") === "range") {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        goNext();
        return;
      }
      const digit = Number(event.key);
      if (Number.isInteger(digit) && digit >= 1 && digit <= options.length) {
        event.preventDefault();
        pickByIndex(digit - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const gpaNote =
    profile.gpa >= GRANT_COMPETITIVE_GPA
      ? "Хватает для грантов"
      : `Для грантов нужно от ${formatGpa(GRANT_COMPETITIVE_GPA)}`;

  return (
    <section aria-label="Анкета профиля" className={styles.wizard}>
      <header className={styles.head}>
        <div className={styles.headTop}>
          <button
            className={styles.back}
            disabled={index === 0}
            onClick={() => setIndex((current) => Math.max(current - 1, 0))}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.4} /> Назад
          </button>
          <span className={styles.counter}>
            <b>{index + 1}</b> / {PROFILE_QUESTIONS.length}
          </span>
        </div>
        <div
          aria-valuemax={PROFILE_QUESTIONS.length}
          aria-valuemin={1}
          aria-valuenow={index + 1}
          aria-valuetext={`Вопрос ${index + 1} из ${PROFILE_QUESTIONS.length}`}
          className={styles.track}
          role="progressbar"
        >
          <span
            className={styles.fill}
            style={{ width: `${((index + 1) / PROFILE_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </header>

      <fieldset className={styles.question} key={question.id}>
        <legend className={styles.legend}>
          <h2 className={styles.title}>{question.title}</h2>
        </legend>

        {question.kind === "scale" ? (
          <div className={styles.scale}>
            <output className={styles.scaleValue} htmlFor="gpa">
              {formatGpa(profile.gpa)}
            </output>
            <input
              aria-label="Средний балл аттестата"
              className={styles.slider}
              id="gpa"
              max={GPA_MAX}
              min={GPA_MIN}
              onChange={(event) => onChange({ ...profile, gpa: Number(event.target.value) })}
              step={GPA_STEP}
              type="range"
              value={profile.gpa}
            />
            <div className={styles.scaleMarks}>
              <span>{formatGpa(GPA_MIN)}</span>
              <span>{formatGpa(GRANT_COMPETITIVE_GPA)}</span>
              <span>{formatGpa(GPA_MAX)}</span>
            </div>
            <p
              className={classNames(
                styles.scaleNote,
                profile.gpa < GRANT_COMPETITIVE_GPA && styles.scaleNoteLow,
              )}
            >
              {gpaNote}
            </p>
          </div>
        ) : (
          <div className={styles.options}>
            {options.map((option) => {
              const Icon = iconFor(question.id, option.value);
              return (
              <label className={styles.option} key={option.value}>
                <input
                  checked={selected.includes(option.value)}
                  name={question.id}
                  onChange={() =>
                    question.kind === "single"
                      ? applySingle(option.value)
                      : toggleMulti(option.value)
                  }
                  type={question.kind === "single" ? "radio" : "checkbox"}
                  value={option.value}
                />
                <span aria-hidden="true" className={styles.icon}>
                  {Icon ? <Icon size={22} strokeWidth={2} /> : null}
                </span>
                <span className={styles.optionLabel}>{option.label}</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    styles.tick,
                    question.kind === "multi" && styles.tickSquare,
                  )}
                >
                  <Check size={14} strokeWidth={3.2} />
                </span>
              </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <ActionButton disabled={!canContinue} onClick={goNext} withArrow>
            {isLast ? "Построить мой маршрут" : "Далее"}
          </ActionButton>
          {question.kind === "multi" ? (
            <p
              className={classNames(
                styles.selectionNote,
                !canContinue && styles.selectionNoteEmpty,
              )}
              role="status"
            >
              {canContinue ? `Выбрано: ${selected.length}` : "Выберите хотя бы один"}
            </p>
          ) : null}
        </div>

        <ul className={styles.summary}>
          {PROFILE_QUESTIONS.map((item, itemIndex) => {
            const answered = isAnswered(profile, item.id);
            return (
              <li key={item.id}>
                <button
                  className={classNames(
                    styles.summaryChip,
                    itemIndex === index && styles.summaryChipCurrent,
                  )}
                  onClick={() => setIndex(itemIndex)}
                  type="button"
                >
                  <span className={styles.summaryKey}>{item.chipLabel}</span>
                  <span
                    className={classNames(
                      styles.summaryValue,
                      !answered && styles.summaryValueEmpty,
                    )}
                  >
                    {describeAnswer(profile, item.id)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
