"use client";

import { useMemo, useState } from "react";

type Lesson = {
  id: number;
  badge: string;
  title: string;
  quest: string;
  skill: string;
  color: string;
  code: string;
  basic: string;
  challenge: string;
  creative: string;
};

const lessons: Lesson[] = [
  { id: 1, badge: "方向徽章", title: "画笔醒来了", quest: "让 Pen 画出回家的路", skill: "程序、前进、后退", color: "mint", code: "int main(){\n  pen.show();\n  pen.fd(120);\n  pen.bk(60);\n  return 0;\n}", basic: "画一条 100 像素的路", challenge: "画出长-短-长的探险脚印", creative: "给路线取一个神奇名字" },
  { id: 2, badge: "转弯徽章", title: "方向魔法", quest: "修复方形城门", skill: "右转、左转、角度", color: "coral", code: "int main(){\n  pen.c(1);\n  pen.size(6);\n  for(int i=0; i<4; i=i+1){\n    pen.fd(100).rt(90);\n  }\n  return 0;\n}", basic: "完成一个正方形", challenge: "把右转换成左转", creative: "设计一个歪歪的城门" },
  { id: 3, badge: "彩虹徽章", title: "彩色画笔", quest: "为探险队制作彩虹旗", skill: "颜色、粗细、状态", color: "sun", code: "int main(){\n  pen.c(1); pen.size(4); pen.fd(120);\n  pen.c(3); pen.size(8); pen.fd(120);\n  pen.c(2); pen.size(12); pen.fd(120);\n  return 0;\n}", basic: "画三条不同颜色的线", challenge: "画一个双色十字", creative: "做一支心情温度计" },
  { id: 4, badge: "形状徽章", title: "形状工厂", quest: "搭建图形王国的房子", skill: "空心矩形、实心矩形", color: "blue", code: "int main(){\n  pen.r(300,180,3);\n  pen.up(); pen.fd(80); pen.down();\n  pen.rr(120,90,1);\n  return 0;\n}", basic: "画绿色空心矩形", challenge: "用实心矩形拼红色十字", creative: "设计一个机器人房子" },
  { id: 5, badge: "隐形桥徽章", title: "隐藏的桥", quest: "飞过河面，不在水上留墨", skill: "抬笔、落笔、移动", color: "violet", code: "int main(){\n  pen.c(2); pen.size(6);\n  pen.fd(100);\n  pen.up(); pen.fd(80);\n  pen.down(); pen.fd(100);\n  return 0;\n}", basic: "画两条不相连的线", challenge: "用抬笔写一个彩色‘三’", creative: "画一个星球轨道" },
  { id: 6, badge: "圆滚滚徽章", title: "圆滚滚的朋友", quest: "给机器人装上眼睛和轮子", skill: "圆、实心圆、椭圆", color: "pink", code: "int main(){\n  pen.oo(80,10);\n  pen.oo(55,7);\n  pen.oo(30,1);\n  pen.e(100,45,4);\n  return 0;\n}", basic: "画三个套在一起的圆", challenge: "画一张机器人脸", creative: "设计一个外星宠物" },
  { id: 7, badge: "循环徽章", title: "重复按钮", quest: "一次写好，造出四面城墙", skill: "for 循环", color: "mint", code: "int main(){\n  pen.c(10); pen.size(8);\n  for(int i=0; i<4; i=i+1){\n    pen.fd(100).rt(90);\n  }\n  return 0;\n}", basic: "用循环画正方形", challenge: "画一个正18边形", creative: "把4改成12，看它变圆" },
  { id: 8, badge: "变量徽章", title: "数字小仓库", quest: "让城门可以变大变小", skill: "int、赋值、变量", color: "coral", code: "int main(){\n  int side = 120;\n  for(int i=0; i<4; i=i+1){\n    pen.fd(side).rt(90);\n  }\n  return 0;\n}", basic: "把 side 改成80和160", challenge: "用 n 表示边数", creative: "一套代码画小门和大城堡" },
  { id: 9, badge: "万花尺徽章", title: "旋转花园", quest: "让花瓣围着花心排队", skill: "循环变量、旋转", color: "sun", code: "int main(){\n  for(int i=1; i<=12; i=i+1){\n    pen.c(i%16);\n    pen.fd(30+i*4).bk(30+i*4);\n    pen.rt(30);\n  }\n  return 0;\n}", basic: "重复画12片花瓣", challenge: "让线段越画越长", creative: "做一把彩色万花尺" },
  { id: 10, badge: "对话徽章", title: "会回答问题的画笔", quest: "让 Pen 问你想画几边形", skill: "cin、cout、输入输出", color: "blue", code: "int n;\ncout << \"请输入边数：\";\ncin >> n;\nfor(int i=0; i<n; i=i+1){\n  pen.fd(60).rt(360/n);\n}", basic: "输入4或6画图", challenge: "输入边长一起控制大小", creative: "让画笔说一句欢迎语" },
  { id: 11, badge: "选择徽章", title: "选择魔法", quest: "晴天画太阳，雨天画雨伞", skill: "if / else", color: "violet", code: "int weather;\ncin >> weather;\nif(weather==1){\n  pen.c(13); pen.oo(50,13);\n}else{\n  pen.c(2); pen.r(100,70,2);\n}", basic: "分别输入1和0", challenge: "画出太阳光线或雨滴", creative: "设计一个心情画笔" },
  { id: 12, badge: "寻宝徽章", title: "坐标寻宝", quest: "找到藏宝图上的宝箱，完成彩虹游乐园", skill: "坐标、综合项目", color: "pink", code: "int main(){\n  showXY();\n  pen.up();\n  pen.moveTo(120,80);\n  pen.down();\n  pen.oo(25,10);\n  return 0;\n}", basic: "完成房子、太阳和树", challenge: "加入旋转木马或多边形城堡", creative: "让输入决定游乐园主题" },
];

const codeLines = (code: string) => code.split("\n");

export default function Home() {
  const [activeId, setActiveId] = useState(1);
  const [completed, setCompleted] = useState<number[]>([1]);
  const [running, setRunning] = useState(false);
  const [level, setLevel] = useState<"basic" | "challenge" | "creative">("basic");
  const [parentMode, setParentMode] = useState(false);
  const [toast, setToast] = useState("欢迎来到魔法画笔王国！");
  const active = lessons[activeId - 1];
  const progress = Math.round((completed.length / lessons.length) * 100);
  const nextLesson = lessons.find((lesson) => !completed.includes(lesson.id));

  const streakText = useMemo(() => completed.length >= 3 ? "连续探险 3 天" : "今天完成 1 个任务就能点亮火花", [completed.length]);

  function runCode() {
    setRunning(true);
    setToast("Pen 出发啦！看看它画出了什么……");
    window.setTimeout(() => {
      setRunning(false);
      setToast("运行成功！你刚刚给电脑下达了一组清晰指令。");
    }, 900);
  }

  function finishLesson() {
    if (!completed.includes(active.id)) setCompleted([...completed, active.id]);
    setToast(`${active.badge} 已收入探险护照！`);
  }

  return (
    <main className="app-shell">
      <nav className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>魔法画笔</span><small>GoC陪读探险站</small></div>
        <div className="top-actions"><span className="streak">🔥 {streakText}</span><button className="parent-toggle" onClick={() => setParentMode(!parentMode)}>{parentMode ? "返回孩子模式" : "家长陪读"}</button><div className="avatar">小画家</div></div>
      </nav>

      <section className="hero-card">
        <div className="hero-copy"><p className="eyebrow">MISSION 01 · 魔法画笔探险队</p><h1>今天，让代码<br /><em>画出一个故事。</em></h1><p className="hero-lead">和 Pen 一起学 GoC：先说清楚想法，再让电脑把它画出来。</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById("lesson-room")?.scrollIntoView({behavior:"smooth"})}>继续探险 <span>→</span></button><span className="tiny-note">适合 7-12 岁 · 三档闯关</span></div></div>
        <div className="hero-art"><img src="/goc-hero.png" alt="魔法画笔 Pen 在图形王国里探险" /><div className="floating-note note-one">今天的任务<br /><strong>修复方形城门</strong></div><div className="floating-note note-two">✦ 2 个新徽章</div></div>
      </section>

      <section className="stats-row"><div><span className="stat-icon mint-icon">✎</span><div><strong>12</strong><small>节探险课</small></div></div><div><span className="stat-icon sun-icon">★</span><div><strong>{completed.length}</strong><small>枚已点亮徽章</small></div></div><div><span className="stat-icon coral-icon">⌁</span><div><strong>{progress}%</strong><small>探险进度</small></div></div><div className="progress-meter"><div className="meter-label"><span>本周探险进度</span><b>{progress}%</b></div><div className="meter"><span style={{width:`${progress}%`}} /></div></div></section>

      <section className="content-grid" id="lesson-room">
        <aside className="course-map panel"><div className="panel-heading"><div><p className="eyebrow">COURSE MAP</p><h2>探险路线</h2></div><span className="map-count">{completed.length}/12</span></div><div className="lesson-list">{lessons.map((lesson) => <button key={lesson.id} className={`lesson-item ${activeId===lesson.id ? "active" : ""} ${completed.includes(lesson.id) ? "done" : ""}`} onClick={() => {setActiveId(lesson.id);setRunning(false);setToast("准备好了吗？先猜猜 Pen 会怎么走。")}}><span className={`lesson-num ${lesson.color}`}>{completed.includes(lesson.id) ? "✓" : String(lesson.id).padStart(2,"0")}</span><span className="lesson-name"><strong>{lesson.title}</strong><small>{lesson.skill}</small></span><span className="lesson-arrow">{activeId===lesson.id ? "●" : "›"}</span></button>)}</div><div className="map-tip"><span>💡</span><p><strong>陪读小提示</strong><br />先问：“你觉得画笔下一步会去哪？”</p></div></aside>

        <section className="lesson-room"><div className="room-topline"><div><p className="eyebrow">TODAY&apos;S QUEST · 第{active.id}课</p><h2>{active.title} <span className={`badge-dot ${active.color}`}>✦</span></h2></div><span className="quest-state">{completed.includes(active.id) ? "已完成 ✓" : "进行中"}</span></div><div className="quest-banner"><span className="quest-emoji">🧭</span><div><small>故事任务</small><strong>{active.quest}</strong></div><span className="sparkle">✦</span></div><div className="explain-card"><div className="pen-avatar">🖌️</div><div><strong>Pen 说：</strong><p>“我不会读心，只会执行清清楚楚的指令。你来当我的队长吧！”</p></div></div><div className="studio-grid"><div className="code-panel"><div className="code-header"><span><i className="dot red"/><i className="dot yellow"/><i className="dot green"/></span><span className="file-name">magic_pen.goc</span><button className="copy-button" onClick={() => {navigator.clipboard?.writeText(active.code);setToast("代码已经复制好啦！")}}>复制代码</button></div><div className="code-body">{codeLines(active.code).map((line,index)=><div className="code-line" key={`${active.id}-${index}`}><span>{index+1}</span><code>{line || " "}</code></div>)}</div><div className="code-footer"><button className="run-button" onClick={runCode}>{running ? "Pen 正在画…" : "▶ 运行画笔"}</button><span>运行前，先预测一下结果</span></div></div><div className={`canvas-panel ${active.color} ${running ? "is-running" : ""}`}><div className="canvas-label"><span>画布预览</span><small>{running ? "正在施展魔法…" : "点击运行看结果"}</small></div><div className="canvas-stage"><div className="canvas-sun"/><div className="canvas-path path-a"/><div className="canvas-path path-b"/><div className="canvas-shape shape-square"/><div className="canvas-shape shape-circle"/><div className="canvas-pen">🖌️</div><span className="canvas-spark spark-a">✦</span><span className="canvas-spark spark-b">✦</span></div><div className="canvas-caption">{running ? "每一行代码，都是 Pen 的一个动作" : "图形会随着你的代码变化"}</div></div></div><div className="challenge-card"><div className="challenge-tabs"><button className={level==="basic" ? "selected" : ""} onClick={() => setLevel("basic")}>基础关 <span>★</span></button><button className={level==="challenge" ? "selected" : ""} onClick={() => setLevel("challenge")}>挑战关 <span>★★</span></button><button className={level==="creative" ? "selected" : ""} onClick={() => setLevel("creative")}>创意关 <span>★★★</span></button></div><div className="challenge-content"><div className="challenge-number">{level==="basic" ? "01" : level==="challenge" ? "02" : "03"}</div><div><p className="eyebrow">{level === "basic" ? "小画家基础关" : level === "challenge" ? "图形侦探挑战关" : "魔法发明家创意关"}</p><h3>{level === "basic" ? active.basic : level === "challenge" ? active.challenge : active.creative}</h3><p className="challenge-hint">完成后告诉陪读伙伴：我改动了哪一个数字？</p></div><button className="finish-button" onClick={finishLesson}>完成这关 ✓</button></div></div></section>

        <aside className="side-column"><div className="passport panel"><div className="panel-heading"><div><p className="eyebrow">MY PASSPORT</p><h2>探险护照</h2></div><span className="passport-star">✦</span></div><div className="passport-hero"><div className="passport-character">🖌️</div><div><strong>小画家学员</strong><p>已收集 {completed.length} 枚徽章</p></div></div><div className="badge-grid">{lessons.slice(0,6).map((lesson) => <div className={`badge ${lesson.color} ${completed.includes(lesson.id) ? "collected" : "locked"}`} key={lesson.id}><span>{completed.includes(lesson.id) ? "✦" : "?"}</span><small>{lesson.badge.replace("徽章","")}</small></div>)}</div><p className="badge-more">完成后 6 课，解锁更多徽章</p></div><div className={`parent-card panel ${parentMode ? "parent-open" : ""}`}><div className="parent-icon">♡</div><div><p className="eyebrow">FOR PARENTS</p><h3>{parentMode ? "陪读任务卡" : "家长陪读"}</h3><p>{parentMode ? "请让孩子先预测结果，再点击运行。不要急着纠正，让他用图形发现答案。" : "不需要会写代码，陪孩子做一件小事就够了。"}</p></div><button onClick={() => setParentMode(!parentMode)}>{parentMode ? "收起" : "打开提示"} →</button></div><div className="next-card"><span>下一站</span><strong>{nextLesson ? `第${nextLesson.id}课 · ${nextLesson.title}` : "彩虹游乐园毕业展"}</strong><button onClick={() => nextLesson && setActiveId(nextLesson.id)}>去看看 →</button></div></aside>
      </section>
      <footer><span>✦ 魔法画笔 GoC 陪读探险站</span><span>代码是给电脑的魔法口令 · 作品没有标准答案</span></footer>
      <div className="toast" aria-live="polite">{toast}</div>
    </main>
  );
}
