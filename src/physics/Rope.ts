import Phaser from 'phaser';

/**
 * A grappling rope: a Matter world-constraint anchoring the player body to a
 * fixed world point (the grapple node). Stiffness near 1 makes it behave like a
 * taut rope rather than a soft spring; gravity + the constraint produce
 * pendulum swinging (DECISIONS.md #009).
 *
 * Length is mutable at runtime (W/S retract/extend), which lets the player pump
 * swings and tuck/extend to control their arc.
 */
export class Rope {
  readonly anchorX: number;
  readonly anchorY: number;

  private readonly scene: Phaser.Scene;
  private readonly constraint: MatterJS.ConstraintType;

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
    this.anchorX = anchorX;
    this.anchorY = anchorY;

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

  destroy(): void {
    this.scene.matter.world.removeConstraint(this.constraint);
  }
}
