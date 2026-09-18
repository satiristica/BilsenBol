import {
  BookOpen,
  Briefcase,
  Coins,
  Cpu,
  Flag,
  Globe,
  GraduationCap,
  Landmark,
  Languages,
  type LucideIcon,
  MapPin,
  PiggyBank,
  School,
  Stethoscope,
  Trophy,
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";

import type {
  BudgetTier,
  EnglishLevel,
  GradeLevel,
  Region,
  StudyField,
} from "@/domain/profile";

/**
 * Icons stand in for the explanatory hint text the options used to carry, so
 * each mapping must stay exhaustive over its domain union.
 */
export const GRADE_ICONS: Record<GradeLevel, LucideIcon> = {
  "grade-9-10": School,
  "grade-11": BookOpen,
  graduate: GraduationCap,
};

export const ENGLISH_ICONS: Record<EnglishLevel, LucideIcon> = {
  school: UserRound,
  duolingo: Languages,
  toefl: Flag,
  ielts: Trophy,
};

export const BUDGET_ICONS: Record<BudgetTier, LucideIcon> = {
  "grant-only": Trophy,
  "up-to-3k": PiggyBank,
  "up-to-8k": Wallet,
  "from-15k": Coins,
};

export const FIELD_ICONS: Record<StudyField, LucideIcon> = {
  it: Cpu,
  business: Briefcase,
  engineering: Wrench,
  medicine: Stethoscope,
  humanities: Landmark,
};

export const REGION_ICONS: Record<Region, LucideIcon> = {
  europe: Globe,
  asia: MapPin,
  usa: Flag,
  cis: Landmark,
};
