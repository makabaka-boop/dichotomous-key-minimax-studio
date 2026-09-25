import { css, html, nothing } from 'lit';
import { StoreElement } from './store-element';

/** 交互式识别面板：沿是/否分支下行，可随时回溯或重来。 */
export class KeyIdentify extends StoreElement {
  static override styles = css`
    :host {
      display: block;
    }
    h2 {
      font-size: 1rem;
      margin: 0 0 0.5rem;
      color: #7dd3fc;
    }
    .panel {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 0.6rem;
      padding: 0.9rem;
    }
    .question {
      font-size: 1.15rem;
      margin: 0.2rem 0 0.7rem;
    }
    .question code {
      color: #fbbf24;
    }
    .answers {
      display: flex;
      gap: 0.6rem;
    }
    button {
      font: inherit;
      cursor: pointer;
      border-radius: 0.4rem;
      border: 1px solid #475569;
      background: #1e293b;
      color: #e2e8f0;
      padding: 0.35rem 1.1rem;
    }
    button:hover:not(:disabled) {
      background: #334155;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    button.yes {
      border-color: #22c55e;
    }
    button.no {
      border-color: #f87171;
    }
    .leaf {
      font-size: 1.15rem;
      color: #86efac;
    }
    .leaf code {
      font-size: 1.3rem;
    }
    .toolbar {
      margin-top: 0.7rem;
      display: flex;
      gap: 0.5rem;
    }
    .crumbs {
      margin-top: 0.7rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .crumb {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 999px;
      padding: 0.1rem 0.6rem;
      font-size: 0.85rem;
      color: #cbd5f5;
    }
    .crumb b {
      color: #fbbf24;
    }
    .candidates {
      margin-top: 0.7rem;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .candidates code {
      color: #e2e8f0;
      margin-right: 0.3rem;
    }
    .meta {
      color: #64748b;
      font-size: 0.85rem;
    }
    .warn {
      background: #2a1604;
      border: 1px solid #d97706;
      color: #fde68a;
      border-radius: 0.5rem;
      padding: 0.6rem 0.8rem;
    }
  `;

  override render() {
    if (!this.store) return html``;
    const snap = this.store.snapshot;
    if (snap.result.status === 'INDISTINGUISHABLE') {
      return html`
        <h2>识别</h2>
        <div class="warn">
          当前矩阵存在无法区分的物种对（${snap.result.pair[0]} /
          ${snap.result.pair[1]}），请先修正矩阵再开始识别。
        </div>
      `;
    }
    if (snap.result.status !== 'OK') {
      return html`<h2>识别</h2>
        <div class="warn">数据无效，修正后才能生成检索树。</div>`;
    }

    const node = this.store.currentNode();
    const asked = this.store.askedFeatures();
    const candidates = this.store.candidates();
    const depth = snap.answers.length;

    return html`
      <h2>识别</h2>
      <div class="panel">
        <div class="meta">
          已问 ${depth} 题 · 最坏还需 ${snap.result.worstDepth} 题封顶 · 候选
          ${candidates.length} 个
        </div>
        ${node && node.kind === 'question'
          ? html`
              <p class="question">该样本具有特征 <code>${node.feature}</code> 吗？</p>
              <div class="answers">
                <button class="yes" @click=${() => this.store.answer(true)}>是</button>
                <button class="no" @click=${() => this.store.answer(false)}>否</button>
              </div>
            `
          : html`
              <p class="leaf">
                识别结果：<code>${node && node.kind === 'leaf' ? node.species : '?'}</code>
              </p>
            `}
        <div class="toolbar">
          <button ?disabled=${depth === 0} @click=${() => this.store.undo()}>← 回溯</button>
          <button ?disabled=${depth === 0} @click=${() => this.store.resetPath()}>重来</button>
        </div>
        ${asked.length > 0
          ? html`
              <div class="crumbs">
                ${asked.map(
                  (f, k) => html`
                    <span class="crumb">${f}：<b>${snap.answers[k] ? '是' : '否'}</b></span>
                  `,
                )}
              </div>
            `
          : nothing}
        <div class="candidates">
          剩余候选：${candidates.map((c) => html`<code>${c}</code>`)}
        </div>
      </div>
    `;
  }
}

customElements.define('key-identify', KeyIdentify);

declare global {
  interface HTMLElementTagNameMap {
    'key-identify': KeyIdentify;
  }
}
