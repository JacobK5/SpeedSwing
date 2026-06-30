import Phaser from 'phaser';

// Thin wrapper over Phaser keyboard + pointer input.
//
// Centralising input behind named actions keeps gameplay systems free of raw
// key codes and gives us a single place to make bindings configurable later
// (see docs/02-v0.1-technical-spec.md "Controls").

export type InputAction =
  | 'left'
  | 'right'
  | 'jump'
  | 'ropeRetract'
  | 'ropeExtend'
  | 'restart'
  | 'pause'
  | 'selectGrapple'
  | 'selectExplosive'
  | 'debugToggle'
  | 'tuningToggle';

export class InputManager {
  private readonly keys: Record<InputAction, Phaser.Input.Keyboard.Key>;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('InputManager requires keyboard input to be enabled.');
    }

    const KC = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      left: keyboard.addKey(KC.A),
      right: keyboard.addKey(KC.D),
      jump: keyboard.addKey(KC.SPACE),
      ropeRetract: keyboard.addKey(KC.W),
      ropeExtend: keyboard.addKey(KC.S),
      restart: keyboard.addKey(KC.R),
      pause: keyboard.addKey(KC.ESC),
      selectGrapple: keyboard.addKey(KC.ONE),
      selectExplosive: keyboard.addKey(KC.TWO),
      debugToggle: keyboard.addKey(KC.BACKTICK),
      tuningToggle: keyboard.addKey(KC.T),
    };

    // Stop the browser from scrolling/space-activating while playing.
    keyboard.addCapture([KC.SPACE, KC.W, KC.A, KC.S, KC.D, KC.BACKTICK]);
  }

  /** Whether the action's key is currently held. */
  isDown(action: InputAction): boolean {
    return this.keys[action].isDown;
  }

  /** True only on the frame the action's key transitions to pressed. */
  justPressed(action: InputAction): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys[action]);
  }

  /** Current pointer position in world space (accounts for camera scroll/zoom). */
  pointerWorld(): Phaser.Math.Vector2 {
    const p = this.scene.input.activePointer;
    return p.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
  }
}
