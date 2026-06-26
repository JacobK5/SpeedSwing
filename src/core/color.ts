// Small colour helpers for placeholder vector art.

/** Parse a "#rrggbb" hex string into a Phaser integer colour. Falls back to grey. */
export function hexToInt(hex: string): number {
  const cleaned = hex.replace(/^#/, '');
  const value = Number.parseInt(cleaned, 16);
  return Number.isFinite(value) ? value : 0x808080;
}

/** Multiply an integer colour's channels by `factor` (0..1) to derive a darker shade. */
export function darken(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * factor);
  const g = Math.floor(((color >> 8) & 0xff) * factor);
  const b = Math.floor((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}
