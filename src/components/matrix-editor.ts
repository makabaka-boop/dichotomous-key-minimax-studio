import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  MAX_CHARACTERS,
  MAX_SPECIES,
  MIN_CHARACTERS,
  MIN_SPECIES,
} from '../lib/key-solver';

export interface MatrixChange {
  species: string[];
  characters: string[];
  matrix: boolean[][];
}

/**
 * 物种 × 特征矩阵编辑器：重命名 id、增删行列、点击单元格切换是/否。
 * 所有编辑都以不可变更新通过 matrix-change 事件上抛，由父级统一重算。
 */
@customElement('matrix-editor')
export class MatrixEditor extends LitElement {
  @property({ attribute: false }) species: string[] = [];
  @property({ attribute: false }) characters: string[] = [];
  @property({ attribute: false }) matrix: boolean[][] = [];

  static styles = css`
    :host {
      display: block;
      overflow-x: auto;
    }
    table {
      border-collapse: collapse;
    }
    th,
    td {
      padding: 3px 5px;
      text-align: center;
    }
    .corner {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 500;
    }
    input {
      width: 6.5rem;
      font: inherit;
      font-size: 0.85rem;
      padding: 2px 6px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }
    input:focus {
      outline: 2px solid #93c5fd;
      outline-offset: 0;
    }
    button {
      font: inherit;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .cell {
      width: 2.6rem;
      height: 1.85rem;
      border-radius: 6px;
      border: 1px solid;
      font-size: 0.82rem;
    }
    .cell.on {
      background: #dcfce7;
      border-color: #86efac;
      color: #166534;
    }
    .cell.off {
      background: #f1f5f9;
      border-color: #e2e8f0;
      color: #94a3b8;
    }
    .del {
      border: none;
      background: none;
      color: #cbd5e1;
      font-size: 0.9rem;
      padding: 0 3px;
    }
    .del:hover:not(:disabled) {
      color: #ef4444;
    }
    .add-row {
      margin-top: 10px;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .add-btn {
      border: 1px dashed #94a3b8;
      background: #fff;
      border-radius: 6px;
      padding: 4px 12px;
      color: #475569;
      font-size: 0.85rem;
    }
    .add-btn:hover:not(:disabled) {
      border-color: #2563eb;
      color: #2563eb;
    }
    .hint {
      margin: 8px 0 0;
      font-size: 0.78rem;
      color: #94a3b8;
    }
  `;

  private emitChange(species: string[], characters: string[], matrix: boolean[][]) {
    this.dispatchEvent(
      new CustomEvent<MatrixChange>('matrix-change', {
        detail: { species, characters, matrix },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private toggleCell(i: number, j: number) {
    const matrix = this.matrix.map((row, r) =>
      r === i ? row.map((v, c) => (c === j ? !v : v)) : [...row],
    );
    this.emitChange(this.species, this.characters, matrix);
  }

  private renameSpecies(i: number, e: InputEvent) {
    const species = [...this.species];
    species[i] = (e.target as HTMLInputElement).value;
    this.emitChange(species, this.characters, this.matrix);
  }

  private renameCharacter(j: number, e: InputEvent) {
    const characters = [...this.characters];
    characters[j] = (e.target as HTMLInputElement).value;
    this.emitChange(this.species, characters, this.matrix);
  }

  private nextId(prefix: string, taken: string[]): string {
    let k = taken.length + 1;
    let id = `${prefix}${k}`;
    while (taken.includes(id)) id = `${prefix}${++k}`;
    return id;
  }

  private addSpecies() {
    if (this.species.length >= MAX_SPECIES) return;
    this.emitChange(
      [...this.species, this.nextId('s', this.species)],
      this.characters,
      [...this.matrix, this.characters.map(() => false)],
    );
  }

  private removeSpecies(i: number) {
    if (this.species.length <= MIN_SPECIES) return;
    this.emitChange(
      this.species.filter((_, r) => r !== i),
      this.characters,
      this.matrix.filter((_, r) => r !== i),
    );
  }

  private addCharacter() {
    if (this.characters.length >= MAX_CHARACTERS) return;
    this.emitChange(
      this.species,
      [...this.characters, this.nextId('c', this.characters)],
      this.matrix.map((row) => [...row, false]),
    );
  }

  private removeCharacter(j: number) {
    if (this.characters.length <= MIN_CHARACTERS) return;
    this.emitChange(
      this.species,
      this.characters.filter((_, c) => c !== j),
      this.matrix.map((row) => row.filter((_, c) => c !== j)),
    );
  }

  render() {
    return html`
      <table>
        <thead>
          <tr>
            <th class="corner">物种＼特征</th>
            ${this.characters.map(
              (c, j) => html`<th>
                <input
                  .value=${c}
                  @input=${(e: InputEvent) => this.renameCharacter(j, e)}
                  aria-label="特征 id"
                />
                <button
                  class="del"
                  title="删除该特征"
                  ?disabled=${this.characters.length <= MIN_CHARACTERS}
                  @click=${() => this.removeCharacter(j)}
                >
                  ×
                </button>
              </th>`,
            )}
            <th>
              <button
                class="add-btn"
                ?disabled=${this.characters.length >= MAX_CHARACTERS}
                @click=${this.addCharacter}
              >
                ＋特征
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          ${this.species.map(
            (s, i) => html`<tr>
              <th>
                <input
                  .value=${s}
                  @input=${(e: InputEvent) => this.renameSpecies(i, e)}
                  aria-label="物种 id"
                />
                <button
                  class="del"
                  title="删除该物种"
                  ?disabled=${this.species.length <= MIN_SPECIES}
                  @click=${() => this.removeSpecies(i)}
                >
                  ×
                </button>
              </th>
              ${this.characters.map((_, j) => {
                const on = this.matrix[i]?.[j] === true;
                return html`<td>
                  <button
                    class="cell ${on ? 'on' : 'off'}"
                    aria-pressed=${on ? 'true' : 'false'}
                    @click=${() => this.toggleCell(i, j)}
                  >
                    ${on ? '是' : '否'}
                  </button>
                </td>`;
              })}
              <td></td>
            </tr>`,
          )}
        </tbody>
      </table>
      <div class="add-row">
        <button
          class="add-btn"
          ?disabled=${this.species.length >= MAX_SPECIES}
          @click=${this.addSpecies}
        >
          ＋物种
        </button>
        <span class="hint">
          ${MIN_SPECIES}–${MAX_SPECIES} 个唯一 ASCII 物种，${MIN_CHARACTERS}–${MAX_CHARACTERS}
          个唯一 ASCII 特征；点击单元格切换 是/否。
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'matrix-editor': MatrixEditor;
  }
}
