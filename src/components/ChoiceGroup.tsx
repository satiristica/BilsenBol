"use client";

import type { LabelledOption } from "@/domain/profile";

import styles from "./ChoiceGroup.module.css";

interface SingleChoiceProps<T extends string> {
  name: string;
  legend: string;
  help?: string;
  options: readonly LabelledOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SingleChoice<T extends string>({
  name,
  legend,
  help,
  options,
  value,
  onChange,
}: SingleChoiceProps<T>) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {help ? <p className={styles.help}>{help}</p> : null}
      <div className={styles.options}>
        {options.map((option) => (
          <label className={styles.option} key={option.value}>
            <input
              checked={value === option.value}
              name={name}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span className={styles.optionLabel}>{option.label}</span>
            {option.hint ? <span className={styles.optionHint}>{option.hint}</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface MultiChoiceProps<T extends string> {
  legend: string;
  help?: string;
  options: readonly LabelledOption<T>[];
  values: readonly T[];
  onChange: (values: T[]) => void;
}

export function MultiChoice<T extends string>({
  legend,
  help,
  options,
  values,
  onChange,
}: MultiChoiceProps<T>) {
  const toggle = (option: T) => {
    onChange(
      values.includes(option)
        ? values.filter((current) => current !== option)
        : [...values, option],
    );
  };

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {help ? <p className={styles.help}>{help}</p> : null}
      <div className={styles.options}>
        {options.map((option) => (
          <label className={styles.option} key={option.value}>
            <input
              checked={values.includes(option.value)}
              onChange={() => toggle(option.value)}
              type="checkbox"
              value={option.value}
            />
            <span className={styles.optionLabel}>{option.label}</span>
            {option.hint ? <span className={styles.optionHint}>{option.hint}</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
