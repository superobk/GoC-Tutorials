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
