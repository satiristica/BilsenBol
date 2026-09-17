/**
 * Applicant profile for CIS school students applying to bachelor programmes.
 * These types are the single source state: diagnosis, recommendations and the
 * roadmap are always recomputed from a profile, never patched in place.
 */

export type GradeLevel = "grade-9-10" | "grade-11" | "graduate";

export type EnglishLevel = "school" | "duolingo" | "toefl" | "ielts";

export type BudgetTier = "grant-only" | "up-to-3k" | "up-to-8k" | "from-15k";

export type StudyField = "it" | "business" | "engineering" | "medicine" | "humanities";

export type Region = "europe" | "asia" | "usa" | "cis";

export interface ApplicantProfile {
  grade: GradeLevel;
  /** Five-point school average. */
  gpa: number;
  english: EnglishLevel;
  budget: BudgetTier;
  fields: StudyField[];
  regions: Region[];
}

export const GPA_MIN = 3;
export const GPA_MAX = 5;
export const GPA_STEP = 0.1;
/** Below this average a full scholarship is rarely realistic. */
export const GRANT_COMPETITIVE_GPA = 4.5;

export interface LabelledOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export const GRADE_OPTIONS: readonly LabelledOption<GradeLevel>[] = [
  { value: "grade-9-10", label: "9–10 класс", hint: "Есть время на подготовку" },
  { value: "grade-11", label: "11 класс", hint: "Подача в этом сезоне" },
  { value: "graduate", label: "Выпускник", hint: "Школа уже окончена" },
];

export const ENGLISH_OPTIONS: readonly LabelledOption<EnglishLevel>[] = [
  { value: "school", label: "Только школьный", hint: "Сертификата пока нет" },
  { value: "duolingo", label: "Duolingo", hint: "Быстрый онлайн-тест" },
  { value: "toefl", label: "TOEFL", hint: "Принимают почти везде" },
  { value: "ielts", label: "IELTS", hint: "Самый универсальный" },
];

export const BUDGET_OPTIONS: readonly LabelledOption<BudgetTier>[] = [
  { value: "grant-only", label: "$0 — только грант", hint: "Нужна полная стипендия" },
  { value: "up-to-3k", label: "До $3 000 в год", hint: "Скромный семейный бюджет" },
  { value: "up-to-8k", label: "До $8 000 в год", hint: "Средний бюджет" },
  { value: "from-15k", label: "От $15 000 в год", hint: "Бюджет не ограничивает выбор" },
];

export const FIELD_OPTIONS: readonly LabelledOption<StudyField>[] = [
  { value: "it", label: "IT и данные" },
  { value: "business", label: "Бизнес и экономика" },
  { value: "engineering", label: "Инженерия" },
  { value: "medicine", label: "Медицина" },
  { value: "humanities", label: "Гуманитарные" },
];

export const REGION_OPTIONS: readonly LabelledOption<Region>[] = [
  { value: "europe", label: "Европа" },
  { value: "asia", label: "Азия" },
  { value: "usa", label: "США" },
  { value: "cis", label: "Сильные вузы СНГ" },
];

/** Annual tuition the family can cover, in USD. */
export const BUDGET_CEILING_USD: Record<BudgetTier, number> = {
  "grant-only": 0,
  "up-to-3k": 3000,
  "up-to-8k": 8000,
  "from-15k": Number.POSITIVE_INFINITY,
};

export function hasEnglishCertificate(profile: ApplicantProfile): boolean {
  return profile.english !== "school";
}

export function labelOf<T extends string>(
  options: readonly LabelledOption<T>[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function formatGpa(gpa: number): string {
  return gpa.toFixed(1);
}

export const DEFAULT_PROFILE: ApplicantProfile = {
  grade: "grade-11",
  gpa: 4.5,
  english: "school",
  budget: "up-to-3k",
  fields: ["it"],
  regions: ["europe", "cis"],
};

export interface ProfilePreset {
  id: string;
  emoji: string;
  title: string;
  description: string;
  profile: ApplicantProfile;
}

/** One-click entry points offered on the landing page. */
export const PROFILE_PRESETS: readonly ProfilePreset[] = [
  {
    id: "grant-ace",
    emoji: "🎓",
    title: "11 класс: отличник",
    description: "Ищу 100% грант или полную стипендию",
    profile: {
      grade: "grade-11",
      gpa: 4.9,
      english: "ielts",
      budget: "grant-only",
      fields: ["it", "engineering"],
      regions: ["europe", "asia", "cis"],
    },
  },
  {
    id: "it-mid-budget",
    emoji: "💻",
    title: "10 класс: IT-направление",
    description: "Умеренный бюджет, готовлюсь заранее",
    profile: {
      grade: "grade-9-10",
      gpa: 4.6,
      english: "duolingo",
      budget: "up-to-8k",
      fields: ["it"],
      regions: ["europe", "asia"],
    },
  },
  {
    id: "foundation-path",
    emoji: "🌍",
    title: "11 класс: пока без IELTS",
    description: "Нужны программы с Foundation и подготовкой",
    profile: {
      grade: "grade-11",
      gpa: 4.4,
      english: "school",
      budget: "up-to-3k",
      fields: ["business", "humanities"],
      regions: ["europe", "asia"],
    },
  },
];

export function findPreset(presetId: string | undefined): ProfilePreset | undefined {
  if (!presetId) {
    return undefined;
  }
  return PROFILE_PRESETS.find((preset) => preset.id === presetId);
}
