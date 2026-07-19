@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "CLOUD_PREVIEW_URL=https://goc-magic-paint.supergragra.chatgpt.site"

echo.
echo ===== GoC 魔法画笔课程站 =====
echo.
echo [1/3] 尝试获取最新代码...
where git >nul 2>&1
if errorlevel 1 (
  echo [提示] 未找到 Git，跳过更新，继续启动课程站。
) else (
  git pull --ff-only
  if errorlevel 1 (
    echo [提示] 代码更新未完成，继续使用本机现有版本启动。
  ) else (
    echo [完成] 已获取最新代码。
  )
)

echo.
echo [2/3] 检查课程站依赖...
where npm >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 npm。请先安装 Node.js 22.13 或更高版本。
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 首次启动，正在安装依赖...
  call npm install
  if errorlevel 1 (
    echo [错误] 依赖安装失败，无法启动课程站。
    pause
    exit /b 1
  )
)

echo.
echo [3/3] 启动本地课程站，并打开私有云端预览...
echo 本地服务的实际地址会显示在新打开的命令窗口中。
start "GoC 本地课程站" cmd /k "npm run dev"
start "GoC 私有云端预览" "%CLOUD_PREVIEW_URL%"

echo.
echo 已启动。本地服务会持续运行；云端预览如要求登录，请使用 ChatGPT 登录。
endlocal
