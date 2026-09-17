import type { Diagnosis } from "@/domain/diagnosis";
import { classNames } from "@/lib/classNames";

import styles from "./DiagnosisPanel.module.css";

interface DiagnosisPanelProps {
  diagnosis: Diagnosis;
}

const INSIGHT_STYLES = {
  strength: undefined,
  bottleneck: styles.insightBottleneck,
  runway: styles.insightRunway,
} as const;

export function DiagnosisPanel({ diagnosis }: DiagnosisPanelProps) {
  return (
    <div className={styles.panel}>
      <article className={styles.statusCard}>
        <p className={styles.statusMeta}>
          <span aria-hidden="true" className={styles.statusDot} />
          Статус готовности
        </p>
        <h2 className={styles.statusLabel}>{diagnosis.statusLabel}</h2>
        <p className={styles.statusDetail}>{diagnosis.statusDetail}</p>
      </article>

      <div className={styles.insights}>
        {diagnosis.insights.map((insight) => (
          <article
            className={classNames(styles.insight, INSIGHT_STYLES[insight.kind])}
            key={insight.kind}
          >
            <span className={styles.insightLabel}>{insight.label}</span>
            <h3 className={styles.insightTitle}>{insight.title}</h3>
            <p className={styles.insightDetail}>{insight.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
