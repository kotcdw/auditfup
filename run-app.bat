@echo off
echo Starting Audit FUP System...
echo.
echo Starting Backend...
start "Backend" cmd /k "cd /d C:\xampp\htdocs\audit-fup\backend && node src\index.js"
timeout /nobreak /t 3
echo.
echo Starting Frontend...
start "Frontend" cmd /k "cd /d C:\xampp\htdocs\audit-fup\frontend && npm run dev"
echo.
echo Opening browser...
timeout /nobreak /t 5
start http://localhost:5173
echo.
echo Done! The app should open in your browser.
pause