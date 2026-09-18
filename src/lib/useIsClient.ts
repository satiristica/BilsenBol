"use client";

import { useSyncExternalStore } from "react";

const neverChanges = () => () => {};

/**
 * False during the server render and the hydration pass, true afterwards.
 * Lets a page render identical markup on both sides and only then read
 * browser-only state such as localStorage, without an effect that sets state.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}
