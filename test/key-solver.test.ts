import { describe, expect, it } from 'vitest';
import {
  compareBytes,
  resolveWalk,
  solveKey,
  validateKeyInput,
  type KeyInput,
} from '../src/lib/key-solver';

const base = (): KeyInput => ({
  species: ['a', 'b', 'c'],
  characters: ['x', 'y'],
  matrix: [
    [true, true],
    [false, true],
    [false, false],
  ],
});

const ok = (r: ReturnType<typeof solveKey>) => {
  if (r.status !== 'ok') throw new Error(`expected ok, got ${r.status}`);
  return r;
};

describe('compareBytes 字节序比较', () => {
  it('按码元逐字节比较', () => {
    expect(compareBytes('a', 'b')).toBeLessThan(0);
    expect(compareBytes('b', 'a')).toBeGreaterThan(0);
    expect(compareBytes('a', 'a')).toBe(0);
    expect(compareBytes('a', 'aa')).toBeLessThan(0); // 前缀短者小
    expect(compareBytes('A', 'a')).toBeLessThan(0); // 0x41 < 0x61
    expect(compareBytes('10', '9')).toBeLessThan(0); // '1' < '9'，非数值比较
  });
});

describe('validateKeyInput 输入校验', () => {
  it('合法输入无错误', () => {
    expect(validateKeyInput(base())).toEqual([]);
  });

  it('物种数量须在 3–16', () => {
    expect(validateKeyInput({ ...base(), species: ['a', 'b'], matrix: base().matrix.slice(0, 2) })).not.toEqual([]);
    const many = Array.from({ length: 17 }, (_, i) => `s${i}`);
    expect(
      validateKeyInput({ species: many, characters: ['x', 'y'], matrix: many.map(() => [true, false]) }),
    ).not.toEqual([]);
  });

  it('特征数量须在 2–16', () => {
    expect(
      validateKeyInput({ species: ['a', 'b', 'c'], characters: ['x'], matrix: [[true], [false], [true]] }),
    ).not.toEqual([]);
  });

  it('拒绝重复 id', () => {
    const dupSpecies = base();
    dupSpecies.species = ['a', 'a', 'c'];
    expect(validateKeyInput(dupSpecies).join()).toContain('重复');
    const dupChars = base();
    dupChars.characters = ['x', 'x'];
    expect(validateKeyInput(dupChars).join()).toContain('重复');
  });

  it('拒绝空 id 与非 ASCII id', () => {
    const empty = base();
    empty.species = ['a', '', 'c'];
    expect(validateKeyInput(empty).join()).toContain('ASCII');
    const cjk = base();
    cjk.characters = ['x', '有毛'];
    expect(validateKeyInput(cjk).join()).toContain('ASCII');
  });

  it('矩阵必须完整且为布尔值', () => {
    const short = base();
    short.matrix = [[true, false], [true, false]];
    expect(validateKeyInput(short).join()).toContain('不一致');
    const ragged = base();
    ragged.matrix = [[true, false], [true], [false, true]];
    expect(validateKeyInput(ragged).join()).toContain('不一致');
    const nonBool = base();
    nonBool.matrix = [[true, false], [true, 1 as unknown as boolean], [false, true]];
    expect(validateKeyInput(nonBool).join()).toContain('非布尔');
  });

  it('非法输入返回 invalid 且不生成树', () => {
    const r = solveKey({ ...base(), species: ['a', 'a', 'c'] });
    expect(r.status).toBe('invalid');
    expect('tree' in r).toBe(false);
  });
});

describe('INDISTINGUISHABLE 重复特征向量', () => {
  it('返回字节序最小的物种对，不伪造识别树', () => {
    const r = solveKey({
      species: ['m', 'b', 'q', 'a'],
      characters: ['x', 'y'],
      matrix: [
        [false, false], // m: 00
        [true, true], //   b: 11
        [true, true], //   q: 11
        [false, false], // a: 00
      ],
    });
    // 重复对为 (a,m) 与 (b,q)，字节序最小的是 (a,m)
    expect(r.status).toBe('indistinguishable');
    if (r.status === 'indistinguishable') expect(r.pair).toEqual(['a', 'm']);
    expect('tree' in r).toBe(false);
  });

  it('全部相同时取字节序最小的两个物种', () => {
    const r = solveKey({
      species: ['c', 'a', 'b'],
      characters: ['x', 'y'],
      matrix: [
        [true, false],
        [true, false],
        [true, false],
      ],
    });
    expect(r.status).toBe('indistinguishable');
    if (r.status === 'indistinguishable') expect(r.pair).toEqual(['a', 'b']);
  });
});

describe('solveKey 决策树生成', () => {
  it('并列特征按 id 字节序裁决（与输入顺序无关）', () => {
    // x 与 y 都把 4 个物种均分为 2|2，最坏深度与总深度完全相同
    const r = ok(
      solveKey({
        species: ['a', 'b', 'c', 'd'],
        characters: ['y', 'x'], // y 在前，但字节序 x < y
        matrix: [
          [true, true],
          [false, true],
          [true, false],
          [false, false],
        ],
      }),
    );
    expect(r.worst).toBe(2);
    expect(r.total).toBe(8);
    expect(r.tree).toEqual({
      kind: 'split',
      character: 'x',
      count: 4,
      worst: 2,
      total: 8,
      yes: {
        kind: 'split',
        character: 'y',
        count: 2,
        worst: 1,
        total: 2,
        yes: { kind: 'leaf', species: 'a', count: 1, worst: 0, total: 0 },
        no: { kind: 'leaf', species: 'b', count: 1, worst: 0, total: 0 },
      },
      no: {
        kind: 'split',
        character: 'y',
        count: 2,
        worst: 1,
        total: 2,
        yes: { kind: 'leaf', species: 'c', count: 1, worst: 0, total: 0 },
        no: { kind: 'leaf', species: 'd', count: 1, worst: 0, total: 0 },
      },
    });
  });

  it('链式分裂：最坏深度并列时仍按字节序选根', () => {
    const r = ok(
      solveKey({
        species: ['a', 'b', 'c'],
        characters: ['x', 'y'],
        matrix: [
          [true, true],
          [false, true],
          [false, false],
        ],
      }),
    );
    expect(r.worst).toBe(2);
    expect(r.total).toBe(5);
    expect(r.tree).toEqual({
      kind: 'split',
      character: 'x',
      count: 3,
      worst: 2,
      total: 5,
      yes: { kind: 'leaf', species: 'a', count: 1, worst: 0, total: 0 },
      no: {
        kind: 'split',
        character: 'y',
        count: 2,
        worst: 1,
        total: 2,
        yes: { kind: 'leaf', species: 'b', count: 1, worst: 0, total: 0 },
        no: { kind: 'leaf', species: 'c', count: 1, worst: 0, total: 0 },
      },
    });
  });

  it('最坏深度并列时最小化总路径长，子节点再按字节序裁决', () => {
    // c1 分裂 1|4（链，总深 14），c2 分裂 2|3（总深 12），v/w 分裂 1|4（总深 13）：
    // 最坏深度都是 3，必须选总深度最小的 c2。
    const r = ok(
      solveKey({
        species: ['a', 'b', 'c', 'd', 'e'],
        characters: ['c1', 'c2', 'u', 'v', 'w'],
        matrix: [
          [true, true, true, false, false], //  a: 11100
          [false, true, false, false, false], // b: 01000
          [false, false, false, true, false], // c: 00010
          [false, false, false, false, true], // d: 00001
          [false, false, false, false, false], // e: 00000
        ],
      }),
    );
    expect(r.worst).toBe(3);
    expect(r.total).toBe(12);
    expect(r.tree).toEqual({
      kind: 'split',
      character: 'c2',
      count: 5,
      worst: 3,
      total: 12,
      yes: {
        kind: 'split',
        character: 'c1', // {a,b} 可被 c1 与 u 分裂，字节序 c1 < u
        count: 2,
        worst: 1,
        total: 2,
        yes: { kind: 'leaf', species: 'a', count: 1, worst: 0, total: 0 },
        no: { kind: 'leaf', species: 'b', count: 1, worst: 0, total: 0 },
      },
      no: {
        kind: 'split',
        character: 'v', // {c,d,e} 的 v、w 并列，字节序 v < w
        count: 3,
        worst: 2,
        total: 5,
        yes: { kind: 'leaf', species: 'c', count: 1, worst: 0, total: 0 },
        no: {
          kind: 'split',
          character: 'w',
          count: 2,
          worst: 1,
          total: 2,
          yes: { kind: 'leaf', species: 'd', count: 1, worst: 0, total: 0 },
          no: { kind: 'leaf', species: 'e', count: 1, worst: 0, total: 0 },
        },
      },
    });
  });

  it('恒定特征（不分裂任何候选集）从不被选用', () => {
    const withoutZ = ok(solveKey(base()));
    const withZ = ok(
      solveKey({
        ...base(),
        characters: ['x', 'y', 'z'],
        matrix: base().matrix.map((row) => [...row, true]), // z 恒为"是"
      }),
    );
    expect(withZ.tree).toEqual(withoutZ.tree);
  });

  it('16 物种 4 特征可完美平衡：最坏 4 问、总路径长 64', () => {
    const species = Array.from({ length: 16 }, (_, i) => `s${i}`);
    const r = ok(
      solveKey({
        species,
        characters: ['c0', 'c1', 'c2', 'c3'],
        matrix: species.map((_, i) => [!!(i & 8), !!(i & 4), !!(i & 2), !!(i & 1)]),
      }),
    );
    expect(r.worst).toBe(4);
    expect(r.total).toBe(64);
    if (r.tree.kind === 'split') expect(r.tree.character).toBe('c0');
  });
});

describe('resolveWalk 交互识别', () => {
  const { tree } = ok(
    solveKey({
      species: ['a', 'b', 'c', 'd'],
      characters: ['x', 'y'],
      matrix: [
        [true, true],
        [true, false],
        [false, true],
        [false, false],
      ],
    }),
  );

  it('沿是/否分支走到叶子', () => {
    const w = resolveWalk(tree, [true, false]);
    expect(w.current).toMatchObject({ kind: 'leaf', species: 'b' });
    expect(w.steps).toEqual([
      { character: 'x', answer: true },
      { character: 'y', answer: false },
    ]);
    expect(resolveWalk(tree, [false, true]).current).toMatchObject({ kind: 'leaf', species: 'c' });
  });

  it('未答完时停在分裂节点，多余答案被忽略', () => {
    const mid = resolveWalk(tree, [true]);
    expect(mid.current.kind).toBe('split');
    const over = resolveWalk(tree, [true, false, true, true]);
    expect(over.current).toMatchObject({ kind: 'leaf', species: 'b' });
    expect(over.steps).toHaveLength(2);
  });
});
