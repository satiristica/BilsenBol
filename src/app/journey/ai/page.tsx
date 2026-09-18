import type { Metadata } from "next";

import { AiPlanEntry } from "@/features/roadmap/AiPlanPage";

export const metadata: Metadata = {
  title: "ИИ-план | BilsenBol",
  description: "Персональный разбор маршрута поступления от ИИ.",
};

export default function AiPlanRoute() {
  return <AiPlanEntry />;
}
