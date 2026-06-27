// Pure ground-contact classification, kept free of Phaser for unit testing.

/**
 * Decide whether a terrain body overlapping the foot probe should count as
 * ground. Only surfaces whose top edge sits roughly at the player's feet qualify.
 *
 * This excludes vertical walls (whose top edge is far above the feet) from
 * registering as ground, which would otherwise allow accidental wall jumps,
 * coyote refreshes and ground friction while merely touching a wall side.
 * docs/03-core-mechanics.md explicitly excludes wall movement.
 *
 * @param playerFeetY World Y of the player's bottom edge (larger Y = lower).
 * @param terrainTop  World Y of the terrain body's top edge.
 * @param tolerance   How far the terrain top may differ from the feet and still
 *                    count (absorbs penetration and pre-landing gaps).
 */
export function terrainCountsAsGround(
  playerFeetY: number,
  terrainTop: number,
  tolerance: number,
): boolean {
  return Math.abs(terrainTop - playerFeetY) <= tolerance;
}
