import { css, html } from 'lit';
import type { KeyNode } from '../solver';
import { StoreElement } from './store-element';

/** 决策树可视化：嵌套列表渲染，并高亮当前识别路径。 */
export class KeyTreeView extends StoreElement {
  static override styles = css`
    :host {
      display: block;
    }
    h2 {
      font-size: 1rem;
      margin: 0 0 0.5rem;
      color: #7dd3fc;
    }
    .tree {
      font-family: ui-monospace, monospace;
      font-size: 0.9rem;
      overflow-x: auto;
      padding: 0.6rem;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 0.6rem;
    }
    ul {
      list-style: none;
      margin: 0;
      padding-left: 1.4rem;
    }
    .node {
      display: inline-block;
      padding: 0.1rem 0.3rem;
      border-radius: 0.3rem;
      white-space: nowrap;
    }
    .node.current {
      background: #1e3a8a;
      color: #bfdbfe;
    }
    .q {
      color: #fbbf24;
    }
    .branch {
      color: #64748b;
    }
    .branch.yes {
      color: #4ade80;
    }
    .branch.no {
      color: #f87171;
    }
    .leaf {
      color: #86efac;
    }
    .empty {
      color: #64748b;
    }
  `;

  override render() {
    if (!this.store) return html``;
    const snap = this.store.snapshot;
    if (snap.result.status !== 'OK') {
      return html`<h2>决策树</h2>
        <div class="tree"><span class="empty">（无可视化：决策树未生成）</span></div>`;
    }
    return html`
      <h2>决策树</h2>
      <div class="tree">${this.renderNode(snap.result.tree, 0, true)}</div>
    `;
  }

  private renderNode(node: KeyNode, depth: number, onPath: boolean): unknown {
    const answers = this.store.snapshot.answers;
    const isCurrent = onPath && answers.length === depth;
    if (node.kind === 'leaf') {
      return html`<div class="node leaf ${isCurrent ? 'current' : ''}">→ ${node.species}</div>`;
    }
    const taken = onPath && depth < answers.length ? answers[depth] : undefined;
    return html`
      <div class="node ${isCurrent ? 'current' : ''}">
        <span class="q">? ${node.feature}</span>
      </div>
      <ul>
        <li>
          <span class="branch yes">是 ─</span>
          ${this.renderNode(node.yes, depth + 1, taken === true)}
        </li>
        <li>
          <span class="branch no">否 ─</span>
          ${this.renderNode(node.no, depth + 1, taken === false)}
        </li>
      </ul>
    `;
  }
}

customElements.define('key-tree-view', KeyTreeView);

declare global {
  interface HTMLElementTagNameMap {
    'key-tree-view': KeyTreeView;
  }
}
