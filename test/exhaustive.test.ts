import { describe, expect, it } from 'vitest';
import {
  compareBytes,
  solveKey,
  type KeyInput,
  type TreeNode,
} from '../src/lib/key-solver';

/**
 * 对拍测试：对小矩阵穷举所有合法决策树，独立算出
 *   1. 最小最坏深度；
 *   2. 并列中的最小总深度；
 *   3. 再按（根特征字节序, yes 子树, no 子树）字典序取最小树；
 * 与求解器输出逐一比对。
 */

interface BruteNode {
  character?: string;
  yes?: BruteNode;
  no?: BruteNode;
  species?: string;
}

/** 穷举候选集 set 上的所有决策树（只使用能真正分裂的特征）。 */
function enumerateTrees(set: string[], chars: string[], vec: Map<string, string>): BruteNode[] {
  if (set.length === 1) return [{ species: set[0] }];
  const out: BruteNode[] = [];
  for (let j = 0; j < chars.length; j++) {
    const yes = set.filter((s) => vec.get(s)![j] === '1');
    const no = set.filter((s) => vec.get(s)![j] === '0');
    if (yes.length === 0 || no.length === 0) continue;
    const yesTrees = enumerateTrees(yes, chars, vec);
    const noTrees = enumerateTrees(no, chars, vec);
    for (const y of yesTrees) {
      for (const n of noTrees) {
        out.push({ character: chars[j], yes: y, no: n });
      }
    }
  }
  return out;
}

const worstOf = (t: BruteNode): number =>
  t.species !== undefined ? 0 : 1 + Math.max(worstOf(t.yes!), worstOf(t.no!));

const countOf = (t: BruteNode): number =>
  t.species !== undefined ? 1 : countOf(t.yes!) + countOf(t.no!);

const totalOf = (t: BruteNode): number =>
  t.species !== undefined ? 0 : totalOf(t.yes!) + totalOf(t.no!) + countOf(t);

/** 树字典序：先根特征字节序，再 yes 子树，再 no 子树（同候选集 ⇒ 同叶子/分裂形态）。 */
function compareTrees(a: BruteNode, b: BruteNode): number {
  if (a.species !== undefined || b.species !== undefined) return 0;
  const c = compareBytes(a.character!, b.character!);
  if (c !== 0) return c;
  const y = compareTrees(a.yes!, b.yes!);
  return y !== 0 ? y : compareTrees(a.no!, b.no!);
}

/** 独立暴力求解：返回 (最小最坏深度, 并列最小总深度, 字典序最小最优树)。 */
function bruteForce(input: KeyInput): { worst: number; total: number; tree: BruteNode } {
  const vec = new Map(
    input.species.map((s, i) => [s, input.matrix[i].map((v) => (v ? '1' : '0')).join('')]),
  );
  const all = enumerateTrees(input.species, input.characters, vec);
  let bestWorst = Infinity;
  let bestTotal = Infinity;
  for (const t of all) {
    const w = worstOf(t);
    const tot = totalOf(t);
    if (w < bestWorst || (w === bestWorst && tot < bestTotal)) {
      bestWorst = w;
      bestTotal = tot;
    }
  }
  let best: BruteNode | null = null;
  for (const t of all) {
    if (worstOf(t) !== bestWorst || totalOf(t) !== bestTotal) continue;
    if (best === null || compareTrees(t, best) < 0) best = t;
  }
  return { worst: bestWorst, total: bestTotal, tree: best! };
}

/** 独立暴力求字节序最小重复对：收集全部重复对后排序取首。 */
function brutePair(input: KeyInput): [string, string] | null {
  const pairs: [string, string][] = [];
  for (let i = 0; i < input.species.length; i++) {
    for (let j = i + 1; j < input.species.length; j++) {
      const vi = input.matrix[i].map((v) => (v ? '1' : '0')).join('');
      const vj = input.matrix[j].map((v) => (v ? '1' : '0')).join('');
      if (vi === vj) {
        const p: [string, string] = [input.species[i], input.species[j]];
        if (compareBytes(p[0], p[1]) > 0) p.reverse();
        pairs.push(p);
      }
    }
  }
  pairs.sort((p, q) => compareBytes(p[0], q[0]) || compareBytes(p[1], q[1]));
  return pairs.length > 0 ? pairs[0] : null;
}

const strip = (node: TreeNode): BruteNode =>
  node.kind === 'leaf'
    ? { species: node.species }
    : { character: node.character, yes: strip(node.yes), no: strip(node.no) };

/** 校验求解器输出的树满足结构不变量。 */
function checkInvariants(tree: TreeNode, input: KeyInput) {
  const leaves: string[] = [];
  const visit = (node: TreeNode, candidates: string[]) => {
    expect(node.count).toBe(candidates.length);
    if (node.kind === 'leaf') {
      expect(candidates).toEqual([node.species]);
      expect(node.worst).toBe(0);
      expect(node.total).toBe(0);
      leaves.push(node.species);
      return;
    }
    const j = input.characters.indexOf(node.character);
    expect(j).toBeGreaterThanOrEqual(0);
    const yes = candidates.filter((s) => input.matrix[input.species.indexOf(s)][j]);
    const no = candidates.filter((s) => !input.matrix[input.species.indexOf(s)][j]);
    // 每个内部节点都必须真正分裂当前候选集
    expect(yes.length).toBeGreaterThan(0);
    expect(no.length).toBeGreaterThan(0);
    expect(yes.length + no.length).toBe(candidates.length);
    visit(node.yes, yes);
    visit(node.no, no);
    expect(node.worst).toBe(1 + Math.max(node.yes.worst, node.no.worst));
    expect(node.total).toBe(node.yes.total + node.no.total + node.count);
  };
  visit(tree, [...input.species]);
  expect([...leaves].sort()).toEqual([...input.species].sort());
}

function checkCase(input: KeyInput) {
  const result = solveKey(input);
  const pair = brutePair(input);
  if (pair !== null) {
    expect(result.status).toBe('indistinguishable');
    if (result.status === 'indistinguishable') expect(result.pair).toEqual(pair);
    return;
  }
  if (result.status !== 'ok') throw new Error(`expected ok, got ${result.status}`);
  const brute = bruteForce(input);
  expect(result.worst).toBe(brute.worst);
  expect(result.total).toBe(brute.total);
  expect(strip(result.tree)).toEqual(brute.tree);
  checkInvariants(result.tree, input);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('对拍：穷举全部小矩阵', () => {
  it('3 物种 × 2 特征：全部 64 个矩阵', () => {
    for (let bits = 0; bits < 1 << 6; bits++) {
      const matrix = [0, 1, 2].map((i) => [0, 1].map((j) => !!((bits >> (i * 2 + j)) & 1)));
      checkCase({ species: ['a', 'b', 'c'], characters: ['x', 'y'], matrix });
    }
  });

  it('4 物种 × 3 特征：全部 4096 个矩阵', () => {
    for (let bits = 0; bits < 1 << 12; bits++) {
      const matrix = [0, 1, 2, 3].map((i) => [0, 1, 2].map((j) => !!((bits >> (i * 3 + j)) & 1)));
      checkCase({ species: ['a', 'b', 'c', 'd'], characters: ['x', 'y', 'z'], matrix });
    }
  });
});

describe('对拍：随机小矩阵', () => {
  it('300 个随机矩阵（3–6 物种 × 2–4 特征，含随机 id 顺序）', () => {
    const rand = mulberry32(20260925);
    for (let k = 0; k < 300; k++) {
      const n = 3 + Math.floor(rand() * 4); // 3..6
      const m = 2 + Math.floor(rand() * 3); // 2..4
      // 随机 id（乱序，验证字节序裁决与输入顺序无关）
      const species = Array.from({ length: n }, (_, i) => `s${i}`);
      const characters = Array.from({ length: m }, (_, j) => `c${j}`);
      for (let i = species.length - 1; i > 0; i--) {
        const r = Math.floor(rand() * (i + 1));
        [species[i], species[r]] = [species[r], species[i]];
      }
      const matrix = species.map(() => characters.map(() => rand() < 0.5));
      checkCase({ species, characters, matrix });
    }
  });
});
