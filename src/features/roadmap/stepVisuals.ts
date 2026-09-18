import {
  Award,
  BadgeCheck,
  CalendarClock,
  Circle,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Languages,
  Leaf,
  ListChecks,
  type LucideIcon,
  PenLine,
  Plane,
  Rocket,
  Scale,
  Send,
  Snowflake,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";

import type { RoadmapSeason, RoadmapStep } from "@/domain/roadmap";

export const SEASON_ICONS: Record<RoadmapSeason, LucideIcon> = {
  autumn: Leaf,
  winter: Snowflake,
  spring: Sprout,
};

/** Icon per step id or id prefix; the caption comes from the step itself. */
const STEP_ICONS: Record<string, LucideIcon> = {
  "autumn-shortlist": ListChecks,
  "autumn-language-check": BadgeCheck,
  "autumn-documents": FolderOpen,
  "autumn-academics": TrendingUp,
  "winter-motivation-letter": PenLine,
  "winter-recommendations": Users,
  "winter-applications": Send,
  "spring-compare-offers": Scale,
  "spring-confirm": FileText,
  "spring-visa": Plane,
};

const PREFIX_ICONS: [string, LucideIcon][] = [
  ["autumn-activities-", Rocket],
  ["autumn-language-", Languages],
  ["autumn-exam-", ClipboardCheck],
  ["apply-", CalendarClock],
  ["winter-scholarship", Award],
];

export function stepVisual(step: RoadmapStep): { icon: LucideIcon; label: string } {
  const icon =
    STEP_ICONS[step.id] ??
    PREFIX_ICONS.find(([prefix]) => step.id.startsWith(prefix))?.[1] ??
    Circle;
  return { icon, label: step.label ?? step.title };
}
