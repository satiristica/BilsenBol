"use client";

import { CloudOff, Info, Leaf, type LucideIcon, Snowflake, Sparkles, Sprout } from "lucide-react";

import type { RoadmapSeason } from "@/domain/roadmap";

import styles from "./AiRoadmapCard.module.css";
import type { RoadmapAdviceState } from "./useRoadmapAdvice";

const SEASONS: Record<RoadmapSeason, { label: string; icon: LucideIcon }> = {
  autumn: { label: "Осень", icon: Leaf },
  winter: { label: "Зима", icon: Snowflake },
  spring: { label: "Весна", icon: Sprout },
};

interface AiRoadmapCardProps {
  state: RoadmapAdviceState;
  title?: string;
  /** What to say when the model is unavailable; depends on what else the page shows. */
  unavailableText?: string;
}

/** Strategy and extra suggestions from the AI layer. */
export function AiRoadmapCard({
  state,
  title = "План от ИИ",
  unavailableText = "ИИ-советы сейчас недоступны — показан базовый план.",
}: AiRoadmapCardProps) {
  if (state.status === "unavailable") {
    return (
      <p className={styles.quiet}>
        <CloudOff aria-hidden="true" size={16} strokeWidth={2.2} />
        <span>{unavailableText}</span>
      </p>
    );
  }

  if (state.status === "loading") {
    return (
      <section aria-busy="true" aria-live="polite" className={styles.card}>
        <div className={styles.head}>
          <h2 className={styles.title}>
            <Sparkles aria-hidden="true" size={18} strokeWidth={2.3} />
            ИИ персонализирует ваш план…
          </h2>
        </div>
        <div aria-hidden="true" className={styles.skeleton}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </section>
    );
  }

  const { advice } = state;
  return (
    <section aria-live="polite" className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          <Sparkles aria-hidden="true" size={18} strokeWidth={2.3} />
          {title}
        </h2>
        <span className={styles.modelTag}>Gemini</span>
      </div>

      {advice.summary ? <p className={styles.summary}>{advice.summary}</p> : null}

      {advice.extras.length > 0 ? (
        <>
          <p className={styles.extrasLabel}>Ещё предложения для вас</p>
          <ul className={styles.extras}>
            {advice.extras.map((extra) => {
              const season = SEASONS[extra.season];
              const SeasonIcon = season.icon;
              return (
                <li className={styles.extra} key={`${extra.season}-${extra.title}`}>
                  <div className={styles.extraTop}>
                    <span className={styles.season}>
                      <SeasonIcon aria-hidden="true" size={12} strokeWidth={2.4} />
                      {season.label}
                    </span>
                    <span className={styles.extraTitle}>{extra.title}</span>
                  </div>
                  <p className={styles.extraDetail}>{extra.detail}</p>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <p className={styles.disclaimer}>
        <Info aria-hidden="true" size={15} strokeWidth={2.2} />
        <span>Составлено ИИ по вашим ответам — это советы, а не требования вузов.</span>
      </p>
    </section>
  );
}
