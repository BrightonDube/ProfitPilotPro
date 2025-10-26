@echo off
echo Starting BizPilot Monorepo...
echo.

:: Check if pnpm is installed
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: pnpm is not installed. Please install it first:
    echo    npm install -g pnpm
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call pnpm install
)

:: Start both services
echo.
echo Starting Backend on port 5000 and Web on port 3000...
echo Press Ctrl+C to stop all services
echo.

:: Run both services
pnpm run dev:all
