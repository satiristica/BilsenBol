import { daysUntil, formatDateRu, nextDeadline, seasonOf } from "@/domain/dates";
import { shortUniversityName, type RecommendationResult } from "@/domain/matching";
import type { ApplicantProfile } from "@/domain/profile";
import type { RoadmapProgress, RoadmapSeason } from "@/domain/roadmap";
import { pluralRu } from "@/lib/plural";

/**
 * In-site reminders, derived from the same state as everything else: the
 * profile, its matches, the roadmap progress and today's date. Nothing is
 * stored except which reminders the user has already seen, so a profile
 * change rewrites the list instead of leaving stale reminders behind.
 */

export type ReminderKind = "deadline" | "behind" | "next-step" | "watch-dates" | "planning-ahead";

export interface Reminder {
  /** Stable while the underlying fact stays the same, so "seen" survives reloads. */
  id: string;
  kind: ReminderKind;
  title: string;
  detail: string;
  isUrgent: boolean;
  /** ISO date for dated reminders; these can be added to a calendar. */
  date?: string;
  daysLeft?: number;
  sourceUrl?: string;
}

/** Deadlines closer than this are marked urgent. */
export const URGENT_DAYS = 30;
/** The same programmes the recommendations screen shows. */
const WATCHED_MATCHES = 6;

const SEASON_INDEX: Record<RoadmapSeason, number> = { autumn: 0, winter: 1, spring: 2 };
const SEASON_NAMES: Record<RoadmapSeason, string> = {
  autumn: "осенние",
  winter: "зимние",
  spring: "весенние",
};

function describeDaysLeft(days: number): string {
  if (days === 0) {
    return "сегодня";
  }
  if (days === 1) {
    return "завтра";
  }
  return `через ${days} ${pluralRu(days, { one: "день", few: "дня", many: "дней" })}`;
}

interface ReminderInput {
  profile: ApplicantProfile;
  result: RecommendationResult;
  progress: RoadmapProgress;
  today: Date;
}

export function buildReminders({ profile, result, progress, today }: ReminderInput): Reminder[] {
  const reminders: Reminder[] = [];
  const watched = result.matches.slice(0, WATCHED_MATCHES);
  const planningAhead = profile.grade === "grade-9-10";

  if (planningAhead) {
    reminders.push({
      id: "planning-ahead",
      kind: "planning-ahead",
      title: "Вы подаётесь через год",
      detail: "Ближайшие сроки вузов относятся к чужому набору. Используйте год на язык, балл и проекты.",
      isUrgent: false,
    });
  } else {
    for (const match of watched) {
      for (const deadline of match.program.deadlines ?? []) {
        const days = daysUntil(deadline.date, today);
        if (days < 0) {
          continue;
        }
        reminders.push({
          id: `deadline:${match.program.id}:${deadline.date}`,
          kind: "deadline",
          title: `${shortUniversityName(match.program)}: ${deadline.label.toLowerCase()} ${describeDaysLeft(days)}`,
          detail: `${match.program.programName} — до ${formatDateRu(deadline.date)}`,
          isUrgent: days <= URGENT_DAYS,
          date: deadline.date,
          daysLeft: days,
          sourceUrl: match.program.sources[0]?.url,
        });
      }
    }
  }

  const { nextStep } = progress;
  if (nextStep) {
    const isBehind = !planningAhead && SEASON_INDEX[nextStep.season] < SEASON_INDEX[seasonOf(today)];
    if (isBehind) {
      reminders.push({
        id: `behind:${nextStep.season}:${seasonOf(today)}`,
        kind: "behind",
        title: `Не закрыты ${SEASON_NAMES[nextStep.season]} шаги плана`,
        detail: `По плану они уже позади. Начните с «${nextStep.title}».`,
        isUrgent: true,
      });
    } else {
      reminders.push({
        id: `next:${nextStep.id}`,
        kind: "next-step",
        title: "Следующий шаг плана",
        detail: nextStep.title,
        isUrgent: false,
      });
    }
  }

  // Programmes whose next dates are not published yet still need watching.
  const undated = watched
    .slice(0, 3)
    .filter((match) => nextDeadline(match.program, today) === null);
  if (undated.length > 0) {
    const names = undated.map((match) => shortUniversityName(match.program));
    reminders.push({
      id: `watch:${undated.map((match) => match.program.id).join(",")}`,
      kind: "watch-dates",
      title: "Следите за датами набора",
      detail: `${names.join(", ")}: новые сроки на сайтах ещё не опубликованы — проверяйте раз в месяц.`,
      isUrgent: false,
    });
  }

  return reminders.sort((left, right) => {
    if (left.isUrgent !== right.isUrgent) {
      return left.isUrgent ? -1 : 1;
    }
    return (left.daysLeft ?? Number.POSITIVE_INFINITY) - (right.daysLeft ?? Number.POSITIVE_INFINITY);
  });
}
