import type { LevelData } from '../levels/types';
import { EDITOR_SURFACES, type EditorSurface, levelToJson } from './editorModel';
import { listLevels } from '../levels/loadLevel';

// DOM control panel for the level editor (dev-only). Native inputs/buttons are
// the simplest reliable way to drive metadata, surface selection, grid snap,
// validation and JSON import/export — the canvas (EditorScene) handles geometry.
//
// The scene owns this panel and calls refresh() whenever it changes state via
// the keyboard (surface keys, grid keys), so the DOM always mirrors the model.

/** What the panel needs from the editor scene. */
export interface EditorController {
  getLevel(): LevelData;
  getSurface(): EditorSurface;
  setSurface(surface: EditorSurface): void;
  getGrid(): number;
  setGrid(grid: number): void;
  setName(name: string): void;
  setResources(grappleNodes: number, explosives: number): void;
  newLevel(): void;
  loadFromJson(text: string): void;
  loadRegistry(id: string): void;
  validateCurrent(): string[];
  playtest(): void;
}

export class EditorPanel {
  private readonly controller: EditorController;
  private readonly root: HTMLDivElement;
  private readonly surfaceButtons = new Map<EditorSurface, HTMLButtonElement>();
  private gridInput!: HTMLInputElement;
  private nameInput!: HTMLInputElement;
  private nodesInput!: HTMLInputElement;
  private explosivesInput!: HTMLInputElement;
  private jsonArea!: HTMLTextAreaElement;
  private status!: HTMLDivElement;

  constructor(controller: EditorController) {
    this.controller = controller;
    this.root = this.build();
    document.body.appendChild(this.root);
    this.refresh();
  }

  destroy(): void {
    this.root.remove();
  }

  /** Re-read controller state into the inputs (after keyboard-driven changes). */
  refresh(): void {
    const surface = this.controller.getSurface();
    for (const [key, btn] of this.surfaceButtons) {
      btn.style.outline = key === surface ? '2px solid #9ecbff' : 'none';
    }
    this.gridInput.value = String(this.controller.getGrid());
    const level = this.controller.getLevel();
    this.nameInput.value = level.metadata.name;
    this.nodesInput.value = String(level.resources?.grappleNodes ?? 0);
    this.explosivesInput.value = String(level.resources?.explosives ?? 0);
  }

  /** Show a status / validation message. */
  setStatus(message: string, ok: boolean): void {
    this.status.textContent = message;
    this.status.style.color = ok ? '#6ee7a8' : '#ff8c8c';
  }

  /** Put the current level JSON into the textarea (e.g. after Copy/validate). */
  showJson(): void {
    this.jsonArea.value = levelToJson(this.controller.getLevel());
  }

  private build(): HTMLDivElement {
    const root = document.createElement('div');
    Object.assign(root.style, {
      position: 'fixed',
      top: '12px',
      left: '12px',
      width: '300px',
      maxHeight: 'calc(100vh - 24px)',
      overflowY: 'auto',
      background: 'rgba(15, 18, 26, 0.95)',
      color: '#dfe6f3',
      font: '12px/1.5 monospace',
      border: '1px solid #2b3344',
      borderRadius: '6px',
      padding: '10px',
      zIndex: '1000',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement('div');
    title.textContent = 'LEVEL EDITOR (dev)';
    Object.assign(title.style, { fontWeight: 'bold', color: '#9ecbff' } satisfies Partial<CSSStyleDeclaration>);
    root.appendChild(title);

    root.appendChild(this.buildSurfaceRow());
    root.appendChild(this.labelledRow('grid', (this.gridInput = this.numberInput((v) => this.controller.setGrid(v)))));
    root.appendChild(this.labelledRow('name', (this.nameInput = this.textInput((v) => this.controller.setName(v)))));
    root.appendChild(this.labelledRow('nodes', (this.nodesInput = this.numberInput(() => this.applyResources()))));
    root.appendChild(
      this.labelledRow('explosives', (this.explosivesInput = this.numberInput(() => this.applyResources()))),
    );

    root.appendChild(this.buildActionRow());
    root.appendChild(this.buildLoadRow());

    this.jsonArea = document.createElement('textarea');
    Object.assign(this.jsonArea.style, {
      width: '100%',
      height: '120px',
      background: '#0c0f16',
      color: '#dfe6f3',
      border: '1px solid #2b3344',
      borderRadius: '3px',
      font: '11px/1.4 monospace',
      resize: 'vertical',
    } satisfies Partial<CSSStyleDeclaration>);
    this.jsonArea.placeholder = 'Level JSON (Copy fills this; paste here then Load JSON)';
    root.appendChild(this.jsonArea);

    this.status = document.createElement('div');
    this.status.style.minHeight = '16px';
    root.appendChild(this.status);

    const help = document.createElement('div');
    help.style.color = '#5b6477';
    help.innerHTML =
      'drag empty: new rect<br>click rect: select<br>drag rect: move &middot; drag corner: resize<br>' +
      'right-drag: pan &middot; wheel: zoom<br>1-4 surface &middot; [ ] grid &middot; G goal &middot; P spawn<br>' +
      'Del: delete &middot; Esc: exit';
    root.appendChild(help);

    return root;
  }

  private buildSurfaceRow(): HTMLElement {
    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', flexWrap: 'wrap', gap: '4px' } satisfies Partial<CSSStyleDeclaration>);
    EDITOR_SURFACES.forEach((surface, index) => {
      const btn = document.createElement('button');
      btn.textContent = `${index + 1} ${surface}`;
      this.styleButton(btn);
      btn.addEventListener('click', () => {
        this.controller.setSurface(surface);
        this.refresh();
      });
      this.surfaceButtons.set(surface, btn);
      row.appendChild(btn);
    });
    return row;
  }

  private buildActionRow(): HTMLElement {
    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: '4px' } satisfies Partial<CSSStyleDeclaration>);
    row.appendChild(this.actionButton('New', () => this.controller.newLevel()));
    row.appendChild(
      this.actionButton('Validate', () => {
        const errors = this.controller.validateCurrent();
        if (errors.length === 0) {
          this.setStatus('Valid ✓', true);
        } else {
          this.setStatus(`${errors.length} error(s): ${errors[0]}`, false);
        }
      }),
    );
    row.appendChild(
      this.actionButton('Copy JSON', () => {
        this.showJson();
        const text = this.jsonArea.value;
        navigator.clipboard?.writeText(text).then(
          () => this.setStatus('Copied to clipboard', true),
          () => this.setStatus('Copied to textarea (clipboard blocked)', true),
        );
      }),
    );
    row.appendChild(
      this.actionButton('Play', () => {
        const errors = this.controller.validateCurrent();
        if (errors.length > 0) {
          this.setStatus(`Fix ${errors.length} error(s) first: ${errors[0]}`, false);
          return;
        }
        this.controller.playtest();
      }),
    );
    return row;
  }

  private buildLoadRow(): HTMLElement {
    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: '4px' } satisfies Partial<CSSStyleDeclaration>);

    const select = document.createElement('select');
    Object.assign(select.style, {
      flex: '1',
      background: '#0c0f16',
      color: '#dfe6f3',
      border: '1px solid #2b3344',
      borderRadius: '3px',
    } satisfies Partial<CSSStyleDeclaration>);
    for (const level of listLevels()) {
      const option = document.createElement('option');
      option.value = level.id;
      option.textContent = level.id;
      select.appendChild(option);
    }

    row.appendChild(select);
    row.appendChild(
      this.actionButton('Load level', () => {
        try {
          this.controller.loadRegistry(select.value);
          this.refresh();
          this.setStatus(`Loaded ${select.value}`, true);
        } catch (e) {
          this.setStatus((e as Error).message, false);
        }
      }),
    );
    row.appendChild(
      this.actionButton('Load JSON', () => {
        try {
          this.controller.loadFromJson(this.jsonArea.value);
          this.refresh();
          this.setStatus('Loaded JSON ✓', true);
        } catch (e) {
          this.setStatus((e as Error).message, false);
        }
      }),
    );
    return row;
  }

  private applyResources(): void {
    const nodes = Number.parseInt(this.nodesInput.value, 10);
    const explosives = Number.parseInt(this.explosivesInput.value, 10);
    this.controller.setResources(Number.isFinite(nodes) ? nodes : 0, Number.isFinite(explosives) ? explosives : 0);
  }

  private labelledRow(label: string, input: HTMLElement): HTMLElement {
    const row = document.createElement('label');
    Object.assign(row.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
    } satisfies Partial<CSSStyleDeclaration>);
    const name = document.createElement('span');
    name.textContent = label;
    row.appendChild(name);
    row.appendChild(input);
    return row;
  }

  private numberInput(onChange: (value: number) => void): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    this.styleField(input);
    input.addEventListener('input', () => {
      const value = Number.parseFloat(input.value);
      if (Number.isFinite(value)) {
        onChange(value);
      }
    });
    return input;
  }

  private textInput(onChange: (value: string) => void): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    this.styleField(input);
    input.addEventListener('input', () => onChange(input.value));
    return input;
  }

  private styleField(input: HTMLInputElement): void {
    Object.assign(input.style, {
      width: '120px',
      background: '#0c0f16',
      color: '#dfe6f3',
      border: '1px solid #2b3344',
      borderRadius: '3px',
      padding: '1px 4px',
    } satisfies Partial<CSSStyleDeclaration>);
  }

  private actionButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    this.styleButton(button);
    button.style.flex = '1';
    button.addEventListener('click', onClick);
    return button;
  }

  private styleButton(button: HTMLButtonElement): void {
    Object.assign(button.style, {
      background: '#1c2433',
      color: '#dfe6f3',
      border: '1px solid #2b3344',
      borderRadius: '3px',
      padding: '2px 6px',
      cursor: 'pointer',
      font: '12px monospace',
    } satisfies Partial<CSSStyleDeclaration>);
  }
}
