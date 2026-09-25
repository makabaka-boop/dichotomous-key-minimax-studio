/**
 * Core domain logic for the dichotomous key studio.
 *
 * A dichotomous key is built from a species x feature binary matrix. Two
 * species sharing an identical feature vector can never be told apart, in
 * which case the solver reports INDISTINGUISHABLE (with the byte-minimal
 * species pair) instead of fabricating a tree. Otherwise it builds the
 * decision tree that minimizes the worst-case number of questions; ties are
 * broken by the total path length over all species, then by feature id in
 * byte order.
 */

export const MIN_SPECIES = 3;
export const MAX_SPECIES = 16;
export const MIN_FEATURES = 2;
export const MAX_FEATURES = 16;

export interface KeyData {
  /** Unique ASCII species ids, 3..16 of them. */
  species: string[];
  /** Unique ASCII feature ids, 2..16 of them. */
  features: string[];
  /** matrix[speciesIndex][featureIndex]; must be complete. */
  matrix: boolean[][];
}

export type KeyNode =
  | { kind: 'leaf'; species: string }
  | { kind: 'question'; feature: string; yes: KeyNode; no: KeyNode };

export type SolveResult =
  | { status: 'OK'; tree: KeyNode; worstDepth: number; totalDepth: number }
  | { status: 'INDISTINGUISHABLE'; pair: [string, string] }
  | { status: 'INVALID'; errors: string[] };

/** Byte-order comparison (char codes); for pure ASCII this is byte order. */
export function compareBytes(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const d = a.charCodeAt(i) - b.charCodeAt(i);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  if (a.length === b.length) return 0;
  return a.length < b.length ? -1 : 1;
}

export function isAsciiName(name: string): boolean {
  if (name.length === 0 || name.length > 64) return false;
  for (let i = 0; i < name.length; i++) {
    if (name.charCodeAt(i) > 0x7f) return false;
  }
  return true;
}

/**
 * Returns a list of stable error codes; an empty list means the data is
 * well-formed (counts, uniqueness, ASCII, complete boolean matrix).
 */
export function validateKeyData(data: KeyData): string[] {
  const errors: string[] = [];

  if (data.species.length < MIN_SPECIES || data.species.length > MAX_SPECIES) {
    errors.push(`species-count:${data.species.length}`);
  }
  if (data.features.length < MIN_FEATURES || data.features.length > MAX_FEATURES) {
    errors.push(`feature-count:${data.features.length}`);
  }

  const seenSpecies = new Set<string>();
  for (const s of data.species) {
    if (!isAsciiName(s)) errors.push(`species-name:${s}`);
    if (seenSpecies.has(s)) errors.push(`species-duplicate:${s}`);
    seenSpecies.add(s);
  }

  const seenFeatures = new Set<string>();
  for (const f of data.features) {
    if (!isAsciiName(f)) errors.push(`feature-name:${f}`);
    if (seenFeatures.has(f)) errors.push(`feature-duplicate:${f}`);
    seenFeatures.add(f);
  }

  if (data.matrix.length !== data.species.length) {
    errors.push(`matrix-rows:${data.matrix.length}`);
  }
  const rows = Math.min(data.matrix.length, data.species.length);
  for (let i = 0; i < rows; i++) {
    const row = data.matrix[i]!;
    if (row.length !== data.features.length) {
      errors.push(`matrix-cols:${i}:${row.length}`);
      continue;
    }
    for (let j = 0; j < row.length; j++) {
      if (typeof row[j] !== 'boolean') errors.push(`matrix-value:${i}:${j}`);
    }
  }

  return errors;
}

function vectorKey(row: readonly boolean[]): string {
  let key = '';
  for (const b of row) key += b ? '1' : '0';
  return key;
}

/**
 * Finds the byte-minimal colliding species pair, or null when every species
 * has a distinct feature vector. Within a collision group the two smallest
 * names form that group's minimal pair; the answer is the minimal pair over
 * all groups (compared element-wise in byte order).
 */
export function findIndistinguishablePair(data: KeyData): [string, string] | null {
  const byVector = new Map<string, number[]>();
  for (let i = 0; i < data.species.length; i++) {
    const key = vectorKey(data.matrix[i]!);
    const bucket = byVector.get(key);
    if (bucket) bucket.push(i);
    else byVector.set(key, [i]);
  }

  let best: [string, string] | null = null;
  for (const idxs of byVector.values()) {
    if (idxs.length < 2) continue;
    const names = idxs.map((i) => data.species[i]!).sort(compareBytes);
    const pair: [string, string] = [names[0]!, names[1]!];
    if (
      best === null ||
      compareBytes(pair[0], best[0]) < 0 ||
      (compareBytes(pair[0], best[0]) === 0 && compareBytes(pair[1], best[1]) < 0)
    ) {
      best = pair;
    }
  }
  return best;
}

interface SubResult {
  /** Worst-case remaining questions from this node (leaf: 0). */
  worst: number;
  /** Sum of remaining path lengths over all species under this node. */
  total: number;
  node: KeyNode;
}

function popcount(x: number): number {
  let c = 0;
  while (x !== 0) {
    x &= x - 1;
    c++;
  }
  return c;
}

/**
 * Validates, detects indistinguishable species, and otherwise builds the
 * optimal decision tree.
 *
 * Optimality is defined per candidate set S:
 *   worst(S) = 1 + max(worst of the two children)   (leaf: 0)
 *   total(S) = |S| + total of the two children      (leaf: 0)
 * A feature is only eligible for S when it truly splits S (both branches
 * non-empty). Features are considered in ascending byte order of their ids
 * and a strictly better (worst, total) is required to replace the incumbent,
 * so among fully tied features the byte-minimal id wins.
 *
 * Memoization is keyed on the species bitmask alone: any feature already
 * asked on the path to S is constant on S and therefore ineligible, so the
 * set of useful features is fully determined by S.
 */
export function solveKey(data: KeyData): SolveResult {
  const errors = validateKeyData(data);
  if (errors.length > 0) return { status: 'INVALID', errors };

  const pair = findIndistinguishablePair(data);
  if (pair !== null) return { status: 'INDISTINGUISHABLE', pair };

  const n = data.species.length;
  const featOrder = data.features
    .map((_, j) => j)
    .sort((a, b) => compareBytes(data.features[a]!, data.features[b]!));

  const memo = new Map<number, SubResult>();

  function solve(mask: number): SubResult {
    const hit = memo.get(mask);
    if (hit !== undefined) return hit;

    const size = popcount(mask);
    let result: SubResult;
    if (size === 1) {
      const idx = 31 - Math.clz32(mask);
      result = { worst: 0, total: 0, node: { kind: 'leaf', species: data.species[idx]! } };
    } else {
      let best: SubResult | null = null;
      for (const j of featOrder) {
        let yesMask = 0;
        let noMask = 0;
        for (let i = 0; i < n; i++) {
          if ((mask & (1 << i)) !== 0) {
            if (data.matrix[i]![j]!) yesMask |= 1 << i;
            else noMask |= 1 << i;
          }
        }
        if (yesMask === 0 || noMask === 0) continue; // must truly split S
        const ry = solve(yesMask);
        const rn = solve(noMask);
        const worst = 1 + Math.max(ry.worst, rn.worst);
        const total = size + ry.total + rn.total;
        if (best === null || worst < best.worst || (worst === best.worst && total < best.total)) {
          best = {
            worst,
            total,
            node: { kind: 'question', feature: data.features[j]!, yes: ry.node, no: rn.node },
          };
        }
      }
      if (best === null) {
        // Unreachable: distinct vectors are always separable.
        throw new Error(`no splitting feature for mask ${mask}`);
      }
      result = best;
    }
    memo.set(mask, result);
    return result;
  }

  const root = solve((1 << n) - 1);
  return { status: 'OK', tree: root.node, worstDepth: root.worst, totalDepth: root.total };
}

/** Walks the tree following the recorded yes/no answers. */
export function walkNode(tree: KeyNode, answers: readonly boolean[]): KeyNode {
  let node = tree;
  for (const answer of answers) {
    if (node.kind !== 'question') break;
    node = answer ? node.yes : node.no;
  }
  return node;
}

/** Feature ids asked along the answered path, in order. */
export function pathFeatures(tree: KeyNode, answers: readonly boolean[]): string[] {
  const features: string[] = [];
  let node = tree;
  for (const answer of answers) {
    if (node.kind !== 'question') break;
    features.push(node.feature);
    node = answer ? node.yes : node.no;
  }
  return features;
}

/** Species still consistent with the answers given so far. */
export function remainingCandidates(
  data: KeyData,
  tree: KeyNode,
  answers: readonly boolean[],
): string[] {
  const asked = pathFeatures(tree, answers);
  const colOf = new Map(data.features.map((f, j) => [f, j]));
  return data.species.filter((_, i) => {
    const row = data.matrix[i]!;
    for (let k = 0; k < asked.length; k++) {
      const j = colOf.get(asked[k]!);
      if (j === undefined || row[j] !== answers[k]) return false;
    }
    return true;
  });
}

/** Depth (number of questions) of every leaf, keyed by species id. */
export function leafDepths(tree: KeyNode): Map<string, number> {
  const depths = new Map<string, number>();
  const visit = (node: KeyNode, depth: number): void => {
    if (node.kind === 'leaf') depths.set(node.species, depth);
    else {
      visit(node.yes, depth + 1);
      visit(node.no, depth + 1);
    }
  };
  visit(tree, 0);
  return depths;
}
