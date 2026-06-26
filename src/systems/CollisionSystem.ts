import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { isTerrainLabel } from '../physics/CollisionCategories';

/**
 * Answers physics/terrain collision questions for gameplay systems.
 *
 * For Phase 1 its sole job is ground detection. It probes a thin rectangle just
 * below the player's feet and reports whether any terrain overlaps it — robust
 * for axis-aligned platforms and free of per-collision event bookkeeping.
 */
export class CollisionSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  isGrounded(player: Player): boolean {
    const pos = player.body.position;
    const halfWidth = player.width / 2;
    const halfHeight = player.height / 2;

    // A flat probe straddling the feet: 2px up into the body, 4px below it.
    const probeX = pos.x - halfWidth * 0.9;
    const probeY = pos.y + halfHeight - 2;
    const probeWidth = halfWidth * 1.8;
    const probeHeight = 6;

    const bodies = this.scene.matter.intersectRect(probeX, probeY, probeWidth, probeHeight, false);

    for (const body of bodies) {
      // intersectRect returns a (body | game object) union; terrain is always a
      // raw Matter body, so narrow to BodyType to read its label.
      const matterBody = body as MatterJS.BodyType;
      if (matterBody === player.body) {
        continue;
      }
      if (isTerrainLabel(matterBody.label)) {
        return true;
      }
    }
    return false;
  }
}
