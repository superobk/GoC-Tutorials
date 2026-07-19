# GoC Finals Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the GoC companion into a finals-aligned practice site with a real, safe drawing interpreter and review questions for every finals topic.

**Architecture:** Keep the browser-only learning shell in `app/page.tsx`, move all interpretable drawing behavior into a deterministic TypeScript module, and hold finals question metadata in a focused data module. The UI renders canvas operations emitted by the interpreter and offers a question bank grouped by finals question type.

**Tech Stack:** Next/Vinext, React 19, TypeScript, Canvas 2D, Node test runner.

## Global Constraints

- The runner executes only the documented GoC teaching subset; unsupported code returns an explicit error.
- Do not evaluate user code with `eval`, `Function`, or remote execution.
- Finals practice contains 5 question types with 4 sample questions each.
- Source facts follow the supplied 横琴比赛决赛试题 PDF: 20 single-choice questions and 6 programming questions.

---

### Task 1: Safe drawing interpreter

**Files:**
- Create: `app/lib/goc-runner.ts`
- Create: `tests/goc-runner.test.mjs`

**Interfaces:**
- Produces: `runGoC(source: string): RunResult`
- Produces: `DrawOperation[]` with line, circle, ellipse, rectangle, move, and state operations.

- [ ] **Step 1: Write failing tests**

```js
assert.deepEqual(runGoC("pen.fd(100).rt(90).fd(50);").operations.map((op) => op.kind), ["line", "turn", "line"]);
assert.equal(runGoC("for(int i=0;i<4;i++) pen.fd(10).rt(90);").operations.filter((op) => op.kind === "line").length, 4);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/goc-runner.test.mjs`
Expected: FAIL because `app/lib/goc-runner.ts` does not exist.

- [ ] **Step 3: Implement the minimal interpreter**

Implement tokenized statements, integer variables, basic arithmetic expressions, supported `for` loops, chained `pen` commands, and controlled execution limits.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/goc-runner.test.mjs`
Expected: PASS with all runner assertions green.

### Task 2: Finals practice data

**Files:**
- Create: `app/lib/finals-practice.ts`
- Modify: `tests/goc-runner.test.mjs`

**Interfaces:**
- Produces: `finalsPracticeTypes`, five entries with exactly four questions per entry.

- [ ] **Step 1: Write failing data-shape test**

```js
assert.equal(finalsPracticeTypes.length, 5);
assert.ok(finalsPracticeTypes.every((type) => type.questions.length === 4));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/goc-runner.test.mjs`
Expected: FAIL because the practice module does not exist.

- [ ] **Step 3: Add finals-aligned sample questions**

Use coordinate/route, loop/pattern, operation/logic, input/array, and integrated drawing types; each question includes an answer, explanation, and knowledge tag.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/goc-runner.test.mjs`
Expected: PASS with 20 finals practice questions.

### Task 3: Canvas runner and review UI

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `runGoC`, `finalsPracticeTypes`
- Produces: visible canvas output, runner error text, practice navigation, answer reveal, and score progress.

- [ ] **Step 1: Write failing rendered-content test**

```js
assert.match(html, /真实运行画布/);
assert.match(html, /决赛题型复习/);
assert.match(html, /坐标与路径/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because the new sections are absent.

- [ ] **Step 3: Replace decorative preview with Canvas rendering**

Render interpreter operations on a real canvas, surface parser errors, and retain the existing course controls.

- [ ] **Step 4: Add the 5-type practice panel**

Render one question at a time, selectable answers, answer explanations, and a type progress indicator.

- [ ] **Step 5: Run full verification**

Run: `npm test && npm run lint`
Expected: all tests pass and lint contains no errors.
