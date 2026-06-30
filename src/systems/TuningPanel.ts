import type { GameConfig } from '../config/types';
import { RANGES, clampToRange, type RangedCategory } from '../config/ranges';
import { resolveConfig } from '../config/resolveConfig';
import { applyConfigInto, saveTuning, loadTuning, clearTuning } from '../config/tuningStore';

// In-game developer tuning panel (docs/02-v0.1-technical-spec.md;
// docs/04-physics-tuning.md). A lightweight DOM overlay — not a Phaser UI —
// because native inputs/checkboxes/buttons are the simplest reliable way to edit
// values live. Dev-only: LevelScene constructs it solely under import.meta.env.DEV.
//
// Edits mutate the live GameConfig object in place, so movement/grapple/debug
// values (read every frame) update instantly; gravity and camera are re-applied
// through the onChange callback. Save/Load/Defaults persist via tuningStore.

/** Categories exposed for tuning (surfaces are a data table, not feel values). */
const TUNED_CATEGORIES: readonly RangedCategory[] = ['movement', 'physics', 'grapple', 'weapons', 'camera', 'debug'];

export interface TuningPanelCallbacks {
  /** Re-apply values that are only read at setup (gravity, camera). */
  onChange: () => void;
}

// Persisted across scene restarts within a session so rapid restart-tuning does
// not keep collapsing the panel.
let panelVisible = false;

interface BoundInput {
  category: RangedCategory;
  key: string;
  el: HTMLInputElement;
}

export class TuningPanel {
  private readonly config: GameConfig;
  private readonly callbacks: TuningPanelCallbacks;
  private readonly root: HTMLDivElement;
  private readonly inputs: BoundInput[] = [];

  constructor(config: GameConfig, callbacks: TuningPanelCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.root = this.build();
    document.body.appendChild(this.root);
    this.setVisible(panelVisible);
  }

  toggle(): void {
    this.setVisible(!panelVisible);
  }

  destroy(): void {
    this.root.remove();
  }

  private setVisible(visible: boolean): void {
    panelVisible = visible;
    this.root.style.display = visible ? 'flex' : 'none';
  }

  private build(): HTMLDivElement {
    const root = document.createElement('div');
    Object.assign(root.style, {
      position: 'fixed',
      top: '12px',
      right: '12px',
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
      flexDirection: 'column',
      gap: '4px',
    } satisfies Partial<CSSStyleDeclaration>);

    root.appendChild(this.buildHeader());
    root.appendChild(this.buildButtons());

    for (const category of TUNED_CATEGORIES) {
      root.appendChild(this.buildCategory(category));
    }

    return root;
  }

  private buildHeader(): HTMLElement {
    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: 'bold',
      color: '#9ecbff',
      marginBottom: '2px',
    } satisfies Partial<CSSStyleDeclaration>);

    const title = document.createElement('span');
    title.textContent = 'TUNING  (T)';
    header.appendChild(title);

    const close = document.createElement('button');
    close.textContent = '×';
    this.styleButton(close);
    close.addEventListener('click', () => this.setVisible(false));
    header.appendChild(close);

    return header;
  }

  private buildButtons(): HTMLElement {
    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: '4px', marginBottom: '4px' } satisfies Partial<CSSStyleDeclaration>);

    row.appendChild(this.actionButton('Save', () => saveTuning(this.config)));
    row.appendChild(
      this.actionButton('Load', () => {
        const saved = loadTuning();
        if (saved) {
          applyConfigInto(this.config, saved);
          this.refreshInputs();
          this.callbacks.onChange();
        }
      }),
    );
    row.appendChild(
      this.actionButton('Defaults', () => {
        applyConfigInto(this.config, resolveConfig({}).config);
        clearTuning();
        this.refreshInputs();
        this.callbacks.onChange();
      }),
    );

    return row;
  }

  private buildCategory(category: RangedCategory): HTMLElement {
    const section = document.createElement('div');

    const heading = document.createElement('div');
    heading.textContent = category.toUpperCase();
    Object.assign(heading.style, {
      color: '#7f8aa3',
      borderBottom: '1px solid #2b3344',
      margin: '6px 0 2px',
    } satisfies Partial<CSSStyleDeclaration>);
    section.appendChild(heading);

    if (category === 'physics') {
      const note = document.createElement('div');
      note.textContent = 'gravity is live; player body (size/friction/chamfer/restitution) applies on restart (R)';
      Object.assign(note.style, { color: '#5b6477', fontStyle: 'italic' } satisfies Partial<CSSStyleDeclaration>);
      section.appendChild(note);
    }

    const values = this.config[category] as unknown as Record<string, number | boolean>;
    for (const [key, value] of Object.entries(values)) {
      section.appendChild(
        typeof value === 'boolean'
          ? this.buildBooleanRow(category, key, value)
          : this.buildNumberRow(category, key, value),
      );
    }

    return section;
  }

  private buildNumberRow(category: RangedCategory, key: string, value: number): HTMLElement {
    const row = this.fieldRow(key);
    const range = RANGES[category][key];

    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.value = String(value);
    if (range?.min !== undefined) input.min = String(range.min);
    if (range?.max !== undefined) input.max = String(range.max);
    Object.assign(input.style, {
      width: '90px',
      background: '#0c0f16',
      color: '#dfe6f3',
      border: '1px solid #2b3344',
      borderRadius: '3px',
      padding: '1px 4px',
    } satisfies Partial<CSSStyleDeclaration>);

    input.addEventListener('input', () => {
      const parsed = Number.parseFloat(input.value);
      if (!Number.isFinite(parsed)) {
        return;
      }
      const clamped = clampToRange(parsed, range);
      (this.config[category] as unknown as Record<string, number | boolean>)[key] = clamped;
      this.callbacks.onChange();
    });

    this.inputs.push({ category, key, el: input });
    row.appendChild(input);
    return row;
  }

  private buildBooleanRow(category: RangedCategory, key: string, value: boolean): HTMLElement {
    const row = this.fieldRow(key);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
    input.addEventListener('change', () => {
      (this.config[category] as unknown as Record<string, number | boolean>)[key] = input.checked;
      this.callbacks.onChange();
    });

    this.inputs.push({ category, key, el: input });
    row.appendChild(input);
    return row;
  }

  private refreshInputs(): void {
    for (const { category, key, el } of this.inputs) {
      const value = (this.config[category] as unknown as Record<string, number | boolean>)[key];
      if (typeof value === 'boolean') {
        el.checked = value;
      } else {
        el.value = String(value);
      }
    }
  }

  private fieldRow(label: string): HTMLElement {
    const row = document.createElement('label');
    Object.assign(row.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
    } satisfies Partial<CSSStyleDeclaration>);

    const name = document.createElement('span');
    name.textContent = label;
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';
    row.appendChild(name);

    return row;
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
