import {
  BUDGET_OPTIONS,
  ENGLISH_OPTIONS,
  FIELD_OPTIONS,
  GRADE_OPTIONS,
  GRANT_COMPETITIVE_GPA,
  REGION_OPTIONS,
  formatGpa,
  hasEnglishCertificate,
  labelOf,
  type ApplicantProfile,
} from "@/domain/profile";
import { hasFullFunding, type RecommendationResult } from "@/domain/matching";
import { pluralRu } from "@/lib/plural";

export type ReadinessStatus =
  | "ready-for-grants"
  | "needs-language"
  | "strengthen-academics"
  | "one-year-runway";

export type InsightKind = "strength" | "bottleneck" | "runway";

export interface DiagnosisInsight {
  kind: InsightKind;
  label: string;
  title: string;
  detail: string;
}

export interface Diagnosis {
  /** One line restating who the applicant is, so the diagnosis is checkable. */
  profileSummary: string;
  /** The educational goal the recommendations are built for. */
  goal: string;
  status: ReadinessStatus;
  statusLabel: string;
  statusDetail: string;
  insights: DiagnosisInsight[];
  meters: ReadinessMeter[];
}

const STATUS_LABELS: Record<ReadinessStatus, string> = {
  "ready-for-grants": "Готов к подаче на гранты",
  "needs-language": "Требуется подтянуть язык",
  "strengthen-academics": "Нужно усилить средний балл",
  "one-year-runway": "В запасе ещё год",
};

function resolveStatus(profile: ApplicantProfile): ReadinessStatus {
  if (profile.grade === "grade-9-10") {
    return "one-year-runway";
  }
  if (!hasEnglishCertificate(profile)) {
    return "needs-language";
  }
  if (profile.gpa < GRANT_COMPETITIVE_GPA) {
    return "strengthen-academics";
  }
  return "ready-for-grants";
}

function describeStatus(
  status: ReadinessStatus,
  profile: ApplicantProfile,
  result: RecommendationResult,
): string {
  const openings = result.matches.length;
  switch (status) {
    case "ready-for-grants":
      return `Средний балл ${profile.gpa.toFixed(1)} и готовый языковой сертификат позволяют подаваться в этом сезоне. Подходящих программ: ${openings}.`;
    case "needs-language":
      return "Профиль сильный, но без языкового сертификата часть программ открывается только через подготовительный год.";
    case "strengthen-academics":
      return "Язык подтверждён, но средний балл пока ниже уровня, на котором обычно проходят грантовые конкурсы.";
    case "one-year-runway":
      return "Вы готовитесь заранее — этого времени хватает, чтобы закрыть язык и поднять балл до подачи.";
  }
}

function buildStrength(profile: ApplicantProfile, result: RecommendationResult): DiagnosisInsight {
  if (profile.gpa >= 4.7) {
    return {
      kind: "strength",
      label: "Сильная сторона",
      title: `Высокий средний балл ${profile.gpa.toFixed(1)}`,
      detail: "Это главный аргумент в грантовых конкурсах и при прямом зачислении.",
    };
  }
  if (hasEnglishCertificate(profile)) {
    return {
      kind: "strength",
      label: "Сильная сторона",
      title: "Язык уже подтверждён",
      detail: "Сертификат снимает основное ограничение и открывает англоязычные программы.",
    };
  }
  const grantOptions = result.matches.filter((match) => hasFullFunding(match.program)).length;
  if (grantOptions > 0) {
    return {
      kind: "strength",
      label: "Сильная сторона",
      title: pluralRu(grantOptions, {
        one: `Доступна ${grantOptions} программа с бесплатным обучением или стипендией`,
        few: `Доступны ${grantOptions} программы с бесплатным обучением или стипендией`,
        many: `Доступно ${grantOptions} программ с бесплатным обучением или стипендией`,
      }),
      detail: "Даже при нулевом бюджете маршрут поступления остаётся рабочим.",
    };
  }
  return {
    kind: "strength",
    label: "Сильная сторона",
    title: "Направление выбрано осознанно",
    detail: "Чёткое направление сужает подготовку до конкретных предметов и экзаменов.",
  };
}

function buildBottleneck(
  profile: ApplicantProfile,
  result: RecommendationResult,
): DiagnosisInsight {
  if (!hasEnglishCertificate(profile)) {
    return {
      kind: "bottleneck",
      label: "Главное узкое место",
      title: "Нет языкового сертификата",
      detail:
        result.excluded.language === 0
          ? "Часть программ доступна только через подготовительный год Foundation."
          : `Из-за этого ${pluralRu(result.excluded.language, {
              one: `${result.excluded.language} программа каталога закрыта`,
              few: `${result.excluded.language} программы каталога закрыты`,
              many: `${result.excluded.language} программ каталога закрыты`,
            })} полностью, а часть доступна только через Foundation.`,
    };
  }
  const scholarshipOnly = result.matches.filter((match) => match.needsScholarshipForBudget).length;
  if (scholarshipOnly > 0 && profile.gpa < GRANT_COMPETITIVE_GPA) {
    return {
      kind: "bottleneck",
      label: "Главное узкое место",
      title: "Средний балл ниже стипендиального уровня",
      detail: `${pluralRu(scholarshipOnly, {
        one: `${scholarshipOnly} программа укладывается`,
        few: `${scholarshipOnly} программы укладываются`,
        many: `${scholarshipOnly} программ укладываются`,
      })} в бюджет только со стипендией, а стипендии дают по заслугам.`,
    };
  }
  if (result.excluded.budget > 0) {
    return {
      kind: "bottleneck",
      label: "Главное узкое место",
      title: "Бюджет отсекает часть вариантов",
      detail: `${pluralRu(result.excluded.budget, {
        one: `${result.excluded.budget} программа стоит`,
        few: `${result.excluded.budget} программы стоят`,
        many: `${result.excluded.budget} программ стоят`,
      })} дороже указанного бюджета и не дают полной стипендии.`,
    };
  }
  return {
    kind: "bottleneck",
    label: "Главное узкое место",
    title: "Не хватает документов, а не оценок",
    detail: "Ограничения по баллу и бюджету пройдены — дело за эссе, рекомендациями и сроками.",
  };
}

function buildRunway(profile: ApplicantProfile): DiagnosisInsight {
  switch (profile.grade) {
    case "grade-9-10":
      return {
        kind: "runway",
        label: "Запас времени",
        title: "Полтора–два учебных года до подачи",
        detail: "Хватает и на языковой экзамен, и на то, чтобы поднять средний балл.",
      };
    case "grade-11":
      return {
        kind: "runway",
        label: "Запас времени",
        title: "Подача в этом учебном году",
        detail: "Окна подачи в каталоге открываются зимой, поэтому документы готовят уже осенью.",
      };
    case "graduate":
      return {
        kind: "runway",
        label: "Запас времени",
        title: "Ближайший набор или год на усиление",
        detail: "Можно подаваться в ближайшее окно либо потратить год на язык и портфолио.",
      };
  }
}

export function buildDiagnosis(
  profile: ApplicantProfile,
  result: RecommendationResult,
): Diagnosis {
  const status = resolveStatus(profile);
  return {
    profileSummary: [
      labelOf(GRADE_OPTIONS, profile.grade),
      `балл ${formatGpa(profile.gpa)}`,
      // Exam names (IELTS, Duolingo) keep their casing; only the plain phrase is lowered.
      `английский: ${profile.english === "school" ? "только школьный" : labelOf(ENGLISH_OPTIONS, profile.english)}`,
      labelOf(BUDGET_OPTIONS, profile.budget),
    ].join(" · "),
    goal: `Бакалавриат: ${profile.fields
      .map((field) => labelOf(FIELD_OPTIONS, field))
      .join(", ")} — ${profile.regions.map((region) => labelOf(REGION_OPTIONS, region)).join(", ")}`,
    status,
    statusLabel: STATUS_LABELS[status],
    statusDetail: describeStatus(status, profile, result),
    insights: [
      buildStrength(profile, result),
      buildBottleneck(profile, result),
      buildRunway(profile),
    ],
    meters: buildReadinessMeters(profile, result),
  };
}

export type MeterTone = "good" | "warn";

/** A readiness gauge: every number is counted from the profile and its matches. */
export interface ReadinessMeter {
  id: "gpa" | "language" | "budget" | "catalogue";
  label: string;
  value: string;
  /** Fill, 0..1. */
  fraction: number;
  tone: MeterTone;
  /** A reference point on the scale, such as the grant-level average. */
  marker?: { at: number; label: string };
}

function ratioMeter(
  id: ReadinessMeter["id"],
  label: string,
  part: number,
  whole: number,
): ReadinessMeter {
  const fraction = whole === 0 ? 0 : part / whole;
  return {
    id,
    label,
    value: whole === 0 ? "—" : `${part} из ${whole}`,
    fraction,
    tone: fraction >= 0.5 ? "good" : "warn",
  };
}

export function buildReadinessMeters(
  profile: ApplicantProfile,
  result: RecommendationResult,
): ReadinessMeter[] {
  const { matches, excluded, totalConsidered } = result;
  const directEntry = matches.filter(
    (match) => match.englishRoute === "certificate" || match.englishRoute === "not-required",
  ).length;
  const withinBudget = matches.filter((match) => !match.needsScholarshipForBudget).length;
  const gpaScale = (gpa: number) => (gpa - 3) / 2;

  return [
    {
      id: "gpa",
      label: "Средний балл",
      value: `${formatGpa(profile.gpa)} / 5`,
      fraction: gpaScale(profile.gpa),
      tone: profile.gpa >= GRANT_COMPETITIVE_GPA ? "good" : "warn",
      marker: { at: gpaScale(GRANT_COMPETITIVE_GPA), label: "гранты" },
    },
    ratioMeter("language", "Язык без подготовки", directEntry, matches.length + excluded.language),
    ratioMeter("budget", "По карману без стипендии", withinBudget, matches.length + excluded.budget),
    ratioMeter("catalogue", "Подходит программ", matches.length, totalConsidered),
  ];
}
