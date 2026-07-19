"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { finalsPracticeTypes } from "./lib/finals-practice.mjs";
import { runGoC } from "./lib/goc-runner.mjs";

type Lesson = { id: number; title: string; focus: string; code: string; color: string };
type Point = { x: number; y: number };
type DrawOperation = {
  kind: string;
  color?: number;
  size?: number;
  from?: Point;
  to?: Point;
  center?: Point;
  at?: Point;
  radius?: number;
  rx?: number;
  ry?: number;
  width?: number;
  height?: number;
  fill?: boolean;
};

const lessons: Lesson[] = [
  { id: 1, title: "移动与方向", focus: "fd / bk / rt / lt", color: "mint", code: "int main(){\n  pen.c(1).size(4);\n  pen.fd(120).rt(90).fd(80);\n  return 0;\n}" },
  { id: 2, title: "形状与状态", focus: "颜色、粗细、抬笔", color: "coral", code: "int main(){\n  pen.c(3).size(6).fd(100);\n  pen.up().fd(50).down();\n  pen.c(1).fd(100);\n  return 0;\n}" },
  { id: 3, title: "循环与正多边形", focus: "for、转角、重复", color: "sun", code: "int main(){\n  pen.c(10).size(4);\n  for(int i=0;i<6;i++){\n    pen.fd(90).rt(60);\n  }\n  return 0;\n}" },
  { id: 4, title: "坐标与路径", focus: "moveTo / lineTo", color: "blue", code: "int main(){\n  pen.up().moveTo(-120,-80).down();\n  pen.lineTo(120,-80).lineTo(0,110).lineTo(-120,-80);\n  return 0;\n}" },
  { id: 5, title: "圆、椭圆与组合", focus: "o / oo / e / ee", color: "violet", code: "int main(){\n  pen.oo(70,10).o(45,1);\n  pen.up().moveTo(140,0).down().ee(55,25,14);\n  return 0;\n}" },
  { id: 6, title: "数据与综合题", focus: "数组、数位、输入", color: "pink", code: "// 本课进入考试输入区：\n// 先在下方题型复习完成数组与数位练习。\npen.fd(100);" },
];

const finalsTasks = [
  ["01", "方形斜拉线", "循环改变底边端点，形成等距斜线"],
  ["02", "三色会徽", "三组10条射线，90°扇形 + 30°间隔"],
  ["03", "圆与外接矩形", "输入半径序列，统计直径和与最大直径"],
  ["04", "木棉烟花", "坐标定位、5瓣旋转、椭圆与渐变花蕊"],
  ["05", "星型改环型", "保存设备坐标，依次连线并回到首点"],
  ["06", "多彩灯饰", "4位数数位提取，颜色控制和环形布局"],
];

const palette = ["#1e293b", "#ef5d5d", "#4389df", "#31a976", "#23b5bc", "#9874dc", "#c7774a", "#d1b138", "#7c8799", "#f078ac", "#48aa56", "#7561b6", "#19a5a5", "#f2c43d", "#ef8d45", "#ffffff"];

function toCanvasPoint(point: { x: number; y: number }) {
  return { x: 320 + point.x * 0.62, y: 210 - point.y * 0.62 };
}

function paintCanvas(canvas: HTMLCanvasElement, operations: DrawOperation[]) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#dce3e7";
  context.lineWidth = 1;
  for (let axis = 20; axis < canvas.width; axis += 20) { context.beginPath(); context.moveTo(axis, 0); context.lineTo(axis, canvas.height); context.stroke(); }
  for (let axis = 10; axis < canvas.height; axis += 20) { context.beginPath(); context.moveTo(0, axis); context.lineTo(canvas.width, axis); context.stroke(); }
  context.strokeStyle = "#bac8cf";
  context.beginPath(); context.moveTo(0, 210); context.lineTo(640, 210); context.moveTo(320, 0); context.lineTo(320, 420); context.stroke();

  operations.forEach((operation) => {
    const color = palette[operation.color ?? 2] ?? palette[2];
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = Math.max(1, operation.size ?? 1);
    if (operation.kind === "line") {
      const from = toCanvasPoint(operation.from ?? { x: 0, y: 0 }); const to = toCanvasPoint(operation.to ?? { x: 0, y: 0 });
      context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); context.stroke();
    }
    if (operation.kind === "circle") {
      const center = toCanvasPoint(operation.center ?? { x: 0, y: 0 }); context.beginPath(); context.arc(center.x, center.y, (operation.radius ?? 0) * 0.62, 0, Math.PI * 2); if (operation.fill) context.fill(); else context.stroke();
    }
    if (operation.kind === "ellipse") {
      const center = toCanvasPoint(operation.center ?? { x: 0, y: 0 }); context.beginPath(); context.ellipse(center.x, center.y, (operation.rx ?? 0) * 0.62, (operation.ry ?? 0) * 0.62, 0, 0, Math.PI * 2); if (operation.fill) context.fill(); else context.stroke();
    }
    if (operation.kind === "rect") {
      const at = toCanvasPoint(operation.at ?? { x: 0, y: 0 }); const width = (operation.width ?? 0) * 0.62; const height = (operation.height ?? 0) * 0.62; if (operation.fill) context.fillRect(at.x, at.y - height, width, height); else context.strokeRect(at.x, at.y - height, width, height);
    }
  });
}

export default function Home() {
  const [activeLesson, setActiveLesson] = useState(lessons[0]);
  const [code, setCode] = useState(lessons[0].code);
  const [result, setResult] = useState(() => runGoC(lessons[0].code));
  const [typeIndex, setTypeIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeType = finalsPracticeTypes[typeIndex];
  const question = activeType.questions[questionIndex];
  const answeredCount = completed.length;
  const correct = revealed && selected === question.answer;

  useEffect(() => { if (canvasRef.current) paintCanvas(canvasRef.current, result.operations); }, [result]);

  const runnerStatus = useMemo(() => result.error ? `未运行：${result.error}` : `已执行 ${result.operations.length} 个绘图动作`, [result]);

  function chooseLesson(lesson: Lesson) {
    setActiveLesson(lesson); setCode(lesson.code); setResult(runGoC(lesson.code));
  }

  function runCode() { setResult(runGoC(code)); }

  function chooseType(index: number) { setTypeIndex(index); setQuestionIndex(0); setSelected(""); setRevealed(false); }

  function revealAnswer(answer: string) { setSelected(answer); setRevealed(true); if (answer === question.answer && !completed.includes(typeIndex * 10 + questionIndex)) setCompleted((items) => [...items, typeIndex * 10 + questionIndex]); }

  function nextQuestion() { setQuestionIndex((questionIndex + 1) % activeType.questions.length); setSelected(""); setRevealed(false); }

  return <main className="exam-shell">
    <nav className="topbar"><div className="brand"><span>✦</span>魔法画笔 <small>提高组决赛备赛站</small></div><div className="exam-score"><b>横琴决赛路线</b><span>20单选 + 6编程</span></div></nav>

    <section className="hero"><div><p className="eyebrow">GO C FINAL PREP · 150 MINUTES</p><h1>每一次运行，<em>都真的画出来。</em></h1><p>根据横琴比赛决赛题优化：先建立画笔与数据能力，再按题型复习，最后挑战六道综合绘图题。</p><div className="hero-pills"><span>真实 Canvas 运行</span><span>5类题型 · 20道样题</span><span>6道决赛编程路线</span></div></div><div className="hero-score"><strong>{answeredCount}</strong><span>已答对样题</span><div className="score-line"><i style={{ width: `${(answeredCount / 20) * 100}%` }} /></div><small>每道题答对后点亮一格</small></div></section>

    <section className="route-section"><div className="section-heading"><div><p className="eyebrow">LEARN → REVIEW → SIMULATE</p><h2>决赛能力路线</h2></div><p>前5站按考题高频能力排列；第6站进入输入、数组与综合题。</p></div><div className="route-grid">{lessons.map((lesson) => <button key={lesson.id} className={`route-card ${lesson.color} ${activeLesson.id === lesson.id ? "selected" : ""}`} onClick={() => chooseLesson(lesson)}><span>0{lesson.id}</span><strong>{lesson.title}</strong><small>{lesson.focus}</small><b>{activeLesson.id === lesson.id ? "正在学习" : "打开画布"}</b></button>)}</div></section>

    <section className="runner-section" aria-label="真实运行画布"><div className="section-heading"><div><p className="eyebrow">SAFE GOC SUBSET RUNNER</p><h2>真实运行画布</h2></div><p>支持常用笔命令、变量、算术表达式和基础 <code>for</code>；不支持的语句会明确报错。</p></div><div className="runner-grid"><div className="editor-card"><div className="editor-header"><span><i/><i/><i/></span><b>{activeLesson.title}.goc</b><button onClick={() => navigator.clipboard?.writeText(code)}>复制</button></div><textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" aria-label="GoC代码编辑器"/><div className="runner-actions"><button className="run-button" onClick={runCode}>▶ 真实运行</button><span className={result.error ? "runner-error" : "runner-ok"}>{runnerStatus}</span></div></div><div className="canvas-card"><div className="canvas-header"><b>画布输出</b><span>{result.error ? "需要修正代码" : "坐标中心：0,0"}</span></div><canvas ref={canvasRef} width="640" height="420" aria-label="GoC真实绘图结果"/><p>{result.error ? "提示：运行器不会假装成功。请根据错误说明修改为支持的教学命令。" : "提示：修改左侧代码后，点击“真实运行”即可重绘。"}</p></div></div></section>

    <section className="review-section"><div className="section-heading"><div><p className="eyebrow">FINALS QUESTION BANK</p><h2>决赛题型复习</h2></div><p>每类4题，覆盖决赛卷中的选择题知识点，并将答案转化为可复习的规则。</p></div><div className="review-layout"><div className="type-list">{finalsPracticeTypes.map((type, index) => <button key={type.id} className={`type-button ${type.color} ${index === typeIndex ? "selected" : ""}`} onClick={() => chooseType(index)}><span>0{index + 1}</span><div><strong>{type.title}</strong><small>{type.focus}</small></div><b>4题</b></button>)}</div><article className="question-card"><div className="question-meta"><span className={`tag ${activeType.color}`}>{question.tag}</span><span>第 {questionIndex + 1} / 4 题</span></div><h3>{question.prompt}</h3><div className="options">{question.options.map((option) => <button key={option} className={`${selected === option ? "picked" : ""} ${revealed && option === question.answer ? "right" : ""} ${revealed && selected === option && option !== question.answer ? "wrong" : ""}`} onClick={() => !revealed && setSelected(option)}><span>{String.fromCharCode(65 + question.options.indexOf(option))}</span>{option}</button>)}</div>{revealed ? <div className={`answer-box ${correct ? "correct" : "incorrect"}`}><strong>{correct ? "答对了！" : `正确答案：${question.answer}`}</strong><p>{question.explanation}</p></div> : <p className="question-tip">先独立选择，再查看解析。答错不是扣分，而是告诉我们下一步该复习什么。</p>}<div className="question-actions"><button className="outline-button" onClick={() => { setSelected(""); setRevealed(false); }}>重做</button><button className="answer-button" disabled={!selected || revealed} onClick={() => revealAnswer(selected)}>查看解析</button>{revealed && <button className="next-button" onClick={nextQuestion}>下一题 →</button>}</div></article></div></section>

    <section className="program-section"><div className="section-heading"><div><p className="eyebrow">SIX PROGRAMMING PROBLEMS</p><h2>决赛程序题冲刺卡</h2></div><p>把原卷6道编程题拆成明确的建模任务；先完成对应题型复习，再独立写程序。</p></div><div className="program-grid">{finalsTasks.map(([number, title, hint]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{hint}</p><button onClick={() => document.querySelector(".runner-section")?.scrollIntoView({ behavior: "smooth" })}>去画布试写 →</button></article>)}</div></section>

    <footer><span>✦ GoC 提高组决赛备赛</span><span>真实运行范围会在画布区明示；完整 WebGoC 以官方编辑器为准。</span></footer>
  </main>;
}
