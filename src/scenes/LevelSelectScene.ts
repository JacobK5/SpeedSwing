import Phaser from 'phaser';
import { SceneKeys } from './keys';
import { listLevels } from '../levels/loadLevel';
import { loadBest } from '../systems/personalBest';
import { formatTime } from '../systems/timeFormat';
import { GAME_VERSION } from '../core/version';

/**
 * Functional level-select screen: lists the available levels with their personal
 * best, and starts the chosen one. Plain text rows (click or number key) — the
 * point is to get into a run fast, not to look impressive (UI is intentionally
 * unpolished at this stage; AGENTS.md scope discipline).
 */
export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.LevelSelect);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    this.add
      .text(centerX, 70, 'SELECT LEVEL', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '34px',
        color: '#e8eaf0',
      })
      .setOrigin(0.5);

    const levels = listLevels();
    const startY = 170;
    const rowHeight = 64;

    levels.forEach((level, index) => {
      const y = startY + index * rowHeight;
      const best = loadBest(level.id);
      const bestLabel = best === null ? 'best —' : `best ${formatTime(best)}`;

      const row = this.add
        .text(centerX, y, `${index + 1}.  ${level.name}     ${bestLabel}`, {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#9ecbff',
          backgroundColor: '#1c2433',
          padding: { x: 16, y: 10 },
          align: 'center',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      row.on('pointerover', () => row.setColor('#ffffff'));
      row.on('pointerout', () => row.setColor('#9ecbff'));
      row.on('pointerdown', () => this.startLevel(level.id));

      // Number-key shortcut for the first nine levels.
      if (index < 9) {
        this.input.keyboard?.once(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'][index]}`, () =>
          this.startLevel(level.id),
        );
      }
    });

    this.add
      .text(centerX, startY + levels.length * rowHeight + 24, 'Click a level or press its number.  ESC to title.', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        color: '#8a93a6',
      })
      .setOrigin(0.5);

    this.add
      .text(width - 12, height - 12, `v${GAME_VERSION}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#5b6477',
      })
      .setOrigin(1, 1);

    this.input.keyboard?.once('keydown-ESC', () => this.scene.start(SceneKeys.Menu));
  }

  private startLevel(levelId: string): void {
    this.scene.start(SceneKeys.Level, { levelId });
  }
}
