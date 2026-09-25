import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { solveKey, type SolveResult } from '../lib/key-solver';
import type { MatrixChange } from './matrix-editor';
import './matrix-editor';
import './key-walk';
import './key-tree';

/**
 * 检索表主页面：矩阵编辑 → 实时求解 → 交互识别。
 * 任何矩阵编辑都会使旧树立即失效（重算）并清空已答路径。
 */
@customElement('key-page')
export class KeyPage extends LitElement {
  @state() private species: string[] = ['cat', 'eagle', 'carp', 'duck'];
  @state() private characters: string[] = ['has fur', 'can fly', 'aquatic'];
  @state() private matrix: boolean[][] = [
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [false, true, true],
  ];
  @state() private answers: boolean[] = [];

  static styles = css`
    :host {
      display: block;
      max-width: 1040px;
      margin: 0 auto;
      padding: 24px 20px 48px;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      color: #1f2933;
    }
    h1 {
      margin: 0 0 4px;
      font-size: 1.5rem;
    }
    .sub {
      margin: 0 0 20px;
      color: #64748b;
      font-size: 0.9rem;
    }
    main {
      display: grid;
      gap: 20px;
    }
    section {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px 20px;
      background: #fff;
    }
    h2 {
      font-size: 1.02rem;
      margin: 0 0 12px;
    }
    .notice {
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 0.92rem;
    }
    .notice.error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .notice.warn {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }
    .notice ul {
      margin: 8px 0 0;
      padding-left: 20px;
    }
    .notice code {
      background: rgba(0, 0, 0, 0.06);
      border-radius: 4px;
      padding: 0 4px;
    }
    .metrics {
      display: flex;
      gap: 28px;
      margin: 0 0 14px;
    }
    .metrics div {
      display: flex;
      flex-direction: column;
    }
    .metrics dt {
      font-size: 0.72rem;
      color: #64748b;
    }
    .metrics dd {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
  `;

  private onMatrixChange(e: CustomEvent<MatrixChange>) {
    this.species = e.detail.species;
    this.characters = e.detail.characters;
    this.matrix = e.detail.matrix;
    this.answers = []; // 矩阵一旦编辑，旧树与已答路径立即失效
  }

  private onAnswersChange(e: CustomEvent<boolean[]>) {
    this.answers = e.detail;
  }

  render() {
    const result = solveKey({
      species: this.species,
      characters: this.characters,
      matrix: this.matrix,
    });
    return html`
      <header>
        <h1>二歧检索表编辑器</h1>
        <p class="sub">
          编辑物种 × 特征矩阵，实时生成最小化最坏提问数的识别树（并列时最小化总路径长，再按特征 id
          字节序裁决），并沿是/否分支实际识别。
        </p>
      </header>
      <main>
        <section>
          <h2>① 物种 × 特征矩阵</h2>
          <matrix-editor
            .species=${this.species}
            .characters=${this.characters}
            .matrix=${this.matrix}
            @matrix-change=${this.onMatrixChange}
          ></matrix-editor>
        </section>
        <section>
          <h2>② 识别树与交互识别</h2>
          ${this.renderResult(result)}
        </section>
      </main>
    `;
  }

  private renderResult(result: SolveResult) {
    switch (result.status) {
      case 'invalid':
        return html`<div class="notice error" role="alert">
          <strong>输入无效，识别树已失效</strong>
          <ul>
            ${result.errors.map((err) => html`<li>${err}</li>`)}
          </ul>
        </div>`;
      case 'indistinguishable':
        return html`<div class="notice warn" role="alert">
          <strong>INDISTINGUISHABLE</strong>
          <p>
            物种 <code>${result.pair[0]}</code> 与 <code>${result.pair[1]}</code>
            的特征向量完全相同，无法可靠区分，不生成识别树。
          </p>
        </div>`;
      case 'ok': {
        const avg = result.total / this.species.length;
        return html`
          <dl class="metrics">
            <div>
              <dt>最坏提问数</dt>
              <dd>${result.worst}</dd>
            </div>
            <div>
              <dt>总路径长</dt>
              <dd>${result.total}</dd>
            </div>
            <div>
              <dt>平均提问数</dt>
              <dd>${avg.toFixed(2)}</dd>
            </div>
          </dl>
          <key-walk
            .tree=${result.tree}
            .answers=${this.answers}
            @answers-change=${this.onAnswersChange}
          ></key-walk>
          <key-tree .tree=${result.tree} .answers=${this.answers}></key-tree>
        `;
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'key-page': KeyPage;
  }
}
