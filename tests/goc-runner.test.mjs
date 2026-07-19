import assert from "node:assert/strict";
import test from "node:test";

import { finalsPracticeTypes } from "../app/lib/finals-practice.mjs";
import { runGoC } from "../app/lib/goc-runner.mjs";

test("executes chained movement as drawing operations", () => {
  const result = runGoC("pen.fd(100).rt(90).fd(50);");
  assert.equal(result.error, null);
  assert.deepEqual(result.operations.map((operation) => operation.kind), ["line", "turn", "line"]);
  assert.deepEqual(result.operations[0].to, { x: 100, y: 0 });
  assert.deepEqual(result.operations[2].to, { x: 100, y: 50 });
});

test("executes a bounded for loop with a loop variable", () => {
  const result = runGoC("for(int i=0;i<4;i++) pen.fd(10).rt(90);");
  assert.equal(result.error, null);
  assert.equal(result.operations.filter((operation) => operation.kind === "line").length, 4);
  assert.equal(result.operations.filter((operation) => operation.kind === "turn").length, 4);
});

test("returns an explicit error for unsupported syntax", () => {
  const result = runGoC("while(true){pen.fd(10);}");
  assert.match(result.error ?? "", /暂不支持/);
});

test("ships exactly four examples for every finals question type", () => {
  assert.equal(finalsPracticeTypes.length, 5);
  assert.ok(finalsPracticeTypes.every((type) => type.questions.length === 4));
  assert.ok(finalsPracticeTypes.every((type) => type.questions.every((question) => question.answer && question.explanation && question.tag)));
});
