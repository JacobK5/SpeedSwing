// Pure geometry helpers for goal completion and kill-zone detection.
//
// Goal/kill triggers are checked every frame against the player's axis-aligned
// bounding box, so these are kept Phaser-free and unit tested. Whether a trigger
// then *does* something (complete / restart) is the scene's job.

export interface Rect {
  /** Top-left corner X. */
  x: number;
  /** Top-left corner Y. */
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

/** Whether two axis-aligned rectangles overlap (touching edges count). */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x <= b.x + b.width &&
    a.x + a.width >= b.x &&
    a.y <= b.y + b.height &&
    a.y + a.height >= b.y
  );
}

/** Whether an axis-aligned rectangle overlaps a circle. */
export function rectOverlapsCircle(rect: Rect, circle: Circle): boolean {
  // Closest point on the rect to the circle centre, then distance test.
  const closestX = clampNumber(circle.x, rect.x, rect.x + rect.width);
  const closestY = clampNumber(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/** Whether a point lies within (or on) a circle. */
export function pointInCircle(px: number, py: number, circle: Circle): boolean {
  const dx = px - circle.x;
  const dy = py - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
