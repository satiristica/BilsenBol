"use client";

import { useEffect, useRef } from "react";

import { DEMO_DATA_NOTICE } from "@/data/programs";
import { buildComparisonRows, type ComparisonWinner } from "@/domain/comparison";
import type { ProgramMatch } from "@/domain/matching";
import { classNames } from "@/lib/classNames";

import styles from "./ComparisonDialog.module.css";

interface ComparisonDialogProps {
  isOpen: boolean;
  pair: [ProgramMatch, ProgramMatch] | null;
  onClose: () => void;
}

function describeVerdict(left: ProgramMatch, right: ProgramMatch): string {
  if (left.score === right.score) {
    return "Совпадение с профилем одинаковое — решайте по стоимости и языку обучения.";
  }
  const leader = left.score > right.score ? left : right;
  const other = leader === left ? right : left;
  const cheaper =
    leader.program.annualTuitionUsd <= other.program.annualTuitionUsd ? leader : other;

  if (cheaper === leader) {
    return `«${leader.program.programName}» одновременно ближе к вашему профилю и дешевле — начните с неё.`;
  }
  return `«${leader.program.programName}» лучше подходит профилю, но «${cheaper.program.programName}» обойдётся дешевле.`;
}

export function ComparisonDialog({ isOpen, pair, onClose }: ComparisonDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  if (!pair) {
    return null;
  }

  const [left, right] = pair;
  const rows = buildComparisonRows(left, right);

  const valueClass = (side: "left" | "right", winner: ComparisonWinner) =>
    classNames(styles.value, winner === side && styles.valueWinner);

  return (
    <dialog
      aria-labelledby="comparison-title"
      className={styles.dialog}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title} id="comparison-title">
            Сравнение лицом к лицу
          </h2>
          <button
            aria-label="Закрыть сравнение"
            className={styles.close}
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </header>

        <div className={styles.heads}>
          <div className={styles.headsSpacer} />
          {[left, right].map((match) => (
            <div className={styles.head} key={match.program.id}>
              <span className={styles.headUniversity}>{match.program.university}</span>
              <h3 className={styles.headProgram}>{match.program.programName}</h3>
              <span className={styles.headPlace}>
                {match.program.city}, {match.program.country}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.label}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={valueClass("left", row.winner)}>
                {row.winner === "left" ? (
                  <span aria-hidden="true" className={styles.winnerMark}>
                    ▲
                  </span>
                ) : null}
                {row.left}
              </span>
              <span className={valueClass("right", row.winner)}>
                {row.winner === "right" ? (
                  <span aria-hidden="true" className={styles.winnerMark}>
                    ▲
                  </span>
                ) : null}
                {row.right}
              </span>
            </div>
          ))}
        </div>

        <footer className={styles.footer}>
          <p className={styles.verdict}>{describeVerdict(left, right)}</p>
          <p className={styles.demoNote}>{DEMO_DATA_NOTICE}</p>
        </footer>
      </div>
    </dialog>
  );
}
