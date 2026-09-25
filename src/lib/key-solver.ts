/**
 * 二歧检索表求解器。
 *
 * 输入 3–16 个唯一 ASCII 物种、2–16 个唯一 ASCII 二值特征与完整的物种×特征矩阵。
 * 若存在重复特征向量，返回 INDISTINGUISHABLE 与字节序最小的物种对，不伪造识别树；
 * 否则生成最小化最坏提问数的决策树，并列时先最小化所有物种路径长度之和，
 * 再按特征 id 字节序裁决（在每个节点局部取最小特征，等价于整树字典序最小）。
 */

export interface KeyInput {
  species: string[];
  characters: string[];
  /** matrix[i][j] 表示物种 i 是否具有特征 j。 */
  matrix: boolean[][];
}

export const MIN_SPECIES = 3;
export const MAX_SPECIES = 16;
export const MIN_CHARACTERS = 2;
export const MAX_CHARACTERS = 16;

export type TreeNode = LeafNode | SplitNode;

export interface LeafNode {
  kind: 'leaf';
  species: string;
  /** 该子树覆盖的物种数。 */
  count: number;
  /** 从该节点出发还需的最坏提问数。 */
  worst: number;
  /** 该子树内所有物种的相对路径长度之和。 */
  total: number;
}

export interface SplitNode {
  kind: 'split';
  character: string;
  /** 具有该特征（回答"是"）的分支。 */
  yes: TreeNode;
  /** 不具有该特征（回答"否"）的分支。 */
  no: TreeNode;
  count: number;
  worst: number;
  total: number;
}

export type SolveResult =
  | { status: 'ok'; tree: TreeNode; worst: number; total: number }
  | { status: 'indistinguishable'; pair: [string, string] }
  | { status: 'invalid'; errors: string[] };

/** 按字节序（逐码元）比较两个 ASCII 字符串。 */
export function compareBytes(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = a.charCodeAt(i) - b.charCodeAt(i);
    if (d !== 0) return d;
  }
  return a.length - b.length;
}

/** 非空且全部为可打印 ASCII（0x20–0x7E）。 */
function isAsciiId(id: string): boolean {
  if (id.length === 0) return false;
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    if (c < 0x20 || c > 0x7e) return false;
  }
  return true;
}

export function validateKeyInput(input: KeyInput): string[] {
  const errors: string[] = [];
  const { species, characters, matrix } = input;

  if (species.length < MIN_SPECIES || species.length > MAX_SPECIES) {
    errors.push(`物种数量须为 ${MIN_SPECIES}–${MAX_SPECIES}，当前为 ${species.length}`);
  }
  if (characters.length < MIN_CHARACTERS || characters.length > MAX_CHARACTERS) {
    errors.push(`特征数量须为 ${MIN_CHARACTERS}–${MAX_CHARACTERS}，当前为 ${characters.length}`);
  }
  species.forEach((id, i) => {
    if (!isAsciiId(id)) errors.push(`物种 #${i + 1} 的 id「${id}」不是非空可打印 ASCII`);
  });
  characters.forEach((id, j) => {
    if (!isAsciiId(id)) errors.push(`特征 #${j + 1} 的 id「${id}」不是非空可打印 ASCII`);
  });
  const checkDup = (ids: string[], label: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${label} id「${id}」重复`);
      seen.add(id);
    }
  };
  checkDup(species, '物种');
  checkDup(characters, '特征');

  if (matrix.length !== species.length) {
    errors.push(`矩阵行数 ${matrix.length} 与物种数 ${species.length} 不一致`);
  } else {
    matrix.forEach((row, i) => {
      if (row.length !== characters.length) {
        errors.push(`矩阵第 ${i + 1} 行长度 ${row.length} 与特征数 ${characters.length} 不一致`);
      } else if (row.some((v) => typeof v !== 'boolean')) {
        errors.push(`矩阵第 ${i + 1} 行含有非布尔值`);
      }
    });
  }
  return errors;
}

export function solveKey(input: KeyInput): SolveResult {
  const errors = validateKeyInput(input);
  if (errors.length > 0) return { status: 'invalid', errors };

  const { species, characters, matrix } = input;
  const n = species.length;
  const m = characters.length;

  // —— 重复特征向量：返回字节序最小的物种对，不生成识别树 ——
  const vectors = matrix.map((row) => row.map((v) => (v ? '1' : '0')).join(''));
  const order = species.map((_, i) => i).sort((a, b) => compareBytes(species[a], species[b]));
  let pair: [string, string] | null = null;
  for (let x = 0; x < n && pair === null; x++) {
    for (let y = x + 1; y < n; y++) {
      const i = order[x];
      const j = order[y];
      if (vectors[i] === vectors[j]) {
        pair = [species[i], species[j]];
        break;
      }
    }
  }
  if (pair !== null) return { status: 'indistinguishable', pair };

  // —— 动态规划：bestTotal(mask, cap) = 候选集 mask 在提问数 ≤ cap 时的最小总路径长 ——
  const colMask: number[] = [];
  for (let j = 0; j < m; j++) {
    let mask = 0;
    for (let i = 0; i < n; i++) if (matrix[i][j]) mask |= 1 << i;
    colMask.push(mask);
  }
  const full = (1 << n) - 1;
  const popcount = (x: number): number => {
    let c = 0;
    while (x !== 0) {
      x &= x - 1;
      c++;
    }
    return c;
  };

  const memo = new Map<number, number[]>();
  function bestTotal(mask: number, cap: number): number {
    if (cap < 0) return Infinity;
    if (popcount(mask) <= 1) return 0;
    let arr = memo.get(mask);
    if (arr !== undefined) {
      const cached = arr[cap];
      if (cached !== undefined) return cached;
    } else {
      arr = [];
      memo.set(mask, arr);
    }
    let best = Infinity;
    if (cap >= 1) {
      for (let j = 0; j < m; j++) {
        const yes = mask & colMask[j];
        const no = mask & ~colMask[j];
        if (yes === 0 || no === 0) continue; // 必须真正分裂当前候选集
        const t = bestTotal(yes, cap - 1) + bestTotal(no, cap - 1);
        if (t < best) best = t;
      }
    }
    const result = best === Infinity ? Infinity : best + popcount(mask);
    arr[cap] = result;
    return result;
  }

  function minWorst(mask: number): number {
    for (let cap = 0; cap <= n; cap++) {
      if (bestTotal(mask, cap) < Infinity) return cap;
    }
    return n; // 不可达：向量两两不同保证总能分裂
  }

  // 特征按 id 字节序排列，任何并列都取字节序最小者
  const charOrder = characters
    .map((_, j) => j)
    .sort((a, b) => compareBytes(characters[a], characters[b]));

  function build(mask: number, cap: number): TreeNode {
    const count = popcount(mask);
    if (count === 1) {
      let i = 0;
      while (((mask >> i) & 1) === 0) i++;
      return { kind: 'leaf', species: species[i], count: 1, worst: 0, total: 0 };
    }
    const target = bestTotal(mask, cap);
    for (const j of charOrder) {
      const yes = mask & colMask[j];
      const no = mask & ~colMask[j];
      if (yes === 0 || no === 0) continue;
      if (bestTotal(yes, cap - 1) + bestTotal(no, cap - 1) + count !== target) continue;
      const yesTree = build(yes, cap - 1);
      const noTree = build(no, cap - 1);
      return {
        kind: 'split',
        character: characters[j],
        yes: yesTree,
        no: noTree,
        count,
        worst: 1 + Math.max(yesTree.worst, noTree.worst),
        total: yesTree.total + noTree.total + count,
      };
    }
    throw new Error('unreachable: no splitting character found');
  }

  const worst = minWorst(full);
  const tree = build(full, worst);
  return { status: 'ok', tree, worst: tree.worst, total: tree.total };
}

export interface WalkStep {
  character: string;
  answer: boolean;
}

export interface WalkState {
  /** 已成功匹配的问答序列。 */
  steps: WalkStep[];
  /** 走完答案后到达的节点（split = 待提问，leaf = 识别结果）。 */
  current: TreeNode;
}

/** 沿是/否答案从根向下走；答案用尽或到达叶子时停下（多余答案被忽略）。 */
export function resolveWalk(tree: TreeNode, answers: boolean[]): WalkState {
  const steps: WalkStep[] = [];
  let current = tree;
  for (const answer of answers) {
    if (current.kind !== 'split') break;
    steps.push({ character: current.character, answer });
    current = answer ? current.yes : current.no;
  }
  return { steps, current };
}
