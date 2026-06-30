import Phaser from 'phaser';
import { isRopeTaut } from '../systems/grappleMath';

/**
 * A grappling rope: a Matter world-constraint anchoring the player body to a
 * fixed world point (the grapple node). Gravity + the constraint produce
 * pendulum swinging (DECISIONS.md #009).
 *
 * The rope can behave two ways (DECISIONS.md #016), selected per-step via
 * {@link update}:
 *  - rigid rod: the constraint is always active (two-sided), so the player is
 *    held at the rope length whether stretched or compressed — the original
 *    behaviour.
 *  - limp rope: the constraint only pulls while taut (player at/beyond the rope
 *    length) and applies no force while there is slack, so the player falls /
 *    swings inward freely until the rope catches.
 *
 * Length is mutable at runtime (W/S retract/extend), which lets the player pump
 * swings and tuck/extend to control their arc.
 */
export class Rope {
  readonly anchorX: number;
  readonly anchorY: number;

  private readonly scene: Phaser.Scene;
  private readonly body: MatterJS.BodyType;
  private readonly constraint: MatterJS.ConstraintType;
  // Active values to restore when the rope is taut; zeroed while slack so a limp
  // rope exerts neither spring force (stiffness) nor radial drag (damping).
  private readonly baseStiffness: number;
  private readonly baseDamping: number;

  constructor(
    scene: Phaser.Scene,
    body: MatterJS.BodyType,
    anchorX: number,
    anchorY: number,
    length: number,
    stiffness: number,
    damping: number,
  ) {
    this.scene = scene;
    this.body = body;
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.baseStiffness = stiffness;
    this.baseDamping = damping;

    this.constraint = scene.matter.add.worldConstraint(body, length, stiffness, {
      pointA: { x: anchorX, y: anchorY }, // fixed world anchor (the node)
      pointB: { x: 0, y: 0 }, // player body centre
      damping,
    });
  }

  get length(): number {
    return this.constraint.length ?? 0;
  }

  set length(value: number) {
    this.constraint.length = value;
  }

  /**
   * Update tension for this physics step. With `goesLimp`, the constraint is
   * disabled (zero stiffness + damping) whenever the player is closer to the
   * anchor than the rope length, so slack applies no force; it re-engages the
   * moment the rope is taut. Called every frame before the Matter step.
   */
  update(goesLimp: boolean): void {
    const distance = Math.hypot(this.body.position.x - this.anchorX, this.body.position.y - this.anchorY);
    const taut = isRopeTaut(distance, this.length, goesLimp);
    this.constraint.stiffness = taut ? this.baseStiffness : 0;
    this.constraint.damping = taut ? this.baseDamping : 0;
  }

  destroy(): void {
    this.scene.matter.world.removeConstraint(this.constraint);
  }
}
