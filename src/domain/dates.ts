import type { Deadline, Program } from "@/data/programs";

/** Seasons of the admission year; the roadmap is organised by them. */
export type RoadmapSeason = "autumn" | "winter" | "spring";

/** September–November is autumn, December–February winter, the rest spring and summer. */
export function seasonOf(date: Date): RoadmapSeason {
  const month = date.getMonth();
  if (month >= 8 && month <= 10) {
    return "autumn";
  }
  if (month === 11 || month <= 1) {
    return "winter";
  }
  return "spring";
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole calendar days between today and an ISO date, ignoring the time of day. */
export function daysUntil(isoDate: string, today: Date): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - start) / DAY_MS);
}

/** The nearest deadline that has not passed yet, if the catalogue has one. */
export function nextDeadline(program: Program, today: Date): Deadline | null {
  return (program.deadlines ?? []).find((deadline) => daysUntil(deadline.date, today) >= 0) ?? null;
}

export function formatDateRu(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "2026-10-22" → "22.10.2026". */
export function formatShortDate(isoDate: string): string {
  return isoDate.split("-").reverse().join(".");
}
