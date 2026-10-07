@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-demo.ps1"
if errorlevel 1 (
  echo.
  echo Demo startup failed. Read the message above and check .runtime logs.
  pause
)
