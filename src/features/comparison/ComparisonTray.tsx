"use client";

import type { ProgramMatch } from "@/domain/matching";

import styles from "./ComparisonTray.module.css";

interface ComparisonTrayProps {
  selected: ProgramMatch[];
  onOpen: () => void;
  onClear: () => void;
}

export function ComparisonTray({ selected, onOpen, onClear }: ComparisonTrayProps) {
  if (selected.length === 0) {
    return null;
  }

  const isReady = selected.length === 2;

  return (
    <aside aria-label="Панель сравнения" className={styles.tray}>
      <div className={styles.summary}>
        <p className={styles.title}>
          {isReady ? "Готово к сравнению" : "Выберите вторую программу"}
        </p>
        <p className={styles.names}>
          {selected.map((match) => match.program.programName).join("  ·  ")}
        </p>
      </div>
      <div className={styles.actions}>
        <button className={styles.open} disabled={!isReady} onClick={onOpen} type="button">
          Сравнить
        </button>
        <button className={styles.clear} onClick={onClear} type="button">
          Сбросить
        </button>
      </div>
    </aside>
  );
}
