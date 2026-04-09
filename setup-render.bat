@echo off
echo ========================================
echo Render Deployment Script
echo ========================================
echo.

REM Check if render CLI is installed
where render >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Render CLI...
    npm install -g @render/cli
)

echo.
echo Step 1: Login to Render
render login

echo.
echo Step 2: Creating PostgreSQL database...
render postgres create ^
  --name=audit-fup-db ^
  --region=oregon ^
  --plan=free ^
  --postgres-version=16

echo.
echo Step 3: Getting PostgreSQL connection info...
render postgres info audit-fup-db

echo.
echo Step 4: Creating web service...
render create web-service ^
  --name=audit-fup-backend ^
  --region=oregon ^
  --repo=https://github.com/kotcdw/auditfup.git ^
  --branch=main ^
  --build-command="cd backend && npm install" ^
  --start-command="cd backend && node src/index.js"

echo.
echo Step 5: Setting environment variables...
render env set DB_TYPE=postgresql
render env set JWT_SECRET=your-secure-secret-here

echo.
echo ========================================
echo Setup complete!
echo Now add DB_HOST, DB_USER, DB_PASSWORD, DB_NAME from your PostgreSQL
echo ========================================

pause