/**
 * localStorage access that never throws. Storage can be missing (server
 * render), blocked (privacy settings), or full, and each of those must degrade
 * to "nothing saved" rather than break the page.
 */

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Accessing the property itself throws when storage is disabled.
    return null;
  }
}

export function readJson(key: string): unknown {
  try {
    const raw = storage()?.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage blocked: the session simply stays in memory.
  }
}

export function removeKey(key: string): void {
  try {
    storage()?.removeItem(key);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
