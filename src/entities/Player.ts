import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import { CollisionFilter } from '../physics/CollisionCategories';
import { hexToInt } from '../core/color';

const FILL_COLOR = hexToInt('#9ecbff');
const STROKE_COLOR = hexToInt('#1b2a44');

/**
 * The player: a single Matter rectangle body paired with a placeholder
 * rectangle visual that is synced to the body each frame. Rotation is locked so
 * the box behaves predictably as a platformer character.
 *
 * Movement *logic* lives in MovementSystem; this class only owns the body, the
 * visual, and per-frame movement bookkeeping (grounded flag, jump timers).
 */
export class Player {
  readonly body: MatterJS.BodyType;
  readonly view: Phaser.GameObjects.Rectangle;
  readonly width: number;
  readonly height: number;

  /** Set each frame by the movement/collision systems. */
  isGrounded = false;
  /** Last horizontal facing direction (+1 right, -1 left). */
  facing: 1 | -1 = 1;

  /** Remaining seconds a jump is still allowed after leaving the ground. */
  coyoteTimer = 0;
  /** Remaining seconds a buffered jump press stays valid. */
  jumpBufferTimer = 0;

  private readonly matter: Phaser.Physics.Matter.MatterPhysics;

  constructor(scene: Phaser.Scene, x: number, y: number, config: GameConfig) {
    this.matter = scene.matter;
    const p = config.physics;
    this.width = p.playerWidth;
    this.height = p.playerHeight;

    this.body = scene.matter.add.rectangle(x, y, p.playerWidth, p.playerHeight, {
      label: 'player',
      friction: p.playerFriction,
      frictionStatic: p.playerFrictionStatic,
      frictionAir: p.playerFrictionAir,
      restitution: p.playerRestitution,
      chamfer: { radius: p.playerChamfer }, // soften corners so the box does not snag on edges
      collisionFilter: { ...CollisionFilter.player },
    });

    // Infinite inertia locks rotation: the player box never tumbles, even while
    // swinging on the rope. This is essential to predictable platforming feel.
    scene.matter.body.setInertia(this.body, Infinity);

    this.view = scene.add
      .rectangle(x, y, p.playerWidth, p.playerHeight, FILL_COLOR)
      .setStrokeStyle(2, STROKE_COLOR)
      .setDepth(10);
  }

  get position(): MatterJS.Vector {
    return this.body.position;
  }

  get velocity(): MatterJS.Vector {
    return this.body.velocity;
  }

  setVelocity(x: number, y: number): void {
    this.matter.body.setVelocity(this.body, { x, y });
  }

  /** Mirror the physics body onto the placeholder visual. Call once per frame. */
  sync(): void {
    this.view.setPosition(this.body.position.x, this.body.position.y);
    this.view.setRotation(this.body.angle);
  }
}
