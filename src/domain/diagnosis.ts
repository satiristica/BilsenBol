import {
  GRANT_COMPETITIVE_GPA,
  hasEnglishCertificate,
  type ApplicantProfile,
} from "@/domain/profile";
import type { RecommendationResult } from "@/domain/matching";
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
  status: ReadinessStatus;
  statusLabel: string;
  statusDetail: string;
  insights: DiagnosisInsight[];
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
  const grantOptions = result.matches.filter((match) => match.program.hasFullGrant).length;
  if (grantOptions > 0) {
    return {
      kind: "strength",
      label: "Сильная сторона",
      title: pluralRu(grantOptions, {
        one: `Доступна ${grantOptions} программа с полным грантом`,
        few: `Доступны ${grantOptions} программы с полным грантом`,
        many: `Доступно ${grantOptions} программ с полным грантом`,
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
  if (result.excluded.gpa > 0 && profile.gpa < 4.7) {
    return {
      kind: "bottleneck",
      label: "Главное узкое место",
      title: "Средний балл ограничивает выбор",
      detail: `${pluralRu(result.excluded.gpa, {
        one: `${result.excluded.gpa} программа требует`,
        few: `${result.excluded.gpa} программы требуют`,
        many: `${result.excluded.gpa} программ требуют`,
      })} балл выше вашего ${profile.gpa.toFixed(1)}.`,
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
      })} дороже указанного бюджета — их заменяют грантовые треки.`,
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
    status,
    statusLabel: STATUS_LABELS[status],
    statusDetail: describeStatus(status, profile, result),
    insights: [
      buildStrength(profile, result),
      buildBottleneck(profile, result),
      buildRunway(profile),
    ],
  };
}
