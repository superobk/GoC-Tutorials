@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

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
echo [3/3] 启动本地课程站，并自动打开实际本地地址...
set "DEV_LOG=%TEMP%\goc-magic-paint-dev.log"
del /q "%DEV_LOG%" >nul 2>&1
start "GoC 本地课程站" cmd /k call npm run dev ^> "%DEV_LOG%" 2^>^&1

set "LOCAL_URL="
for /l %%I in (1,1,20) do (
  if exist "%DEV_LOG%" (
    for /f "tokens=3" %%U in ('findstr /C:"Local:" "%DEV_LOG%"') do set "LOCAL_URL=%%U"
  )
  if defined LOCAL_URL goto :open_local
  timeout /t 1 >nul
)

set "LOCAL_URL=http://localhost:3000/"
echo [提示] 尚未识别到服务地址，已尝试打开默认地址：%LOCAL_URL%

:open_local
echo 正在打开：%LOCAL_URL%
start "GoC 本地课程站" "%LOCAL_URL%"

echo.
echo 已启动。本地服务会持续运行；关闭服务窗口即可停止。
endlocal
