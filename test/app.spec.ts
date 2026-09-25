// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import '../src/components/key-app';
import '../src/components/key-editor';
import '../src/components/key-identify';
import '../src/components/key-tree-view';
import type { KeyApp } from '../src/components/key-app';
import type { KeyEditor } from '../src/components/key-editor';
import type { KeyIdentify } from '../src/components/key-identify';
import type { KeyTreeView } from '../src/components/key-tree-view';
import { KeyStore } from '../src/store';

async function mount<T extends HTMLElement>(tag: string): Promise<T> {
  const el = document.createElement(tag) as T;
  document.body.appendChild(el);
  await (el as unknown as { updateComplete: Promise<boolean> }).updateComplete;
  return el;
}

function text(el: Element | null | undefined): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('key-app routing', () => {
  it('renders the home page by default and the key page on #/key', async () => {
    window.location.hash = '';
    const app = await mount<KeyApp>('key-app');
    expect(app.shadowRoot!.textContent).toContain('进入检索表编辑器');
    expect(app.shadowRoot!.querySelector('key-editor')).toBeNull();

    window.location.hash = '#/key';
    window.dispatchEvent(new Event('hashchange'));
    await app.updateComplete;

    expect(app.shadowRoot!.querySelector('key-editor')).not.toBeNull();
    expect(app.shadowRoot!.querySelector('key-identify')).not.toBeNull();
    expect(app.shadowRoot!.querySelector('key-tree-view')).not.toBeNull();
  });
});

describe('key-editor', () => {
  it('shows OK metrics for the sample data and invalidates on cell toggle', async () => {
    const store = new KeyStore();
    const el = await mount<KeyEditor>('key-editor');
    (el as unknown as { store: KeyStore }).store = store;
    await el.updateComplete;

    const status = () => el.shadowRoot!.querySelector('.status')!;
    expect(status().classList.contains('ok')).toBe(true);
    expect(text(status())).toContain('最坏提问数');

    // Toggle a cell through the DOM: bee.flying 1 -> 0 makes bee == fox.
    const beeRow = el.shadowRoot!.querySelectorAll('tbody tr')[1]!;
    const cell = beeRow.querySelectorAll('button.cell')[0] as HTMLButtonElement;
    cell.click();
    await el.updateComplete;

    expect(store.snapshot.result.status).toBe('INDISTINGUISHABLE');
    expect(status().classList.contains('warn')).toBe(true);
    expect(text(status())).toContain('INDISTINGUISHABLE');
    expect(text(status())).toContain('bee');
    expect(text(status())).toContain('fox');
  });

  it('lists validation errors for duplicate species names', async () => {
    const store = new KeyStore();
    const el = await mount<KeyEditor>('key-editor');
    (el as unknown as { store: KeyStore }).store = store;
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector('.chip input') as HTMLInputElement;
    input.value = 'bee';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;

    expect(text(el.shadowRoot!.querySelector('.status.bad'))).toContain('重复');
  });
});

describe('key-identify', () => {
  it('walks questions, identifies a species, and backtracks', async () => {
    const store = new KeyStore();
    const el = await mount<KeyIdentify>('key-identify');
    (el as unknown as { store: KeyStore }).store = store;
    await el.updateComplete;

    const question = () => el.shadowRoot!.querySelector('.question');
    const clickButton = async (label: string) => {
      const btn = [...el.shadowRoot!.querySelectorAll('button')].find((b) =>
        b.textContent!.includes(label),
      ) as HTMLButtonElement;
      btn.click();
      await el.updateComplete;
    };

    expect(store.snapshot.answers).toEqual([]);
    const firstFeature = text(question());

    // Answer 是 down to a leaf.
    while (question()) {
      await clickButton('是');
    }
    expect(el.shadowRoot!.querySelector('.leaf')).not.toBeNull();
    expect(store.snapshot.answers.length).toBeGreaterThan(0);
    expect(store.candidates().length).toBe(1);

    // Backtrack all the way: the first question returns.
    await clickButton('重来');
    expect(store.snapshot.answers).toEqual([]);
    expect(text(question())).toBe(firstFeature);

    // 否 branch also advances.
    await clickButton('否');
    expect(store.snapshot.answers).toEqual([false]);
    await clickButton('← 回溯');
    expect(store.snapshot.answers).toEqual([]);
  });

  it('refuses to identify while species are indistinguishable', async () => {
    const store = new KeyStore();
    store.setCell(1, 0, false); // bee == fox
    const el = await mount<KeyIdentify>('key-identify');
    (el as unknown as { store: KeyStore }).store = store;
    await el.updateComplete;
    expect(text(el.shadowRoot!.querySelector('.warn'))).toContain('无法区分');
  });
});

describe('key-tree-view', () => {
  it('renders the tree and highlights the answered path', async () => {
    const store = new KeyStore();
    const el = await mount<KeyTreeView>('key-tree-view');
    (el as unknown as { store: KeyStore }).store = store;
    await el.updateComplete;

    expect(el.shadowRoot!.querySelectorAll('.q').length).toBeGreaterThan(0);
    expect(el.shadowRoot!.querySelector('.node.current')).not.toBeNull();

    store.answer(true);
    await el.updateComplete;
    // The highlight moved one question deeper.
    const currents = el.shadowRoot!.querySelectorAll('.node.current');
    expect(currents.length).toBe(1);

    store.setCell(1, 0, false); // collision -> tree gone
    await el.updateComplete;
    expect(text(el.shadowRoot!.querySelector('.empty'))).toContain('未生成');
  });
});
