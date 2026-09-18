"use client";

import {
  Bell,
  CalendarClock,
  CalendarPlus,
  Eye,
  Footprints,
  Hourglass,
  type LucideIcon,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Reminder, ReminderKind } from "@/domain/reminders";
import { readJson, writeJson } from "@/lib/browserStorage";
import { buildIcsEvent, downloadIcs } from "@/lib/calendar";
import { classNames } from "@/lib/classNames";
import { pluralRu } from "@/lib/plural";

import styles from "./NotificationBell.module.css";

const SEEN_KEY = "bilsenbol.seenReminders";
/** Old ids are dropped so the list cannot grow forever. */
const MAX_SEEN = 60;

const KIND_ICONS: Record<ReminderKind, LucideIcon> = {
  deadline: CalendarClock,
  behind: TriangleAlert,
  "next-step": Footprints,
  "watch-dates": Eye,
  "planning-ahead": Hourglass,
};

function readSeen(): string[] {
  const stored = readJson(SEEN_KEY);
  return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
}

function addToCalendar(reminder: Reminder) {
  if (!reminder.date) {
    return;
  }
  const ics = buildIcsEvent({
    uid: reminder.id,
    title: `BilsenBol: ${reminder.title}`,
    description: `${reminder.detail} Сверьте дату на сайте вуза перед подачей.`,
    date: reminder.date,
    url: reminder.sourceUrl,
  });
  downloadIcs(`bilsenbol-${reminder.date}.ics`, ics);
}

/**
 * Reminder centre in the journey header. Reminders are recomputed from the
 * profile and today's date; only the ids the user has already seen are kept.
 */
export function NotificationBell({ reminders }: { reminders: Reminder[] }) {
  const [isOpen, setOpen] = useState(false);
  const [seen, setSeen] = useState<string[]>(readSeen);
  // Items that were new when the panel opened keep their marker until it closes.
  const [freshIds, setFreshIds] = useState<ReadonlySet<string>>(new Set());
  // On phones the panel is fixed to the viewport, just below wherever the bell ended up.
  const [panelTop, setPanelTop] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const unread = reminders.filter((reminder) => !seen.includes(reminder.id));
  const hasUrgentUnread = unread.some((reminder) => reminder.isUrgent);

  const close = () => setOpen(false);

  const toggle = () => {
    if (isOpen) {
      close();
      return;
    }
    setFreshIds(new Set(unread.map((reminder) => reminder.id)));
    setPanelTop(Math.round(wrapperRef.current?.getBoundingClientRect().bottom ?? 0) + 10);
    const nextSeen = [...new Set([...reminders.map((reminder) => reminder.id), ...seen])].slice(0, MAX_SEEN);
    setSeen(nextSeen);
    writeJson(SEEN_KEY, nextSeen);
    setOpen(true);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const label =
    unread.length > 0
      ? `Напоминания: ${unread.length} ${pluralRu(unread.length, { one: "новое", few: "новых", many: "новых" })}`
      : "Напоминания";

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        aria-controls="reminder-panel"
        aria-expanded={isOpen}
        aria-label={label}
        className={classNames(styles.bell, hasUrgentUnread && styles.bellUrgent)}
        onClick={toggle}
        type="button"
      >
        <Bell aria-hidden="true" size={18} strokeWidth={2.3} />
        {unread.length > 0 ? (
          <span aria-hidden="true" className={styles.count}>
            {unread.length}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <section
          aria-label="Напоминания"
          className={styles.panel}
          id="reminder-panel"
          style={{ "--panel-top": `${panelTop}px` } as React.CSSProperties}
        >
          <header className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Напоминания</h2>
            <span className={styles.panelHint}>по вашему плану и датам вузов</span>
          </header>

          {reminders.length === 0 ? (
            <p className={styles.empty}>Пока напоминать не о чем — план выполнен.</p>
          ) : (
            <ul className={styles.list}>
              {reminders.map((reminder, index) => {
                const Icon = KIND_ICONS[reminder.kind];
                return (
                  <li
                    className={classNames(styles.item, reminder.isUrgent && styles.itemUrgent)}
                    key={reminder.id}
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    <span className={styles.icon}>
                      <Icon aria-hidden="true" size={17} strokeWidth={2.3} />
                    </span>
                    <div className={styles.body}>
                      <p className={styles.itemTitle}>
                        {freshIds.has(reminder.id) ? <span className={styles.newTag}>Новое</span> : null}
                        {reminder.title}
                      </p>
                      <p className={styles.itemDetail}>{reminder.detail}</p>
                      {reminder.date ? (
                        <button
                          className={styles.calendar}
                          onClick={() => addToCalendar(reminder)}
                          type="button"
                        >
                          <CalendarPlus aria-hidden="true" size={14} strokeWidth={2.4} />
                          В календарь
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
