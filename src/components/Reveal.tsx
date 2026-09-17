"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./Reveal.module.css";

interface RevealProps {
  children: ReactNode;
  /** Stagger within a group, in milliseconds. */
  delay?: number;
  className?: string;
}

/**
 * Reveals its children when they scroll into view.
 *
 * The hidden state is applied by the effect rather than during render, so the
 * content stays visible when JavaScript never runs, and the class toggling is
 * done on the DOM node directly instead of through state.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    element.classList.add(styles.armed);

    if (typeof IntersectionObserver === "undefined") {
      element.classList.add(styles.visible);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={className}
      ref={elementRef}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
