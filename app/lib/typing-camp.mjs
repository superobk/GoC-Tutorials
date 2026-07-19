const warmupLevels = [
  ["pen", "拿起魔法画笔", "pen", "pen.fd(70);"],
  ["fd", "让画笔向前走一小步", "fd", "pen.fd(70);"],
  ["bk", "让画笔向后退一小步", "bk", "pen.bk(70);"],
  ["rt", "让画笔向右转弯", "rt", "pen.fd(50).rt(90).fd(50);"],
  ["lt", "让画笔向左转弯", "lt", "pen.fd(50).lt(90).fd(50);"],
  ["c", "给画笔换一种颜色", "c", "pen.c(3).fd(80);"],
  ["up", "把画笔抬起来", "up", "pen.up().fd(60).down().fd(60);"],
  ["down", "让抬起的画笔重新落下", "down", "pen.up().fd(60).down().fd(60);"],
  ["moveTo", "抬笔后移动到指定坐标", "moveTo", "pen.up().moveTo(100,50).down().fd(70);"],
  ["lineTo", "从当前位置连到新坐标", "lineTo", "pen.lineTo(100,50);"],
  ["o", "画一个空心圆", "o", "pen.o(45);"],
  ["r", "画一个空心长方形", "r", "pen.r(90,60);"],
  ["for", "让画笔重复执行动作", "for", "for(int i=0;i<4;i++){ pen.fd(60).rt(90); }"],
];

const challengeLevels = [
  ["pen", "准备向前走 70 格", "pen.fd(70);", "pen.fd(70);"],
  ["fd", "向前走 100 格", "fd(100);", "pen.fd(100);"],
  ["bk", "向后退 80 格", "bk(80);", "pen.bk(80);"],
  ["rt", "向右转 90 度", "rt(90);", "pen.fd(60).rt(90).fd(60);"],
  ["lt", "向左转 90 度", "lt(90);", "pen.fd(60).lt(90).fd(60);"],
  ["c", "把颜色换成第 3 号", "c(3);", "pen.c(3).fd(80);"],
  ["up", "把画笔抬起来", "up();", "pen.up().fd(60).down().fd(60);"],
  ["down", "让画笔重新落下", "down();", "pen.up().fd(60).down().fd(60);"],
  ["moveTo", "移动到坐标 (80,50)", "moveTo(80,50);", "pen.up().moveTo(80,50).down().fd(70);"],
  ["lineTo", "连到坐标 (100,50)", "lineTo(100,50);", "pen.lineTo(100,50);"],
  ["o", "画半径为 45 的圆", "o(45);", "pen.o(45);"],
  ["r", "画宽 90、高 60 的长方形", "r(90,60);", "pen.r(90,60);"],
  ["for", "输入重复画正方形的循环头", "for(i=0;i<4;i++)", "int i; for(i=0;i<4;i++){ pen.fd(60).rt(90); }"],
];

function makeLevels(mode, levels) {
  return levels.map(([command, prompt, answer, previewCode]) => ({
    id: `${command}-${mode === "warmup" ? "name" : "full"}`,
    mode,
    command,
    prompt,
    answer,
    previewCode,
  }));
}

export const typingLevels = [...makeLevels("warmup", warmupLevels), ...makeLevels("challenge", challengeLevels)];

export function checkTypingAnswer(level, rawInput) {
  const input = String(rawInput ?? "").trim();
  const expected = level.answer;
  if (input === expected) return { correct: true, hint: "答对了！画笔准备出发。" };

  for (let index = 0; index < input.length; index += 1) {
    if (input[index] !== expected[index]) return { correct: false, hint: `第 ${index + 1} 个字符应为：${expected[index]}` };
  }
  return { correct: false, hint: `还缺少：${expected.slice(input.length, input.length + 1)}` };
}

export function updateTypingStats(stats, correct) {
  const answered = stats.answered + 1;
  const streak = correct ? stats.streak + 1 : 0;
  return {
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    answered,
    correct: stats.correct + (correct ? 1 : 0),
  };
}
