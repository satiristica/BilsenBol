import {
  BUDGET_OPTIONS,
  ENGLISH_OPTIONS,
  FIELD_OPTIONS,
  GRADE_OPTIONS,
  REGION_OPTIONS,
  formatGpa,
  labelOf,
  type ApplicantProfile,
} from "@/domain/profile";

export type QuestionId = "grade" | "gpa" | "english" | "budget" | "fields" | "regions";

/**
 * A question either picks one value, picks several, or moves a scale.
 * Only `single` questions may advance on their own: on the other two the user
 * has not finished answering when the first control changes.
 */
export type QuestionKind = "single" | "multi" | "scale";

export interface ProfileQuestion {
  id: QuestionId;
  kind: QuestionKind;
  title: string;
  /** Short label for the summary rail. */
  chipLabel: string;
}

export const PROFILE_QUESTIONS: readonly ProfileQuestion[] = [
  {
    id: "grade",
    kind: "single",
    title: "Где вы сейчас учитесь?",
    chipLabel: "Класс",
  },
  {
    id: "gpa",
    kind: "scale",
    title: "Какой у вас средний балл?",
    chipLabel: "Балл",
  },
  {
    id: "english",
    kind: "single",
    title: "Как у вас с английским?",
    chipLabel: "Английский",
  },
  {
    id: "budget",
    kind: "single",
    title: "Сколько семья готова платить за год?",
    chipLabel: "Бюджет",
  },
  {
    id: "fields",
    kind: "multi",
    title: "Что вам интересно?",
    chipLabel: "Направление",
  },
  {
    id: "regions",
    kind: "multi",
    title: "Куда хотите поехать?",
    chipLabel: "Регионы",
  },
];

/** Short answer text shown on the summary rail. */
export function describeAnswer(profile: ApplicantProfile, id: QuestionId): string {
  switch (id) {
    case "grade":
      return labelOf(GRADE_OPTIONS, profile.grade);
    case "gpa":
      return formatGpa(profile.gpa);
    case "english":
      return labelOf(ENGLISH_OPTIONS, profile.english);
    case "budget":
      return labelOf(BUDGET_OPTIONS, profile.budget);
    case "fields":
      return profile.fields.length === 0
        ? "не выбрано"
        : profile.fields.map((field) => labelOf(FIELD_OPTIONS, field)).join(", ");
    case "regions":
      return profile.regions.length === 0
        ? "не выбрано"
        : profile.regions.map((region) => labelOf(REGION_OPTIONS, region)).join(", ");
  }
}

export function isAnswered(profile: ApplicantProfile, id: QuestionId): boolean {
  if (id === "fields") {
    return profile.fields.length > 0;
  }
  if (id === "regions") {
    return profile.regions.length > 0;
  }
  return true;
}
