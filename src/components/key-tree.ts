import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TreeNode } from '../lib/key-solver';

/**
 * 识别树可视化：嵌套缩进展示是/否分支，并高亮当前识别路径。
 */
@customElement('key-tree')
export class KeyTree extends LitElement {
  @property({ attribute: false }) tree!: TreeNode;
  @property({ attribute: false }) answers: boolean[] = [];

  static styles = css`
    ul {
      list-style: none;
      margin: 0;
      padding-left: 20px;
      border-left: 1px dashed #cbd5e1;
    }
    ul.tree {
      border-left: none;
      padding-left: 0;
    }
    li {
      margin: 3px 0;
    }
    .q {
      font-weight: 600;
      font-size: 0.92rem;
      border-radius: 6px;
      padding: 1px 6px;
    }
    .split.current > .q {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .branch > .label {
      font-size: 0.78rem;
      color: #94a3b8;
      margin-right: 4px;
    }
    .branch.taken > .label {
      color: #2563eb;
      font-weight: 700;
    }
    .leaf .species {
      color: #166534;
      font-weight: 600;
      font-size: 0.92rem;
      border-radius: 6px;
      padding: 1px 6px;
    }
    .leaf.current .species {
      background: #dcfce7;
    }
    .meta {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 400;
    }
  `;

  render() {
    return html`<ul class="tree">
      ${this.renderNode(this.tree, 0, true)}
    </ul>`;
  }

  private renderNode(node: TreeNode, depth: number, onPath: boolean): TemplateResult {
    const isCurrent = onPath && depth === this.answers.length;
    if (node.kind === 'leaf') {
      return html`<li class="leaf ${isCurrent ? 'current' : ''}">
        <span class="species">${node.species}</span>
      </li>`;
    }
    const answer = this.answers[depth];
    const yesOnPath = onPath && answer === true;
    const noOnPath = onPath && answer === false;
    return html`<li class="split ${isCurrent ? 'current' : ''}">
      <span class="q">${node.character}?</span>
      <span class="meta">${node.count} 个候选 · 至多还需 ${node.worst} 问</span>
      <ul>
        <li class="branch yes ${yesOnPath ? 'taken' : ''}">
          <span class="label">是 →</span>
          <ul>
            ${this.renderNode(node.yes, depth + 1, yesOnPath)}
          </ul>
        </li>
        <li class="branch no ${noOnPath ? 'taken' : ''}">
          <span class="label">否 →</span>
          <ul>
            ${this.renderNode(node.no, depth + 1, noOnPath)}
          </ul>
        </li>
      </ul>
    </li>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'key-tree': KeyTree;
  }
}
