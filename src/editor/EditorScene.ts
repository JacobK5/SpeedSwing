import Phaser from 'phaser';
import { SceneKeys } from '../scenes/keys';
import { loadGameConfig } from '../config/loadConfig';
import { loadLevel } from '../levels/loadLevel';
import { validateLevel } from '../levels/validateLevel';
import type { GameConfig } from '../config/types';
import type { LevelData, LevelGeometry } from '../levels/types';
import { hexToInt } from '../core/color';
import { EditorPanel, type EditorController } from './EditorPanel';
import {
  EDITOR_SURFACES,
  type EditorSurface,
  snap,
  normalizeRect,
  geometryAtPoint,
  createEmptyLevel,
  levelToJson,
  parseLevelJson,
} from './editorModel';

const SESSION_KEY = 'speedswing.editor.level.v1';
const MIN_RECT = 8;
const HANDLE_PX = 14;

type DragMode = 'none' | 'create' | 'move' | 'resize' | 'pan';

/**
 * Dev-only greybox level editor. Reuses the existing level format and validator;
 * it is intentionally minimal (place / move / resize rectangles, pick a surface,
 * set spawn & goal & resources, validate, export/import JSON, test-play) and must
 * never grow into a production editor (AGENTS.md scope; approved as optional
 * tooling only). Opened via the `?editor` URL flag in dev builds.
 */
export class EditorScene extends Phaser.Scene implements EditorController {
  private config!: GameConfig;
  private level!: LevelData;
  private surface: EditorSurface = 'standard';
  private grid = 20;
  private selected = -1;

  private gfx!: Phaser.GameObjects.Graphics;
  private panel!: EditorPanel;

  private mode: DragMode = 'none';
  private createStart = { x: 0, y: 0 };
  private createCurrent = { x: 0, y: 0 };
  private moveOffset = { x: 0, y: 0 };
  private panPointer = { x: 0, y: 0 };
  private panScroll = { x: 0, y: 0 };
  private zoom = 0.7;

  constructor() {
    super(SceneKeys.Editor);
  }

  create(): void {
    this.config = loadGameConfig();
    this.level = this.restoreLevel();

    this.cameras.main.setBackgroundColor('#0f1116');
    this.cameras.main.setZoom(this.zoom);
    this.cameras.main.centerOn(400, 300);

    this.gfx = this.add.graphics().setDepth(1);
    this.panel = new EditorPanel(this);

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('wheel', this.onWheel, this);
    this.input.keyboard?.on('keydown', this.onKeyDown, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.panel.destroy());
  }

  update(): void {
    this.redraw();
  }

  // --- EditorController (panel callbacks) ---

  getLevel(): LevelData {
    return this.level;
  }
  getSurface(): EditorSurface {
    return this.surface;
  }
  setSurface(surface: EditorSurface): void {
    this.surface = surface;
    if (this.selected >= 0) {
      this.level.geometry[this.selected].surface = surface;
    }
  }
  getGrid(): number {
    return this.grid;
  }
  setGrid(grid: number): void {
    this.grid = Math.max(0, grid);
  }
  setName(name: string): void {
    this.level.metadata.name = name;
  }
  setResources(grappleNodes: number, explosives: number): void {
    this.level.resources = { grappleNodes: Math.max(0, grappleNodes), explosives: Math.max(0, explosives) };
  }
  newLevel(): void {
    this.level = createEmptyLevel();
    this.selected = -1;
  }
  loadFromJson(text: string): void {
    const raw = parseLevelJson(text);
    const result = validateLevel(raw, Object.keys(this.config.surfaces));
    if (!result.valid) {
      throw new Error(`Invalid level: ${result.errors[0]}`);
    }
    this.level = raw as LevelData;
    this.selected = -1;
  }
  loadRegistry(id: string): void {
    this.level = loadLevel(id, this.config);
    this.selected = -1;
  }
  validateCurrent(): string[] {
    return validateLevel(this.level, Object.keys(this.config.surfaces)).errors;
  }
  playtest(): void {
    this.persistLevel();
    this.scene.start(SceneKeys.Level, { levelData: this.level, returnScene: SceneKeys.Editor });
  }

  // --- Input ---

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    const world = this.worldPoint(pointer);
    if (pointer.rightButtonDown()) {
      this.mode = 'pan';
      this.panPointer = { x: pointer.x, y: pointer.y };
      this.panScroll = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
      return;
    }
    if (!pointer.leftButtonDown()) {
      return;
    }

    if (this.selected >= 0 && this.isOnHandle(world, this.level.geometry[this.selected])) {
      this.mode = 'resize';
      return;
    }

    const idx = geometryAtPoint(this.level.geometry, world.x, world.y);
    if (idx >= 0) {
      this.selected = idx;
      this.surface = this.level.geometry[idx].surface as EditorSurface;
      this.panel.refresh();
      this.mode = 'move';
      const piece = this.level.geometry[idx];
      this.moveOffset = { x: world.x - piece.x, y: world.y - piece.y };
      return;
    }

    this.selected = -1;
    this.mode = 'create';
    this.createStart = { x: snap(world.x, this.grid), y: snap(world.y, this.grid) };
    this.createCurrent = { ...this.createStart };
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.mode === 'pan') {
      const cam = this.cameras.main;
      cam.scrollX = this.panScroll.x - (pointer.x - this.panPointer.x) / cam.zoom;
      cam.scrollY = this.panScroll.y - (pointer.y - this.panPointer.y) / cam.zoom;
      return;
    }
    const world = this.worldPoint(pointer);
    if (this.mode === 'create') {
      this.createCurrent = { x: snap(world.x, this.grid), y: snap(world.y, this.grid) };
    } else if (this.mode === 'move' && this.selected >= 0) {
      const piece = this.level.geometry[this.selected];
      piece.x = snap(world.x - this.moveOffset.x, this.grid);
      piece.y = snap(world.y - this.moveOffset.y, this.grid);
    } else if (this.mode === 'resize' && this.selected >= 0) {
      const piece = this.level.geometry[this.selected];
      piece.width = Math.max(MIN_RECT, snap(world.x, this.grid) - piece.x);
      piece.height = Math.max(MIN_RECT, snap(world.y, this.grid) - piece.y);
    }
  }

  private onPointerUp(): void {
    if (this.mode === 'create') {
      const rect = normalizeRect(
        this.createStart.x,
        this.createStart.y,
        this.createCurrent.x,
        this.createCurrent.y,
      );
      if (rect.width >= MIN_RECT && rect.height >= MIN_RECT) {
        this.level.geometry.push({ ...rect, surface: this.surface });
        this.selected = this.level.geometry.length - 1;
      }
    }
    this.mode = 'none';
  }

  private onWheel(_p: unknown, _o: unknown, _dx: number, dy: number): void {
    this.zoom = Phaser.Math.Clamp(this.zoom * (dy > 0 ? 0.9 : 1.1), 0.2, 3);
    this.cameras.main.setZoom(this.zoom);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const surfaceIndex = ['1', '2', '3', '4'].indexOf(event.key);
    if (surfaceIndex >= 0 && surfaceIndex < EDITOR_SURFACES.length) {
      this.setSurface(EDITOR_SURFACES[surfaceIndex]);
      this.panel.refresh();
      return;
    }
    const cursor = this.worldPoint(this.input.activePointer);
    switch (event.key) {
      case '[':
        this.grid = Math.max(0, this.grid - 5);
        this.panel.refresh();
        break;
      case ']':
        this.grid += 5;
        this.panel.refresh();
        break;
      case 'g':
      case 'G':
        this.level.goal.x = snap(cursor.x, this.grid);
        this.level.goal.y = snap(cursor.y, this.grid);
        break;
      case 'p':
      case 'P':
        this.level.spawn.x = snap(cursor.x, this.grid);
        this.level.spawn.y = snap(cursor.y, this.grid);
        break;
      case 'Delete':
      case 'Backspace':
        if (this.selected >= 0) {
          this.level.geometry.splice(this.selected, 1);
          this.selected = -1;
        }
        break;
      case 'Escape':
        this.scene.start(SceneKeys.Menu);
        break;
      default:
        break;
    }
  }

  // --- Rendering ---

  private redraw(): void {
    const g = this.gfx;
    g.clear();
    this.drawGrid(g);

    this.level.geometry.forEach((piece, index) => {
      const color = hexToInt(this.config.surfaces[piece.surface]?.color ?? '#6b7280');
      g.fillStyle(color, 0.5);
      g.fillRect(piece.x, piece.y, piece.width, piece.height);
      g.lineStyle(2, color, 1);
      g.strokeRect(piece.x, piece.y, piece.width, piece.height);
      if (index === this.selected) {
        g.lineStyle(2, hexToInt('#9ecbff'), 1);
        g.strokeRect(piece.x - 2, piece.y - 2, piece.width + 4, piece.height + 4);
        const h = HANDLE_PX / this.cameras.main.zoom;
        g.fillStyle(hexToInt('#9ecbff'), 1);
        g.fillRect(piece.x + piece.width - h / 2, piece.y + piece.height - h / 2, h, h);
      }
    });

    // Spawn marker (blue) and goal trigger (green).
    const spawn = this.level.spawn;
    g.lineStyle(2, hexToInt('#9ecbff'), 1);
    g.strokeRect(spawn.x - 14, spawn.y - 22, 28, 44);
    g.fillStyle(hexToInt('#9ecbff'), 0.25);
    g.fillRect(spawn.x - 14, spawn.y - 22, 28, 44);

    const goal = this.level.goal;
    g.lineStyle(2, hexToInt('#6ee7a8'), 1);
    g.strokeCircle(goal.x, goal.y, goal.radius);

    if (this.mode === 'create') {
      const rect = normalizeRect(
        this.createStart.x,
        this.createStart.y,
        this.createCurrent.x,
        this.createCurrent.y,
      );
      g.lineStyle(1, hexToInt('#ffffff'), 0.8);
      g.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  private drawGrid(g: Phaser.GameObjects.Graphics): void {
    if (this.grid <= 0) {
      return;
    }
    const view = this.cameras.main.worldView;
    g.lineStyle(1, hexToInt('#1d2230'), 0.8);
    const startX = Math.floor(view.x / this.grid) * this.grid;
    const startY = Math.floor(view.y / this.grid) * this.grid;
    for (let x = startX; x <= view.right; x += this.grid) {
      g.lineBetween(x, view.y, x, view.bottom);
    }
    for (let y = startY; y <= view.bottom; y += this.grid) {
      g.lineBetween(view.x, y, view.right, y);
    }
  }

  // --- Helpers ---

  private worldPoint(pointer: Phaser.Input.Pointer): { x: number; y: number } {
    const p = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    return { x: p.x, y: p.y };
  }

  private isOnHandle(world: { x: number; y: number }, piece: LevelGeometry): boolean {
    const h = HANDLE_PX / this.cameras.main.zoom;
    const hx = piece.x + piece.width;
    const hy = piece.y + piece.height;
    return Math.abs(world.x - hx) <= h && Math.abs(world.y - hy) <= h;
  }

  private restoreLevel(): LevelData {
    try {
      const raw = sessionStorage?.getItem(SESSION_KEY);
      if (raw) {
        const parsed = parseLevelJson(raw);
        if (validateLevel(parsed, Object.keys(this.config.surfaces)).valid) {
          return parsed as LevelData;
        }
      }
    } catch {
      // fall through to a fresh level
    }
    return createEmptyLevel();
  }

  private persistLevel(): void {
    try {
      sessionStorage?.setItem(SESSION_KEY, levelToJson(this.level));
    } catch {
      // best effort
    }
  }
}
