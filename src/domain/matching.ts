import {
  PROGRAMS,
  annualTuitionUsd,
  type Currency,
  type EnglishTest,
  type Program,
} from "@/data/programs";
import {
  BUDGET_CEILING_USD,
  GRANT_COMPETITIVE_GPA,
  type ApplicantProfile,
} from "@/domain/profile";
import { YEARS, pluralRu } from "@/lib/plural";

/**
 * Hard constraints decide eligibility, soft signals only decide order.
 * A programme that violates a hard constraint is never shown as a match,
 * regardless of how well it scores on preference.
 *
 * The school average is deliberately not a hard constraint: none of the
 * catalogued universities publishes a cut-off on the five-point CIS scale, so
 * it only ranks programmes that rely on a merit scholarship.
 */
export type HardConstraint = "budget" | "language" | "region";

/** How this applicant can satisfy the programme's English requirement. */
export type EnglishRoute = "not-required" | "certificate" | "own-test" | "foundation";

export type MatchBadgeKind =
  | "budget-fit"
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
  englishRoute: EnglishRoute;
  /** Approximate yearly tuition in USD at the catalogue's reference rates. */
  annualTuitionUsd: number;
  /** The tuition exceeds the budget, so the programme fits only with its scholarship. */
  needsScholarshipForBudget: boolean;
}

export interface ExclusionSummary {
  budget: number;
  language: number;
  region: number;
}

export interface RecommendationResult {
  matches: ProgramMatch[];
  excluded: ExclusionSummary;
  totalConsidered: number;
}

function certificateOf(profile: ApplicantProfile): EnglishTest | null {
  return profile.english === "school" ? null : profile.english;
}

function isTaughtInEnglish(program: Program): boolean {
  return program.teachingLanguage === "Английский";
}

export function isFreeTuition(program: Program): boolean {
  return program.tuition.amount === 0;
}

export function hasFullFunding(program: Program): boolean {
  return program.fullFunding !== null || isFreeTuition(program);
}

function findEnglishRoute(profile: ApplicantProfile, program: Program): EnglishRoute | null {
  if (program.english === null) {
    return "not-required";
  }
  const certificate = certificateOf(profile);
  const { accepts } = program.english;
  if (certificate && (accepts === "unlisted" || accepts.includes(certificate))) {
    return "certificate";
  }
  if (program.ownEnglishTest) {
    return "own-test";
  }
  const foundation = program.foundation;
  if (foundation && (foundation.accepts === null || (certificate && foundation.accepts.includes(certificate)))) {
    return "foundation";
  }
  return null;
}

interface Eligibility {
  route: EnglishRoute;
  tuitionUsd: number;
  needsScholarshipForBudget: boolean;
}

function checkEligibility(
  profile: ApplicantProfile,
  program: Program,
): { failure: HardConstraint } | { eligibility: Eligibility } {
  if (profile.regions.length > 0 && !profile.regions.includes(program.region)) {
    return { failure: "region" };
  }
  const tuitionUsd = annualTuitionUsd(program.tuition);
  const fitsBudget = tuitionUsd <= BUDGET_CEILING_USD[profile.budget];
  if (!fitsBudget && program.fullFunding === null) {
    return { failure: "budget" };
  }
  const route = findEnglishRoute(profile, program);
  if (route === null) {
    return { failure: "language" };
  }
  return { eligibility: { route, tuitionUsd, needsScholarshipForBudget: !fitsBudget } };
}

function buildProgramBadges(program: Program): ProgramBadge[] {
  const badges: ProgramBadge[] = [];
  if (isFreeTuition(program)) {
    badges.push({ label: "Бесплатное обучение" });
  }
  if (program.fullFunding) {
    badges.push({ label: `Стипендия ${program.fullFunding.name}` });
  }
  if (isTaughtInEnglish(program)) {
    badges.push({ label: "Обучение на английском" });
  } else {
    badges.push({ label: `Обучение: ${program.teachingLanguage.toLowerCase()}` });
  }
  if (program.foundation) {
    badges.push({ label: "Есть подготовительная программа" });
  }
  if (program.entranceExam) {
    badges.push({ label: "Вступительные испытания" });
  }
  return badges;
}

const ROUTE_FACTORS: Record<EnglishRoute, { label: string; delta: number; reason: string }> = {
  certificate: {
    label: "Ваш сертификат принимают",
    delta: 14,
    reason: "Ваш языковой сертификат есть в списке принимаемых.",
  },
  "not-required": {
    label: "Сертификат по английскому не нужен",
    delta: 12,
    reason: "Английский сертификат не указан среди требований к поступлению.",
  },
  "own-test": {
    label: "Можно сдать экзамен вуза",
    delta: 10,
    reason: "Без сертификата можно сдать собственный экзамен вуза по английскому.",
  },
  foundation: {
    label: "Через подготовительную программу",
    delta: 8,
    reason: "Подготовительная программа открывает путь, пока язык не подтверждён.",
  },
};

function scoreProgram(profile: ApplicantProfile, program: Program, eligibility: Eligibility) {
  const factors: MatchFactor[] = [{ label: "Проходит обязательные требования", delta: 6 }];
  const matchBadges: MatchBadge[] = [];
  const whyItFits: string[] = [];

  const wantsThisField = profile.fields.length === 0 || profile.fields.includes(program.field);
  if (wantsThisField) {
    factors.push({ label: "Совпадает с выбранным направлением", delta: 34 });
    matchBadges.push({ kind: "field-fit", label: "Ваше направление" });
    whyItFits.push("Направление совпадает с тем, что вы выбрали в профиле.");
  }

  if (isFreeTuition(program)) {
    factors.push({ label: "Обучение бесплатное", delta: 18 });
    matchBadges.push({ kind: "budget-fit", label: "Подходит по бюджету" });
    whyItFits.push("Обучение бесплатное — платить за учёбу не нужно.");
  } else if (program.fullFunding?.awardedToAllAdmitted) {
    factors.push({ label: "Стипендия всем зачисленным", delta: 18 });
    matchBadges.push({ kind: "budget-fit", label: "Подходит по бюджету" });
    whyItFits.push(`${program.fullFunding.name} получают все зачисленные иностранцы.`);
  } else if (eligibility.needsScholarshipForBudget) {
    // A contested scholarship is the whole plan for a grant-only family, but
    // only a fallback for a family that set a budget.
    factors.push({
      label: "В бюджет — только со стипендией",
      delta: profile.budget === "grant-only" ? 12 : 4,
    });
    whyItFits.push(`Стипендия ${program.fullFunding?.name} покрывает обучение, если её получить.`);
  } else {
    const ceiling = BUDGET_CEILING_USD[profile.budget];
    const headroom = Number.isFinite(ceiling)
      ? 1 - eligibility.tuitionUsd / Math.max(ceiling, 1)
      : 1;
    factors.push({
      label: "Стоимость укладывается в бюджет",
      delta: Math.round(6 + Math.max(headroom, 0) * 12),
    });
    matchBadges.push({ kind: "budget-fit", label: "Подходит по бюджету" });
    whyItFits.push("Стоимость обучения помещается в указанный семейный бюджет.");
  }

  const route = ROUTE_FACTORS[eligibility.route];
  factors.push({ label: route.label, delta: route.delta });
  whyItFits.push(route.reason);
  if (eligibility.route === "certificate") {
    matchBadges.push({ kind: "language-ready", label: "Язык подтверждён" });
  } else if (eligibility.route === "foundation") {
    matchBadges.push({ kind: "foundation-available", label: "Есть подготовительная" });
  }

  // Scholarship contests are merit-based; the GPA threshold is our own
  // heuristic (GRANT_COMPETITIVE_GPA), not a university cut-off.
  if (program.fullFunding && profile.gpa >= GRANT_COMPETITIVE_GPA) {
    const margin = Math.min(profile.gpa, 5) - GRANT_COMPETITIVE_GPA;
    factors.push({
      label: "Балл на уровне стипендиальных конкурсов",
      delta: 8 + Math.round((margin / (5 - GRANT_COMPETITIVE_GPA)) * 6),
    });
    whyItFits.push("Ваш средний балл помогает в конкурсе на стипендию.");
  }

  if (profile.regions.includes(program.region)) {
    factors.push({ label: "Выбранный вами регион", delta: 8 });
  }

  const appliesThisSeason = profile.grade !== "grade-9-10";
  if (appliesThisSeason && eligibility.route !== "foundation") {
    factors.push({ label: "Можно поступать без подготовительного года", delta: 6 });
  }

  const score = Math.max(
    0,
    Math.min(
      100,
      factors.reduce((total, factor) => total + factor.delta, 0),
    ),
  );

  return { score, factors, matchBadges, whyItFits };
}

function describeTradeOff(profile: ApplicantProfile, program: Program, eligibility: Eligibility): string {
  if (program.fullFunding?.awardedToAllAdmitted) {
    return `${program.fullFunding.name} получают все зачисленные иностранцы — конкурс идёт за место, а не за деньги.`;
  }
  if (eligibility.needsScholarshipForBudget && program.fullFunding) {
    return `Без стипендии ${program.fullFunding.name} стоимость выше вашего бюджета, а стипендия конкурсная.`;
  }
  if (program.fullFunding) {
    return `Стипендия ${program.fullFunding.name} выдаётся ${program.fullFunding.eligibility} — это конкурс, а не гарантия.`;
  }
  if (!profile.fields.includes(program.field)) {
    return "Это не то направление, которое вы отметили основным — рассматривайте как запасной вариант.";
  }
  if (!isTaughtInEnglish(program)) {
    return `Обучение на языке «${program.teachingLanguage.toLowerCase()}» — язык придётся выучить до уровня, который требует вуз.`;
  }
  if (eligibility.tuitionUsd >= 10000) {
    return "Сильная программа, но стоимость обучения останется основной статьёй расходов.";
  }
  if (program.durationYears !== null && program.durationYears >= 6) {
    return `Учиться дольше обычного: ${program.durationYears} ${pluralRu(program.durationYears, YEARS)}.`;
  }
  if (program.entranceExam) {
    return "Кроме документов нужно пройти вступительные испытания вуза.";
  }
  return "Даты подачи привязаны к году набора — следите за ними на сайте вуза.";
}

function describeBlocker(profile: ApplicantProfile, program: Program, eligibility: Eligibility): string | null {
  if (eligibility.route === "foundation" && program.foundation) {
    return `Сейчас поступление возможно только через подготовительную программу: ${program.foundation.requirement}.`;
  }
  if (eligibility.route === "own-test" && program.ownEnglishTest) {
    return `Английский проверяют отдельно: ${program.ownEnglishTest}.`;
  }
  if (eligibility.route === "certificate" && program.english?.accepts === "unlisted") {
    return "Вуз называет уровень английского, но не список тестов — уточните, примут ли ваш сертификат.";
  }
  if (eligibility.needsScholarshipForBudget && !program.fullFunding?.awardedToAllAdmitted) {
    return "В ваш бюджет программа укладывается только со стипендией.";
  }
  if (program.entranceExam) {
    return `Вступительные испытания: ${program.entranceExam}.`;
  }
  if (program.fullFunding && profile.gpa < GRANT_COMPETITIVE_GPA) {
    return "Стипендии дают по заслугам, а ваш средний балл пока ниже грантового уровня.";
  }
  return null;
}

const TEST_NAMES: Record<EnglishTest, string> = {
  ielts: "IELTS",
  toefl: "TOEFL",
  duolingo: "Duolingo",
};

function describeImprovement(profile: ApplicantProfile, program: Program, eligibility: Eligibility): string {
  const english = program.english;
  const needsCertificate = eligibility.route === "foundation" || eligibility.route === "own-test";
  if (needsCertificate && english && english.accepts !== "unlisted" && english.accepts.length > 0) {
    const tests = english.accepts.map((test) => TEST_NAMES[test]).join(" или ");
    return `Сдайте ${tests} (${english.minimum}) — это откроет прямое поступление.`;
  }
  if (program.entranceExam) {
    return "Начните готовиться к вступительным испытаниям заранее — по ним и идёт отбор.";
  }
  if (program.fullFunding) {
    return "Соберите олимпиадные и проектные достижения — они решают исход стипендиального конкурса.";
  }
  if (profile.english === "school" && !isTaughtInEnglish(program)) {
    return `Начните учить язык обучения: ${program.teachingLanguage.toLowerCase()}.`;
  }
  return "Напишите мотивационное письмо под эту программу и запросите рекомендацию у учителя.";
}

export function rankPrograms(
  profile: ApplicantProfile,
  catalogue: readonly Program[] = PROGRAMS,
): RecommendationResult {
  const excluded: ExclusionSummary = { budget: 0, language: 0, region: 0 };
  const matches: ProgramMatch[] = [];

  for (const program of catalogue) {
    const check = checkEligibility(profile, program);
    if ("failure" in check) {
      excluded[check.failure] += 1;
      continue;
    }
    const { eligibility } = check;
    const scored = scoreProgram(profile, program, eligibility);
    matches.push({
      program,
      score: scored.score,
      factors: scored.factors,
      matchBadges: scored.matchBadges,
      programBadges: buildProgramBadges(program),
      whyItFits: scored.whyItFits,
      tradeOff: describeTradeOff(profile, program, eligibility),
      blocker: describeBlocker(profile, program, eligibility),
      improvementAction: describeImprovement(profile, program, eligibility),
      englishRoute: eligibility.route,
      annualTuitionUsd: eligibility.tuitionUsd,
      needsScholarshipForBudget: eligibility.needsScholarshipForBudget,
    });
  }

  matches.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.annualTuitionUsd - right.annualTuitionUsd;
  });

  return { matches, excluded, totalConsidered: catalogue.length };
}

const CURRENCY_SIGNS: Partial<Record<Currency, string>> = { USD: "$", EUR: "€" };

/** Tuition exactly as the university publishes it. */
export function formatTuition(program: Program): string {
  const { amount, currency, period } = program.tuition;
  if (amount === 0) {
    return "Бесплатно";
  }
  const sign = CURRENCY_SIGNS[currency] ?? currency;
  return `${amount.toLocaleString("ru-RU")} ${sign} ${period === "year" ? "в год" : "за семестр"}`;
}

/** Published tuition plus the dollar estimate the budget filter used. */
export function formatTuitionWithEstimate(match: ProgramMatch): string {
  const published = formatTuition(match.program);
  const { amount, currency, period } = match.program.tuition;
  if (amount === 0 || (currency === "USD" && period === "year")) {
    return published;
  }
  return `${published} (≈ ${match.annualTuitionUsd.toLocaleString("ru-RU")} $ в год)`;
}

export function englishRequirementText(program: Program): string {
  return program.english?.minimum ?? program.englishNote ?? "Не нужен";
}
