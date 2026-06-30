// Pure run-time formatting helpers for the speedrun timer.
//
// Kept free of Phaser/DOM so the formatting (the part that's easy to get subtly
// wrong) can be unit tested. The HUD and run-complete screen consume these.

/**
 * Format a duration in milliseconds as a speedrun clock.
 *
 * Under one minute: `SS.mmm` (e.g. `7.482`). One minute or more:
 * `M:SS.mmm` (e.g. `1:07.482`). Always shows three-digit milliseconds so the
 * value never visibly "jumps" width while running. Negative inputs are treated
 * as zero.
 */
export function formatTime(ms: number): string {
  const safe = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const totalMs = Math.floor(safe);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis = totalMs % 1000;
  const mmm = millis.toString().padStart(3, '0');
  if (minutes > 0) {
    const ss = seconds.toString().padStart(2, '0');
    return `${minutes}:${ss}.${mmm}`;
  }
  return `${seconds}.${mmm}`;
}

/**
 * Format a signed delta against a previous best (e.g. "-0.512" / "+1.204").
 * Used on the run-complete screen to show improvement at a glance.
 */
export function formatDelta(deltaMs: number): string {
  const sign = deltaMs <= 0 ? '-' : '+';
  return `${sign}${formatTime(Math.abs(deltaMs))}`;
}
