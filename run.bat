@echo off
cd /d "%~dp0"
call npm install
start "" http://localhost:3000
node server.js
