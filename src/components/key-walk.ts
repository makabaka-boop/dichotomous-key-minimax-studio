import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { resolveWalk, type TreeNode } from '../lib/key-solver';

/**
 * 交互识别：从根开始逐问回答是/否，可随时撤销、回溯到任意一问或重新开始。
 */
@customElement('key-walk')
export class KeyWalk extends LitElement {
  @property({ attribute: false }) tree!: TreeNode;
  @property({ attribute: false }) answers: boolean[] = [];

  static styles = css`
    .walk {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      background: #f8fafc;
    }
    .history {
      margin: 0 0 10px;
      padding-left: 22px;
      font-size: 0.88rem;
    }
    .history li {
      margin: 3px 0;
    }
    .history .a {
      font-weight: 700;
      margin: 0 4px;
    }
    .a.yes {
      color: #166534;
    }
    .a.no {
      color: #b91c1c;
    }
    .back {
      border: none;
      background: none;
      color: #94a3b8;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0 4px;
    }
    .back:hover {
      color: #2563eb;
      text-decoration: underline;
    }
    .question {
      margin: 4px 0 10px;
      font-size: 1.02rem;
    }
    .choices {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .choices button {
      font: inherit;
      font-weight: 600;
      padding: 6px 26px;
      border-radius: 8px;
      border: 1px solid;
      cursor: pointer;
    }
    .choices .yes {
      background: #dcfce7;
      border-color: #86efac;
      color: #166534;
    }
    .choices .no {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
    }
    .conclusion {
      margin: 4px 0 10px;
      font-size: 1.05rem;
    }
    .conclusion strong {
      color: #166534;
      font-size: 1.2rem;
    }
    .controls {
      display: flex;
      gap: 8px;
    }
    .controls button {
      font: inherit;
      font-size: 0.8rem;
      border: 1px solid #cbd5e1;
      background: #fff;
      border-radius: 6px;
      padding: 3px 10px;
      color: #475569;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.35;
      cursor: default;
    }
  `;

  private setAnswers(answers: boolean[]) {
    this.dispatchEvent(
      new CustomEvent<boolean[]>('answers-change', {
        detail: answers,
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const { steps, current } = resolveWalk(this.tree, this.answers);
    return html`
      <div class="walk">
        ${steps.length > 0
          ? html`<ol class="history">
              ${steps.map(
                (st, idx) => html`<li>
                  <span class="q">${st.character}?</span> →
                  <span class="a ${st.answer ? 'yes' : 'no'}">${st.answer ? '是' : '否'}</span>
                  <button
                    class="back"
                    title="回溯到这一问之前"
                    @click=${() => this.setAnswers(this.answers.slice(0, idx))}
                  >
                    ↩ 回溯
                  </button>
                </li>`,
              )}
            </ol>`
          : null}
        ${current.kind === 'leaf'
          ? html`<p class="conclusion">识别结果：<strong>${current.species}</strong></p>`
          : html`<p class="question">
                第 ${steps.length + 1} 问：<strong>${current.character}</strong>？
              </p>
              <div class="choices">
                <button class="yes" @click=${() => this.setAnswers([...this.answers, true])}>
                  是
                </button>
                <button class="no" @click=${() => this.setAnswers([...this.answers, false])}>
                  否
                </button>
              </div>`}
        <div class="controls">
          <button
            ?disabled=${this.answers.length === 0}
            @click=${() => this.setAnswers(this.answers.slice(0, -1))}
          >
            撤销上一答
          </button>
          <button ?disabled=${this.answers.length === 0} @click=${() => this.setAnswers([])}>
            重新开始
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'key-walk': KeyWalk;
  }
}
