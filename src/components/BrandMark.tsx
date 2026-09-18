import Image from "next/image";

import styles from "./BrandMark.module.css";

interface BrandMarkProps {
  size?: number;
}

/** Product logo mark, shown next to the "BilsenBol" wordmark in every header. */
export function BrandMark({ size = 36 }: BrandMarkProps) {
  return (
    <span aria-hidden="true" className={styles.tile} style={{ width: size, height: size }}>
      <Image alt="" height={size} src="/brand/logo-mark.png" width={size} />
    </span>
  );
}
