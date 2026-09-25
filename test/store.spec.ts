import { describe, expect, it } from 'vitest';
import { KeyData } from '../src/solver';
import { KeyStore, sampleData } from '../src/store';

function tinyData(): KeyData {
  return {
    species: ['a', 'b', 'c'],
    features: ['f1', 'f2'],
    matrix: [
      [false, false],
      [true, false],
      [true, true],
    ],
  };
}

describe('KeyStore', () => {
  it('solves the sample data on construction', () => {
    const store = new KeyStore();
    expect(store.snapshot.result.status).toBe('OK');
    expect(store.snapshot.answers).toEqual([]);
    expect(store.snapshot.revision).toBe(1);
  });

  it('invalidates the old tree immediately when the matrix is edited', () => {
    const store = new KeyStore(tinyData());
    const before = store.snapshot;
    expect(before.result.status).toBe('OK');

    store.toggleCell(0, 0);

    const after = store.snapshot;
    expect(after.revision).toBe(before.revision + 1);
    expect(after.result).not.toBe(before.result); // no stale tree is exposed
    // a becomes (true,false) == b -> INDISTINGUISHABLE, reported immediately
    expect(after.result.status).toBe('INDISTINGUISHABLE');
    if (after.result.status === 'INDISTINGUISHABLE') {
      expect(after.result.pair).toEqual(['a', 'b']);
    }
  });

  it('clears the in-progress identification on any edit', () => {
    const store = new KeyStore(tinyData());
    store.answer(true);
    store.answer(false);
    expect(store.snapshot.answers.length).toBeGreaterThan(0);

    store.toggleCell(2, 1);
    expect(store.snapshot.answers).toEqual([]);

    store.answer(true);
    store.setSpeciesName(0, 'a2');
    expect(store.snapshot.answers).toEqual([]);
  });

  it('reports INDISTINGUISHABLE instead of fabricating a tree', () => {
    const data = tinyData();
    data.matrix[2] = [true, false]; // c == b
    const store = new KeyStore(data);
    const result = store.snapshot.result;
    expect(result.status).toBe('INDISTINGUISHABLE');
    if (result.status === 'INDISTINGUISHABLE') {
      expect(result.pair).toEqual(['b', 'c']);
    }
    expect(store.currentNode()).toBeNull();
  });

  it('walks to a leaf by answering and supports undo/reset', () => {
    const store = new KeyStore(tinyData());
    // tree: f1? no -> a ; yes -> f2? no -> b, yes -> c
    expect(store.snapshot.result.status).toBe('OK');

    store.answer(true);
    let node = store.currentNode();
    expect(node).toEqual({ kind: 'question', feature: 'f2', yes: { kind: 'leaf', species: 'c' }, no: { kind: 'leaf', species: 'b' } });
    expect(store.askedFeatures()).toEqual(['f1']);
    expect(store.candidates()).toEqual(['b', 'c']);

    store.answer(true);
    node = store.currentNode();
    expect(node).toEqual({ kind: 'leaf', species: 'c' });
    expect(store.candidates()).toEqual(['c']);

    // answering at a leaf is ignored
    store.answer(false);
    expect(store.snapshot.answers).toEqual([true, true]);

    store.undo();
    expect(store.snapshot.answers).toEqual([true]);
    expect(store.currentNode()).toMatchObject({ kind: 'question', feature: 'f2' });

    store.undo();
    expect(store.snapshot.answers).toEqual([]);
    expect(store.currentNode()).toMatchObject({ kind: 'question', feature: 'f1' });

    // undo on empty path is a no-op
    store.undo();
    expect(store.snapshot.answers).toEqual([]);

    store.answer(false);
    expect(store.currentNode()).toEqual({ kind: 'leaf', species: 'a' });
    store.resetPath();
    expect(store.snapshot.answers).toEqual([]);
  });

  it('keeps matrix dimensions in sync when adding/removing rows and columns', () => {
    const store = new KeyStore(tinyData());
    store.addSpecies('d');
    expect(store.snapshot.data.species).toEqual(['a', 'b', 'c', 'd']);
    expect(store.snapshot.data.matrix.length).toBe(4);
    expect(store.snapshot.data.matrix[3]).toEqual([false, false]);

    store.addFeature('f3');
    expect(store.snapshot.data.features).toEqual(['f1', 'f2', 'f3']);
    for (const row of store.snapshot.data.matrix) expect(row.length).toBe(3);

    store.removeFeature(0);
    expect(store.snapshot.data.features).toEqual(['f2', 'f3']);
    for (const row of store.snapshot.data.matrix) expect(row.length).toBe(2);

    store.removeSpecies(0);
    expect(store.snapshot.data.species).toEqual(['b', 'c', 'd']);
    expect(store.snapshot.data.matrix.length).toBe(3);
  });

  it('auto-generates fresh names that do not collide', () => {
    const store = new KeyStore(tinyData());
    store.addSpecies();
    store.addSpecies();
    const names = store.snapshot.data.species;
    expect(new Set(names).size).toBe(names.length);
  });

  it('surfaces validation errors for duplicate names', () => {
    const store = new KeyStore(tinyData());
    store.setSpeciesName(1, 'a');
    const result = store.snapshot.result;
    expect(result.status).toBe('INVALID');
    if (result.status === 'INVALID') {
      expect(result.errors.some((e) => e.startsWith('species-duplicate'))).toBe(true);
    }
  });

  it('notifies subscribers on every mutation', () => {
    const store = new KeyStore(tinyData());
    let calls = 0;
    const unsub = store.subscribe(() => calls++);
    store.toggleCell(0, 1); // a becomes (false,true): still distinguishable
    expect(store.snapshot.result.status).toBe('OK');
    store.answer(true);
    store.undo();
    expect(calls).toBe(3);
    unsub();
    store.toggleCell(0, 1);
    expect(calls).toBe(3);
  });

  it('solves the sample dataset to a known optimum', () => {
    const store = new KeyStore(sampleData());
    const result = store.snapshot.result;
    expect(result.status).toBe('OK');
    if (result.status !== 'OK') return;
    // 6 species need at least ceil(log2 6) = 3 questions in the worst case.
    expect(result.worstDepth).toBe(3);
  });
});
