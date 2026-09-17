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
  hint: string;
  /** Short label for the summary rail. */
  chipLabel: string;
}

export const PROFILE_QUESTIONS: readonly ProfileQuestion[] = [
  {
    id: "grade",
    kind: "single",
    title: "Где вы сейчас учитесь?",
    hint: "От этого зависит, подаётесь вы в этом сезоне или готовитесь заранее.",
    chipLabel: "Класс",
  },
  {
    id: "gpa",
    kind: "scale",
    title: "Какой у вас средний балл?",
    hint: "Это первый фильтр в грантовых конкурсах. Достаточно примерной оценки.",
    chipLabel: "Балл",
  },
  {
    id: "english",
    kind: "single",
    title: "Как у вас с английским?",
    hint: "Выберите то, что уже сдано или точно будет сдано до подачи.",
    chipLabel: "Английский",
  },
  {
    id: "budget",
    kind: "single",
    title: "Сколько семья готова платить за год?",
    hint: "Программы дороже этой суммы мы не покажем — только честные варианты.",
    chipLabel: "Бюджет",
  },
  {
    id: "fields",
    kind: "multi",
    title: "Что вам интересно?",
    hint: "Можно выбрать несколько направлений.",
    chipLabel: "Направление",
  },
  {
    id: "regions",
    kind: "multi",
    title: "Куда хотите поехать?",
    hint: "Программы за пределами выбранных регионов в подборку не попадут.",
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
