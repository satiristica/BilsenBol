import {
  Hourglass,
  type LucideIcon,
  Target,
  TrendingUp,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import type { Diagnosis, InsightKind } from "@/domain/diagnosis";
import { classNames } from "@/lib/classNames";

import styles from "./DiagnosisPanel.module.css";

interface DiagnosisPanelProps {
  diagnosis: Diagnosis;
}

const INSIGHT_STYLES: Record<InsightKind, string | undefined> = {
  strength: undefined,
  bottleneck: styles.insightBottleneck,
  runway: styles.insightRunway,
};

const INSIGHT_ICONS: Record<InsightKind, LucideIcon> = {
  strength: TrendingUp,
  bottleneck: TriangleAlert,
  runway: Hourglass,
};

export function DiagnosisPanel({ diagnosis }: DiagnosisPanelProps) {
  return (
    <div className={styles.panel}>
      <dl className={styles.summary}>
        <div className={styles.summaryRow}>
          <dt className={styles.summaryKey}>
            <UserRound aria-hidden="true" size={16} strokeWidth={2.3} />
            Профиль
          </dt>
          <dd className={styles.summaryValue}>{diagnosis.profileSummary}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt className={styles.summaryKey}>
            <Target aria-hidden="true" size={16} strokeWidth={2.3} />
            Цель
          </dt>
          <dd className={styles.summaryValue}>{diagnosis.goal}</dd>
        </div>
      </dl>

      <article className={styles.statusCard}>
        <p className={styles.statusMeta}>
          <span aria-hidden="true" className={styles.statusDot} />
          Статус
        </p>
        <h2 className={styles.statusLabel}>{diagnosis.statusLabel}</h2>
        <p className={styles.statusDetail}>{diagnosis.statusDetail}</p>
      </article>

      <div className={styles.insights}>
        {diagnosis.insights.map((insight, index) => {
          const Icon = INSIGHT_ICONS[insight.kind];
          return (
            <article
              className={classNames(styles.insight, INSIGHT_STYLES[insight.kind])}
              key={insight.kind}
              style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}
            >
              <span className={styles.insightHead}>
                <span aria-hidden="true" className={styles.insightIcon}>
                  <Icon size={18} strokeWidth={2.3} />
                </span>
                <span className={styles.insightLabel}>{insight.label}</span>
              </span>
              <h3 className={styles.insightTitle}>{insight.title}</h3>
              <p className={styles.insightDetail}>{insight.detail}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
