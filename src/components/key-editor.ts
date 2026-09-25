import { css, html, nothing } from 'lit';
import { MAX_FEATURES, MAX_SPECIES, MIN_FEATURES, MIN_SPECIES } from '../solver';
import { StoreElement } from './store-element';

function describeError(code: string): string {
  const [kind, ...rest] = code.split(':');
  switch (kind) {
    case 'species-count':
      return `物种数量须为 ${MIN_SPECIES}–${MAX_SPECIES}，当前为 ${rest[0]}`;
    case 'feature-count':
      return `特征数量须为 ${MIN_FEATURES}–${MAX_FEATURES}，当前为 ${rest[0]}`;
    case 'species-name':
      return `物种名「${rest[0]}」为空或含非 ASCII 字符`;
    case 'species-duplicate':
      return `物种名「${rest[0]}」重复`;
    case 'feature-name':
      return `特征名「${rest[0]}」为空或含非 ASCII 字符`;
    case 'feature-duplicate':
      return `特征名「${rest[0]}」重复`;
    case 'matrix-rows':
      return `矩阵行数（${rest[0]}）与物种数不一致`;
    case 'matrix-cols':
      return `矩阵第 ${Number(rest[0]) + 1} 行列数（${rest[1]}）与特征数不一致`;
    case 'matrix-value':
      return `矩阵 (${rest[0]}, ${rest[1]}) 不是布尔值`;
    default:
      return code;
  }
}

/** 数据编辑面板：物种、特征、物种×特征矩阵，以及求解状态。 */
export class KeyEditor extends StoreElement {
  static override styles = css`
    :host {
      display: block;
    }
    h2 {
      font-size: 1rem;
      margin: 0 0 0.5rem;
      color: #7dd3fc;
    }
    section {
      margin-bottom: 1.25rem;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 0.5rem;
      padding: 0.2rem 0.4rem;
    }
    .chip input {
      width: 7rem;
      background: transparent;
      border: none;
      color: #e2e8f0;
      font: inherit;
      outline: none;
    }
    button {
      font: inherit;
      cursor: pointer;
      border-radius: 0.4rem;
      border: 1px solid #475569;
      background: #0f172a;
      color: #e2e8f0;
      padding: 0.2rem 0.6rem;
    }
    button:hover:not(:disabled) {
      background: #1e293b;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .remove {
      padding: 0 0.4rem;
      color: #f87171;
    }
    table {
      border-collapse: collapse;
    }
    th,
    td {
      padding: 0.25rem 0.4rem;
      text-align: center;
    }
    th {
      color: #93c5fd;
      font-weight: 600;
      writing-mode: vertical-rl;
      max-height: 7rem;
    }
    td.rowhead {
      color: #cbd5f5;
      text-align: right;
      font-family: ui-monospace, monospace;
    }
    td button.cell {
      width: 1.9rem;
      height: 1.9rem;
      padding: 0;
      font-family: ui-monospace, monospace;
    }
    td button.cell.on {
      background: #166534;
      border-color: #22c55e;
      color: #dcfce7;
    }
    td button.cell.off {
      background: #1f2937;
      color: #64748b;
    }
    .status {
      border-radius: 0.5rem;
      padding: 0.6rem 0.8rem;
      margin-top: 0.5rem;
    }
    .status.ok {
      background: #052e16;
      border: 1px solid #16a34a;
      color: #bbf7d0;
    }
    .status.warn {
      background: #2a1604;
      border: 1px solid #d97706;
      color: #fde68a;
    }
    .status.bad {
      background: #2b0a0a;
      border: 1px solid #ef4444;
      color: #fecaca;
    }
    .status ul {
      margin: 0.3rem 0 0;
      padding-left: 1.2rem;
    }
    .hint {
      color: #64748b;
      font-size: 0.85rem;
    }
  `;

  override render() {
    if (!this.store) return html``;
    const { data, result } = this.store.snapshot;
    return html`
      <section>
        <h2>物种（${data.species.length}/${MAX_SPECIES}）</h2>
        <div class="chips">
          ${data.species.map(
            (name, i) => html`
              <span class="chip">
                <input
                  aria-label="物种名"
                  .value=${name}
                  @input=${(e: InputEvent) =>
                    this.store.setSpeciesName(i, (e.target as HTMLInputElement).value)}
                />
                <button
                  class="remove"
                  title="删除物种"
                  ?disabled=${data.species.length <= MIN_SPECIES}
                  @click=${() => this.store.removeSpecies(i)}
                >
                  ×
                </button>
              </span>
            `,
          )}
          <button
            ?disabled=${data.species.length >= MAX_SPECIES}
            @click=${() => this.store.addSpecies()}
          >
            + 物种
          </button>
        </div>
      </section>

      <section>
        <h2>二值特征（${data.features.length}/${MAX_FEATURES}）</h2>
        <div class="chips">
          ${data.features.map(
            (name, j) => html`
              <span class="chip">
                <input
                  aria-label="特征名"
                  .value=${name}
                  @input=${(e: InputEvent) =>
                    this.store.setFeatureName(j, (e.target as HTMLInputElement).value)}
                />
                <button
                  class="remove"
                  title="删除特征"
                  ?disabled=${data.features.length <= MIN_FEATURES}
                  @click=${() => this.store.removeFeature(j)}
                >
                  ×
                </button>
              </span>
            `,
          )}
          <button
            ?disabled=${data.features.length >= MAX_FEATURES}
            @click=${() => this.store.addFeature()}
          >
            + 特征
          </button>
        </div>
      </section>

      <section>
        <h2>物种 × 特征矩阵</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              ${data.features.map((f) => html`<th title=${f}>${f}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${data.matrix.map(
              (row, i) => html`
                <tr>
                  <td class="rowhead">${data.species[i]}</td>
                  ${row.map(
                    (bit, j) => html`
                      <td>
                        <button
                          class="cell ${bit ? 'on' : 'off'}"
                          title="${data.species[i]} · ${data.features[j]}"
                          @click=${() => this.store.toggleCell(i, j)}
                        >
                          ${bit ? '1' : '0'}
                        </button>
                      </td>
                    `,
                  )}
                </tr>
              `,
            )}
          </tbody>
        </table>
        <p class="hint">点击格子切换 0/1；任何修改都会立即使旧决策树失效并重新求解。</p>
      </section>

      <section>${this.renderStatus(result)}</section>
    `;
  }

  private renderStatus(result: (typeof this.store.snapshot)['result']) {
    if (result.status === 'OK') {
      const n = this.store.snapshot.data.species.length;
      const avg = (result.totalDepth / n).toFixed(2);
      return html`
        <div class="status ok">
          决策树已生成：最坏提问数 <b>${result.worstDepth}</b>，路径长度总和
          <b>${result.totalDepth}</b>（平均 ${avg} 问 / 物种）。
        </div>
      `;
    }
    if (result.status === 'INDISTINGUISHABLE') {
      return html`
        <div class="status warn">
          <b>INDISTINGUISHABLE</b>：物种 <code>${result.pair[0]}</code> 与
          <code>${result.pair[1]}</code>
          的特征向量完全相同，任何提问都无法区分它们，故不生成决策树。
        </div>
      `;
    }
    return html`
      <div class="status bad">
        数据无效，无法求解：
        <ul>
          ${result.errors.map((e) => html`<li>${describeError(e)}</li>`)}
        </ul>
      </div>
    `;
  }
}

customElements.define('key-editor', KeyEditor);

declare global {
  interface HTMLElementTagNameMap {
    'key-editor': KeyEditor;
  }
}
