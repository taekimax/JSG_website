@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to validate assets.
  echo Install Node LTS from https://nodejs.org/ and retry.
  exit /b 1
)

node tools\validate-assets.mjs
exit /b %errorlevel%
