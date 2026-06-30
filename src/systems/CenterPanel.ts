import Phaser from 'phaser';

export interface PanelContent {
  title: string;
  /** Body lines, rendered centred under the title. */
  lines: string[];
  /** A short call-to-action footer (e.g. controls hint). */
  hint: string;
  /** Title colour (hex string). Defaults to a neutral light. */
  titleColor?: string;
}

/**
 * A simple screen-fixed centred panel used for the run-complete and pause
 * screens. Functional, not flashy: a dim backdrop plus title / body / hint text.
 * Reused rather than duplicated so both screens stay consistent and cheap to
 * maintain (docs/02 "small focused classes").
 */
export class CenterPanel {
  private readonly scene: Phaser.Scene;
  private readonly dim: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly body: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private shown = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.dim = scene.add
      .rectangle(cx, cy, width, height, 0x05070c, 0.6)
      .setScrollFactor(0)
      .setDepth(2000);

    this.title = scene.add
      .text(cx, cy - 90, '', { fontFamily: 'system-ui, sans-serif', fontSize: '36px', color: '#e8eaf0' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2001);

    this.body = scene.add
      .text(cx, cy, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#cdd6e6',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2001);

    this.hint = scene.add
      .text(cx, cy + 110, '', { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#8a93a6' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2001);

    this.setVisible(false);
  }

  get visible(): boolean {
    return this.shown;
  }

  show(content: PanelContent): void {
    this.reposition();
    this.title.setText(content.title).setColor(content.titleColor ?? '#e8eaf0');
    this.body.setText(content.lines);
    this.hint.setText(content.hint);
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  destroy(): void {
    this.dim.destroy();
    this.title.destroy();
    this.body.destroy();
    this.hint.destroy();
  }

  private reposition(): void {
    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height / 2;
    this.dim.setPosition(cx, cy).setSize(width, height);
    this.title.setPosition(cx, cy - 90);
    this.body.setPosition(cx, cy);
    this.hint.setPosition(cx, cy + 110);
  }

  private setVisible(visible: boolean): void {
    this.shown = visible;
    this.dim.setVisible(visible);
    this.title.setVisible(visible);
    this.body.setVisible(visible);
    this.hint.setVisible(visible);
  }
}
