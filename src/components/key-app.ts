import { LitElement, css, html } from 'lit';
import { KeyStore } from '../store';
import './key-editor';
import './key-identify';
import './key-tree-view';

type Route = 'home' | 'key';

function routeFromHash(hash: string): Route {
  return hash.replace(/^#\/?/, '').startsWith('key') ? 'key' : 'home';
}

/** 应用外壳：hash 路由，key 页面承载检索表编辑器。 */
export class KeyApp extends LitElement {
  static override properties = {
    route: { state: true },
  };

  static override styles = css`
    :host {
      display: block;
      max-width: 1080px;
      margin: 0 auto;
      padding: 1.5rem 1rem 4rem;
    }
    header {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 0.8rem;
      margin-bottom: 1.2rem;
    }
    h1 {
      font-size: 1.3rem;
      margin: 0;
      color: #e2e8f0;
    }
    nav a {
      color: #7dd3fc;
      text-decoration: none;
      margin-right: 0.8rem;
    }
    nav a.active {
      text-decoration: underline;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 900px) {
      .layout {
        grid-template-columns: 3fr 2fr;
      }
    }
    .col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 0.8rem;
      padding: 1rem;
    }
    .hero p {
      color: #94a3b8;
      line-height: 1.7;
    }
    .hero code {
      color: #fbbf24;
    }
  `;

  private store = new KeyStore();
  private route: Route = routeFromHash(window.location.hash);

  private readonly onHashChange = () => {
    this.route = routeFromHash(window.location.hash);
  };

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('hashchange', this.onHashChange);
  }

  override disconnectedCallback(): void {
    window.removeEventListener('hashchange', this.onHashChange);
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <header>
        <h1>二歧检索表 · Minimax Studio</h1>
        <nav>
          <a class=${this.route === 'home' ? 'active' : ''} href="#/">首页</a>
          <a class=${this.route === 'key' ? 'active' : ''} href="#/key">检索表编辑器</a>
        </nav>
      </header>
      ${this.route === 'key' ? this.renderKeyPage() : this.renderHome()}
    `;
  }

  private renderHome() {
    return html`
      <div class="card hero">
        <p>
          交互式二歧检索表编辑器。输入 3–16 个唯一 ASCII 物种、2–16 个唯一 ASCII
          二值特征以及完整的物种×特征矩阵，求解器会为当前候选集合选择真正能分裂它的特征，
          生成<strong>最坏提问数最小</strong>的决策树；并列时依次按所有物种路径长度之和、
          特征 id 字节序裁决。
        </p>
        <p>
          若两个物种的特征向量完全相同，则返回 <code>INDISTINGUISHABLE</code>
          及字节序最小的物种对，绝不伪造识别树。编辑矩阵后旧树立即失效；
          识别面板支持沿是/否分支下行并随时回溯。
        </p>
        <p><a href="#/key">进入检索表编辑器 →</a></p>
      </div>
    `;
  }

  private renderKeyPage() {
    return html`
      <div class="layout">
        <div class="col card"><key-editor .store=${this.store}></key-editor></div>
        <div class="col">
          <div class="card"><key-identify .store=${this.store}></key-identify></div>
          <div class="card"><key-tree-view .store=${this.store}></key-tree-view></div>
        </div>
      </div>
    `;
  }
}

customElements.define('key-app', KeyApp);

declare global {
  interface HTMLElementTagNameMap {
    'key-app': KeyApp;
  }
}
