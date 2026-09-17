import { DEMO_PROGRAMS, type Program } from "@/data/programs";
import {
  BUDGET_CEILING_USD,
  hasEnglishCertificate,
  type ApplicantProfile,
} from "@/domain/profile";

/**
 * Hard constraints decide eligibility, soft signals only decide order.
 * A programme that violates a hard constraint is never shown as a match,
 * regardless of how well it scores on preference.
 */
export type HardConstraint = "budget" | "gpa" | "language" | "region";

export type MatchBadgeKind =
  | "budget-fit"
  | "scholarship-chance"
  | "field-fit"
  | "language-ready"
  | "foundation-available";

export interface MatchBadge {
  kind: MatchBadgeKind;
  label: string;
}

export interface ProgramBadge {
  label: string;
}

export interface MatchFactor {
  label: string;
  delta: number;
}

export interface ProgramMatch {
  program: Program;
  score: number;
  factors: MatchFactor[];
  matchBadges: MatchBadge[];
  programBadges: ProgramBadge[];
  whyItFits: string[];
  tradeOff: string;
  /** A requirement the applicant does not meet yet, or null when nothing blocks. */
  blocker: string | null;
  improvementAction: string;
}

export interface ExclusionSummary {
  budget: number;
  gpa: number;
  language: number;
  region: number;
}

export interface RecommendationResult {
  matches: ProgramMatch[];
  excluded: ExclusionSummary;
  totalConsidered: number;
}

function failedConstraint(
  profile: ApplicantProfile,
  program: Program,
): HardConstraint | null {
  if (profile.regions.length > 0 && !profile.regions.includes(program.region)) {
    return "region";
  }
  if (profile.budget === "grant-only") {
    if (!program.hasFullGrant) {
      return "budget";
    }
  } else if (program.annualTuitionUsd > BUDGET_CEILING_USD[profile.budget]) {
    return "budget";
  }
  if (program.minGpa > profile.gpa) {
    return "gpa";
  }
  if (
    program.requiresEnglishCertificate &&
    !hasEnglishCertificate(profile) &&
    !program.hasFoundationYear
  ) {
    return "language";
  }
  return null;
}

function teachesInEnglish(program: Program): boolean {
  return program.teachingLanguage !== "ru";
}

function buildProgramBadges(program: Program): ProgramBadge[] {
  const badges: ProgramBadge[] = [];
  if (program.hasFullGrant) {
    badges.push({ label: "100% грант" });
  }
  if (program.acceptsAfterGrade11) {
    badges.push({ label: "Прямое поступление после 11 класса" });
  }
  if (teachesInEnglish(program)) {
    badges.push({ label: "Обучение на английском" });
  }
  if (program.hasFoundationYear) {
    badges.push({ label: "Есть Foundation" });
  }
  return badges;
}

function scoreProgram(profile: ApplicantProfile, program: Program) {
  const factors: MatchFactor[] = [
    { label: "Проходит обязательные требования", delta: 6 },
  ];
  const matchBadges: MatchBadge[] = [];
  const whyItFits: string[] = [];
  const hasCertificate = hasEnglishCertificate(profile);

  const wantsThisField =
    profile.fields.length === 0 || profile.fields.includes(program.field);
  if (wantsThisField) {
    factors.push({ label: "Совпадает с выбранным направлением", delta: 34 });
    whyItFits.push("Направление совпадает с тем, что вы выбрали в профиле.");
  }

  if (profile.budget === "grant-only" && program.hasFullGrant) {
    factors.push({ label: "Полностью покрывается грантом", delta: 18 });
    matchBadges.push({ kind: "scholarship-chance", label: "Высокий шанс на стипендию" });
    whyItFits.push("Программа существует в грантовом формате — платить за обучение не нужно.");
  } else {
    const ceiling = BUDGET_CEILING_USD[profile.budget];
    const headroom = Number.isFinite(ceiling)
      ? 1 - program.annualTuitionUsd / Math.max(ceiling, 1)
      : 1;
    const budgetDelta = Math.round(6 + Math.max(headroom, 0) * 12);
    factors.push({ label: "Стоимость укладывается в бюджет", delta: budgetDelta });
    matchBadges.push({ kind: "budget-fit", label: "Подходит по бюджету" });
    if (program.hasFullGrant) {
      matchBadges.push({ kind: "scholarship-chance", label: "Высокий шанс на стипендию" });
      whyItFits.push("У программы есть грантовый трек — расходы можно свести к нулю.");
    } else {
      whyItFits.push("Стоимость обучения помещается в указанный семейный бюджет.");
    }
  }

  if (wantsThisField) {
    matchBadges.push({ kind: "field-fit", label: "Ваше направление" });
  }

  if (hasCertificate && teachesInEnglish(program)) {
    factors.push({ label: "Языковой сертификат уже есть", delta: 14 });
    matchBadges.push({ kind: "language-ready", label: "Язык подтверждён" });
    whyItFits.push("Ваш языковой сертификат закрывает требование по английскому.");
  } else if (!program.requiresEnglishCertificate) {
    factors.push({ label: "Сертификат не требуется", delta: 12 });
    whyItFits.push("Сертификат не нужен: вуз проверяет язык своими силами.");
  } else if (program.hasFoundationYear) {
    factors.push({ label: "Есть подготовительный год", delta: 9 });
    matchBadges.push({ kind: "foundation-available", label: "Есть Foundation" });
    whyItFits.push("Подготовительный год позволяет поступить без готового сертификата.");
  }

  const gpaMargin = Math.min(Math.max(profile.gpa - program.minGpa, 0), 0.7);
  const gpaDelta = Math.round((gpaMargin / 0.7) * 14);
  if (gpaDelta > 0) {
    factors.push({ label: "Средний балл выше минимального", delta: gpaDelta });
  }
  if (gpaMargin >= 0.3) {
    whyItFits.push("Ваш средний балл заметно выше минимального порога программы.");
  }

  if (profile.regions.includes(program.region)) {
    factors.push({ label: "Выбранный вами регион", delta: 8 });
  }

  const appliesThisSeason = profile.grade !== "grade-9-10";
  if (appliesThisSeason && program.acceptsAfterGrade11) {
    factors.push({ label: "Поступление сразу после школы", delta: 6 });
  }

  const score = Math.max(
    0,
    Math.min(
      100,
      factors.reduce((total, factor) => total + factor.delta, 0),
    ),
  );

  return { score, factors, matchBadges, whyItFits, hasCertificate, wantsThisField, gpaMargin };
}

function describeTradeOff(profile: ApplicantProfile, program: Program): string {
  if (program.annualTuitionUsd === 0 && program.hasFullGrant) {
    return "Грантовых мест мало, поэтому конкурс выше, чем на платные программы.";
  }
  if (program.annualTuitionUsd >= 10000) {
    return "Сильная программа, но стоимость обучения останется основной статьёй расходов.";
  }
  if (!profile.fields.includes(program.field)) {
    return "Это не то направление, которое вы отметили основным — рассматривайте как запасной вариант.";
  }
  if (program.durationYears >= 6) {
    return `Учиться дольше обычного: ${program.durationYears} лет вместо четырёх.`;
  }
  if (program.teachingLanguage === "ru") {
    return "Обучение на русском — меньше языкового барьера, но и меньше международной практики.";
  }
  return "Окно подачи короткое, поэтому документы нужно готовить заранее.";
}

function describeBlocker(profile: ApplicantProfile, program: Program): string | null {
  if (
    program.requiresEnglishCertificate &&
    !hasEnglishCertificate(profile) &&
    program.hasFoundationYear
  ) {
    return "Без сертификата поступление возможно только через подготовительный год.";
  }
  if (!program.acceptsAfterGrade11 && profile.grade !== "grade-9-10") {
    return "После 11 класса СНГ нужен подготовительный год — напрямую не зачисляют.";
  }
  if (profile.gpa - program.minGpa < 0.2) {
    return `Средний балл почти на границе: программа ждёт минимум ${program.minGpa.toFixed(1)}.`;
  }
  if (program.hasFullGrant && profile.gpa < 4.7) {
    return "На грант обычно проходят с более высоким средним баллом.";
  }
  return null;
}

function describeImprovement(profile: ApplicantProfile, program: Program): string {
  if (!hasEnglishCertificate(profile) && program.requiresEnglishCertificate) {
    return "Сдайте IELTS или Duolingo — это снимет главное ограничение по этой программе.";
  }
  if (profile.gpa < program.minGpa + 0.3) {
    return "Подтяните средний балл по профильным предметам в ближайшем семестре.";
  }
  if (program.hasFullGrant) {
    return "Соберите олимпиадные и проектные достижения — они решают исход грантового конкурса.";
  }
  return "Напишите мотивационное письмо под эту программу и запросите рекомендацию у учителя.";
}

export function rankPrograms(
  profile: ApplicantProfile,
  catalogue: readonly Program[] = DEMO_PROGRAMS,
): RecommendationResult {
  const excluded: ExclusionSummary = { budget: 0, gpa: 0, language: 0, region: 0 };
  const matches: ProgramMatch[] = [];

  for (const program of catalogue) {
    const failure = failedConstraint(profile, program);
    if (failure) {
      excluded[failure] += 1;
      continue;
    }

    const scored = scoreProgram(profile, program);
    matches.push({
      program,
      score: scored.score,
      factors: scored.factors,
      matchBadges: scored.matchBadges,
      programBadges: buildProgramBadges(program),
      whyItFits: scored.whyItFits,
      tradeOff: describeTradeOff(profile, program),
      blocker: describeBlocker(profile, program),
      improvementAction: describeImprovement(profile, program),
    });
  }

  matches.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.program.annualTuitionUsd - right.program.annualTuitionUsd;
  });

  return { matches, excluded, totalConsidered: catalogue.length };
}

export function formatTuition(program: Program): string {
  if (program.annualTuitionUsd === 0) {
    return "0 $ — грант";
  }
  return `${program.annualTuitionUsd.toLocaleString("ru-RU")} $ в год`;
}
