"use client";

import { useEffect, useMemo, useState } from "react";

import type { ApplicantProfile } from "@/domain/profile";
import { readJson, writeJson } from "@/lib/browserStorage";

import {
  ROADMAP_ADVICE_VERSION,
  adviceCacheKey,
  isAiProvider,
  sanitizeRoadmapAdvice,
  type AiProvider,
  type RoadmapAdvice,
} from "./roadmapAdvice";

export type RoadmapAdviceState =
  | { status: "loading" }
  | { status: "ready"; advice: RoadmapAdvice; provider: AiProvider; model: string }
  | { status: "unavailable" };

const STORAGE_KEY = "bilsenbol.roadmapAdvice";
/** Only the most recent profiles are worth keeping. */
const MAX_CACHED = 12;
/** Quick edits in a row settle before one request goes out. */
const DEBOUNCE_MS = 700;

const LOADING: RoadmapAdviceState = { status: "loading" };
const UNAVAILABLE: RoadmapAdviceState = { status: "unavailable" };

interface CachedEntry {
  key: string;
  advice: unknown;
  provider: unknown;
  model: unknown;
}

function readEntries(): CachedEntry[] {
  const stored = readJson(STORAGE_KEY) as { version?: unknown; entries?: unknown } | null;
  if (stored?.version !== ROADMAP_ADVICE_VERSION || !Array.isArray(stored.entries)) {
    return [];
  }
  return stored.entries.filter(
    (entry): entry is CachedEntry =>
      typeof entry === "object" && entry !== null && typeof (entry as CachedEntry).key === "string",
  );
}

/** Cached advice is re-validated: storage is as untrusted as the model. */
function toState(
  { advice, provider, model }: { advice: unknown; provider: unknown; model: unknown },
  allowedStepIds: ReadonlySet<string>,
): RoadmapAdviceState {
  const clean = sanitizeRoadmapAdvice(advice, allowedStepIds);
  return clean && isAiProvider(provider) && typeof model === "string"
    ? { status: "ready", advice: clean, provider, model }
    : UNAVAILABLE;
}

function readCached(key: string, allowedStepIds: ReadonlySet<string>): RoadmapAdviceState | null {
  const entry = readEntries().find((item) => item.key === key);
  if (!entry) {
    return null;
  }
  const state = toState(entry, allowedStepIds);
  return state.status === "ready" ? state : null;
}

function writeCached(key: string, state: Extract<RoadmapAdviceState, { status: "ready" }>) {
  const entries = readEntries().filter((item) => item.key !== key);
  entries.unshift({ key, advice: state.advice, provider: state.provider, model: state.model });
  writeJson(STORAGE_KEY, { version: ROADMAP_ADVICE_VERSION, entries: entries.slice(0, MAX_CACHED) });
}

/**
 * AI advice for the current profile's roadmap.
 * Failures are never cached, so a quota that recovers is picked up on the
 * next visit. Its callers mount only on the client (behind `useIsClient`),
 * so reading storage during render cannot break hydration.
 */
export function useRoadmapAdvice(
  profile: ApplicantProfile,
  allowedStepIds: ReadonlySet<string>,
  isEnabled: boolean,
): RoadmapAdviceState {
  const key = adviceCacheKey(profile);
  const cached = useMemo(() => readCached(key, allowedStepIds), [key, allowedStepIds]);
  const [fetched, setFetched] = useState<{ key: string; state: RoadmapAdviceState } | null>(null);

  useEffect(() => {
    if (!isEnabled || cached) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/roadmap", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile }),
          signal: controller.signal,
        });
        const data = (response.ok ? await response.json() : null) as
          | { status?: unknown; advice?: unknown; provider?: unknown; model?: unknown }
          | null;
        const state =
          data?.status === "ready"
            ? toState({ advice: data.advice, provider: data.provider, model: data.model }, allowedStepIds)
            : UNAVAILABLE;
        if (state.status === "ready") {
          writeCached(key, state);
        }
        setFetched({ key, state });
      } catch {
        if (!controller.signal.aborted) {
          setFetched({ key, state: UNAVAILABLE });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isEnabled, cached, key, profile, allowedStepIds]);

  if (cached) {
    return cached;
  }
  return fetched?.key === key ? fetched.state : LOADING;
}
