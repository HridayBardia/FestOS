@echo off
title FestOS Operations Command Center (Port 3000)
cd /d "%~dp0"
echo ========================================================
echo Starting FestOS Local Server on http://localhost:3000
echo Keep this terminal window open to keep the server live.
echo ========================================================
node server.js
pause

