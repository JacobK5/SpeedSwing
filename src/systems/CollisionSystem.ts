import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { isTerrainLabel } from '../physics/CollisionCategories';
import { terrainCountsAsGround } from './groundCheck';

// How far a terrain top may differ from the feet and still count as ground.
// Absorbs body penetration and the small pre-landing gap; small enough that
// vertical wall sides (top edge far above the feet) never qualify.
const GROUND_CONTACT_TOLERANCE = 6;

/**
 * Answers physics/terrain collision questions for gameplay systems.
 *
 * For Phase 1-2 its job is ground detection. It probes a thin rectangle just
 * below the player's feet and counts a terrain body as ground only when that
 * body's *top* edge is roughly at the feet — so vertical walls overlapping the
 * probe are not misread as ground (see groundCheck.ts).
 */
export class CollisionSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  isGrounded(player: Player): boolean {
    const body = player.body;
    const feetY = body.bounds.max.y;
    const halfWidth = player.width / 2;

    // A flat probe straddling the feet: 2px up into the body, 4px below it.
    const probeX = body.position.x - halfWidth * 0.9;
    const probeY = feetY - 2;
    const probeWidth = halfWidth * 1.8;
    const probeHeight = 6;

    const bodies = this.scene.matter.intersectRect(probeX, probeY, probeWidth, probeHeight, false);

    for (const overlapped of bodies) {
      // intersectRect returns a (body | game object) union; terrain is always a
      // raw Matter body, so narrow to BodyType to read its label/bounds.
      const matterBody = overlapped as MatterJS.BodyType;
      if (matterBody === body || !isTerrainLabel(matterBody.label)) {
        continue;
      }
      if (terrainCountsAsGround(feetY, matterBody.bounds.min.y, GROUND_CONTACT_TOLERANCE)) {
        return true;
      }
    }
    return false;
  }
}
