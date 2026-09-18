import Image from "next/image";

import styles from "./BrandMark.module.css";

interface BrandMarkProps {
  size?: number;
}

/** Product logo mark, shown next to the "BilsenBol" wordmark in every header. */
export function BrandMark({ size = 36 }: BrandMarkProps) {
  return (
    <span aria-hidden="true" className={styles.tile} style={{ width: size, height: size }}>
      {/* Always above the fold, and on short pages it becomes the LCP element. */}
      <Image alt="" height={size} loading="eager" src="/brand/logo-mark.png" width={size} />
    </span>
  );
}
