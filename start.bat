@echo off
REM Card Game - Quick Start Script for Windows

echo.
echo 🃏 Welcome to Card Game Setup!
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

echo Choose setup method:
echo 1. Local Development (Recommended for development)
echo 2. Docker (Recommended for quick demo)
set /p CHOICE="Enter choice (1 or 2): "

if "%CHOICE%"=="1" (
    echo.
    echo 📦 Installing backend dependencies...
    cd backend
    if not exist .env copy .env.example .env
    call npm install
    cd ..
    
    echo.
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    
    echo.
    echo ✅ Installation complete!
    echo.
    echo 🚀 Starting servers...
    echo.
    echo Backend will run on: http://localhost:3001
    echo Frontend will run on: http://localhost:3000
    echo.
    echo Press Ctrl+C to stop servers
    echo.
    
    REM Start backend in new window
    start "Card Game Backend" cmd /k "cd backend && npm run dev"
    
    REM Wait a bit for backend to start
    timeout /t 3 /nobreak >nul
    
    REM Start frontend in new window
    start "Card Game Frontend" cmd /k "cd frontend && npm run dev"
    
    echo.
    echo ✅ Servers started in separate windows!
    
) else if "%CHOICE%"=="2" (
    where docker >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Docker is not installed!
        echo Please install Docker from https://www.docker.com/get-started
        pause
        exit /b 1
    )
    
    echo.
    echo 🐳 Starting Docker containers...
    docker-compose up -d
    
    echo.
    echo ⏳ Waiting for services to start...
    timeout /t 10 /nobreak >nul
    
    echo.
    echo ✅ Services started!
    echo.
    echo Frontend: http://localhost:3000
    echo Backend API: http://localhost:3001
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop: docker-compose down
    
) else (
    echo Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo 🎮 Ready to play! Open http://localhost:3000 in your browser
echo.
pause
