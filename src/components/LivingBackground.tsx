"use client";

import { useEffect, useRef } from "react";

import styles from "./LivingBackground.module.css";

const MOTE_COUNT = 18;

/**
 * Deterministic pseudo-random values: the server and the client must produce
 * identical markup, so the motes are derived from their index rather than
 * from Math.random().
 */
const MOTES = Array.from({ length: MOTE_COUNT }, (_, index) => {
  const spread = (index * 37) % 100;
  const size = 2 + ((index * 13) % 4);
  return {
    left: `${spread}%`,
    size: `${size}px`,
    duration: `${22 + ((index * 7) % 20)}s`,
    delay: `-${(index * 5) % 26}s`,
    sway: `${((index % 5) - 2) * 2.4}vw`,
    peak: `${0.25 + ((index * 11) % 40) / 100}`,
  };
});

/**
 * Ambient landing background: a morphing aurora, a dot grid that lights up
 * around the pointer, drifting motes and a light grain.
 *
 * The pointer position is written straight to CSS custom properties on the
 * root node — no React state, so moving the mouse never triggers a render.
 */
export function LivingBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;

    const apply = () => {
      frame = 0;
      root.style.setProperty("--px", `${pendingX}px`);
      root.style.setProperty("--py", `${pendingY}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      // A finger dragging the spotlight around is a mid-tap change iOS Safari
      // can mistake for hover content, and on touch it only follows scrolling.
      if (event.pointerType !== "mouse") {
        return;
      }
      pendingX = event.clientX;
      pendingY = event.clientY;
      // Coalesce moves into one write per frame.
      if (frame === 0) {
        frame = requestAnimationFrame(apply);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div aria-hidden="true" className={styles.root} ref={rootRef}>
      <span className={`${styles.blob} ${styles.blobOne}`} />
      <span className={`${styles.blob} ${styles.blobTwo}`} />
      <span className={`${styles.blob} ${styles.blobThree}`} />
      <span className={`${styles.blob} ${styles.blobFour}`} />

      <div className={styles.grid} />

      <div className={styles.motes}>
        {MOTES.map((mote, index) => (
          <span
            className={styles.mote}
            key={index}
            style={
              {
                left: mote.left,
                width: mote.size,
                height: mote.size,
                "--duration": mote.duration,
                "--delay": mote.delay,
                "--sway": mote.sway,
                "--peak": mote.peak,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.grain} />
      <div className={styles.veil} />
    </div>
  );
}
