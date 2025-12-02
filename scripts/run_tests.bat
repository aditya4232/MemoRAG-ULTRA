@echo off
REM ============================================
REM CodeGenesis - Quick Test Script (Windows)
REM ============================================

echo.
echo ============================================
echo   CODEGENESIS - QUICK TEST SUITE
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo [INFO] Python found
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Node.js found
echo.

REM Check if backend is running
echo [INFO] Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Backend is not running
    echo [INFO] Please start the backend in a separate terminal:
    echo    cd backend
    echo    python main.py
    echo.
) else (
    echo [SUCCESS] Backend is running
    echo.
)

REM Check if frontend is running
echo [INFO] Checking if frontend is running...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Frontend is not running
    echo [INFO] Please start the frontend in a separate terminal:
    echo    cd frontend
    echo    npm run dev
    echo.
) else (
    echo [SUCCESS] Frontend is running
    echo.
)

REM Check for OpenRouter API key
if "%OPENROUTER_API_KEY%"=="" (
    echo [WARNING] OPENROUTER_API_KEY environment variable not set
    set /p OPENROUTER_API_KEY="Enter your OpenRouter API Key (or press Enter to skip): "
)

if "%OPENROUTER_API_KEY%"=="" (
    echo [INFO] No API key provided. Some tests will be skipped.
    echo.
) else (
    echo [SUCCESS] API Key configured
    set OPENROUTER_API_KEY=%OPENROUTER_API_KEY%
    echo.
)

REM Install test dependencies if needed
echo [INFO] Installing test dependencies...
pip install requests >nul 2>&1
echo [SUCCESS] Dependencies installed
echo.

REM Run the test suite
echo ============================================
echo   RUNNING TESTS
echo ============================================
echo.

python test_all_features.py

echo.
echo ============================================
echo   TEST COMPLETE
echo ============================================
echo.

pause
