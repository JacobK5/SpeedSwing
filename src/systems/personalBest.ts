// Personal-best (fastest completion) tracking, persisted per level.
//
// Mirrors the tuningStore pattern: a pure comparison helper plus a thin,
// guarded localStorage layer so the game degrades gracefully where storage is
// unavailable. Bests are keyed by level name so each level has its own record.

const PB_STORAGE_PREFIX = 'speedswing.pb.v1:';

/** Whether `candidateMs` beats the previous best (null = no prior best). */
export function isNewBest(previousMs: number | null, candidateMs: number): boolean {
  if (!Number.isFinite(candidateMs) || candidateMs < 0) {
    return false;
  }
  return previousMs === null || candidateMs < previousMs;
}

function getStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function keyFor(levelName: string): string {
  return `${PB_STORAGE_PREFIX}${levelName}`;
}

/** Read the stored best for a level in milliseconds, or null if none/unavailable. */
export function loadBest(levelName: string): number | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(keyFor(levelName));
  if (raw === null) {
    return null;
  }
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

export interface BestResult {
  /** True if this run set a new record. */
  isNewBest: boolean;
  /** The best time after this run (ms). */
  best: number;
}

/**
 * Record a completion time, updating the stored best if it improved.
 * Returns whether it was a new best and the resulting best time.
 */
export function recordRun(levelName: string, timeMs: number): BestResult {
  const previous = loadBest(levelName);
  if (isNewBest(previous, timeMs)) {
    const storage = getStorage();
    try {
      storage?.setItem(keyFor(levelName), String(Math.floor(timeMs)));
    } catch {
      // best-effort; ignore storage failures
    }
    return { isNewBest: true, best: timeMs };
  }
  return { isNewBest: false, best: previous ?? timeMs };
}

/** Forget the stored best for a level (dev/debug aid). */
export function clearBest(levelName: string): void {
  const storage = getStorage();
  try {
    storage?.removeItem(keyFor(levelName));
  } catch {
    // ignore
  }
}
