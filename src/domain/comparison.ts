import {
  englishRequirementText,
  formatTuitionWithEstimate,
  hasFullFunding,
  type ProgramMatch,
} from "@/domain/matching";
import { YEARS, pluralRu } from "@/lib/plural";

export type ComparisonWinner = "left" | "right" | "tie";

export interface ComparisonRow {
  label: string;
  left: string;
  right: string;
  /** Which side is better for the applicant on this single criterion. */
  winner: ComparisonWinner;
}

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

function fundingText(match: ProgramMatch): string {
  if (match.program.tuition.amount === 0) {
    return "Бесплатное обучение";
  }
  return match.program.fullFunding ? `Стипендия ${match.program.fullFunding.name}` : "Нет";
}

function durationText(match: ProgramMatch): string {
  const years = match.program.durationYears;
  if (years === null) {
    return "Уточняйте на сайте";
  }
  return Number.isInteger(years) ? `${years} ${pluralRu(years, YEARS)}` : `${years.toLocaleString("ru-RU")} года`;
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
      left: formatTuitionWithEstimate(left),
      right: formatTuitionWithEstimate(right),
      winner: compareNumbers(left.annualTuitionUsd, right.annualTuitionUsd, true),
    },
    {
      label: "Полное покрытие обучения",
      left: fundingText(left),
      right: fundingText(right),
      winner: compareFlags(hasFullFunding(left.program), hasFullFunding(right.program)),
    },
    {
      label: "Язык обучения",
      left: left.program.teachingLanguage,
      right: right.program.teachingLanguage,
      winner: "tie",
    },
    {
      label: "Требование к английскому",
      left: englishRequirementText(left.program),
      right: englishRequirementText(right.program),
      winner: compareFlags(left.englishRoute !== "foundation", right.englishRoute !== "foundation"),
    },
    {
      label: "Подготовительная программа",
      left: left.program.foundation ? "Есть" : "Нет",
      right: right.program.foundation ? "Есть" : "Нет",
      winner: compareFlags(left.program.foundation !== null, right.program.foundation !== null),
    },
    {
      label: "Вступительные испытания",
      left: left.program.entranceExam ?? "Нет данных",
      right: right.program.entranceExam ?? "Нет данных",
      winner: "tie",
    },
    {
      label: "Срок обучения",
      left: durationText(left),
      right: durationText(right),
      winner: "tie",
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
