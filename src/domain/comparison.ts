import { formatTuition, type ProgramMatch } from "@/domain/matching";

export type ComparisonWinner = "left" | "right" | "tie";

export interface ComparisonRow {
  label: string;
  left: string;
  right: string;
  /** Which side is better for the applicant on this single criterion. */
  winner: ComparisonWinner;
}

const TEACHING_LANGUAGE_LABELS = {
  en: "Английский",
  ru: "Русский",
  "en-ru": "Английский и русский",
} as const;

function compareNumbers(left: number, right: number, lowerIsBetter: boolean): ComparisonWinner {
  if (left === right) {
    return "tie";
  }
  const leftWins = lowerIsBetter ? left < right : left > right;
  return leftWins ? "left" : "right";
}

function compareFlags(left: boolean, right: boolean): ComparisonWinner {
  if (left === right) {
    return "tie";
  }
  return left ? "left" : "right";
}

export function buildComparisonRows(left: ProgramMatch, right: ProgramMatch): ComparisonRow[] {
  return [
    {
      label: "Совпадение с профилем",
      left: `${left.score}%`,
      right: `${right.score}%`,
      winner: compareNumbers(left.score, right.score, false),
    },
    {
      label: "Стоимость обучения",
      left: formatTuition(left.program),
      right: formatTuition(right.program),
      winner: compareNumbers(
        left.program.annualTuitionUsd,
        right.program.annualTuitionUsd,
        true,
      ),
    },
    {
      label: "Полный грант",
      left: left.program.hasFullGrant ? "Есть" : "Нет",
      right: right.program.hasFullGrant ? "Есть" : "Нет",
      winner: compareFlags(left.program.hasFullGrant, right.program.hasFullGrant),
    },
    {
      label: "Минимальный средний балл",
      left: left.program.minGpa.toFixed(1),
      right: right.program.minGpa.toFixed(1),
      winner: compareNumbers(left.program.minGpa, right.program.minGpa, true),
    },
    {
      label: "Язык обучения",
      left: TEACHING_LANGUAGE_LABELS[left.program.teachingLanguage],
      right: TEACHING_LANGUAGE_LABELS[right.program.teachingLanguage],
      winner: "tie",
    },
    {
      label: "Нужен языковой сертификат",
      left: left.program.requiresEnglishCertificate ? "Да" : "Нет",
      right: right.program.requiresEnglishCertificate ? "Да" : "Нет",
      winner: compareFlags(
        !left.program.requiresEnglishCertificate,
        !right.program.requiresEnglishCertificate,
      ),
    },
    {
      label: "Подготовительный год",
      left: left.program.hasFoundationYear ? "Есть" : "Нет",
      right: right.program.hasFoundationYear ? "Есть" : "Нет",
      winner: compareFlags(left.program.hasFoundationYear, right.program.hasFoundationYear),
    },
    {
      label: "Срок обучения",
      left: `${left.program.durationYears} года/лет`,
      right: `${right.program.durationYears} года/лет`,
      winner: compareNumbers(left.program.durationYears, right.program.durationYears, true),
    },
    {
      label: "Окно подачи",
      left: left.program.applicationWindow,
      right: right.program.applicationWindow,
      winner: "tie",
    },
    {
      label: "Что может помешать",
      left: left.blocker ?? "Ограничений не найдено",
      right: right.blocker ?? "Ограничений не найдено",
      winner: compareFlags(left.blocker === null, right.blocker === null),
    },
  ];
}
