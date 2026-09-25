# 二歧检索表 · Minimax Studio

交互式二歧检索表编辑器：Lit + TypeScript 前端，Vitest 穷举对拍，Compose 一键呈现 key 页面。

## 规则

- 输入 3–16 个唯一 ASCII 物种、2–16 个唯一 ASCII 二值特征，以及完整的物种×特征布尔矩阵。
- 若两个物种的特征向量完全相同，返回 `INDISTINGUISHABLE` 与字节序最小的物种对，**不伪造识别树**。
- 否则对当前候选物种集合选择能真正分裂它的特征，生成**最坏提问数最小**的决策树；
  并列时先最小化所有物种路径长度之和，再按特征 id 字节序裁决（与输入顺序无关）。
- 编辑矩阵后旧树立即失效并同步重算；识别面板可沿是/否分支下行、逐题回溯或重来。

## 开发

```bash
npm install
npm run dev        # 本地开发（#/key 为编辑器页面）
npm test           # Vitest：小矩阵穷举所有决策树对拍 + 大矩阵随机校验
npm run build      # 类型检查 + 产物构建
```

## Compose 部署

```bash
docker compose up --build
```

`key` 服务构建前端产物并由 nginx 呈现，访问 http://localhost:8080/#/key 即为检索表编辑器页面。

## 结构

```
src/solver.ts    纯求解器：校验、INDISTINGUISHABLE 检测、minimax 决策树（子集位掩码记忆化）
src/store.ts     框架无关状态：编辑即失效重算、识别会话（答题/回溯/重置）
src/components/  Lit 组件：key-app（hash 路由 #/key）、key-editor、key-identify、key-tree-view
test/            Vitest：小矩阵全枚举对拍（最坏深度/总深度/并列顺序）、随机大矩阵结构校验、store 行为
```
