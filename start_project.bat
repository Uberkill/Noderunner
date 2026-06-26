@echo off
TITLE Radial Stream Launcher
CLS

ECHO Checking for Node.js...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO [ERROR] Node.js is not installed!
    ECHO.
    ECHO You need to install Node.js to view this website.
    ECHO 1. Go to https://nodejs.org/
    ECHO 2. Download and install the "LTS" version.
    ECHO 3. Once installed, run this file again.
    ECHO.
    PAUSE
    EXIT /B
)

ECHO.
ECHO Node.js is found.
CD /D "%~dp0"

IF NOT EXIST "node_modules" (
    ECHO.
    ECHO First time setup: Downloading 3D libraries (Three.js, React)...
    ECHO This might take a minute. Please wait.
    ECHO.
    call npm install
)

ECHO.
ECHO Starting the Radial Stream 3D Site...
ECHO.
ECHO Once it starts, hold CTRL and click the "Local" URL shown below (usually http://localhost:5173)
ECHO.
call npm run dev
PAUSE
