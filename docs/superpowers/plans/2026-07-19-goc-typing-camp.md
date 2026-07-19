# GoC 魔法画笔打字训练营 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 GoC 决赛备赛站内加入两档、可持续计分且会真实绘图反馈的儿童打字训练营。

**Architecture:** 训练题库、输入判定与统计更新放在独立的纯 JavaScript 模块中，使其能用 Node 测试而无需浏览器。页面组件只保存交互状态、读写 localStorage 并把正确答案（`for` 关补全循环体）交给现有 `runGoC`；现有 canvas 绘制函数继续负责可视化。

**Tech Stack:** React 19、TypeScript、现有 Vinext/Next 页面、Node 内置 test runner、现有安全 GoC 子运行器。

## Global Constraints

- Node.js 版本要求保持 `>=22.13.0`，不添加 npm 依赖。
- 训练只能使用本地数据与 localStorage；不得发起网络请求、引入账号或收集个人信息。
- 继续复用 `runGoC`，绝不使用 `eval` 或动态执行 JavaScript。
- 不改变既有课程卡、真实运行器和决赛题练习的功能。
- 热身档忽略输入前后空格；挑战档要求大小写、括号、参数、分号完全正确。

---

### Task 1: 创建可测试的训练题库与判定模块

**Files:**
- Create: `app/lib/typing-camp.mjs`
- Create: `tests/typing-camp.test.mjs`

**Interfaces:**
- Produces `typingLevels`: `{ id, mode, prompt, answer, previewCode, command }[]`，包含 `for` 的热身与完整循环头挑战题。
- Produces `checkTypingAnswer(level, rawInput)`: 返回 `{ correct: boolean, hint: string }`。
- Produces `updateTypingStats(stats, correct)`: 返回 `{ streak, bestStreak, answered, correct }`。

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { checkTypingAnswer, typingLevels, updateTypingStats } from "../app/lib/typing-camp.mjs";

test("accepts a trimmed command name in warmup mode", () => {
  const level = typingLevels.find((item) => item.id === "fd-name");
  assert.deepEqual(checkTypingAnswer(level, "  fd  "), { correct: true, hint: "答对了！画笔准备出发。" });
});

test("requires exact punctuation for a full command", () => {
  const level = typingLevels.find((item) => item.id === "fd-full");
  assert.deepEqual(checkTypingAnswer(level, "fd(100)"), { correct: false, hint: "还缺少：;" });
});

test("reports the first wrong character without exposing the answer", () => {
  const level = typingLevels.find((item) => item.id === "moveTo-name");
  assert.deepEqual(checkTypingAnswer(level, "moveto"), { correct: false, hint: "第 5 个字符应为：T" });
});

test("includes both for drills and executes its drawing preview", () => {
  assert.ok(typingLevels.some((item) => item.id === "for-name" && item.answer === "for"));
  const loop = typingLevels.find((item) => item.id === "for-full");
  assert.equal(loop.answer, "for(i=0;i<4;i++)");
  assert.match(loop.previewCode, /for\(i=0;i<4;i\+\+\)\{\s*pen\.fd\(60\)\.rt\(90\);\s*\}/);
});

test("updates streak and best streak after correct and incorrect attempts", () => {
  const start = { streak: 0, bestStreak: 0, answered: 0, correct: 0 };
  assert.deepEqual(updateTypingStats(start, true), { streak: 1, bestStreak: 1, answered: 1, correct: 1 });
  assert.deepEqual(updateTypingStats({ streak: 3, bestStreak: 3, answered: 3, correct: 3 }, false), { streak: 0, bestStreak: 3, answered: 4, correct: 3 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/typing-camp.test.mjs`

Expected: `ERR_MODULE_NOT_FOUND` because `app/lib/typing-camp.mjs` does not yet exist.

- [ ] **Step 3: Write minimal implementation**

Create `app/lib/typing-camp.mjs` with no browser imports. Define fixed levels for the listed commands, including these required records:

```js
{ id: "fd-name", mode: "warmup", command: "fd", prompt: "让画笔向前走一小步", answer: "fd", previewCode: "pen.fd(70);" }
{ id: "fd-full", mode: "challenge", command: "fd", prompt: "向前走 100 格", answer: "fd(100);", previewCode: "pen.fd(100);" }
{ id: "moveTo-name", mode: "warmup", command: "moveTo", prompt: "抬笔后移动到指定坐标", answer: "moveTo", previewCode: "pen.up().moveTo(100,50).down();" }
{ id: "for-name", mode: "warmup", command: "for", prompt: "让画笔重复执行动作", answer: "for", previewCode: "for(int i=0;i<4;i++){ pen.fd(60).rt(90); }" }
{ id: "for-full", mode: "challenge", command: "for", prompt: "输入重复画正方形的循环头", answer: "for(i=0;i<4;i++)", previewCode: "int i; for(i=0;i<4;i++){ pen.fd(60).rt(90); }" }
```

Implement `checkTypingAnswer` by trimming only leading/trailing whitespace. On a mismatch, compare strings from left to right; if input ends first return `还缺少：${expected.slice(input.length, input.length + 1)}`; otherwise return `第 ${index + 1} 个字符应为：${expected[index]}`. Return the exact success hint asserted in the test. Implement `updateTypingStats` with immutable object returns.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/typing-camp.test.mjs`

Expected: 5 passing tests and 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/lib/typing-camp.mjs tests/typing-camp.test.mjs
git commit -m "feat: add GoC typing camp drills"
```

### Task 2: 将训练营接入课程页面和真实画布

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes `typingLevels`, `checkTypingAnswer`, `updateTypingStats` from `./lib/typing-camp.mjs`.
- Consumes existing `runGoC(source)` and `paintCanvas(canvas, operations)`.
- Produces an accessible `<section>` with text `魔法画笔打字训练营`，可选择 `热身档` 或 `挑战档`。

- [ ] **Step 1: Write the failing render test**

Append this test to `tests/rendered-html.test.mjs`:

```js
test("server-renders the two-mode typing camp", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /魔法画笔打字训练营/);
  assert.match(html, /热身档：指令名/);
  assert.match(html, /挑战档：完整命令/);
  assert.match(html, /输入魔法指令/);
  assert.match(html, /最高连击/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: build completes, then `server-renders the two-mode typing camp` fails because the page lacks the training-camp text.

- [ ] **Step 3: Add minimal page state and behavior**

In `app/page.tsx`, import the three Task 1 exports. Add these React state values inside `Home`:

```ts
const [typingMode, setTypingMode] = useState<"warmup" | "challenge">("warmup");
const [typingIndex, setTypingIndex] = useState(0);
const [typingInput, setTypingInput] = useState("");
const [typingHint, setTypingHint] = useState("输入指令后按 Enter 或点击提交。");
const [typingSolved, setTypingSolved] = useState(false);
const [typingStats, setTypingStats] = useState({ streak: 0, bestStreak: 0, answered: 0, correct: 0 });
```

Derive the current level from `typingLevels.filter((level) => level.mode === typingMode)`. On first client mount, parse `localStorage.getItem("goc-typing-stats")`; accept only four finite non-negative numeric fields, otherwise retain the default. Whenever statistics change after hydration, save `JSON.stringify(typingStats)` under that key.

Implement `submitTypingAnswer()` to call `checkTypingAnswer`, update the hint and statistics, reset streak on an incorrect attempt, and on success call `setResult(runGoC(currentLevel.previewCode))`, set `typingSolved` true and preserve the canvas output. Implement `nextTypingLevel()` to advance modulo the selected mode's levels and clear input, hint and solved state. Both mode buttons reset index and input.

Insert the section after the real runner section. It must include:

```tsx
<section className="typing-section" aria-label="GoC 打字训练营">
  <p className="eyebrow">TYPE → SEE → REMEMBER</p>
  <h2>魔法画笔打字训练营</h2>
  <button type="button">热身档：指令名</button>
  <button type="button">挑战档：完整命令</button>
  <label htmlFor="typing-answer">输入魔法指令</label>
  <input id="typing-answer" />
  <button type="button">提交指令</button>
  <button type="button">下一关</button>
  <strong>最高连击</strong>
</section>
```

Bind Enter to submission. Disable submit only after a correct answer; keep it active after an error. Display hints with `aria-live="polite"`. Correct answers state that the canvas has drawn the result; incorrect answers use only `checkTypingAnswer` hints. Add scoped CSS in `app/globals.css` for a child-friendly two-column layout, large monospace input, selected-mode state, green correct hint and coral error hint; preserve existing responsive styling.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`

Expected: existing tests plus `server-renders the two-mode typing camp` pass.

- [ ] **Step 5: Run lint and commit**

```bash
npm run lint
git add app/page.tsx app/globals.css tests/rendered-html.test.mjs
git commit -m "feat: add interactive GoC typing camp"
```

### Task 3: 验证完整项目与本地运行体验

**Files:**
- Modify: none unless verification reveals a direct defect.

**Interfaces:**
- Consumes all code and tests from Tasks 1–2.
- Produces a verified local build with no lint errors.

- [ ] **Step 1: Run the full automated verification**

```bash
npm test
npm run lint
```

Expected: all Node tests pass; Vinext build exits 0; ESLint exits 0.

- [ ] **Step 2: Perform the local interaction check**

Run: `npm run dev`

Expected: the terminal prints a local URL. In the browser, submit `fd` in 热身档, then `fd(100);` in 挑战档, then `for` and `for(i=0;i<4;i++)`; each correct answer updates the canvas. Enter `fd(100)` once and verify the message is `还缺少：;`.

- [ ] **Step 3: Commit only a direct verification fix, if required**

If and only if a defect is found, add a focused regression test, make the smallest change that passes it, then run both verification commands again and commit with `fix: correct typing camp interaction`.
