"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { type PointerEvent as ReactPointerEvent } from "react";

import { classNames } from "@/lib/classNames";

import styles from "./ActionButton.module.css";

type ActionVariant = "primary" | "ghost" | "warm";

interface SharedProps {
  children: ReactNode;
  variant?: ActionVariant;
  compact?: boolean;
  block?: boolean;
  /** Renders the sliding arrow used on forward-moving actions. */
  withArrow?: boolean;
  className?: string;
}

/** Feeds the pointer position to CSS so the highlight tracks the cursor. */
function trackPointer(event: ReactPointerEvent<HTMLElement>) {
  const target = event.currentTarget;
  const bounds = target.getBoundingClientRect();
  target.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
  target.style.setProperty("--my", `${event.clientY - bounds.top}px`);
}

function actionClassName({ variant = "primary", compact, block, className }: SharedProps) {
  return classNames(
    styles.base,
    styles[variant],
    compact && styles.compact,
    block && styles.block,
    className,
  );
}

function ActionContent({ children, withArrow }: Pick<SharedProps, "children" | "withArrow">) {
  return (
    <>
      <span className={styles.label}>{children}</span>
      {withArrow ? (
        <span aria-hidden="true" className={styles.arrow}>
          <ArrowRight className={styles.arrowGlyph} size={18} strokeWidth={2.6} />
        </span>
      ) : null}
    </>
  );
}

interface ActionButtonProps extends SharedProps {
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  "aria-pressed"?: boolean;
}

export function ActionButton({
  onClick,
  type = "button",
  disabled,
  "aria-pressed": ariaPressed,
  ...shared
}: ActionButtonProps) {
  return (
    <button
      aria-pressed={ariaPressed}
      className={actionClassName(shared)}
      disabled={disabled}
      onClick={onClick}
      onPointerMove={trackPointer}
      type={type}
    >
      <ActionContent withArrow={shared.withArrow}>{shared.children}</ActionContent>
    </button>
  );
}

interface ActionLinkProps extends SharedProps {
  href: string;
}

export function ActionLink({ href, ...shared }: ActionLinkProps) {
  return (
    <Link className={actionClassName(shared)} href={href} onPointerMove={trackPointer}>
      <ActionContent withArrow={shared.withArrow}>{shared.children}</ActionContent>
    </Link>
  );
}
