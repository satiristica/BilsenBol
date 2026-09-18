import styles from "./JourneySkeleton.module.css";

/** Shown until the client has read the saved journey. */
export function JourneySkeleton() {
  return (
    <div aria-busy="true" aria-label="Загружаем ваш маршрут" className={styles.shell} role="status">
      <div className={styles.bar} />
      <div className={styles.stepper} />
      <div className={styles.card} />
    </div>
  );
}
