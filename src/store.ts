import {
  KeyData,
  KeyNode,
  MAX_FEATURES,
  MAX_SPECIES,
  SolveResult,
  pathFeatures,
  remainingCandidates,
  solveKey,
  walkNode,
} from './solver';

export interface KeySnapshot {
  data: KeyData;
  /** Synchronously recomputed on every edit: a stale tree is never exposed. */
  result: SolveResult;
  /** Yes/no answers of the ongoing identification session. */
  answers: boolean[];
  /** Bumps on every edit; consumers can detect staleness cheaply. */
  revision: number;
}

function cloneMatrix(matrix: boolean[][]): boolean[][] {
  return matrix.map((row) => row.slice());
}

export function sampleData(): KeyData {
  return {
    species: ['ant', 'bee', 'cat', 'dog', 'eel', 'fox'],
    features: ['flying', 'furry', 'legs', 'swims', 'tail'],
    matrix: [
      // flying, furry, legs, swims, tail
      [false, false, true, false, false], // ant
      [true, true, true, false, false], // bee
      [false, true, true, false, true], // cat
      [false, true, true, true, true], // dog
      [false, false, false, true, false], // eel
      [false, true, true, false, false], // fox
    ],
  };
}

/**
 * Framework-free store shared by the Lit components and unit tests.
 *
 * Every mutation recomputes the decision tree immediately and clears the
 * identification path, so an edited matrix invalidates the old tree (and any
 * in-progress answers over it) before the next read.
 */
export class KeyStore {
  private state: KeySnapshot;
  private readonly listeners = new Set<() => void>();

  constructor(initial?: KeyData) {
    const data = initial ?? sampleData();
    this.state = {
      data: {
        species: data.species.slice(),
        features: data.features.slice(),
        matrix: cloneMatrix(data.matrix),
      },
      result: { status: 'INVALID', errors: ['not-solved-yet'] },
      answers: [],
      revision: 0,
    };
    this.recompute();
  }

  get snapshot(): KeySnapshot {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }

  /** Recomputes the tree and drops the in-progress identification. */
  private recompute(): void {
    this.state = {
      ...this.state,
      result: solveKey(this.state.data),
      answers: [],
      revision: this.state.revision + 1,
    };
  }

  // ---- matrix / schema edits (each invalidates the current tree) ----

  setSpeciesName(index: number, name: string): void {
    if (index < 0 || index >= this.state.data.species.length) return;
    const species = this.state.data.species.slice();
    species[index] = name;
    this.state = { ...this.state, data: { ...this.state.data, species } };
    this.recompute();
    this.emit();
  }

  addSpecies(name?: string): void {
    const data = this.state.data;
    if (data.species.length >= MAX_SPECIES) return;
    const species = data.species.concat([name ?? this.freshName('sp', data.species)]);
    const matrix = data.matrix.map((row) => row.slice());
    matrix.push(data.features.map(() => false));
    this.state = { ...this.state, data: { ...data, species, matrix } };
    this.recompute();
    this.emit();
  }

  removeSpecies(index: number): void {
    const data = this.state.data;
    if (index < 0 || index >= data.species.length) return;
    const species = data.species.filter((_, i) => i !== index);
    const matrix = data.matrix.filter((_, i) => i !== index).map((row) => row.slice());
    this.state = { ...this.state, data: { ...data, species, matrix } };
    this.recompute();
    this.emit();
  }

  setFeatureName(index: number, name: string): void {
    if (index < 0 || index >= this.state.data.features.length) return;
    const features = this.state.data.features.slice();
    features[index] = name;
    this.state = { ...this.state, data: { ...this.state.data, features } };
    this.recompute();
    this.emit();
  }

  addFeature(name?: string): void {
    const data = this.state.data;
    if (data.features.length >= MAX_FEATURES) return;
    const features = data.features.concat([name ?? this.freshName('f', data.features)]);
    const matrix = data.matrix.map((row) => row.concat([false]));
    this.state = { ...this.state, data: { ...data, features, matrix } };
    this.recompute();
    this.emit();
  }

  removeFeature(index: number): void {
    const data = this.state.data;
    if (index < 0 || index >= data.features.length) return;
    const features = data.features.filter((_, j) => j !== index);
    const matrix = data.matrix.map((row) => row.filter((_, j) => j !== index));
    this.state = { ...this.state, data: { ...data, features, matrix } };
    this.recompute();
    this.emit();
  }

  setCell(speciesIndex: number, featureIndex: number, value: boolean): void {
    const data = this.state.data;
    if (speciesIndex < 0 || speciesIndex >= data.species.length) return;
    if (featureIndex < 0 || featureIndex >= data.features.length) return;
    const matrix = cloneMatrix(data.matrix);
    matrix[speciesIndex]![featureIndex] = value;
    this.state = { ...this.state, data: { ...data, matrix } };
    this.recompute();
    this.emit();
  }

  toggleCell(speciesIndex: number, featureIndex: number): void {
    const data = this.state.data;
    const current = data.matrix[speciesIndex]?.[featureIndex];
    if (typeof current !== 'boolean') return;
    this.setCell(speciesIndex, featureIndex, !current);
  }

  loadData(data: KeyData): void {
    this.state = {
      ...this.state,
      data: {
        species: data.species.slice(),
        features: data.features.slice(),
        matrix: cloneMatrix(data.matrix),
      },
    };
    this.recompute();
    this.emit();
  }

  // ---- identification session ----

  /** Records a yes/no answer; ignored once a leaf is reached or no tree. */
  answer(bit: boolean): void {
    if (this.state.result.status !== 'OK') return;
    const node = walkNode(this.state.result.tree, this.state.answers);
    if (node.kind !== 'question') return;
    this.state = { ...this.state, answers: this.state.answers.concat([bit]) };
    this.emit();
  }

  /** Backtracks one answer. */
  undo(): void {
    if (this.state.answers.length === 0) return;
    this.state = { ...this.state, answers: this.state.answers.slice(0, -1) };
    this.emit();
  }

  resetPath(): void {
    if (this.state.answers.length === 0) return;
    this.state = { ...this.state, answers: [] };
    this.emit();
  }

  // ---- derived identification state ----

  currentNode(): KeyNode | null {
    if (this.state.result.status !== 'OK') return null;
    return walkNode(this.state.result.tree, this.state.answers);
  }

  askedFeatures(): string[] {
    if (this.state.result.status !== 'OK') return [];
    return pathFeatures(this.state.result.tree, this.state.answers);
  }

  candidates(): string[] {
    if (this.state.result.status !== 'OK') return [];
    return remainingCandidates(this.state.data, this.state.result.tree, this.state.answers);
  }

  private freshName(prefix: string, taken: string[]): string {
    for (let i = 1; ; i++) {
      const candidate = `${prefix}${i}`;
      if (!taken.includes(candidate)) return candidate;
    }
  }
}
