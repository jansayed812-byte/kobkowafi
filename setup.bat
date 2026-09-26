@echo off
REM Brute Forcer Pro - Setup Script for Windows
REM This script sets up the entire project for local development on Windows

setlocal enabledelayedexpansion

echo.
echo ============================================
echo  Brute Forcer Pro - Setup Script (Windows)
echo ============================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo [OK] Docker is installed

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed
    exit /b 1
)
echo [OK] Docker Compose is installed

echo.
echo [*] Configuring environment...

REM Create .env file if it doesn't exist
if not exist backend\.env (
    echo Creating backend\.env file...
    copy backend\.env.example backend\.env
    echo [OK] backend\.env created
) else (
    echo [OK] backend\.env already exists
)

echo.
echo [*] Building Docker images...
docker-compose build

echo.
echo [*] Starting PostgreSQL and Redis...
docker-compose up -d postgres redis

echo.
echo [*] Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak

REM Start API server
echo.
echo [*] Starting API server...
docker-compose up -d api

echo.
echo [*] Waiting for API to be ready...
timeout /t 10 /nobreak

REM Print status
echo.
echo [SUCCESS] Setup Complete!
echo.
echo Services Status:
docker-compose ps
echo.
echo Access points:
echo   Backend API: http://localhost:3000
echo   PostgreSQL: localhost:5432
echo   Redis: localhost:6379
echo.
echo Next steps:
echo   1. Register a new account: POST /api/auth/register
echo   2. View logs: docker-compose logs -f api
echo   3. Stop services: docker-compose down
echo.
echo Development Notes:
echo   - JWT_SECRET is set to 'dev-secret-key' (change in production)
echo   - Database will persist in docker volumes
echo   - Source code changes will hot-reload via npm watch
echo.
pause
