import { buildDiagnosis } from "@/domain/diagnosis";
import { rankPrograms } from "@/domain/matching";
import type { ApplicantProfile } from "@/domain/profile";
import { buildRoadmap, listSteps } from "@/domain/roadmap";

/** The outcomes a profile edit can visibly move. */
export interface JourneyFacts {
  matchCount: number;
  leader: string | null;
  statusLabel: string;
  planSteps: { id: string; title: string }[];
}

export type ImpactKind = "matches" | "status" | "leader" | "plan" | "none";

export interface ImpactItem {
  kind: ImpactKind;
  text: string;
  /** Whether the change widens (up) or narrows (down) the applicant's options. */
  direction?: "up" | "down";
}

export function collectFacts(profile: ApplicantProfile): JourneyFacts {
  const result = rankPrograms(profile);
  return {
    matchCount: result.matches.length,
    leader: result.matches[0]?.program.programName ?? null,
    statusLabel: buildDiagnosis(profile, result).statusLabel,
    planSteps: listSteps(buildRoadmap(profile, result)).map(({ id, title }) => ({ id, title })),
  };
}

/**
 * Turns two snapshots into the short list shown after a profile edit, so the
 * applicant sees what their change actually did instead of hunting for it.
 * An edit that changes nothing says so: that is an answer too.
 */
export function describeProfileImpact(before: JourneyFacts, after: JourneyFacts): ImpactItem[] {
  const items: ImpactItem[] = [];

  if (before.matchCount !== after.matchCount) {
    items.push({
      kind: "matches",
      text: `Программ: ${before.matchCount} → ${after.matchCount}`,
      direction: after.matchCount > before.matchCount ? "up" : "down",
    });
  }
  if (before.statusLabel !== after.statusLabel) {
    items.push({ kind: "status", text: `Статус: «${after.statusLabel}»` });
  }
  if (before.leader !== after.leader && after.leader !== null) {
    items.push({ kind: "leader", text: `Лидер подборки: «${after.leader}»` });
  }
  // Compare the steps themselves: swapping one step for another keeps the
  // count but is exactly the route change the applicant needs to notice.
  const beforeIds = new Set(before.planSteps.map((step) => step.id));
  const afterIds = new Set(after.planSteps.map((step) => step.id));
  const added = after.planSteps.filter((step) => !beforeIds.has(step.id));
  const removedCount = before.planSteps.filter((step) => !afterIds.has(step.id)).length;
  if (added.length > 0 || removedCount > 0) {
    const parts: string[] = [];
    if (added.length === 1) {
      parts.push(`новый шаг «${added[0].title}»`);
    } else if (added.length > 1) {
      parts.push(`новых шагов: ${added.length}`);
    }
    if (removedCount > 0) {
      parts.push(`убрано: ${removedCount}`);
    }
    items.push({ kind: "plan", text: `План: ${parts.join(" · ")}` });
  }

  if (items.length === 0) {
    items.push({ kind: "none", text: "Подборка и план не изменились — это условие на них не влияет" });
  }
  return items;
}
