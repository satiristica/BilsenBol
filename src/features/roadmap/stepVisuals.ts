import {
  Award,
  BadgeCheck,
  Circle,
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

/** Icon and a one- or two-word caption per roadmap step; the full title stays available. */
const STEP_VISUALS: Record<string, { icon: LucideIcon; label: string }> = {
  "autumn-shortlist": { icon: ListChecks, label: "Шорт-лист" },
  "autumn-language-check": { icon: BadgeCheck, label: "Сертификат" },
  "autumn-language-exam": { icon: Languages, label: "Экзамен по языку" },
  "autumn-documents": { icon: FolderOpen, label: "Документы" },
  "autumn-academics": { icon: TrendingUp, label: "Средний балл" },
  "winter-motivation-letter": { icon: PenLine, label: "Мотивационное письмо" },
  "winter-recommendations": { icon: Users, label: "Рекомендации" },
  "winter-applications": { icon: Send, label: "Подача" },
  "winter-scholarships": { icon: Award, label: "Гранты" },
  "spring-compare-offers": { icon: Scale, label: "Офферы" },
  "spring-confirm": { icon: FileText, label: "Выбор вуза" },
  "spring-visa": { icon: Plane, label: "Виза" },
};

export function stepVisual(step: RoadmapStep): { icon: LucideIcon; label: string } {
  if (step.id.startsWith("autumn-activities-")) {
    return { icon: Rocket, label: "Проект" };
  }
  return STEP_VISUALS[step.id] ?? { icon: Circle, label: step.title };
}
