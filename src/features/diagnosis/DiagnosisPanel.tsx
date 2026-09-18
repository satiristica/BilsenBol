import {
  GraduationCap,
  Hourglass,
  Languages,
  type LucideIcon,
  Target,
  TrendingUp,
  TriangleAlert,
  UserRound,
  Wallet,
} from "lucide-react";

import type { Diagnosis, InsightKind, ReadinessMeter } from "@/domain/diagnosis";
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

const METER_ICONS: Record<ReadinessMeter["id"], LucideIcon> = {
  gpa: TrendingUp,
  language: Languages,
  budget: Wallet,
  catalogue: GraduationCap,
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

      <ul aria-label="Готовность" className={styles.meters}>
        {diagnosis.meters.map((meter, index) => {
          const Icon = METER_ICONS[meter.id];
          return (
            <li
              className={classNames(styles.meter, meter.tone === "warn" && styles.meterWarn)}
              key={meter.id}
              style={{ "--delay": `${index * 90}ms`, "--fill": meter.fraction } as React.CSSProperties}
            >
              <span className={styles.meterHead}>
                <Icon aria-hidden="true" size={16} strokeWidth={2.4} />
                {meter.label}
              </span>
              <span className={styles.meterValue}>{meter.value}</span>
              <span aria-hidden="true" className={styles.meterTrack}>
                <span className={styles.meterFill} />
                {meter.marker ? (
                  <span className={styles.meterMarker} style={{ left: `${meter.marker.at * 100}%` }}>
                    <span className={styles.meterMarkerLabel}>{meter.marker.label}</span>
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>

      <ul className={styles.insights}>
        {diagnosis.insights.map((insight, index) => {
          const Icon = INSIGHT_ICONS[insight.kind];
          return (
            <li
              className={classNames(styles.insight, INSIGHT_STYLES[insight.kind])}
              key={insight.kind}
              style={{ "--delay": `${360 + index * 90}ms` } as React.CSSProperties}
            >
              <span aria-hidden="true" className={styles.insightIcon}>
                <Icon size={16} strokeWidth={2.3} />
              </span>
              <span className={styles.insightText}>
                <span className={styles.insightLabel}>{insight.label}</span>
                <span className={styles.insightTitle}>{insight.title}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
