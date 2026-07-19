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
