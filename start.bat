@echo off
echo Starting Doraemon Chat Bot...
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking if npm is installed...
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Installing dependencies...
call npm run install-all

echo.
echo Starting the application...
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.

call npm run dev 