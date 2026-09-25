# 二歧检索表编辑器（Lit + TypeScript）

交互式二歧检索表（dichotomous key）编辑器：编辑物种 × 特征二值矩阵，实时生成
**最小化最坏提问数**的识别树，并沿是/否分支实际识别、随时回溯。

## 规则

- 输入 **3–16 个唯一 ASCII 物种**、**2–16 个唯一 ASCII 二值特征** 与完整的物种×特征矩阵；
  不合法输入立即报错并使旧树失效。
- 若两个物种的**特征向量完全相同**，返回 `INDISTINGUISHABLE` 与字节序最小的物种对，
  **不伪造识别树**。
- 否则对每个候选物种集合选择**能真正分裂它**的特征，生成决策树：
  1. 最小化最坏提问数（最大叶深）；
  2. 并列时最小化所有物种路径长度之和；
  3. 再并列时按特征 id **字节序**裁决（每个节点取字节序最小特征，
     等价于整树按「根特征 → yes 子树 → no 子树」字典序最小）。
- 编辑矩阵后旧树**立即失效**（重算并清空已答路径）；用户可沿是/否分支识别，
  支持撤销上一答、回溯到任意一问、重新开始。

## 目录

```
src/lib/key-solver.ts      纯求解器：校验、INDISTINGUISHABLE 检测、DP 建树、行走进程
src/components/key-page.ts 主页面（key 页面）：状态与实时重算
src/components/matrix-editor.ts  矩阵编辑器
src/components/key-walk.ts       交互识别（是/否、回溯）
src/components/key-tree.ts       识别树可视化（高亮当前路径）
test/key-solver.test.ts    单元测试
test/exhaustive.test.ts    对拍：穷举全部决策树核对最坏深度、总深度与并列顺序
```

## 命令

```bash
npm install
npm run dev     # 本地开发（Vite）
npm test        # Vitest：单元测试 + 穷举对拍
npm run build   # 类型检查 + 产物构建
```

## Docker Compose 呈现

```bash
docker compose up --build   # 打开 http://localhost:8080 即 key 页面
```
