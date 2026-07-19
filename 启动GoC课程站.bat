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
set "LOCAL_PORT="
for /f %%P in ('powershell -NoProfile -Command "$used = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners().Port; 3000..3999 ^| Where-Object { $used -notcontains $_ } ^| Select-Object -First 1"') do set "LOCAL_PORT=%%P"
if not defined LOCAL_PORT set "LOCAL_PORT=3000"
set "LOCAL_URL=http://127.0.0.1:%LOCAL_PORT%/"

echo 本地测试站地址：%LOCAL_URL%
start "GoC 本地课程站（请保持此窗口打开）" cmd /k "npm run dev -- --host 127.0.0.1 --port %LOCAL_PORT% --strictPort"

for /l %%I in (1,1,20) do (
  powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 '%LOCAL_URL%' ^| Out-Null; exit 0 } catch { exit 1 }"
  if not errorlevel 1 goto :open_local
  timeout /t 1 >nul
)

echo [提示] 本地测试站尚未响应。请查看“GoC 本地课程站”窗口的错误信息；该窗口会保持打开。
pause
exit /b 1

:open_local
echo 正在打开：%LOCAL_URL%
start "GoC 本地课程站" "%LOCAL_URL%"

echo.
echo 已启动。本地服务会持续运行；关闭“GoC 本地课程站”窗口即可停止。
endlocal
