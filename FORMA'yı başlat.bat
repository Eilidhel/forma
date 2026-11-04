@echo off
REM FORMA'yi bu bilgisayarda baslatir. Node.js gerekli: https://nodejs.org
cd /d "%~dp0"
start "" http://localhost:5173
node tools\serve.js
pause
