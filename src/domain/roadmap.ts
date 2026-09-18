import {
  hasEnglishCertificate,
  type ApplicantProfile,
  type StudyField,
} from "@/domain/profile";
import type { RecommendationResult } from "@/domain/matching";

export type RoadmapSeason = "autumn" | "winter" | "spring";

export interface RoadmapStep {
  /**
   * Stable semantic id: when the profile changes the roadmap is rebuilt, and a
   * step that still exists keeps whatever progress the user already marked.
   */
  id: string;
  season: RoadmapSeason;
  title: string;
  detail: string;
}

export interface RoadmapPhase {
  season: RoadmapSeason;
  period: string;
  title: string;
  steps: RoadmapStep[];
}

export interface RoadmapProgress {
  completedCount: number;
  totalCount: number;
  percent: number;
  nextStep: RoadmapStep | null;
  nextPhase: RoadmapPhase | null;
}

const SEASON_ORDER: readonly RoadmapSeason[] = ["autumn", "winter", "spring"];

/**
 * Extracurricular activity suggestions per field: generic guidance, not
 * requirements of any institution, so no source is needed beyond the
 * roadmap-wide notice that steps are orientation only.
 */
const ACTIVITY_BY_FIELD: Record<StudyField, { title: string; detail: string }> = {
  it: {
    title: "Сделать IT-проект или поучаствовать в хакатоне",
    detail: "Небольшое приложение или бот на GitHub показывает интерес к направлению лучше любых слов.",
  },
  business: {
    title: "Поучаствовать в олимпиаде по экономике или бизнес-кейсе",
    detail: "Разбор реального кейса или школьный проект с цифрами добавит веса мотивационному письму.",
  },
  engineering: {
    title: "Собрать инженерный проект или пойти в кружок робототехники",
    detail: "Фото и описание собранного своими руками — сильный аргумент для инженерных программ.",
  },
  medicine: {
    title: "Найти волонтёрство в медицине или олимпиаду по биологии",
    detail: "Опыт рядом с медициной показывает, что выбор направления осознанный.",
  },
  humanities: {
    title: "Выступить на дебатах, модели ООН или в конкурсе эссе",
    detail: "Публичные выступления и тексты — главное портфолио гуманитария.",
  },
};

export function buildRoadmap(
  profile: ApplicantProfile,
  result: RecommendationResult,
): RoadmapPhase[] {
  const certified = hasEnglishCertificate(profile);
  const grantFocused = profile.budget === "grant-only";
  const planningAhead = profile.grade === "grade-9-10";
  const topProgram = result.matches[0]?.program;

  const autumn: RoadmapStep[] = [
    {
      id: "autumn-shortlist",
      season: "autumn",
      title: "Составить короткий список из 4–6 программ",
      detail: topProgram
        ? `Начните со своей подборки: сейчас лидирует «${topProgram.programName}», ${topProgram.city}.`
        : "Смягчите один из фильтров профиля, чтобы получить рабочий список программ.",
    },
    certified
      ? {
          id: "autumn-language-check",
          season: "autumn",
          title: "Проверить срок действия языкового сертификата",
          detail: "Результат должен оставаться действительным на дату зачисления, а не только подачи.",
        }
      : {
          id: "autumn-language-exam",
          season: "autumn",
          title: "Записаться на IELTS или Duolingo",
          detail: "Это главное ограничение вашего профиля: сертификат открывает большинство программ.",
        },
    {
      id: "autumn-documents",
      season: "autumn",
      title: "Собрать базовый пакет документов",
      detail: "Аттестат или табель, паспорт, переводы и заверенные копии готовят заранее.",
    },
  ];

  // The id carries the field, so changing the main interest swaps this step
  // for another one instead of silently rewording it.
  const mainField = profile.fields[0];
  if (mainField) {
    autumn.push({
      id: `autumn-activities-${mainField}`,
      season: "autumn",
      ...ACTIVITY_BY_FIELD[mainField],
    });
  }

  if (grantFocused || profile.gpa < 4.7) {
    autumn.push({
      id: "autumn-academics",
      season: "autumn",
      title: "Поднять балл по профильным предметам",
      detail: "Средний балл — первый фильтр в грантовых конкурсах, и подтянуть его проще всего осенью.",
    });
  }

  const winter: RoadmapStep[] = [
    {
      id: "winter-motivation-letter",
      season: "winter",
      title: "Написать мотивационное письмо",
      detail: "Один базовый текст плюс короткий абзац под каждую программу из списка.",
    },
    {
      id: "winter-recommendations",
      season: "winter",
      title: "Запросить рекомендации у учителей",
      detail: "Просите заранее и приносите список программ — так письмо получается конкретнее.",
    },
    {
      id: "winter-applications",
      season: "winter",
      title: planningAhead ? "Пройти подачу «вхолостую»" : "Подать заявки в выбранные вузы",
      detail: planningAhead
        ? "Заполните формы на пробу: через год вы будете знать процесс и успеете к ранним окнам."
        : "Подавайтесь в несколько вузов сразу, окна подачи в каталоге частично пересекаются.",
    },
  ];

  if (grantFocused || result.matches.some((match) => match.program.hasFullGrant)) {
    winter.push({
      id: "winter-scholarships",
      season: "winter",
      title: "Подать заявки на гранты и стипендии",
      detail: "Грантовые заявки почти всегда идут отдельным пакетом и закрываются раньше обычных.",
    });
  }

  const spring: RoadmapStep[] = [
    {
      id: "spring-compare-offers",
      season: "spring",
      title: "Сравнить полученные офферы",
      detail: "Сравнивайте не только стоимость: срок обучения, язык и условия стипендии важнее.",
    },
    {
      id: "spring-confirm",
      season: "spring",
      title: grantFocused ? "Подтвердить грантовое место" : "Подтвердить вуз и внести депозит",
      detail: grantFocused
        ? "У грантовых мест жёсткий срок подтверждения — пропустив его, место передают следующему."
        : "После подтверждения вуз выдаёт документы, которые нужны для визы.",
    },
    {
      id: "spring-visa",
      season: "spring",
      title: "Собрать документы на студенческую визу",
      detail: "Выписка со счёта, приглашение вуза и медицинская справка обычно нужны везде.",
    },
  ];

  return [
    {
      season: "autumn",
      period: "Осень",
      title: "Выбор и тесты",
      steps: autumn,
    },
    {
      season: "winter",
      period: "Зима",
      title: "Подача заявок",
      steps: winter,
    },
    {
      season: "spring",
      period: "Весна",
      title: "Офферы и виза",
      steps: spring,
    },
  ];
}

export function listSteps(phases: readonly RoadmapPhase[]): RoadmapStep[] {
  return SEASON_ORDER.flatMap(
    (season) => phases.find((phase) => phase.season === season)?.steps ?? [],
  );
}

export function calculateProgress(
  phases: readonly RoadmapPhase[],
  completedStepIds: ReadonlySet<string>,
): RoadmapProgress {
  const steps = listSteps(phases);
  const completed = steps.filter((step) => completedStepIds.has(step.id));
  const nextStep = steps.find((step) => !completedStepIds.has(step.id)) ?? null;
  const nextPhase = nextStep
    ? (phases.find((phase) => phase.season === nextStep.season) ?? null)
    : null;

  return {
    completedCount: completed.length,
    totalCount: steps.length,
    percent: steps.length === 0 ? 0 : Math.round((completed.length / steps.length) * 100),
    nextStep,
    nextPhase,
  };
}
