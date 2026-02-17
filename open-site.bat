@echo off
REM Discord Status Checker launcher
REM Tries to start a local HTTP server (Python or Node)
REM Falls back to opening index.html directly if servers unavailable

pushd "%~dp0"

echo Opening Discord Status Checker...
echo.

REM Try Python first (usually pre-installed on Windows)
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
  echo Starting Python server on http://localhost:3000...
  start python serve.py
  timeout /t 2 /nobreak
  start http://localhost:3000
  echo.
  echo Server started! Check your browser.
  popd
  exit /b 0
)

REM Try Node.js next
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
  echo Starting Node server on http://localhost:3000...
  start node server.mjs
  timeout /t 2 /nobreak
  start http://localhost:3000
  echo.
  echo Server started! Check your browser.
  popd
  exit /b 0
)

REM Fallback: open file directly (CORS may be limited)
echo Warning: Neither Python nor Node.js found.
echo Opening index.html directly (some features may have limited API access).
echo.
echo For best results, install Node.js and run: node server.mjs
echo Or install Python (usually pre-installed on Windows).
echo.
start "" "%~dp0index.html"

echo Done! Check your browser.
popd
