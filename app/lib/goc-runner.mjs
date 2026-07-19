const MAX_STEPS = 5000;

function error(message) {
  return { operations: [], error: message };
}

function stripComments(source) {
  return source.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function findMatch(source, start, open, close) {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === open) depth += 1;
    if (source[index] === close) depth -= 1;
    if (depth === 0) return index;
  }
  return -1;
}

function readStatement(source, start) {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth -= 1;
    if (char === ";" && depth === 0) return { text: source.slice(start, index), end: index + 1 };
  }
  return { text: source.slice(start), end: source.length };
}

function tokenizeExpression(expression) {
  const tokens = expression.match(/\d+(?:\.\d+)?|[A-Za-z_]\w*|==|!=|<=|>=|&&|\|\||[()+\-*/%<>!]/g);
  if (!tokens || tokens.join("") !== expression.replace(/\s+/g, "")) throw new Error("表达式包含暂不支持的字符");
  return tokens;
}

function evaluateExpression(expression, variables) {
  const tokens = tokenizeExpression(expression.trim());
  let position = 0;
  const peek = () => tokens[position];
  const consume = () => tokens[position++];
  const numberOrVariable = () => {
    const token = consume();
    if (token === "(") {
      const value = logicalOr();
      if (consume() !== ")") throw new Error("缺少右括号");
      return value;
    }
    if (token === "+") return numberOrVariable();
    if (token === "-") return -numberOrVariable();
    if (token === "!") return numberOrVariable() ? 0 : 1;
    if (/^\d/.test(token)) return Number(token);
    if (/^[A-Za-z_]/.test(token)) {
      if (!(token in variables)) throw new Error(`变量 ${token} 尚未定义`);
      return variables[token];
    }
    throw new Error("表达式不完整");
  };
  const multiply = () => {
    let value = numberOrVariable();
    while (["*", "/", "%"].includes(peek())) {
      const operator = consume();
      const right = numberOrVariable();
      if (operator === "*") value *= right;
      if (operator === "/") value /= right;
      if (operator === "%") value %= right;
    }
    return value;
  };
  const add = () => {
    let value = multiply();
    while (["+", "-"].includes(peek())) {
      const operator = consume();
      const right = multiply();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };
  const compare = () => {
    let value = add();
    while (["<", ">", "<=", ">=", "==", "!="].includes(peek())) {
      const operator = consume();
      const right = add();
      value = Number(({ "<": value < right, ">": value > right, "<=": value <= right, ">=": value >= right, "==": value === right, "!=": value !== right })[operator]);
    }
    return value;
  };
  const logicalAnd = () => {
    let value = compare();
    while (peek() === "&&") value = Number(Boolean(value) && Boolean(consume() && compare()));
    return value;
  };
  const logicalOr = () => {
    let value = logicalAnd();
    while (peek() === "||") value = Number(Boolean(value) || Boolean(consume() && logicalAnd()));
    return value;
  };
  const value = logicalOr();
  if (position !== tokens.length) throw new Error("表达式无法完整解析");
  return value;
}

function splitArguments(source) {
  if (!source.trim()) return [];
  const values = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    if (source[index] === ")") depth -= 1;
    if (source[index] === "," && depth === 0) {
      values.push(source.slice(start, index));
      start = index + 1;
    }
  }
  values.push(source.slice(start));
  return values;
}

function createState() {
  return { x: 0, y: 0, angle: 0, color: 2, size: 1, drawing: true, operations: [], steps: 0 };
}

function addOperation(state, operation) {
  state.steps += 1;
  if (state.steps > MAX_STEPS) throw new Error("程序步骤过多，请缩小循环次数后再试");
  state.operations.push(operation);
}

function forward(state, distance) {
  const from = { x: state.x, y: state.y };
  state.x += Math.cos((state.angle * Math.PI) / 180) * distance;
  state.y += Math.sin((state.angle * Math.PI) / 180) * distance;
  const to = { x: state.x, y: state.y };
  if (state.drawing) addOperation(state, { kind: "line", from, to, color: state.color, size: state.size });
  else addOperation(state, { kind: "move", to });
}

function runPenChain(statement, state, variables) {
  const chain = statement.trim().replace(/^(?:pen|p)\s*\./, "");
  const matcher = /(\w+)\s*\(([^()]*)\)\s*(?:\.\s*|$)/g;
  let matchedLength = 0;
  let match;
  while ((match = matcher.exec(chain))) {
    matchedLength = matcher.lastIndex;
    const [, command, rawArguments] = match;
    const args = splitArguments(rawArguments).map((argument) => evaluateExpression(argument, variables));
    if (command === "fd") forward(state, args[0]);
    else if (command === "bk") forward(state, -args[0]);
    else if (command === "rt") { state.angle += args[0]; addOperation(state, { kind: "turn", angle: state.angle }); }
    else if (command === "lt") { state.angle -= args[0]; addOperation(state, { kind: "turn", angle: state.angle }); }
    else if (command === "c" || command === "color") { state.color = args[0]; addOperation(state, { kind: "color", color: state.color }); }
    else if (command === "size") { state.size = args[0]; addOperation(state, { kind: "size", size: state.size }); }
    else if (command === "up") { state.drawing = false; addOperation(state, { kind: "pen", drawing: false }); }
    else if (command === "down") { state.drawing = true; addOperation(state, { kind: "pen", drawing: true }); }
    else if (command === "moveTo") { state.x = args[0]; state.y = args[1]; addOperation(state, { kind: "move", to: { x: state.x, y: state.y } }); }
    else if (command === "lineTo") { const from = { x: state.x, y: state.y }; state.x = args[0]; state.y = args[1]; addOperation(state, { kind: "line", from, to: { x: state.x, y: state.y }, color: state.color, size: state.size }); }
    else if (["o", "oo"].includes(command)) addOperation(state, { kind: "circle", center: { x: state.x, y: state.y }, radius: args[0], color: args[1] ?? state.color, fill: command === "oo", size: state.size });
    else if (["e", "ee"].includes(command)) addOperation(state, { kind: "ellipse", center: { x: state.x, y: state.y }, rx: args[0], ry: args[1], color: args[2] ?? state.color, fill: command === "ee", size: state.size });
    else if (["r", "rr"].includes(command)) addOperation(state, { kind: "rect", at: { x: state.x, y: state.y }, width: args[0], height: args[1], color: args[2] ?? state.color, fill: command === "rr", size: state.size });
    else if (["show", "hide", "speed", "picU", "pic"].includes(command)) addOperation(state, { kind: "note", command });
    else throw new Error(`命令 ${command} 暂不支持`);
  }
  if (!matchedLength || chain.slice(matchedLength).trim()) throw new Error("绘图命令格式无法识别");
}

function executeStatement(statement, state, variables) {
  const trimmed = statement.trim();
  if (!trimmed || trimmed === "return 0" || trimmed === "return") return;
  const declaration = trimmed.match(/^(?:int|double)\s+([A-Za-z_]\w*)\s*(?:=\s*(.+))?$/);
  if (declaration) { variables[declaration[1]] = declaration[2] ? evaluateExpression(declaration[2], variables) : 0; return; }
  const increment = trimmed.match(/^([A-Za-z_]\w*)\s*(\+\+|--|\+=|-=)\s*(.*)$/);
  if (increment) { const [, name, operator, raw] = increment; if (!(name in variables)) throw new Error(`变量 ${name} 尚未定义`); const amount = raw ? evaluateExpression(raw, variables) : 1; variables[name] += operator === "++" || operator === "+=" ? amount : -amount; return; }
  const assignment = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
  if (assignment) { variables[assignment[1]] = evaluateExpression(assignment[2], variables); return; }
  if (/^(?:pen|p)\s*\./.test(trimmed)) { runPenChain(trimmed, state, variables); return; }
  if (/^(?:cout|cin|showXY|pause)\b/.test(trimmed)) throw new Error("输入、输出与坐标辅助命令请在题目练习区学习；画布运行器暂不支持");
  throw new Error("暂不支持这条语句，请使用示例中的 GoC 绘图命令");
}

function readBody(source, start) {
  let cursor = start;
  while (/\s/.test(source[cursor] ?? "")) cursor += 1;
  if (source[cursor] === "{") { const end = findMatch(source, cursor, "{", "}"); if (end < 0) throw new Error("循环体缺少右大括号"); return { body: source.slice(cursor + 1, end), end: end + 1 }; }
  const statement = readStatement(source, cursor);
  return { body: statement.text, end: statement.end };
}

function executeBlock(source, state, variables) {
  let cursor = 0;
  while (cursor < source.length) {
    while (/\s|;/.test(source[cursor] ?? "")) cursor += 1;
    if (cursor >= source.length) break;
    if (source.startsWith("for", cursor) && /\s|\(/.test(source[cursor + 3] ?? "")) {
      const parenStart = source.indexOf("(", cursor + 3);
      const parenEnd = findMatch(source, parenStart, "(", ")");
      if (parenStart < 0 || parenEnd < 0) throw new Error("for 循环格式不完整");
      const [init, condition, update] = splitArguments(source.slice(parenStart + 1, parenEnd).replace(/;/g, ","));
      if (!init || !condition || !update) throw new Error("for 循环需要初始化、条件和变化三部分");
      const body = readBody(source, parenEnd + 1);
      executeStatement(init, state, variables);
      let guard = 0;
      while (evaluateExpression(condition, variables)) {
        if (guard++ > MAX_STEPS) throw new Error("循环次数过多，请检查循环条件");
        executeBlock(body.body, state, variables);
        executeStatement(update, state, variables);
      }
      cursor = body.end;
      continue;
    }
    if (source.startsWith("int main", cursor)) {
      const open = source.indexOf("{", cursor);
      const close = findMatch(source, open, "{", "}");
      if (open < 0 || close < 0) throw new Error("main 函数缺少大括号");
      executeBlock(source.slice(open + 1, close), state, variables);
      cursor = close + 1;
      continue;
    }
    const statement = readStatement(source, cursor);
    executeStatement(statement.text, state, variables);
    cursor = statement.end;
  }
}

export function runGoC(source) {
  try {
    const state = createState();
    executeBlock(stripComments(source), state, {});
    return { operations: state.operations, error: null };
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "运行失败");
  }
}
