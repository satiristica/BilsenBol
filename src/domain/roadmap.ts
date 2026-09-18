import type { EnglishTest } from "@/data/programs";
import { daysUntil, seasonOf } from "@/domain/dates";
import {
  shortUniversityName,
  type ProgramMatch,
  type RecommendationResult,
} from "@/domain/matching";
import {
  hasEnglishCertificate,
  type ApplicantProfile,
  type StudyField,
} from "@/domain/profile";

import type { RoadmapSeason } from "@/domain/dates";

export type { RoadmapSeason };

export interface RoadmapStep {
  /**
   * Stable semantic id: when the profile changes the roadmap is rebuilt, and a
   * step that still exists keeps whatever progress the user already marked.
   */
  id: string;
  season: RoadmapSeason;
  /** Never contains digits: titles are sent to the AI, which must not echo numbers. */
  title: string;
  detail: string;
  /** One- or two-word caption for compact views (tree nodes, icons). */
  label?: string;
  /** ISO date for steps tied to a published deadline. */
  dueDate?: string;
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

/** The roadmap is built around the programmes the applicant would apply to first. */
const TARGET_PROGRAMMES = 3;

const TEST_NAMES: Record<EnglishTest, string> = {
  ielts: "IELTS",
  toefl: "TOEFL",
  duolingo: "Duolingo",
};

function joinNames(matches: readonly ProgramMatch[]): string {
  return [...new Set(matches.map((match) => shortUniversityName(match.program)))].join(", ");
}

/**
 * The English step names the certificate the target programmes actually
 * accept, or the university's own route when there is one. A generic
 * "take IELTS or Duolingo" would be wrong for METU (no IELTS) or KAIST
 * (no Duolingo).
 */
function buildLanguageStep(profile: ApplicantProfile, targets: readonly ProgramMatch[]): RoadmapStep | null {
  const needTest = targets.filter((match) => match.englishRoute !== "not-required");
  if (needTest.length === 0) {
    return null;
  }
  if (hasEnglishCertificate(profile) && needTest.every((match) => match.englishRoute === "certificate")) {
    return {
      id: "autumn-language-check",
      season: "autumn",
      title: "Проверить срок действия языкового сертификата",
      detail: `Ваш сертификат принимают ${joinNames(needTest)}. Он должен действовать на дату зачисления.`,
      label: "Сертификат",
    };
  }

  const counts = new Map<EnglishTest, ProgramMatch[]>();
  for (const match of needTest) {
    const accepts = match.program.english?.accepts;
    if (!Array.isArray(accepts)) {
      continue;
    }
    for (const test of accepts as readonly EnglishTest[]) {
      counts.set(test, [...(counts.get(test) ?? []), match]);
    }
  }
  const [bestTest, acceptedBy] =
    [...counts.entries()].sort((left, right) => right[1].length - left[1].length)[0] ?? [];
  // Two programmes of one university share its English exam: mention it once.
  const ownTests = needTest.filter(
    (match, index) =>
      match.program.ownEnglishTest &&
      needTest.findIndex((other) => other.program.university === match.program.university) === index,
  );
  const ownNote = ownTests.length
    ? ` Без сертификата: ${ownTests.map((match) => `${shortUniversityName(match.program)} — ${match.program.ownEnglishTest}`).join("; ")}.`
    : "";

  if (!bestTest || !acceptedBy) {
    return {
      id: "autumn-language-own",
      season: "autumn",
      title: "Подготовиться к проверке английского в вузе",
      detail: `Сертификаты не перечислены.${ownNote}`,
      label: "Английский",
    };
  }
  return {
    id: `autumn-language-${bestTest}`,
    season: "autumn",
    title: `Сдать ${TEST_NAMES[bestTest]}`,
    detail: `Его принимают ${joinNames(acceptedBy)}.${ownNote}`,
    label: TEST_NAMES[bestTest],
  };
}

/** One step per distinct entrance requirement of the target programmes. */
function buildExamSteps(targets: readonly ProgramMatch[]): RoadmapStep[] {
  const seen = new Set<string>();
  const steps: RoadmapStep[] = [];
  for (const match of targets) {
    const exam = match.program.entranceExam;
    const key = `${match.program.university}|${exam}`;
    if (!exam || seen.has(key)) {
      continue;
    }
    seen.add(key);
    const name = shortUniversityName(match.program);
    steps.push({
      id: `autumn-exam-${match.program.id}`,
      season: "autumn",
      title: `Подготовиться к отбору в ${name}`,
      detail: exam,
      label: `Отбор ${name}`,
    });
  }
  return steps;
}

/** Dated deadlines of the targets land in the season they fall in, sorted by date. */
function buildDeadlineSteps(targets: readonly ProgramMatch[], today: Date): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  for (const match of targets) {
    for (const deadline of match.program.deadlines ?? []) {
      if (daysUntil(deadline.date, today) < 0) {
        continue;
      }
      const [year, month, day] = deadline.date.split("-").map(Number);
      const name = shortUniversityName(match.program);
      steps.push({
        id: `apply-${match.program.id}-${deadline.date}`,
        season: seasonOf(new Date(year, month - 1, day)),
        title: `Подать заявку в ${name}: ${deadline.label.toLowerCase()}`,
        detail: `${match.program.programName}. Окно: ${match.program.applicationWindow}.`,
        label: `Подача ${name}`,
        dueDate: deadline.date,
      });
    }
  }
  return steps.sort((left, right) => (left.dueDate ?? "").localeCompare(right.dueDate ?? ""));
}

function buildScholarshipSteps(
  targets: readonly ProgramMatch[],
  grantFocused: boolean,
): RoadmapStep[] {
  const byName = new Map<string, ProgramMatch[]>();
  for (const match of targets) {
    const funding = match.program.fullFunding;
    // Awarded to everyone admitted: there is nothing separate to apply for.
    if (funding && !funding.awardedToAllAdmitted) {
      byName.set(funding.name, [...(byName.get(funding.name) ?? []), match]);
    }
  }
  const steps = [...byName.entries()].map(([name, matches]): RoadmapStep => ({
    id: `winter-scholarship-${name.toLowerCase().replace(/[^a-zа-яё]+/gi, "-")}`,
    season: "winter",
    title: `Подать заявку на ${name}`,
    detail: `Для ${joinNames(matches)}. Кому: ${matches[0].program.fullFunding?.eligibility}. Заявка на стипендию обычно отдельная и закрывается раньше.`,
    label: name,
  }));
  if (steps.length === 0 && grantFocused) {
    steps.push({
      id: "winter-scholarships",
      season: "winter",
      title: "Найти и подать заявки на гранты",
      detail: "У выбранных программ нет полной стипендии: ищите государственные гранты своей страны.",
      label: "Гранты",
    });
  }
  return steps;
}

/**
 * The plan is derived from the applicant's top programmes: their English
 * rules, entrance requirements, dated deadlines and scholarships become
 * steps. Generic steps (documents, letters, visa) frame them. Rebuilt from
 * scratch on every profile change; stable ids keep marked progress.
 */
export function buildRoadmap(
  profile: ApplicantProfile,
  result: RecommendationResult,
  today: Date = new Date(),
): RoadmapPhase[] {
  const grantFocused = profile.budget === "grant-only";
  const planningAhead = profile.grade === "grade-9-10";
  const targets = result.matches.slice(0, TARGET_PROGRAMMES);
  const targetNames = joinNames(targets);

  const autumn: RoadmapStep[] = [
    {
      id: "autumn-shortlist",
      season: "autumn",
      title: "Утвердить короткий список программ",
      detail: targets.length
        ? `Ваш список: ${targetNames}. Добавьте одну-две запасные из подборки.`
        : "Смягчите один из фильтров профиля, чтобы получить рабочий список программ.",
      label: "Шорт-лист",
    },
  ];
  const languageStep = buildLanguageStep(profile, targets);
  if (languageStep) {
    autumn.push(languageStep);
  }
  autumn.push(...buildExamSteps(targets));
  autumn.push({
    id: "autumn-documents",
    season: "autumn",
    title: "Собрать базовый пакет документов",
    detail: "Аттестат или табель, паспорт, переводы и заверенные копии готовят заранее.",
    label: "Документы",
  });

  // The id carries the field, so changing the main interest swaps this step
  // for another one instead of silently rewording it.
  const mainField = profile.fields[0];
  if (mainField) {
    autumn.push({
      id: `autumn-activities-${mainField}`,
      season: "autumn",
      label: "Проект",
      ...ACTIVITY_BY_FIELD[mainField],
    });
  }

  if (grantFocused || profile.gpa < 4.7) {
    autumn.push({
      id: "autumn-academics",
      season: "autumn",
      title: "Поднять балл по профильным предметам",
      detail: "Средний балл — первый фильтр в грантовых конкурсах, и подтянуть его проще всего осенью.",
      label: "Средний балл",
    });
  }

  const winter: RoadmapStep[] = [
    {
      id: "winter-motivation-letter",
      season: "winter",
      title: "Написать мотивационное письмо",
      detail: targets.length
        ? `Один базовый текст плюс абзац под каждую программу: ${targetNames}.`
        : "Один базовый текст плюс короткий абзац под каждую программу из списка.",
      label: "Мотивационное письмо",
    },
    {
      id: "winter-recommendations",
      season: "winter",
      title: "Запросить рекомендации у учителей",
      detail: "Просите заранее и приносите список программ — так письмо получается конкретнее.",
      label: "Рекомендации",
    },
  ];

  const deadlineSteps = planningAhead ? [] : buildDeadlineSteps(targets, today);
  const undated = targets.filter(
    (match) => !deadlineSteps.some((step) => step.id.startsWith(`apply-${match.program.id}-`)),
  );
  if (planningAhead || undated.length > 0) {
    winter.push({
      id: "winter-applications",
      season: "winter",
      title: planningAhead ? "Пройти подачу «вхолостую»" : "Подать заявки в выбранные вузы",
      detail: planningAhead
        ? "Заполните формы на пробу: через год вы будете знать процесс и успеете к ранним окнам."
        : `${joinNames(undated)}: следите за окнами подачи на сайтах, даты нового набора ещё не опубликованы.`,
      label: "Подача",
    });
  }

  winter.push(...buildScholarshipSteps(targets, grantFocused));

  const spring: RoadmapStep[] = [
    {
      id: "spring-compare-offers",
      season: "spring",
      title: "Сравнить полученные офферы",
      detail: "Сравнивайте не только стоимость: срок обучения, язык и условия стипендии важнее.",
      label: "Офферы",
    },
    {
      id: "spring-confirm",
      season: "spring",
      title: grantFocused ? "Подтвердить грантовое место" : "Подтвердить вуз и внести депозит",
      detail: grantFocused
        ? "У грантовых мест жёсткий срок подтверждения — пропустив его, место передают следующему."
        : "После подтверждения вуз выдаёт документы, которые нужны для визы.",
      label: "Выбор вуза",
    },
    {
      id: "spring-visa",
      season: "spring",
      title: "Собрать документы на студенческую визу",
      detail: "Выписка со счёта, приглашение вуза и медицинская справка обычно нужны везде.",
      label: "Виза",
    },
  ];

  const bySeason = { autumn, winter, spring };
  for (const step of deadlineSteps) {
    bySeason[step.season].push(step);
  }

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
