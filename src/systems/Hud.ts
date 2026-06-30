import Phaser from 'phaser';
import type { AmmoCounts } from './Resources';
import type { WeaponType } from './WeaponSystem';
import { formatTime } from './timeFormat';

/** Everything the HUD needs to render one frame. */
export interface HudState {
  timeMs: number;
  best: number | null;
  ammo: AmmoCounts;
  selected: WeaponType;
}

/**
 * Minimal in-run heads-up display: the live speedrun clock, the personal best,
 * and ammo for both weapons with the selected one highlighted. Screen-fixed and
 * deliberately plain — it should inform without competing with the action
 * (DECISIONS.md #010 "player flow"). Built only in the level scene.
 */
export class Hud {
  private readonly scene: Phaser.Scene;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly infoText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.timerText = scene.add
      .text(scene.scale.width / 2, 14, '0.000', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: '#e8eaf0',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1000);

    this.infoText = scene.add
      .text(scene.scale.width / 2, 52, '', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#9ecbff',
        align: 'center',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1000);
  }

  update(state: HudState): void {
    const centerX = this.scene.scale.width / 2;
    this.timerText.setPosition(centerX, 14);
    this.infoText.setPosition(centerX, 52);

    this.timerText.setText(formatTime(state.timeMs));

    const best = state.best === null ? '—' : formatTime(state.best);
    const node = state.selected === 'grapple' ? `[nodes ${state.ammo.grappleNodes}]` : `nodes ${state.ammo.grappleNodes}`;
    const expl = state.selected === 'explosive' ? `[explosives ${state.ammo.explosives}]` : `explosives ${state.ammo.explosives}`;
    this.infoText.setText(`best ${best}    ${node}   ${expl}`);
  }

  destroy(): void {
    this.timerText.destroy();
    this.infoText.destroy();
  }
}
