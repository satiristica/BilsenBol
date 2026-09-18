"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Equal,
  ListChecks,
  type LucideIcon,
  RefreshCw,
  Trophy,
  UserRoundCheck,
  X,
} from "lucide-react";

import { classNames } from "@/lib/classNames";

import type { ImpactItem, ImpactKind } from "./profileImpact";
import styles from "./ProfileImpact.module.css";

const KIND_ICONS: Record<ImpactKind, LucideIcon> = {
  matches: ArrowUpRight,
  status: UserRoundCheck,
  leader: Trophy,
  plan: ListChecks,
  none: Equal,
};

interface ProfileImpactProps {
  items: ImpactItem[];
  onDismiss: () => void;
}

/** Shown right after a profile edit, next to where the edit was made. */
export function ProfileImpact({ items, onDismiss }: ProfileImpactProps) {
  return (
    <section aria-live="polite" className={styles.impact}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          <RefreshCw aria-hidden="true" size={15} strokeWidth={2.4} />
          Что изменилось
        </h2>
        <button
          aria-label="Скрыть"
          className={styles.close}
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" size={15} strokeWidth={2.4} />
        </button>
      </div>
      <ul className={styles.items}>
        {items.map((item) => {
          const Icon =
            item.kind === "matches" && item.direction === "down"
              ? ArrowDownRight
              : KIND_ICONS[item.kind];
          return (
            <li
              className={classNames(
                styles.item,
                item.direction === "down" && styles.itemDown,
                item.kind === "none" && styles.itemNone,
              )}
              key={item.kind}
            >
              <Icon aria-hidden="true" size={15} strokeWidth={2.4} />
              {item.text}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
