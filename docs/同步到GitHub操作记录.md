# 同步到 GitHub 操作记录

- 同步目标：`https://github.com/superobk/GoC-Tutorials`
- 本地项目：`/Users/bou/Workspace/Viber/GoC-Winner/site`
- 操作日期：2026-07-19（Asia/Shanghai）
- 署名身份：`superobk <superobk@users.noreply.github.com>`（仅本仓库设置）
- 安全说明：本记录不会写入 token、密码或任何认证请求头。

## 已实际执行的终端指令

```sh
git -C site status --short --branch
git -C site log --oneline -3
gh --version
gh auth status
gh repo view superobk/GoC-Tutorials --json nameWithOwner,url,defaultBranchRef,isPrivate
ssh -T -o BatchMode=yes -o ConnectTimeout=8 git@github.com
git ls-remote git@github.com:superobk/GoC-Tutorials.git
git ls-remote https://github.com/superobk/GoC-Tutorials.git
git -C site config user.name "superobk"
git -C site config user.email "superobk@users.noreply.github.com"
git -C site config --get user.name
git -C site config --get user.email
git -C site add docs/同步到GitHub操作记录.md
git -C site commit -m "docs: record GitHub sync attempts"
git -C site status --short --branch
git -C site remote -v
git -C site remote add github https://github.com/superobk/GoC-Tutorials.git
git -C site remote -v
git -C site push -u github main
git -C site add docs/同步到GitHub操作记录.md
git -C site commit -m "docs: record completed GitHub sync"
git -C site push
git -C site ls-remote --heads github main
```

## 结果摘要

1. 本地分支为 `main`，工作区干净；待同步的最新功能提交为 `a342f69 feat: add finals practice and real GoC runner`。
2. `gh` 保存的 `superobk` token 已失效，因此无法用 GitHub CLI 读取仓库元数据或写入远端。
3. SSH 到 GitHub 未建立可用会话；HTTPS 只读检查成功且没有任何输出，说明目标仓库目前没有 refs（空仓库）。
4. 已将当前项目的本地 Git 提交署名设置为 `superobk <superobk@users.noreply.github.com>`。
5. 已请求执行下列外部写入操作，但安全网关要求在说明“将本地网站源码导出至第三方 GitHub 仓库”的风险后再次确认，因此命令**未执行**，远端仓库没有任何改动：

   ```sh
   git -C site remote add github https://github.com/superobk/GoC-Tutorials.git
   git -C site remote -v
   git -C site push -u github main
   ```
6. 用户已明确确认导出范围后，成功新增本地 `github` 远端并执行普通推送：

   ```text
   To https://github.com/superobk/GoC-Tutorials.git
    * [new branch]      main -> main
   branch 'main' set up to track 'github/main'.
   ```

   推送没有使用 `--force`；远端 `main` 已包含课程网站、GoC 真实运行器、决赛题型练习与本操作记录。

## 待认证恢复后执行的指令

请先完成 GitHub 登录（浏览器授权或粘贴新 token），然后在本目录运行：

```sh
cd /Users/bou/Workspace/Viber/GoC-Winner/site
gh auth login -h github.com -w
gh auth status
git remote add github https://github.com/superobk/GoC-Tutorials.git
git push -u github main
```

这些指令会将当前 `main` 完整推送到空的 `superobk/GoC-Tutorials` 仓库；不会使用强制推送。

## 2026-07-19：Windows 启动器改为打开本地地址

### 改动范围

- 修改 `启动GoC课程站.bat`：不再打开私有云端预览地址。
- 启动本地 `npm run dev` 后，从输出日志识别 Vinext 实际提供的 `Local:` 地址并打开；因此端口 3000 被占用时，仍能打开自动切换后的本地地址。
- 保留“先尝试 `git pull --ff-only`，失败不阻止启动”的行为。

### 本次实际操作

文件改动使用 `apply_patch` 完成；终端中执行并核验的指令如下（不含凭据）：

```sh
sed -n '1,260p' 启动GoC课程站.bat
rg -n -- "git pull --ff-only|npm run dev|Local:|CLOUD_PREVIEW_URL|start" 启动GoC课程站.bat
git add 启动GoC课程站.bat docs/同步到GitHub操作记录.md
git commit -m "fix: open local URL from Windows launcher"
git push
git status --short --branch
```

### 结果

- 启动器只会打开本地课程站地址；不再打开私有云端预览。
- 本次提交会以普通 `git push` 同步到 `superobk/GoC-Tutorials`，不使用强制推送。

## 2026-07-19：Windows 本地测试站启动修复

### 原因与改动

旧版通过后台日志推断开发端口，日志未及时写入时会错误回退到 3000，导致浏览器可能在服务未启动或端口已变更时打开。本次改为：

1. 用 PowerShell 在 3000–3999 中选择未监听的端口；
2. 使用固定端口启动 `npm run dev -- --host 127.0.0.1 --port <端口> --strictPort`；
3. 保持新的“GoC 本地课程站”命令窗口运行；
4. 轮询本地 HTTP 响应，确认测试站可访问后才打开浏览器。

### 本次实际操作

文件改动使用 `apply_patch` 完成；终端中执行并核验的指令如下（不含凭据）：

```sh
sed -n '1,260p' 启动GoC课程站.bat
rg -n -- "LOCAL_PORT|LOCAL_URL|strictPort|Invoke-WebRequest|git pull --ff-only|CLOUD_PREVIEW_URL" 启动GoC课程站.bat
git diff --check
git add 启动GoC课程站.bat docs/同步到GitHub操作记录.md
git commit -m "fix: keep Windows local dev server running"
git push
git status --short --branch
```

### 结果

- 服务未确认可访问前，启动器不会再错误打开默认 3000 地址。
- `npm run dev` 在独立的 `cmd /k` 窗口内持续运行，只有用户关闭该窗口才会停止。

## 2026-07-19：修复 Windows 的 npm 环境变量错误

### 原因与改动

Windows `cmd` 不支持 macOS/Linux 形式的行内环境变量，例如：

```text
WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext dev
```

因此 Windows 执行 `npm run dev` 时会把 `WRANGLER_LOG_PATH` 误当作命令。本次把 `dev`、`build`、`start` 改为直接执行 `vinext`，不再依赖 Unix 环境变量前缀。

### 本次实际操作

文件改动使用 `apply_patch` 完成；终端中执行并核验的指令如下（不含凭据）：

```sh
sed -n '1,180p' package.json
sed -n '38,72p' 启动GoC课程站.bat
rg -n -- "WRANGLER_LOG_PATH|npm run dev" package.json 启动GoC课程站.bat tests
node --test tests/windows-launcher.test.mjs
npm test
npm run lint
git add package.json tests/windows-launcher.test.mjs docs/同步到GitHub操作记录.md
git commit -m "fix: support Windows npm scripts"
git push
git status --short --branch
```

### 结果

- Windows 双击启动器时，`npm run dev` 不会再报“`WRANGLER_LOG_PATH` is not recognized”。
- 新增自动检查，防止未来重新加入 Unix 专用的脚本前缀。

## 2026-07-19：修复 Windows 端口值为 `+`

### 原因与改动

上一版在批处理的嵌套 PowerShell 命令中使用管道符。Windows 对该嵌套管道的转义会产生 PowerShell 错误定位文本，批处理随后把其中的 `+` 误作端口，导致 `vinext --port +` 失败。

本次改为无管道的 PowerShell `while` 循环选择空闲端口，并用 `findstr` 仅接受纯数字端口；不符合要求的值会被清空后回退为 3000，绝不会再传递 `+` 给 Vinext。

### 本次实际操作

文件改动使用 `apply_patch` 完成；终端中执行并核验的指令如下（不含凭据）：

```sh
sed -n '38,68p' 启动GoC课程站.bat
sed -n '1,220p' tests/windows-launcher.test.mjs
rg -n -- "LOCAL_PORT|3000\.\.3999|\^\||strictPort" 启动GoC课程站.bat tests/windows-launcher.test.mjs
node --test tests/windows-launcher.test.mjs
npm test
npm run lint
git diff --check
git add 启动GoC课程站.bat tests/windows-launcher.test.mjs docs/同步到GitHub操作记录.md
git commit -m "fix: validate Windows local port"
git push
git status --short --branch
```

### 结果

- `vinext` 只能收到例如 `3000` 的纯数字端口，不会再收到 `+`。
- 新增回归检查：禁止端口选择使用嵌套 PowerShell 管道，并要求有数字端口校验。
