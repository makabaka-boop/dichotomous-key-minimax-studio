import { describe, expect, it } from 'vitest';
import {
  KeyData,
  KeyNode,
  compareBytes,
  findIndistinguishablePair,
  leafDepths,
  solveKey,
  validateKeyData,
} from '../src/solver';

// ---------------------------------------------------------------------------
// Independent brute-force reference implementation.
//
// Unlike the solver (memoized greedy over subsets), `allTrees` enumerates
// EVERY binary decision tree obtainable by repeatedly splitting the candidate
// set with a truly-splitting feature, and `bestTree` folds them with the
// spec's ordering: worst depth, then total depth, then feature-id byte order
// at the root, then yes-subtree, then no-subtree.
// ---------------------------------------------------------------------------

interface BTree {
  worst: number;
  total: number;
  node: KeyNode;
}

function treeWorst(node: KeyNode): number {
  if (node.kind === 'leaf') return 0;
  return 1 + Math.max(treeWorst(node.yes), treeWorst(node.no));
}

function treeTotal(node: KeyNode): number {
  if (node.kind === 'leaf') return 0;
  return countLeaves(node) + treeTotal(node.yes) + treeTotal(node.no);
}

function countLeaves(node: KeyNode): number {
  if (node.kind === 'leaf') return 1;
  return countLeaves(node.yes) + countLeaves(node.no);
}

function compareNode(a: KeyNode, b: KeyNode): number {
  if (a.kind === 'leaf' && b.kind === 'leaf') return compareBytes(a.species, b.species);
  if (a.kind === 'leaf') return -1;
  if (b.kind === 'leaf') return 1;
  const f = compareBytes(a.feature, b.feature);
  if (f !== 0) return f;
  const y = compareNode(a.yes, b.yes);
  if (y !== 0) return y;
  return compareNode(a.no, b.no);
}

function compareBTree(a: BTree, b: BTree): number {
  if (a.worst !== b.worst) return a.worst - b.worst;
  if (a.total !== b.total) return a.total - b.total;
  return compareNode(a.node, b.node);
}

function makeBTree(node: KeyNode): BTree {
  return { worst: treeWorst(node), total: treeTotal(node), node };
}

/** Enumerates every decision tree for the candidate set `mask`. */
function allTrees(data: KeyData, mask: number): BTree[] {
  const indices: number[] = [];
  for (let i = 0; i < data.species.length; i++) {
    if ((mask & (1 << i)) !== 0) indices.push(i);
  }
  if (indices.length === 1) {
    return [makeBTree({ kind: 'leaf', species: data.species[indices[0]!]! })];
  }
  const out: BTree[] = [];
  for (let j = 0; j < data.features.length; j++) {
    let yes = 0;
    let no = 0;
    for (const i of indices) {
      if (data.matrix[i]![j]!) yes |= 1 << i;
      else no |= 1 << i;
    }
    if (yes === 0 || no === 0) continue;
    for (const ty of allTrees(data, yes)) {
      for (const tn of allTrees(data, no)) {
        out.push(
          makeBTree({
            kind: 'question',
            feature: data.features[j]!,
            yes: ty.node,
            no: tn.node,
          }),
        );
      }
    }
  }
  return out;
}

function bestTree(data: KeyData): BTree {
  const full = (1 << data.species.length) - 1;
  const trees = allTrees(data, full);
  expect(trees.length).toBeGreaterThan(0);
  let best = trees[0]!;
  for (const t of trees) {
    if (compareBTree(t, best) < 0) best = t;
  }
  return best;
}

/** Brute-force minimal colliding pair, computed pair-by-pair. */
function expectedPair(data: KeyData): [string, string] | null {
  let best: [string, string] | null = null;
  const n = data.species.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = data.matrix[i]!;
      const b = data.matrix[j]!;
      if (!a.every((v, k) => v === b[k])) continue;
      const pair: [string, string] = [data.species[i]!, data.species[j]!].sort(
        compareBytes,
      ) as [string, string];
      if (
        best === null ||
        compareBytes(pair[0], best[0]) < 0 ||
        (compareBytes(pair[0], best[0]) === 0 && compareBytes(pair[1], best[1]) < 0)
      ) {
        best = pair;
      }
    }
  }
  return best;
}

function dataFromBits(
  species: string[],
  features: string[],
  bits: number,
): KeyData {
  const rows = species.length;
  const cols = features.length;
  const matrix: boolean[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: boolean[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(((bits >> (i * cols + j)) & 1) === 1);
    }
    matrix.push(row);
  }
  return { species, features, matrix };
}

/** Exhaustively checks every matrix of the given shape against brute force. */
function checkExhaustive(species: string[], features: string[]): void {
  const total = 1 << (species.length * features.length);
  for (let bits = 0; bits < total; bits++) {
    const data = dataFromBits(species, features, bits);
    const result = solveKey(data);
    const pair = expectedPair(data);
    if (pair !== null) {
      expect(result.status).toBe('INDISTINGUISHABLE');
      if (result.status === 'INDISTINGUISHABLE') {
        expect(result.pair).toEqual(pair);
      }
      continue;
    }
    expect(result.status).toBe('OK');
    if (result.status !== 'OK') continue;
    const brute = bestTree(data);
    // worst depth, total depth, and the full tie-broken structure must match.
    expect(result.worstDepth).toBe(brute.worst);
    expect(result.totalDepth).toBe(brute.total);
    expect(result.tree).toEqual(brute.node);
  }
}

// ---------------------------------------------------------------------------

describe('validateKeyData', () => {
  const good: KeyData = {
    species: ['a', 'b', 'c'],
    features: ['f1', 'f2'],
    matrix: [
      [true, false],
      [false, true],
      [true, true],
    ],
  };

  it('accepts well-formed data', () => {
    expect(validateKeyData(good)).toEqual([]);
  });

  it('rejects too few / too many species', () => {
    expect(
      validateKeyData({ ...good, species: ['a', 'b'], matrix: good.matrix.slice(0, 2) }),
    ).toContain('species-count:2');
    const many = Array.from({ length: 17 }, (_, i) => `s${i}`);
    expect(
      validateKeyData({
        ...good,
        species: many,
        matrix: many.map(() => [true, false]),
      }),
    ).toContain('species-count:17');
  });

  it('rejects too few / too many features', () => {
    expect(
      validateKeyData({
        ...good,
        features: ['f1'],
        matrix: good.matrix.map((r) => r.slice(0, 1)),
      }),
    ).toContain('feature-count:1');
  });

  it('rejects duplicate and non-ASCII names', () => {
    expect(
      validateKeyData({ ...good, species: ['a', 'a', 'b'] }).some((e) =>
        e.startsWith('species-duplicate'),
      ),
    ).toBe(true);
    expect(
      validateKeyData({ ...good, features: ['f1', 'f1'] }).some((e) =>
        e.startsWith('feature-duplicate'),
      ),
    ).toBe(true);
    expect(
      validateKeyData({ ...good, species: ['a', 'b', '猫'] }).some((e) =>
        e.startsWith('species-name'),
      ),
    ).toBe(true);
    expect(
      validateKeyData({ ...good, species: ['a', 'b', ''] }).some((e) =>
        e.startsWith('species-name'),
      ),
    ).toBe(true);
  });

  it('rejects incomplete matrices', () => {
    expect(validateKeyData({ ...good, matrix: [] })).toContain('matrix-rows:0');
    expect(
      validateKeyData({
        ...good,
        matrix: [
          [true, false],
          [true],
          [false, false],
        ],
      }),
    ).toContain('matrix-cols:1:1');
    expect(
      validateKeyData({
        ...good,
        matrix: [
          [true, false],
          [true, 1 as unknown as boolean],
          [false, false],
        ],
      }).some((e) => e.startsWith('matrix-value')),
    ).toBe(true);
  });

  it('reports INVALID through solveKey', () => {
    const result = solveKey({ ...good, species: ['a', 'a', 'b'] });
    expect(result.status).toBe('INVALID');
  });
});

describe('INDISTINGUISHABLE', () => {
  it('detects identical vectors and reports the minimal pair', () => {
    const data: KeyData = {
      species: ['delta', 'alpha', 'charlie', 'bravo'],
      features: ['f1', 'f2', 'f3'],
      matrix: [
        [true, false, true], // delta
        [false, true, false], // alpha
        [true, false, true], // charlie == delta
        [false, true, false], // bravo == alpha
      ],
    };
    const result = solveKey(data);
    expect(result.status).toBe('INDISTINGUISHABLE');
    if (result.status === 'INDISTINGUISHABLE') {
      // colliding pairs: (alpha, bravo) and (charlie, delta); byte-minimal wins.
      expect(result.pair).toEqual(['alpha', 'bravo']);
    }
  });

  it('uses byte order, not lexicographic locale order', () => {
    const data: KeyData = {
      species: ['b', 'Z', 'a'],
      features: ['f1', 'f2'],
      matrix: [
        [true, true], // b
        [false, false], // Z
        [true, true], // a == b
      ],
    };
    const result = solveKey(data);
    expect(result.status).toBe('INDISTINGUISHABLE');
    if (result.status === 'INDISTINGUISHABLE') {
      expect(result.pair).toEqual(['a', 'b']);
    }
  });

  it('picks the two smallest names inside a larger collision group', () => {
    const data: KeyData = {
      species: ['c', 'b', 'a', 'z'],
      features: ['f1', 'f2'],
      matrix: [
        [true, false], // c
        [true, false], // b
        [true, false], // a
        [false, true], // z
      ],
    };
    expect(findIndistinguishablePair(data)).toEqual(['a', 'b']);
  });

  it('agrees with pair-by-pair brute force on all 3x3 matrices', () => {
    const species = ['c', 'a', 'b'];
    const features = ['f2', 'f0', 'f1'];
    for (let bits = 0; bits < (1 << 9); bits++) {
      const data = dataFromBits(species, features, bits);
      expect(findIndistinguishablePair(data)).toEqual(expectedPair(data));
    }
  });
});

describe('solver structure', () => {
  it('asks zero questions only at leaves and reports depths', () => {
    const data: KeyData = {
      species: ['a', 'b', 'c', 'd'],
      features: ['f1', 'f2'],
      matrix: [
        [false, false],
        [false, true],
        [true, false],
        [true, true],
      ],
    };
    const result = solveKey(data);
    expect(result.status).toBe('OK');
    if (result.status !== 'OK') return;
    expect(result.worstDepth).toBe(2);
    expect(result.totalDepth).toBe(8);
    const depths = leafDepths(result.tree);
    expect([...depths.values()].sort()).toEqual([2, 2, 2, 2]);
  });

  it('prefers the balanced split over an unbalanced one', () => {
    // f1 and f3 split 2|2 (worst 2), f2 splits 1|3 (worst 3): f2 must lose;
    // f1 and f3 tie on (worst, total) and f1 wins by byte order — despite
    // being listed last.
    const data: KeyData = {
      species: ['a', 'b', 'c', 'd'],
      features: ['f3', 'f2', 'f1'],
      matrix: [
        // f3    f2    f1
        [false, true, false], // a
        [true, false, false], // b
        [false, false, true], // c
        [true, false, true], // d
      ],
    };
    const result = solveKey(data);
    expect(result.status).toBe('OK');
    if (result.status !== 'OK') return;
    expect(result.worstDepth).toBe(2);
    expect(result.totalDepth).toBe(8);
    expect(result.tree.kind).toBe('question');
    if (result.tree.kind === 'question') expect(result.tree.feature).toBe('f1');
  });

  it('breaks worst-depth ties by total path length', () => {
    // f1, f2, g1, g2 all achieve worst depth 3 at the root, but f1's total
    // is 13 while the others achieve 12, so f1 must lose the tie-break.
    const data: KeyData = {
      species: ['a', 'b', 'c', 'd', 'e'],
      features: ['f1', 'f2', 'g1', 'g2'],
      matrix: [
        // f1    f2    g1    g2
        [false, false, false, false], // a
        [true, true, false, false], // b
        [true, true, true, false], // c
        [true, true, true, true], // d
        [true, false, true, true], // e
      ],
    };
    const result = solveKey(data);
    expect(result.status).toBe('OK');
    if (result.status !== 'OK') return;
    const brute = bestTree(data);
    expect(result.worstDepth).toBe(brute.worst);
    expect(result.totalDepth).toBe(brute.total);
    expect(result.tree).toEqual(brute.node);
  });

  it('breaks full ties by feature id byte order, not input order', () => {
    // 'b' and 'a' split identically; 'a' must be chosen although listed last.
    const data: KeyData = {
      species: ['x', 'y', 'z'],
      features: ['b', 'a'],
      matrix: [
        [false, false],
        [true, true],
        [true, true],
      ],
    };
    // y and z collide -> adjust so all rows are distinct with a third feature
    const data2: KeyData = {
      species: ['x', 'y', 'z'],
      features: ['b', 'a', 'c'],
      matrix: [
        [false, false, false],
        [true, true, false],
        [true, true, true],
      ],
    };
    const r1 = solveKey(data);
    expect(r1.status).toBe('INDISTINGUISHABLE');
    const r2 = solveKey(data2);
    expect(r2.status).toBe('OK');
    if (r2.status !== 'OK') return;
    expect(r2.tree.kind).toBe('question');
    if (r2.tree.kind === 'question') {
      // 'a' and 'b' both split {x}|{y,z} with equal subtrees; byte-min wins.
      expect(r2.tree.feature).toBe('a');
    }
  });

  it('is deterministic across runs', () => {
    const data: KeyData = {
      species: ['s1', 's2', 's3', 's4', 's5', 's6'],
      features: ['f1', 'f2', 'f3', 'f4'],
      matrix: [
        [false, false, false, false],
        [false, false, true, true],
        [false, true, false, true],
        [true, false, true, false],
        [true, true, false, false],
        [true, true, true, true],
      ],
    };
    expect(solveKey(data)).toEqual(solveKey(data));
  });
});

describe('exhaustive differential check (all matrices, all trees)', () => {
  it('3 species x 2 features', () => {
    checkExhaustive(['c', 'a', 'b'], ['f1', 'f0']);
  });

  it('3 species x 3 features', () => {
    checkExhaustive(['c', 'a', 'b'], ['f2', 'f0', 'f1']);
  });

  it('4 species x 2 features', () => {
    checkExhaustive(['d', 'a', 'c', 'b'], ['f1', 'f0']);
  });

  it('4 species x 3 features', () => {
    checkExhaustive(['d', 'a', 'c', 'b'], ['f2', 'f0', 'f1']);
  });

  it('4 species x 4 features', () => {
    checkExhaustive(['d', 'a', 'c', 'b'], ['f3', 'f1', 'f0', 'f2']);
  });

  it('5 species x 2 features', () => {
    checkExhaustive(['e', 'a', 'd', 'b', 'c'], ['f1', 'f0']);
  });

  it('5 species x 3 features', () => {
    checkExhaustive(['e', 'a', 'd', 'b', 'c'], ['f2', 'f0', 'f1']);
  });
});

// ---------------------------------------------------------------------------
// Randomized larger matrices: structural validity + optimality of metrics +
// per-node tie-break, checked against an independently written DP.
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomData(rand: () => number, n: number, m: number): KeyData {
  if (2 ** m < n) throw new Error(`cannot build ${n} distinct rows from ${m} features`);
  const species = Array.from({ length: n }, (_, i) => `sp${i}`);
  const features = Array.from({ length: m }, (_, j) => `f${j}`).reverse();
  const seen = new Set<string>();
  const matrix: boolean[][] = [];
  for (let i = 0; i < n; i++) {
    let row: boolean[] = [];
    let key = '';
    do {
      row = Array.from({ length: m }, () => rand() < 0.5);
      key = row.map(Number).join('');
    } while (seen.has(key));
    seen.add(key);
    matrix.push(row);
  }
  return { species, features, matrix };
}

/** Independent memoized DP over subsets for optimal (worst, total). */
function optimalMetrics(data: KeyData): (mask: number) => { worst: number; total: number } {
  const memo = new Map<number, { worst: number; total: number }>();
  const solve = (mask: number): { worst: number; total: number } => {
    const hit = memo.get(mask);
    if (hit) return hit;
    const idx: number[] = [];
    for (let i = 0; i < data.species.length; i++) {
      if ((mask & (1 << i)) !== 0) idx.push(i);
    }
    let best = { worst: 0, total: 0 };
    if (idx.length > 1) {
      best = { worst: Infinity, total: Infinity };
      for (let j = 0; j < data.features.length; j++) {
        let yes = 0;
        let no = 0;
        for (const i of idx) {
          if (data.matrix[i]![j]!) yes |= 1 << i;
          else no |= 1 << i;
        }
        if (yes === 0 || no === 0) continue;
        const ry = solve(yes);
        const rn = solve(no);
        const worst = 1 + Math.max(ry.worst, rn.worst);
        const total = idx.length + ry.total + rn.total;
        if (worst < best.worst || (worst === best.worst && total < best.total)) {
          best = { worst, total };
        }
      }
    }
    memo.set(mask, best);
    return best;
  };
  return solve;
}

function checkNodeLocal(
  data: KeyData,
  node: KeyNode,
  mask: number,
  opt: (mask: number) => { worst: number; total: number },
  pathFeatures: Set<string>,
): void {
  if (node.kind === 'leaf') {
    expect(mask & (mask - 1)).toBe(0); // exactly one species remains
    return;
  }
  // No feature repeats along a root-to-leaf path.
  expect(pathFeatures.has(node.feature)).toBe(false);
  const nextPath = new Set(pathFeatures);
  nextPath.add(node.feature);

  let yes = 0;
  let no = 0;
  for (let i = 0; i < data.species.length; i++) {
    if ((mask & (1 << i)) === 0) continue;
    const j = data.features.indexOf(node.feature);
    if (data.matrix[i]![j]!) yes |= 1 << i;
    else no |= 1 << i;
  }
  // The chosen feature truly splits the candidate set.
  expect(yes).not.toBe(0);
  expect(no).not.toBe(0);

  // The chosen feature is optimal and byte-minimal among ties.
  const chosen = {
    worst: 1 + Math.max(opt(yes).worst, opt(no).worst),
    total: countMask(mask) + opt(yes).total + opt(no).total,
  };
  for (let j = 0; j < data.features.length; j++) {
    let gy = 0;
    let gn = 0;
    for (let i = 0; i < data.species.length; i++) {
      if ((mask & (1 << i)) === 0) continue;
      if (data.matrix[i]![j]!) gy |= 1 << i;
      else gn |= 1 << i;
    }
    if (gy === 0 || gn === 0) continue;
    const cand = {
      worst: 1 + Math.max(opt(gy).worst, opt(gn).worst),
      total: countMask(mask) + opt(gy).total + opt(gn).total,
    };
    const better =
      cand.worst < chosen.worst ||
      (cand.worst === chosen.worst && cand.total < chosen.total);
    expect(better).toBe(false);
    if (cand.worst === chosen.worst && cand.total === chosen.total) {
      expect(compareBytes(node.feature, data.features[j]!)).toBeLessThanOrEqual(0);
    }
  }

  checkNodeLocal(data, node.yes, yes, opt, nextPath);
  checkNodeLocal(data, node.no, no, opt, nextPath);
}

function countMask(mask: number): number {
  let c = 0;
  while (mask !== 0) {
    mask &= mask - 1;
    c++;
  }
  return c;
}

describe('randomized larger matrices', () => {
  it('validates structure, metrics and tie order', () => {
    const rand = mulberry32(20260925);
    for (let trial = 0; trial < 150; trial++) {
      const n = 3 + Math.floor(rand() * 14); // 3..16
      const minM = Math.max(2, Math.ceil(Math.log2(n))); // need 2^m >= n vectors
      const m = minM + Math.floor(rand() * (17 - minM)); // minM..16
      const data = randomData(rand, n, m);
      const result = solveKey(data);
      expect(result.status).toBe('OK');
      if (result.status !== 'OK') continue;

      // Metrics reported match the actual tree.
      expect(treeWorst(result.tree)).toBe(result.worstDepth);
      expect(treeTotal(result.tree)).toBe(result.totalDepth);

      // Metrics are optimal (independent DP).
      const opt = optimalMetrics(data);
      const full = (1 << n) - 1;
      expect(result.worstDepth).toBe(opt(full).worst);
      expect(result.totalDepth).toBe(opt(full).total);

      // Leaves cover exactly the species set.
      const leaves = [...leafDepths(result.tree).keys()].sort(compareBytes);
      expect(leaves).toEqual([...data.species].sort(compareBytes));

      // Every node makes a locally optimal, byte-minimal choice.
      checkNodeLocal(data, result.tree, full, opt, new Set());
    }
  });
});
