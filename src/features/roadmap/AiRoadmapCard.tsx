"use client";

import { CloudOff, Info, Sparkles } from "lucide-react";

import styles from "./AiRoadmapCard.module.css";
import { AI_PROVIDER_LABELS } from "./roadmapAdvice";
import type { RoadmapAdviceState } from "./useRoadmapAdvice";

interface AiRoadmapCardProps {
  state: RoadmapAdviceState;
  title?: string;
  /** What to say when the model is unavailable; depends on what else the page shows. */
  unavailableText?: string;
}

/** The AI strategy summary; extra suggestions live in the roadmap tree as nodes. */
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
        <span className={styles.modelTag} title={state.model}>
          {AI_PROVIDER_LABELS[state.provider]}
        </span>
      </div>

      {advice.summary ? <p className={styles.summary}>{advice.summary}</p> : null}

      <p className={styles.disclaimer}>
        <Info aria-hidden="true" size={15} strokeWidth={2.2} />
        <span>Составлено ИИ по вашим ответам — это советы, а не требования вузов.</span>
      </p>
    </section>
  );
}
