"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "./ResetControl.module.css";

interface ResetControlProps {
  onReset: () => void;
}

/**
 * Starting over wipes saved progress, so it takes a second, explicit tap.
 * The safe choice ("Нет") receives focus so a stray Enter cannot confirm.
 */
export function ResetControl({ onReset }: ResetControlProps) {
  const [isConfirming, setConfirming] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isConfirming) {
      cancelRef.current?.focus();
    }
  }, [isConfirming]);

  if (!isConfirming) {
    return (
      <button className={styles.trigger} onClick={() => setConfirming(true)} type="button">
        <RotateCcw aria-hidden="true" size={14} strokeWidth={2.4} />
        <span className={styles.triggerLabel}>Начать заново</span>
      </button>
    );
  }

  return (
    <div aria-label="Подтверждение сброса" className={styles.confirm} role="group">
      <span className={styles.question}>Стереть прогресс?</span>
      <button
        className={styles.yes}
        onClick={() => {
          setConfirming(false);
          onReset();
        }}
        type="button"
      >
        Да
      </button>
      <button
        className={styles.no}
        onClick={() => setConfirming(false)}
        ref={cancelRef}
        type="button"
      >
        Нет
      </button>
    </div>
  );
}
